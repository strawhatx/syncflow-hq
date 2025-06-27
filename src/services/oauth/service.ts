import { supabase } from "@/integrations/supabase/client";
import { Connector } from "@/types/connectors";
import { generateCodeVerifier, generateCodeChallenge } from "./pkce-utils";
import { saveOAuthState, getOAuthState, clearOAuthState, savePkceVerifier, getPkceVerifier, clearPkceVerifier } from "./state";

// OAuth configuration for different providers
interface OAuthProviderConfig {
  clientId: string;
  authUrl: string;
  tokenUrl: string;
  scopes: string[];
  requiredParameters?: string[];
  description: string;
  redirectUrl?: string;
  code_challenge_required?: boolean;
  code_challenge?: string;
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
      clientId: (connector.config as any).client_id || '',
      authUrl: (connector.config as any).auth_url || '',
      tokenUrl: (connector.config as any).token_url || '',
      scopes: (connector.config as any).scopes || [],
      requiredParameters: (connector.config as any).required_parameters || [],
      description: (connector.config as any).description,
      redirectUrl: (connector.config as any).redirect_url,
      code_challenge_required: (connector.config as any).code_challenge_required
    }
  };
};

// Initiate OAuth flow
export const initiateOAuth = async (
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

  // Generate code_verifier and code_challenge
  const code_verifier = generateCodeVerifier();
  if (providerConfig.code_challenge_required) {
    const code_challenge = await generateCodeChallenge(code_verifier);
    providerConfig.code_challenge = code_challenge;
    savePkceVerifier(code_verifier);
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
  saveOAuthState(state);

  // Construct full auth URL
  // https://airtable.com/oauth2/v1/authorize?
  // client_id=YOUR_CLIENT_ID
  // &redirect_uri=YOUR_REDIRECT_URI
  // &response_type=code
  // &scope=YOUR_SCOPES
  // &state=YOUR_STATE
  // &code_challenge=GENERATED_CODE_CHALLENGE
  // &code_challenge_method=S256
  const url = new URL(authUrl);
  url.searchParams.append("client_id", providerConfig.clientId);
  url.searchParams.append("redirect_uri", redirectUri);
  url.searchParams.append("response_type", "code");
  url.searchParams.append("scope", providerConfig.scopes.join(" "));
  url.searchParams.append("state", state);

  // Add code_challenge if required
  if (providerConfig.code_challenge_required) {
    url.searchParams.append("code_challenge", providerConfig.code_challenge);
    url.searchParams.append("code_challenge_method", "S256");
  }

  // Add access_type and prompt
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
    const storedState = getOAuthState();
    if (!storedState || storedState !== state) {
      throw new Error("Invalid state parameter");
    }
    clearOAuthState();

    // Decode state and verify timestamp
    const stateData = JSON.parse(atob(state));
    if (Date.now() - stateData.timestamp > 3600000) { // 1 hour
      throw new Error("OAuth state expired");
    }

    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session?.user) {
      throw new Error('User not authenticated');
    }

    // Retrieve code_verifier
    const code_verifier = getPkceVerifier();
    clearPkceVerifier();

    // Send to backend for processing
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_API}/oauth-callback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        team_id,
        code,
        provider,
        code_verifier,
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
