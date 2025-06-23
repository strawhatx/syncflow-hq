// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { handleCORS } from "../utils/cors.ts";

// Types
interface OAuthCallbackRequest {
  code: string;
  state: string;
  connectionName: string;
  provider: string;
  [key: string]: string;
}

interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  error?: string;
  error_description?: string;
}

interface Integration {
  id: string;
  name: string;
  client_id: string;
  client_secret: string;
  token_url: string;
  auth_url: string;
}

interface StateData {
  user_id: string;
  redirectUri: string;
}

const createErrorResponse = (message: string, status = 400) => {
  return new Response(
    JSON.stringify({ error: message }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status
    }
  );
};

const createSuccessResponse = (data: unknown) => {
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

const prepareTokenRequest = (
  integration: Integration,
  code: string,
  stateData: StateData
): RequestInit => {
  const baseConfig: RequestInit = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  return {
    ...baseConfig,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${btoa(`${integration.client_id}:${integration.client_secret}`)}`
    },
    body: new URLSearchParams({
      code,
      redirect_uri: stateData.redirectUri,
      grant_type: 'authorization_code'
    }).toString()
  };
};

// Main handler
Deno.serve(async (req) => {
  const corsResponse = handleCORS(req);
    if (corsResponse) return corsResponse;

  try {
    const { team_id, connectionName, provider, ...params } = await req.json() as OAuthCallbackRequest;
    
    if (!provider) {
      throw new Error('Provider not specified');
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('EF_SUPABASE_URL') ?? '',
      Deno.env.get('EF_SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch integration configuration
    const { data: connector, error: integrationError } = await supabaseClient
      .from('connector_oauth_configs_public')
      .select('*')
      .ilike('name', provider)
      .single();

    if (integrationError || !connector) {
      throw new Error('Integration not found');
    }

    // Process state and get user ID
    const stateData = JSON.parse(atob(params.state)) as StateData;
  
    // Process token URL for provider-specific templates
    let tokenUrl = connector.token_url;

    // Exchange code for tokens
    const tokenRequestConfig = prepareTokenRequest(connector, params.code, stateData);
    const tokenResponse = await fetch(tokenUrl, tokenRequestConfig);

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json() as TokenResponse;
      console.error('Token exchange failed:', {
        provider,
        status: tokenResponse.status,
        statusText: tokenResponse.statusText,
        error: errorData
      });
      throw new Error(
        `Failed to exchange token: ${errorData.error_description || tokenResponse.statusText}`
      );
    }

    const tokenData = await tokenResponse.json() as TokenResponse;

    // Create connection record
    const { data, error } = await supabaseClient
      .from('connections')
      .insert([{
        connector_id: connector.id,
        name: connectionName,
        is_active: true,
        team_id,
        config: {
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token,
          expires_at: tokenData.expires_in ? Date.now() + tokenData.expires_in * 1000 : null,
          provider,
          ...params,
          timestamp: new Date().toISOString()
        }
      }])
      .select();

    if (error) {
      throw error;
    }

    return createSuccessResponse(data[0]);
  } catch (error) {
    console.error('OAuth callback error:', error);
    return createErrorResponse(error instanceof Error ? error.message : 'Unknown error occurred');
  }
});