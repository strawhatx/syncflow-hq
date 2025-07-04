// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { handleCORS, handleReturnCORS } from "../utils/cors.ts";
import { validateSupabaseToken } from "../utils/auth.ts";
import { DataSourceStrategyFactory } from "./strategy/index.ts";
import { getValidAccessToken } from "../utils/access.ts";
import { oauthProviders } from "../utils/utils.ts";

// ✅ Load Environment Variables
const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

// ✅ Get the connection config from the database
const getConnectionConfig = async (connection_id: string) => {
  const { data, error } = await supabase
    .from('connections')
    .select('config')
    .eq('id', connection_id)
    .single();

  if (error) {
    throw new Error(error.message);
  }
  return data.config;
}

serve(async (req) => {
  const corsResponse = handleCORS(req);
  if (corsResponse) return corsResponse;

  // Validate the JWT token
  const authHeader = req.headers.get("Authorization");
  await validateSupabaseToken(authHeader);

  // if the request is not a POST request, return a 405 Method Not Allowed
  if (req.method !== 'POST') {
    return new Response(
      'Method Not Allowed', { headers: handleReturnCORS(req), status: 200 },
    )
  }

  try {
    // get the provider and config from the request
    // provider: string
    // action: "tables" | "sources"
    // config: see below for the different providers

    // example:
    // airtable: {
    //   baseId: string <= required for getting tables
    //   access_token: string <= is pulled from the connection config in the db
    // }
    // supabase: {
    //   project_ref: string <= required for getting tables
    //   access_token: string <= is pulled from the connection config in the db
    // }
    // google_sheets: {
    //   spreadsheetId: string <= required for getting tables
    //   sheetName: string <= required for validating the sheet
    //   access_token: string <= is pulled from the connection config in the db
    // }
    // notion: {
    //   databaseId: string <= required for getting tables
    //   access_token: string <= is pulled from the connection config in the db
    // }
    // postgres: {
    //   database: string <= required for getting tables
    //  ... other params <= pulled from the connection config in the db
    // }
    // mysql: {
    //   database: string <= required for getting tables
    //  ... other params <= pulled from the connection config in the db
    // }
    // mongo: {
    //   database: string <= required for getting tables
    //  ... other params <= pulled from the connection config in the db
    // } 
    // s3: {} <= pulled from the connection config in the db
    const { connection_id, provider, action, config } = await req.json();
    if (!connection_id || !provider || !action || !config) {
      throw new Error("Invalid request");
    }



    // get the strategy for the provider
    const strategy = DataSourceStrategyFactory.getStrategy(provider);

    // merge the configs with the connection config in the db
    const connectionConfig = await getConnectionConfig(connection_id);
    const mergedConfig = { ...config, ...connectionConfig};

    // get the access token from the connection config in the db 
    // or refresh the token if it's expired
    if (oauthProviders.includes(provider)) {
      const accessToken = await getValidAccessToken(connection_id);
      mergedConfig.access_token = accessToken;
    }

    // check if the action is getTables or getSources
    let data: Record<string, any>[] = [];

    // route the request to the correct strategy
    switch (action) {
      case "tables":
        data = await strategy.getTables(mergedConfig);
        break;
      case "sources":
        data = await strategy.getSources(mergedConfig);
        break;
      default:
        throw new Error("Invalid action");
    }

    return new Response(
      JSON.stringify(data), { headers: handleReturnCORS(req), status: 200 },
    )
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ error: "Internal Server Error" }),
      { headers: handleReturnCORS(req), status: 500 },
    )
  }
})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/get-tables' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
