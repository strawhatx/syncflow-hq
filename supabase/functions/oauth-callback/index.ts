
// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// This would use the supabase-js client to update the database with OAuth tokens
// In a real application, we'd exchange the authorization code for access tokens here
// and store them securely in the database

serve(async (req) => {
  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      // Supabase API URL - env var exported by default when deployed
      Deno.env.get('SUPABASE_URL') ?? '',
      // Supabase API ANON KEY - env var exported by default when deployed
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )
    
    // Get request parameters
    const url = new URL(req.url)
    const code = url.searchParams.get('code')
    const state = url.searchParams.get('state')
    const error = url.searchParams.get('error')
    
    if (error) {
      return new Response(
        JSON.stringify({ error: error }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }
    
    if (!code || !state) {
      return new Response(
        JSON.stringify({ error: 'Missing code or state parameter' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }
    
    // In a real implementation, you would:
    // 1. Decode the state parameter to get stored information
    let stateData
    try {
      stateData = JSON.parse(atob(state))
    } catch (err) {
      return new Response(
        JSON.stringify({ error: 'Invalid state parameter' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }
    
    // 2. Exchange the authorization code for an access token
    // This would be specific to each OAuth provider
    // Example for a generic OAuth 2.0 flow:
    /*
    const tokenResponse = await fetch('https://provider.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: stateData.redirectUri,
        client_id: 'CLIENT_ID', // Would come from environment variables
        client_secret: 'CLIENT_SECRET', // Would come from environment variables
      }),
    })
    
    const tokenData = await tokenResponse.json()
    */
    
    // For this example, we'll use mock data
    const tokenData = {
      access_token: "mock_access_token_" + Date.now(),
      refresh_token: "mock_refresh_token_" + Date.now(),
      expires_in: 7200
    }
    
    // 3. Store the tokens in the database
    // Get integration ID
    const { data: integrationData, error: integrationError } = await supabaseClient
      .from('integrations')
      .select('id')
      .eq('name', stateData.provider)
      .single()
      
    if (integrationError) {
      return new Response(
        JSON.stringify({ error: 'Integration not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      )
    }
    
    // Get user ID from the session
    const { data: { session }, error: sessionError } = await supabaseClient.auth.getSession()
    
    if (sessionError || !session) {
      return new Response(
        JSON.stringify({ error: 'User not authenticated' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }
    
    // Store connection
    const { data, error: connectionError } = await supabaseClient
      .from('integration_connections')
      .insert([
        {
          integration_id: integrationData.id,
          connection_name: stateData.connectionName,
          connection_status: 'active',
          auth_data: {
            access_token: tokenData.access_token,
            refresh_token: tokenData.refresh_token,
            expires_at: new Date(Date.now() + (tokenData.expires_in * 1000)).toISOString(),
            provider: stateData.provider,
            shop: stateData.shopName
          },
          user_id: session.user.id
        }
      ])
      .select()
      
    if (connectionError) {
      return new Response(
        JSON.stringify({ error: 'Failed to create connection' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }
    
    // Redirect back to the application with success message
    const redirectUrl = new URL('/integrations', url.origin)
    redirectUrl.searchParams.set('success', 'true')
    redirectUrl.searchParams.set('connection_id', data[0].id)
    
    return new Response(null, {
      status: 302,
      headers: {
        Location: redirectUrl.toString(),
      },
    })
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
