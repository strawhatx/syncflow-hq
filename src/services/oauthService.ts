
import { supabase } from "@/integrations/supabase/client";

// OAuth configuration for different providers
interface OAuthProviderConfig {
  clientId: string; // Would be environment variable in production
  authUrl: string;
  tokenUrl: string;
  scopes: string[];
  requiredParameters?: string[];
}

// OAuth provider configurations
const providers: Record<string, OAuthProviderConfig> = {
  shopify: {
    clientId: "placeholder_client_id", // Would be environment variable in production
    authUrl: "https://{shop}.myshopify.com/admin/oauth/authorize",
    tokenUrl: "https://{shop}.myshopify.com/admin/oauth/access_token",
    scopes: ["read_products", "write_products", "read_orders", "write_orders"],
    requiredParameters: ["shop"]
  },
  // Could add more providers here
};

// Initiate OAuth flow
export const initiateOAuth = (
  provider: string,
  params: Record<string, string>,
  connectionName: string
) => {
  const config = providers[provider];
  if (!config) {
    throw new Error(`Unsupported OAuth provider: ${provider}`);
  }
  
  // Check for required parameters
  if (config.requiredParameters) {
    for (const param of config.requiredParameters) {
      if (!params[param]) {
        throw new Error(`Missing required parameter: ${param}`);
      }
    }
  }
  
  // Construct auth URL with placeholders replaced
  let authUrl = config.authUrl;
  for (const [key, value] of Object.entries(params)) {
    authUrl = authUrl.replace(`{${key}}`, value);
  }
  
  // Build redirect URI - use current URL as base
  const redirectUri = `${window.location.origin}/api/oauth-callback`;
  
  // Build state parameter with connection info
  const state = btoa(JSON.stringify({
    provider,
    connectionName,
    redirectUri,
    ...params
  }));
  
  // Construct full auth URL
  const url = new URL(authUrl);
  url.searchParams.append("client_id", config.clientId);
  url.searchParams.append("redirect_uri", redirectUri);
  url.searchParams.append("response_type", "code");
  url.searchParams.append("scope", config.scopes.join(","));
  url.searchParams.append("state", state);
  
  return url.toString();
};

// Process OAuth callback - in a real app this would be done server-side
// for security reasons, but we're simplifying for this demo
export const processOAuthCallback = async (
  code: string,
  state: string
) => {
  try {
    // Decode state
    const stateData = JSON.parse(atob(state));
    const provider = stateData.provider;
    
    // In a real app, we would make a secure server-side request to exchange
    // the code for tokens. For this demo, we'll simulate a successful exchange.
    
    // Get user info - ensure user is logged in
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      throw new Error("User not authenticated");
    }
    
    // Get integration info
    const { data: integrationData, error: integrationError } = await supabase
      .from("integrations")
      .select("id")
      .eq("name", provider)
      .single();
    
    if (integrationError) {
      throw new Error("Integration not found");
    }
    
    // Create connection
    const { data, error } = await supabase
      .from("integration_connections")
      .insert([{
        integration_id: integrationData.id,
        connection_name: stateData.connectionName,
        connection_status: "active",
        user_id: sessionData.session.user.id,
        auth_data: {
          provider,
          ...stateData,
          code,
          timestamp: new Date().toISOString()
        }
      }])
      .select();
    
    if (error) {
      throw error;
    }
    
    return data[0];
  } catch (error) {
    console.error("Error processing OAuth callback:", error);
    throw error;
  }
};
