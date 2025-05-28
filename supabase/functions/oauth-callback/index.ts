// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, ApiKey"
};

console.info('server started');
async function validateHmac(params, secret, hmacToCompare) {
  const sortedParams = Object.entries(params).filter(([key])=>key !== 'hmac').sort(([a], [b])=>a.localeCompare(b)).map(([key, value])=>`${key}=${value}`).join('&');
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), {
    name: "HMAC",
    hash: "SHA-256"
  }, false, [
    "sign"
  ]);
  const signature = await crypto.subtle.sign("HMAC", key, enc.encode(sortedParams));
  const calculatedHmac = Array.from(new Uint8Array(signature)).map((b)=>b.toString(16).padStart(2, '0')).join('');
  // Compare the generated HMAC with the one from Shopify (case-insensitive)
  return calculatedHmac === hmacToCompare || calculatedHmac === hmacToCompare.toLowerCase();
}
Deno.serve(async (req)=>{
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders
    });
  }
  try {
    // Get the request body
    const { code, state, connectionName, provider, token_url, ...params } = await req.json();
    if (!provider) {
      throw new Error('Provider not specified');
    }
    // Create Supabase client
    const supabaseClient = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');
    // Get the provider configuration
    const { data: integration, error: integrationError } = await supabaseClient.from('integrations').select('*').eq('name', provider).single();
    if (integrationError || !integration) {
      throw new Error('Integration not found');
    }
    // Handle provider-specific validation
    if (provider === 'shopify') {
      const { hmac, shop } = params;
      if (!hmac || !shop) {
        throw new Error('Missing required Shopify parameters');
      }
      const isValid = await validateHmac({
        ...params,
        code,
        shop
      }, integration.client_secret, hmac);
      if (!isValid) {
        throw new Error('Invalid HMAC signature');
      }
    }
    // Get the user from the state
    const stateData = JSON.parse(atob(state));
    const { user_id } = stateData;
    
    // Exchange the code for tokens
    const tokenResponse = await fetch(token_url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        client_id: integration.client_id,
        client_secret: integration.client_secret,
        code,
        redirect_uri: stateData.redirectUri,
        grant_type: 'authorization_code'
      })
    });
    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange token');
    }
    const tokenData = await tokenResponse.json();
    // Create the connection
    const { data, error } = await supabaseClient.from('integration_connections').insert([
      {
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
      }
    ]).select();
    if (error) {
      throw error;
    }
    return new Response(JSON.stringify(data[0]), {
      headers: {
        'Content-Type': 'application/json',
        'Connection': 'keep-alive',
        ...corsHeaders
      },
      status: 200
    });
  } catch (error) {
    return new Response(JSON.stringify({
      error: error.message
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 400
    });
  }
});
