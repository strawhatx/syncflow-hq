// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { handleCORS, handleReturnCORS } from "../utils/cors.ts";
import { validateSupabaseToken } from "../utils/auth.ts";
import { DataSourceStrategyFactory } from "./strategy/datasource.ts";

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

const validateConnection = async (provider: string, config: Record<string, any>) => {
  const strategy = DataSourceStrategyFactory.getStrategy(provider as any);
  const validationResult = await strategy.connect(config);
  return validationResult;
}

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

    const validationResult = await validateConnection(provider, config);

    return createSuccessResponse(validationResult, req);
  } catch (error) {
    console.error('Connection validation error:', error);
    return createErrorResponse(req, error instanceof Error ? error.message : 'Unknown error occurred', 500);
  }
}); 