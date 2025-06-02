// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

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

// Constants
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, ApiKey"
} as const;

// Utility functions
const validateHmac = async (params: Record<string, string>, secret: string, hmacToCompare: string): Promise<boolean> => {
  // Log input parameters
  console.log('HMAC Validation Input:', {
    params,
    secret: secret.substring(0, 5) + '...', // Only log first 5 chars of secret
    hmacToCompare
  });

  const sortedParams = Object.entries(params)
    .filter(([key]) => key !== 'hmac' && key !== 'signature')
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('&');

  // Log sorted parameters
  console.log('Sorted Parameters:', sortedParams);

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(sortedParams));
  const calculatedHmac = Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  // Log comparison
  console.log('HMAC Comparison:', {
    calculated: calculatedHmac,
    received: hmacToCompare.toLowerCase(),
    match: calculatedHmac === hmacToCompare.toLowerCase()
  });

  return calculatedHmac === hmacToCompare.toLowerCase();
};

const processShopifyTokenUrl = (tokenUrl: string, shop: string): string => {
  const shopMatch = shop.match(/^([a-z0-9-]+)\.myshopify\.com$/i);
  if (!shopMatch) {
    throw new Error('Invalid Shopify domain format');
  }
  return tokenUrl.replace('{shop}', shopMatch[1]);
};

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

const validateShopifyRequest = async (params: Record<string, string>, integration: Integration): Promise<void> => {
  const { hmac, shop, code } = params;
  if (!hmac || !shop || !code) {
    throw new Error('Missing required Shopify parameters');
  }

  // Log validation attempt
  console.log('Validating Shopify Request:', {
    shop,
    hmac,
    code,
    params
  });

  // Create a new params object with all required parameters
  const validationParams = {
    ...params,
    code // Ensure code is included in the validation
  };

  const isValid = await validateHmac(
    validationParams,
    integration.client_secret,
    hmac
  );

  if (!isValid) {
    throw new Error('Invalid HMAC signature');
  }
};

const prepareTokenRequest = (
  provider: string,
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

  if (provider === 'shopify') {
    return {
      ...baseConfig,
      body: JSON.stringify({
        client_id: integration.client_id,
        client_secret: integration.client_secret,
        code
      })
    };
  }

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
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { user_id, connectionName, provider, ...params } = await req.json() as OAuthCallbackRequest;
    
    if (!provider) {
      throw new Error('Provider not specified');
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch integration configuration
    const { data: integration, error: integrationError } = await supabaseClient
      .from('integrations')
      .select('*')
      .ilike('name', provider)
      .single();

    if (integrationError || !integration) {
      throw new Error('Integration not found');
    }

    // Provider-specific validation
    if (provider === 'shopify') {
      await validateShopifyRequest(params, integration);
    }

    // Process state and get user ID
    const stateData = JSON.parse(atob(params.state)) as StateData;
  
    // Process token URL for provider-specific templates
    let tokenUrl = integration.token_url;
    if (provider === 'shopify' && params.shop) {
      tokenUrl = processShopifyTokenUrl(tokenUrl, params.shop);
    }

    // Exchange code for tokens
    const tokenRequestConfig = prepareTokenRequest(provider, integration, params.code, stateData);
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
      .from('integration_connections')
      .insert([{
        integration_id: integration.id,
        connection_name: connectionName,
        connection_status: 'active',
        user_id,
        auth_data: {
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
