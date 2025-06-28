// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { serve } from "jsr:@supabase/functions-js/server";
import { validateSupabaseToken } from "../utils/auth";
import { handleCORS, handleReturnCORS } from "../utils/cors";
import { DataSourceStrategyFactory } from "./strategy";
import { createClient } from "jsr:@supabase/supabase-js";

// ✅ Load Environment Variables
const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

type Provider = "airtable" | "supabase" | "postgres" | "mysql" | "mongo" | "s3";

// ✅ Get the connection config from the database
const getConnectionConfig = async (provider: Provider) => {
  const { data, error } = await supabase
    .from('connections')
    .select('config')
    .eq('provider', provider)
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
    return new Response('Method Not Allowed', { status: 405 });
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
    // sqlserver: {
    //   database: string <= required for getting tables
    //  ... other params <= pulled from the connection config in the db
    // }
    // s3: {} <= pulled from the connection config in the db
    const { provider, action, config } = await req.json();
    const strategy = DataSourceStrategyFactory.getStrategy(provider);

    // merge the configs with the connection config in the db
    const connectionConfig = await getConnectionConfig(provider);
    const mergedConfig = { ...config, ...connectionConfig };

    // check if the action is getTables or getSources
    let data: string[] = [];

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
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
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
