import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { createDataSyncJob } from './services/job';

export const hello = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        message: 'Data Sync Service is running!',
        input: event,
      },
      null,
      2
    ),
  };
};

export const createJob = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const body = JSON.parse(event.body || '{}');
    const { syncId, teamId } = body;

    if (!syncId || !teamId) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: 'Missing required fields: syncId and teamId'
        })
      };
    }

    const job = await createDataSyncJob(syncId, teamId);

    return {
      statusCode: 201,
      body: JSON.stringify({
        message: 'Data sync job created successfully',
        job
      })
    };
  } catch (error) {
    console.error('Error creating data sync job:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Internal server error'
      })
    };
  }
};
