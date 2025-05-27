// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { createHmac } from "https://deno.land/std@0.168.0/crypto/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization'
};

console.info('server started');

Deno.serve(async (req)=>{
  
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders
    });
  }
  try {
    // Get the request body
    const { code, state, connectionName, provider, ...params } = await req.json();
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
      // Validate HMAC
      const sortedParams = Object.entries({
        ...params,
        code,
        shop
      }).filter(([key])=>key !== 'hmac').sort(([a], [b])=>a.localeCompare(b)).map(([key, value])=>`${key}=${value}`).join('&');
      const calculatedHmac = createHmac('sha256', integration.client_secret).update(sortedParams).digest('hex');
      if (calculatedHmac !== hmac) {
        throw new Error('Invalid HMAC signature');
      }
    }
    // Get the user from the state
    const stateData = JSON.parse(atob(state));
    const { user_id } = stateData;
    // Exchange the code for tokens
    let tokenUrl = integration.token_url;
    if (provider === 'shopify') {
      tokenUrl = `https://${params.shop}/admin/oauth/access_token`;
    }
    const tokenResponse = await fetch(tokenUrl, {
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
      }
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
