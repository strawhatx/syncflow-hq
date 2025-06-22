// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { Client } from "npm:pg@8.16.2";
import { MongoClient } from "npm:mongodb@6.17.0";
import { createPool } from "npm:mysql2@3.14.1/promise";
import { S3Client, ListBucketsCommand } from "npm:@aws-sdk/client-s3@3.832.0";

// Types
interface ValidationRequest {
  provider: string;
  config: Record<string, any>;
}

interface ValidationResponse {
  valid: boolean;
  error?: string;
}

// Constants
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, ApiKey"
} as const;

const createErrorResponse = (message: string, status = 400) => {
  return new Response(
    JSON.stringify({ error: message }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status
    }
  );
};

const createSuccessResponse = (data: ValidationResponse) => {
  return new Response(
    JSON.stringify(data),
    {
      headers: {
        'Content-Type': 'application/json',
        'Connection': 'keep-alive',
        ...corsHeaders
      },
      status: 200
    }
  );
};

// Connection validation functions
const validatePostgreSQL = async (config: Record<string, any>): Promise<ValidationResponse> => {
  try {
    const client = new Client(config);
    await client.connect();
    await client.end();
    return { valid: true };
  } catch (error) {
    return { 
      valid: false, 
      error: error instanceof Error ? error.message : 'Unknown PostgreSQL error' 
    };
  }
};

const validateMongoDB = async (config: Record<string, any>): Promise<ValidationResponse> => {
  try {
    const client = new MongoClient(config.url);
    await client.connect();
    await client.close();
    return { valid: true };
  } catch (error) {
    return { 
      valid: false, 
      error: error instanceof Error ? error.message : 'Unknown MongoDB error' 
    };
  }
};

const validateMySQL = async (config: Record<string, any>): Promise<ValidationResponse> => {
  try {
    const pool = createPool(config);
    const connection = await pool.getConnection();
    connection.release();
    await pool.end();
    return { valid: true };
  } catch (error) {
    return { 
      valid: false, 
      error: error instanceof Error ? error.message : 'Unknown MySQL error' 
    };
  }
};

const validateS3 = async (config: Record<string, any>): Promise<ValidationResponse> => {
  try {
    const client = new S3Client(config);
    await client.send(new ListBucketsCommand({}));
    return { valid: true };
  } catch (error) {
    return { 
      valid: false, 
      error: error instanceof Error ? error.message : 'Unknown S3 error' 
    };
  }
};

// Main handler
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return createErrorResponse('Method not allowed', 405);
  }

  try {
    const { provider, config }: ValidationRequest = await req.json();
    
    if (!provider || !config) {
      throw new Error('Provider and config are required');
    }

    let validationResult: ValidationResponse;

    switch (provider) {
      case 'postgresql':
        validationResult = await validatePostgreSQL(config);
        break;
      case 'mongodb':
        validationResult = await validateMongoDB(config);
        break;
      case 'mysql':
        validationResult = await validateMySQL(config);
        break;
      case 'aws':
        validationResult = await validateS3(config);
        break;
      default:
        validationResult = { 
          valid: false, 
          error: `Unsupported provider: ${provider}` 
        };
    }

    return createSuccessResponse(validationResult);
  } catch (error) {
    console.error('Connection validation error:', error);
    return createErrorResponse(
      error instanceof Error ? error.message : 'Unknown error occurred'
    );
  }
}); 