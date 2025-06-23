// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { Client } from "npm:pg@8.16.2";
import { MongoClient } from "npm:mongodb@6.17.0";
import { createPool } from "npm:mysql2@3.14.1/promise";
import { S3Client, ListBucketsCommand } from "npm:@aws-sdk/client-s3@3.832.0";
import { handleCORS, handleReturnCORS } from "../utils/cors.ts";
import { validateSupabaseToken } from "../utils/auth.ts";

// Types
interface ValidationRequest {
  provider: string;
  config: Record<string, any>;
}

interface ValidationResponse {
  valid: boolean;
  error?: string;
}

const createErrorResponse = (req: Request, message: string, status = 400) => {
  return new Response(
    JSON.stringify({ error: message }),
    { headers: handleReturnCORS(req), status }
  );
};

const createSuccessResponse = (data: ValidationResponse, req: Request) => {
  return new Response(
    JSON.stringify(data),
    { headers: handleReturnCORS(req), status: 200 }
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
    // Convert boolean SSL to proper mysql2 SSL object format
    const mysqlConfig = { ...config };
    if (typeof mysqlConfig.ssl === 'boolean') {
      if (mysqlConfig.ssl) {
        mysqlConfig.ssl = { rejectUnauthorized: false };
      } else {
        delete mysqlConfig.ssl;
      }
    }
    
    const pool = createPool(mysqlConfig);
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
  const corsResponse = handleCORS(req);
  if (corsResponse) return corsResponse;
  
  // Validate the JWT token
  const authHeader = req.headers.get("Authorization");
  await validateSupabaseToken(authHeader);

  if (req.method !== 'POST') {
    return createErrorResponse(req, 'Method not allowed', 405);
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

    return createSuccessResponse(validationResult, req);
  } catch (error) {
    console.error('Connection validation error:', error);
    return createErrorResponse(req, error instanceof Error ? error.message : 'Unknown error occurred', 500);
  }
}); 