
import { ScheduledHandler } from 'aws-lambda';
import { DataSourceStrategyFactory } from './patterns/strategies/datasource/index';
import { oauthProviders } from './util/providers';
import { getValidAccessToken } from './util/access';
import { failJob, getPendingJob, updateJobStatus } from './services/job';
import { getConnectionConfig, rollbackDatabaseSync } from './services/connection';
import { CreateConfigFactory } from './patterns/factories/config';
import { ConnectorProvider } from './types/connector';
import { limiter } from './util/rate-limiter';

/**
 * Processes data sources (databases) for a given provider
 * This function retrieves the list of available databases/sources from the data provider
 * 
 * @param provider - The data provider (e.g., 'postgres', 'mysql', 'mongodb')
 * @param config - Configuration object containing connection details and credentials
 * @returns Array of data sources/databases available for the connection
 */
const processSources = async (provider: string, config: Record<string, any>) => {
  // Get the appropriate strategy implementation for the provider
  const strategy = DataSourceStrategyFactory.getStrategy(provider);

  // For OAuth providers, we need to ensure we have a valid access token
  // This handles token refresh if the current token is expired
  if (oauthProviders.includes(provider) && config?.connection_id) {
    const accessToken = await getValidAccessToken(config.connection_id);
    config.access_token = accessToken;
  }

  // Retrieve the list of data sources (databases) from the provider
  // The limiter ensures we don't exceed rate limits when making API calls
  let data = await limiter.schedule(() => strategy.getSources(config));

  return data;
}

/**
 * Processes tables and fields for each data source
 * This function iterates through each source and retrieves its table structure
 * 
 * @param provider - The data provider (e.g., 'postgres', 'mysql', 'mongodb')
 * @param config - Base configuration object with connection details
 * @param sources - Array of data sources to process
 */
const processTablesAndFields = async (provider: string, config: Record<string, any>, sources: Record<string, any>[]) => {
  // Get the strategy implementation for the provider
  const strategy = DataSourceStrategyFactory.getStrategy(provider);

  // Process each data source individually
  for (const source of sources) {
    // Create a source-specific configuration by merging the base config with source details
    const sourceConfig = CreateConfigFactory.create(provider as ConnectorProvider, source);
    const mergedConfig = { ...config, ...sourceConfig };

    // Retrieve tables and their field structure for this source
    // The limiter ensures we respect API rate limits
    await limiter.schedule(() => strategy.getTables(mergedConfig));
  }
}

/**
 * Main handler function for processing metadata sync jobs
 * This function is triggered by AWS EventBridge on a schedule
 * 
 * The process flow:
 * 1. Check for pending metadata sync jobs
 * 2. Update job status to "processing" (with optimistic locking)
 * 3. Retrieve connection configuration
 * 4. Process data sources (databases)
 * 5. Process tables and fields for each source
 * 6. Update job status to "completed"
 * 7. Handle errors with rollback if needed
 */
export const processJobs: ScheduledHandler = async () => {
  // Track job and connection IDs for error handling and rollback
  let currentJobId: string | undefined;
  let connection_id: string | undefined;

  try {
    // Check if there are any pending metadata sync jobs in the queue
    const job = await getPendingJob();

    if (!job) {
      console.log("No pending jobs found");
      return;
    }

    currentJobId = job.id;

    // Use optimistic locking to ensure only one Lambda processes this job
    // If another Lambda already picked up the job, this will return false
    const updated = await updateJobStatus(currentJobId, "processing", "pending");
    if (!updated) {
      console.log("Job was picked up by another Lambda");
      return;
    }

    // Extract job metadata for processing
    const provider = job?.connection?.connector?.provider;
    const team_id = job?.team_id;
    connection_id = job?.connection?.id;

    // Retrieve the connection configuration from the database
    // This includes credentials, connection parameters, etc.
    const config = await getConnectionConfig(connection_id);
    
    // Merge the connection config with job-specific metadata
    const mergedConfig = { ...config, team_id, connection_id };

    // Step 1: Process data sources (databases) available for this connection
    const sources = await processSources(provider, mergedConfig);

    // Step 2: Process tables and fields for each data source
    await processTablesAndFields(provider, mergedConfig, sources);

    // Mark the job as successfully completed
    await updateJobStatus(currentJobId, "completed", "processing");

    console.log(`Successfully processed job: ${currentJobId}`);

  } 
  catch (error) {
    console.error('Error:', error);

    // If we have a job ID, mark it as failed with the error message
    if (currentJobId) {
      await failJob(currentJobId, error instanceof Error ? error.message : String(error));
    }

    // If we have a connection ID, rollback any database sync operations
    // This ensures we don't leave the database in an inconsistent state
    if (connection_id) {
      await rollbackDatabaseSync(connection_id);
    }
  }
}; 
