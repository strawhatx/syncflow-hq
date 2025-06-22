import { supabase } from "@/integrations/supabase/client";
import { Connector } from "@/types/connectors";

// OAuth configuration for different providers
interface OAuthProviderConfig {
  clientId: string;
  authUrl: string;
  tokenUrl: string;
  scopes: string[];
  requiredParameters?: string[];
  description: string;
  redirectUrl?: string;
}

// Combined provider configurations
interface ProviderConfig {
  type: "oauth";
  config: OAuthProviderConfig;
}

// Get provider configuration from database
const getProviderConfig = async (connector: Connector): Promise<ProviderConfig | null> => {
  if (connector.type !== "oauth") {
    return null;
  }

  return {
    type: 'oauth',
    config: {
      clientId: connector.config.client_id || '',
      authUrl: connector.config.auth_url || '',
      tokenUrl: connector.config.token_url || '',
      scopes: connector.config.scopes || [],
      requiredParameters: connector.config.required_parameters || [],
      description: connector.config.description,
      redirectUrl: connector.config.redirect_url
    }
  };
};

// Initiate OAuth flow
export const initiateOAuth = async (
  team_id: string,
  connectionName: string,
  provider: "supabase" | "airtable",
  config: Connector,
  params: Record<string, string>,
) => {
  const providerConfig = (await getProviderConfig(config)).config;
  if (!providerConfig) {
    throw new Error(`Unsupported provider: ${provider}`);
  }

  if (!providerConfig.clientId) {
    throw new Error(`Missing OAuth configuration for ${provider}`);
  }

  // Check for required parameters
  if (providerConfig.requiredParameters) {
    for (const param of providerConfig.requiredParameters) {
      if (!params[param]) {
        throw new Error(`Missing required parameter: ${param}`);
      }
    }
  }

  // Construct auth URL with placeholders replaced
  let authUrl = providerConfig.authUrl;
  for (const [key, value] of Object.entries(params)) {
    authUrl = authUrl.replace(`{${key}}`, value);
  }

  // Build redirect URI
  const redirectUri = providerConfig.redirectUrl || `${window.location.origin}/auth/callback`;

  // Build state parameter with connection info and security measures
  const state = btoa(JSON.stringify({
    provider,
    connectionName,
    redirectUri,
    timestamp: Date.now(),
    nonce: Math.random().toString(36).substring(2, 15),
    ...params
  }));

  // Store state in session storage for verification
  sessionStorage.setItem("oauth_state", state);

  // Construct full auth URL
  const url = new URL(authUrl);
  url.searchParams.append("client_id", providerConfig.clientId);
  url.searchParams.append("redirect_uri", redirectUri);
  url.searchParams.append("response_type", "code");
  url.searchParams.append("scope", providerConfig.scopes.join(" "));
  url.searchParams.append("state", state);
  url.searchParams.append("access_type", "offline");
  url.searchParams.append("prompt", "consent");

  return url.toString();
};

// Process OAuth callback
export const processOAuthCallback = async (
  team_id:string, 
  code: string,
  state: string,
  provider: string,
  searchParams: URLSearchParams
) => {
  try {
    // Verify state parameter
    const storedState = sessionStorage.getItem("oauth_state");
    if (!storedState || storedState !== state) {
      throw new Error("Invalid state parameter");
    }
    sessionStorage.removeItem("oauth_state");

    // Decode state and verify timestamp
    const stateData = JSON.parse(atob(state));
    if (Date.now() - stateData.timestamp > 3600000) { // 1 hour
      throw new Error("OAuth state expired");
    }

    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session?.user) {
      throw new Error('User not authenticated');
    }

    // Send to backend for processing
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_API}/oauth-callback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        team_id,
        code,
        provider,
        connectionName: stateData.connectionName,
        ...Object.fromEntries(searchParams.entries())
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `Failed to process ${provider} callback`);
    }

    return response.json();
  } catch (error) {
    console.error("Error processing OAuth callback:", error);
    throw error;
  }
};
