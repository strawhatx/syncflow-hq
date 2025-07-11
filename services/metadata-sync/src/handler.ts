
import { ScheduledHandler } from 'aws-lambda';
import { DataSourceStrategyFactory } from './patterns/strategies/datasource/index.ts';
import { oauthProviders } from './util/providers.ts';
import { getValidAccessToken } from './util/access.ts';
import { failJob, getPendingJob, updateJobStatus } from './services/job.ts';
import { getConnectionConfig } from './services/connection.ts';
import { CreateConfigFactory } from './patterns/factories/config.ts';
import { ConnectorProvider } from './types/connector.ts';
import { limiter } from './util/rate-limiter.ts';

const processSources = async (provider: string, connection_id: string, config: Record<string, any>) => {
  // get the strategy for the provider
  const strategy = DataSourceStrategyFactory.getStrategy(provider);

  // get the access token from the connection config in the db 
  // or refresh the token if it's expired
  if (oauthProviders.includes(provider)) {
    const accessToken = await getValidAccessToken(connection_id);
    config.access_token = accessToken;
  }

  // check if the action is getTables or getSources
  // Use the limiter to throttle requests
  let data = await limiter.schedule(() => strategy.getSources(connection_id, config));

  return data;
}

const processTablesAndFields = async (provider: string, config: Record<string, any>, sources: Record<string, any>[]) => {
  const strategy = DataSourceStrategyFactory.getStrategy(provider);

  for (const source of sources) {
    const sourceConfig = CreateConfigFactory.create(provider as ConnectorProvider, source);
    const mergedConfig = { ...config, ...sourceConfig };

    // Use the limiter to throttle requests
    await limiter.schedule(() => strategy.getTables(mergedConfig));
  }
}

export const processJobs: ScheduledHandler = async (event) => {
  let currentJobId: string | undefined;

  try {
    // check if there are any pending jobs
    const job = await getPendingJob();

    if (!job) {
      console.log("No pending jobs found");
      return;
    }

    currentJobId = job.id;

    // Update job to processing and return false if it was picked up by another Lambda
    const updated = await updateJobStatus(currentJobId, "processing", "pending");
    if (!updated) {
      console.log("Job was picked up by another Lambda");
      return;
    }

    // vars for the job
    const provider = job?.connection?.connector?.provider;
    const connection_id = job?.connection?.id;

    // merge the configs with the connection config in the db
    const config = await getConnectionConfig(connection_id);

    // process the sources (databases)
    const sources = await processSources(provider, connection_id, config);

    // process the tables
    await processTablesAndFields(provider, config, sources);

    console.log(`Successfully processed job: ${currentJobId}`);

  } catch (error) {
    console.error('Error:', error);

    if (currentJobId) {
      await failJob(currentJobId, error instanceof Error ? error.message : String(error));
    }
  }
}; 
