import { supabase } from "@/integrations/supabase/client";

// Database types
interface Integration {
  id: string;
  name: string;
  description: string;
  icon: string;
  auth_type: 'oauth' | 'api_key';
  category: string;
  client_id?: string;
  client_secret?: string;
  auth_url?: string;
  token_url?: string;
  scopes?: string[];
  required_parameters?: string[];
  created_at: string;
  updated_at: string;
  redirect_url?: string;
}

// OAuth configuration for different providers
interface OAuthProviderConfig {
  clientId: string;
  authUrl: string;
  tokenUrl: string;
  scopes: string[];
  requiredParameters?: string[];
  category: string;
  description: string;
  processCallback: {
    type: 'backend';
    validateParams?: (params: URLSearchParams) => Promise<boolean>;
  };
  redirectUrl?: string;
}

// API Key configuration for providers that use API keys
interface APIKeyConfig {
  category: string;
  description: string;
  requiredParameters: string[];
  fields: {
    name: string;
    label: string;
    placeholder: string;
    type: "text" | "password";
  }[];
}

// Combined provider configurations
interface ProviderConfig {
  type: "oauth" | "api_key";
  config: OAuthProviderConfig | APIKeyConfig;
}

// Get provider configuration from database
const getProviderConfig = async (provider: string): Promise<ProviderConfig | null> => {
  const { data, error } = await supabase
    .from('integrations')
    .select('*')
    .eq('name', provider.toLowerCase())
    .single();

  if (error || !data) return null;

  const integration = data as Integration;

  if (integration.auth_type === 'oauth') {
    return {
      type: 'oauth',
      config: {
        clientId: integration.client_id || '',
        authUrl: integration.auth_url || '',
        tokenUrl: integration.token_url || '',
        scopes: integration.scopes || [],
        requiredParameters: integration.required_parameters || [],
        category: integration.category,
        description: integration.description,
        processCallback: {
          type: 'backend',
          validateParams: async (params: URLSearchParams) => {
            // HMAC validation is now handled in the backend
            return true;
          }
        },
        redirectUrl: integration.redirect_url
      }
    };
  } else {
    return {
      type: 'api_key',
      config: {
        category: integration.category,
        description: integration.description,
        requiredParameters: integration.required_parameters || [],
        fields: [
          {
            name: 'api_key',
            label: 'API Key',
            placeholder: 'Enter your API key',
            type: 'password'
          }
        ]
      }
    };
  }
};

// Initiate OAuth flow
export const initiateOAuth = async (
  provider: string,
  params: Record<string, string>,
  connectionName: string
) => {
  const providerConfig = await getProviderConfig(provider);
  if (!providerConfig) {
    throw new Error(`Unsupported provider: ${provider}`);
  }

  if (providerConfig.type !== "oauth") {
    throw new Error(`${provider} does not support OAuth authentication`);
  }

  const config = providerConfig.config as OAuthProviderConfig;

  if (!config.clientId) {
    throw new Error(`Missing OAuth configuration for ${provider}`);
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
    if (key === 'shop' && provider === 'shopify') {
      // For Shopify, we need to extract the myshopify.com domain
      const myshopifyMatch = value.match(/https?:\/\/([^.]+)\.myshopify\.com/);
      if (myshopifyMatch) {
        authUrl = authUrl.replace(`{${key}}`, myshopifyMatch[1]);
      } else {
        throw new Error(
          "For custom domains, please provide the myshopify.com domain (e.g., store-name.myshopify.com) " +
          "instead of the custom domain. You can find this in your Shopify admin under Settings > Domains."
        );
      }
    } else {
      authUrl = authUrl.replace(`{${key}}`, value);
    }
  }

  // Build redirect URI
  const redirectUri = config.redirectUrl || `${window.location.origin}/auth/callback`;

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
  url.searchParams.append("client_id", config.clientId);
  url.searchParams.append("redirect_uri", redirectUri);
  url.searchParams.append("response_type", "code");
  url.searchParams.append("scope", config.scopes.join(" "));
  url.searchParams.append("state", state);
  url.searchParams.append("access_type", "offline");
  url.searchParams.append("prompt", "consent");

  return url.toString();
};

// Exchange OAuth code for tokens
const exchangeToken = async (
  provider: string,
  code: string,
  params: Record<string, string>
) => {
  const providerConfig = await getProviderConfig(provider);
  if (!providerConfig || providerConfig.type !== "oauth") {
    throw new Error(`Unsupported OAuth provider: ${provider}`);
  }

  const config = providerConfig.config as OAuthProviderConfig;

  // Construct token URL with placeholders replaced
  let tokenUrl = config.tokenUrl;
  for (const [key, value] of Object.entries(params)) {
    tokenUrl = tokenUrl.replace(`{${key}}`, value);
  }

  const response = await fetch(tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json"
    },
    body: JSON.stringify({
      client_id: config.clientId,
      code,
      redirect_uri: params.redirectUri,
      grant_type: "authorization_code"
    })
  });

  if (!response.ok) {
    throw new Error(`Failed to exchange token: ${response.statusText}`);
  }

  return response.json();
};

// Process OAuth callback
export const processOAuthCallback = async (
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

    // Send to backend for processing
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_API}/oauth-callback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code,
        state,
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

// Get all available providers
export const getAvailableProviders = async () => {
  const { data, error } = await supabase
    .from('integrations')
    .select('*');

  if (error) throw error;

  return (data as Integration[]).map(integration => ({
    id: integration.id,
    name: integration.name,
    type: integration.auth_type,
    category: integration.category,
    description: integration.description,
    ...(integration.auth_type === "oauth" ? {
      scopes: integration.scopes || [],
      requiredParameters: integration.required_parameters || []
    } : {
      fields: [
        {
          name: 'api_key',
          label: 'API Key',
          placeholder: 'Enter your API key',
          type: 'password'
        }
      ],
      requiredParameters: ['api_key']
    })
  }));
};
