import { DynamoDB } from 'aws-sdk';

const dynamodb = new DynamoDB.DocumentClient();
const RATE_LIMIT_TABLE = process.env.RATE_LIMIT_TABLE!;
const RATE_LIMIT = 15; // requests per minute (Gemini free tier)
const RATE_WINDOW = 60; // 1 minute

export const checkRateLimit = async (): Promise<boolean> => {
    const now = Math.floor(Date.now() / 1000); // Current time in seconds
    const windowStart = now - RATE_WINDOW;

    // Clean up old timestamps and get current count
    const result = await dynamodb.update({
        TableName: RATE_LIMIT_TABLE,
        Key: { id: 'gemini-api' },
        UpdateExpression: 'SET timestamps = list_append(if_not_exists(timestamps, :empty_list), :new_timestamp)',
        ConditionExpression: 'attribute_not_exists(timestamps) OR size(timestamps) < :limit',
        ExpressionAttributeValues: {
            ':empty_list': [],
            ':new_timestamp': [now],
            ':limit': RATE_LIMIT
        },
        ReturnValues: 'ALL_NEW'
    }).promise().catch(() => null);

    return result !== null;
}
