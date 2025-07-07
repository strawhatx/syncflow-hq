
import { ScheduledHandler } from 'aws-lambda';
import { DataSourceStrategyFactory } from './strategies/index.ts';
import { oauthProviders } from './util/providers.ts';
import { getValidAccessToken } from './util/access.ts';
import { failJob, getPendingJob, updateJobStatus } from './services/job.ts';
import { getConnectionConfig } from './services/connection.ts';

const processSources = async (provider: string, connection_id: string) => {
  // get the strategy for the provider
  const strategy = DataSourceStrategyFactory.getStrategy(provider);

  // merge the configs with the connection config in the db
  const config = await getConnectionConfig(connection_id);

  // get the access token from the connection config in the db 
  // or refresh the token if it's expired
  if (oauthProviders.includes(provider)) {
    const accessToken = await getValidAccessToken(connection_id);
    config.access_token = accessToken;
  }

  // check if the action is getTables or getSources
  let data = await strategy.getSources(config);

  return data;
}

const processTables = async (provider: string, sources: Record<string, any>[]) => {
  const strategy = DataSourceStrategyFactory.getStrategy(provider);
  const config = await getConnectionConfig(source.id);
  for (const source of sources) {
    
    await strategy.getTables(config);
  }
}

export const processJobs: ScheduledHandler = async (event) => {
  let currentJobId: string | undefined;

  try {
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

    // process the sources (databases)
    const sources = await processSources(
      provider, 
      connection_id
    );

    // process the tables
    const tables = await processTables(
      provider, 
      sources
    );

    console.log(`Successfully processed job: ${currentJobId}`);

  } catch (error) {
    console.error('Error:', error);

    if (currentJobId) {
      await failJob(currentJobId, error instanceof Error ? error.message : String(error));
    }
  }
}; 
