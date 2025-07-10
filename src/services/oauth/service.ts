import { supabase } from "@/integrations/supabase/client";
import { Connector } from "@/types/connectors";
import { generateCodeVerifier, generateCodeChallenge } from "./pkce-utils";
import { saveOAuthState, getOAuthState, clearOAuthState, savePkceVerifier, getPkceVerifier, clearPkceVerifier } from "./state";
import { fetchWithAuth } from "@/lib/api";

/**
 * Dynamic OAuth Service
 * 
 * This service provides a flexible, configuration-driven approach to OAuth URL building.
 * It supports different OAuth providers with their specific parameters without hardcoding.
 * 
 * Key Features:
 * - Dynamic parameter building based on provider configuration
 * - Support for PKCE (Proof Key for Code Exchange)
 * - Provider-specific parameter overrides
 * - Conditional parameter inclusion
 * - Easy extension for new OAuth providers
 * 
 * How to add a new OAuth provider:
 * 1. Add the provider to the ConnectorProvider type in types/connectors.ts
 * 2. Add provider-specific parameters to getProviderSpecificParameters()
 * 3. Configure the connector in the database with the required OAuth settings
 * 
 * Example usage:
 * ```typescript
 * const oauthUrl = await initiateOAuth(
 *   "My Connection",
 *   "google",
 *   connectorConfig,
 *   { team_id: "123" }
 * );
 * ```
 */

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

// Dynamic OAuth parameter configuration
interface OAuthParameterConfig {
  [key: string]: {
    value: string | (() => string);
    required?: boolean;
    conditional?: (config: OAuthProviderConfig) => boolean;
  };
}

// Get provider configuration from database
const getProviderConfig = async (connector: Connector): Promise<ProviderConfig | null> => {
  if (connector.type !== "oauth") {
    return null;
  }

  return {
    type: 'oauth',
    config: {
      clientId: connector.client_id || '',
      authUrl: connector.auth_url || '',
      tokenUrl: connector.token_url || '',
      scopes: connector.scopes || [],
      requiredParameters: connector.required_parameters || [],
      description: connector.description,
      redirectUrl: connector.redirect_url,
      code_challenge_required: connector.code_challenge_required
    }
  };
};

// Dynamic OAuth parameter builder
const buildOAuthParameters = (
  providerConfig: OAuthProviderConfig,
  redirectUri: string,
  state: string,
  params: Record<string, string>,
  provider: string
): Record<string, string> => {
  const oauthParams: OAuthParameterConfig = {
    // Standard OAuth 2.0 parameters
    client_id: {
      value: providerConfig.clientId,
      required: true
    },
    redirect_uri: {
      value: redirectUri,
      required: true
    },
    response_type: {
      value: 'code',
      required: true
    },
    scope: {
      value: () => providerConfig.scopes.join(' '),
      required: true
    },
    state: {
      value: state,
      required: true
    },
    
    // PKCE parameters (conditional)
    code_challenge: {
      value: () => providerConfig.code_challenge || '',
      conditional: (config) => config.code_challenge_required === true
    },
    code_challenge_method: {
      value: 'S256',
      conditional: (config) => config.code_challenge_required === true
    },
  };

  // Build the final parameters object
  const finalParams: Record<string, string> = {};

  // Add standard OAuth parameters
  for (const [key, config] of Object.entries(oauthParams)) {
    // Check if parameter should be included based on conditional
    if (config.conditional && !config.conditional(providerConfig)) {
      continue;
    }

    // Get the value (either static string or function result)
    const value = typeof config.value === 'function' ? config.value() : config.value;
    
    // Only add if value is not empty
    if (value && value.trim() !== '') {
      finalParams[key] = value;
    }
  }

  // Add provider-specific parameters
  const providerSpecificParams = getProviderSpecificParameters(provider);
  Object.assign(finalParams, providerSpecificParams);

  // Add any additional parameters from the params object (these override defaults)
  Object.assign(finalParams, params);

  return finalParams;
};

// Build OAuth URL dynamically
const buildOAuthUrl = (
  authUrl: string,
  parameters: Record<string, string>
): string => {
  const url = new URL(authUrl);
  
  // Add all parameters to the URL
  for (const [key, value] of Object.entries(parameters)) {
    if (value && value.trim() !== '') {
      url.searchParams.append(key, value);
    }
  }
  
  return url.toString();
};

// Helper function to get provider-specific parameters
const getProviderSpecificParameters = (provider: string): Record<string, string> => {
  const providerParams: Record<string, Record<string, string>> = {
    'airtable': {
      access_type: 'offline',
      prompt: 'consent'
    },
    'google_sheets': {
      access_type: 'offline',
      prompt: 'consent'
    }
  };

  return providerParams[provider] || {};
};

// Initiate OAuth flow
export const initiateOAuth = async (
  connectionName: string,
  provider: "supabase" | "airtable"| "google_sheets" |  "notion",
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
  let code_verifier = null
  if (providerConfig.code_challenge_required) {
    code_verifier = generateCodeVerifier();
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

  // Build OAuth parameters dynamically
  const oauthParameters = buildOAuthParameters(
    providerConfig,
    redirectUri,
    state,
    params,
    provider
  );

  // Build the final OAuth URL
  const finalUrl = buildOAuthUrl(authUrl, oauthParameters);

  return finalUrl;
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
    const result = await fetchWithAuth("/oauth-callback", {
      method: "POST",
      body: JSON.stringify({
        team_id,
        code,
        provider,
        code_verifier,
        connectionName: stateData.connectionName,
        ...Object.fromEntries(searchParams.entries())
      })
    });

    return await result.json();
  } catch (error) {
    console.error("Error processing OAuth callback:", error);
    throw error;
  }
};
