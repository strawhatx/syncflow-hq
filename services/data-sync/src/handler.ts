import { ScheduledHandler, APIGatewayProxyHandler } from "aws-lambda";
import { createJob, updateJobStatus } from "./services/job";
import { webhookParse } from "./tasks/webhook-parser";
import { DataSyncJob } from "./types/job";

// Polling handler - runs on schedule to check any jobs that need to run
// Edgcase what if there are multiple pending requests with didferent  daata for the same job?
export const processJobs: ScheduledHandler = async () => {
  try {
    // TODO: process pending jobs

  } catch (error) {
    console.error('Error polling sources:', error);
    throw error;
  }
};

// Webhook handler - receives webhook events from supported sources
// edgecase: sheets webhook is not supported yet
// "airtable"
// "supabase" 
// "google_sheets" ?
// "notion" 
// "postgresql" 
// "mysql" 
// "mongodb" 
// "sqlserver"
export const webhookHandler: APIGatewayProxyHandler = async (event) => {
  try {
    const body = JSON.parse(event.body || '{}');
    const provider = event.pathParameters?.provider || body.provider;

    if (!provider) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Provider is required' })
      };
    }

    // TODO: search for all related syncs 
    const syncs = await webhookParse(body, provider);
    const jobs = syncs.map(sync => ({
      provider,
      payload: body,
      status: 'pending',
      sync_id: sync.id,
      team_id: sync.team_id
    }));

    // Insert a jobs for the webhook event
    await createJob(jobs as Omit<DataSyncJob, 'id'>[]);

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true })
    };
  } catch (error) {
    console.error('Error handling webhook:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to handle webhook' })
    };
  }
};

// Setup database listeners API
export const setupListener: APIGatewayProxyHandler = async (event) => {
  try {
    const body = JSON.parse(event.body || '{}');
    const { provider, connectionConfig, tableName } = body;

    if (!provider || !connectionConfig || !tableName) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'provider, connectionConfig, and tableName are required' })
      };
    }

    await setupDatabaseListener(provider, connectionConfig, tableName);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: `Database listener setup successfully for ${provider}`
      })
    };
  } catch (error) {
    console.error('Error setting up database listener:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to setup database listener' })
    };
  }
};

// Health check
export const healthCheck: APIGatewayProxyHandler = async () => {
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Data Sync Service is running!',
      timestamp: new Date().toISOString()
    })
  };
};
