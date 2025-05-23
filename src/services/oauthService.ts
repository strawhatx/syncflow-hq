import { supabase } from "@/integrations/supabase/client";

// OAuth configuration for different providers
interface OAuthProviderConfig {
  clientId: string;
  clientSecret: string;
  authUrl: string;
  tokenUrl: string;
  scopes: string[];
  requiredParameters?: string[];
  category: string;
  description: string;
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

// Provider configurations
const providers: Record<string, ProviderConfig> = {
  shopify: {
    type: "oauth",
    config: {
      clientId: import.meta.env.VITE_SHOPIFY_CLIENT_ID || "",
      clientSecret: import.meta.env.VITE_SHOPIFY_CLIENT_SECRET || "",
      authUrl: "https://{shop}.myshopify.com/admin/oauth/authorize",
      tokenUrl: "https://{shop}.myshopify.com/admin/oauth/access_token",
      scopes: [
        "read_products",
        "write_products",
        "read_orders",
        "write_orders",
        "read_customers",
        "write_customers",
        "read_inventory",
        "write_inventory"
      ],
      requiredParameters: ["shop"],
      category: "commerce",
      description: "Connect your Shopify store to sync products, orders, and customers"
    }
  },
  airtable: {
    type: "oauth",
    config: {
      clientId: import.meta.env.VITE_AIRTABLE_CLIENT_ID || "",
      clientSecret: import.meta.env.VITE_AIRTABLE_CLIENT_SECRET || "",
      authUrl: "https://airtable.com/oauth2/v1/authorize",
      tokenUrl: "https://airtable.com/oauth2/v1/token",
      scopes: [
        "data.records:read",
        "data.records:write",
        "schema.bases:read",
        "schema.bases:write"
      ],
      category: "database",
      description: "Connect your Airtable bases to sync data across your organization"
    }
  },
  notion: {
    type: "oauth",
    config: {
      clientId: import.meta.env.VITE_NOTION_CLIENT_ID || "",
      clientSecret: import.meta.env.VITE_NOTION_CLIENT_SECRET || "",
      authUrl: "https://api.notion.com/v1/oauth/authorize",
      tokenUrl: "https://api.notion.com/v1/oauth/token",
      scopes: [
        "read_user",
        "read_blocks",
        "write_blocks",
        "read_databases",
        "write_databases",
        "read_pages",
        "write_pages"
      ],
      category: "productivity",
      description: "Connect your Notion workspace to sync pages and databases"
    }
  },
  klaviyo: {
    type: "oauth",
    config: {
      clientId: import.meta.env.VITE_KLAVIYO_CLIENT_ID || "",
      clientSecret: import.meta.env.VITE_KLAVIYO_CLIENT_SECRET || "",
      authUrl: "https://www.klaviyo.com/oauth/authorize",
      tokenUrl: "https://www.klaviyo.com/oauth/token",
      scopes: [
        "read-campaigns",
        "write-campaigns",
        "read-lists",
        "write-lists",
        "read-profiles",
        "write-profiles"
      ],
      category: "marketing",
      description: "Connect your Klaviyo account to sync marketing campaigns and customer data"
    }
  },
  bigcommerce: {
    type: "oauth",
    config: {
      clientId: import.meta.env.VITE_BIGCOMMERCE_CLIENT_ID || "",
      clientSecret: import.meta.env.VITE_BIGCOMMERCE_CLIENT_SECRET || "",
      authUrl: "https://login.bigcommerce.com/oauth2/authorize",
      tokenUrl: "https://login.bigcommerce.com/oauth2/token",
      scopes: [
        "store_v2_products",
        "store_v2_orders",
        "store_v2_customers",
        "store_v2_information",
        "store_v2_marketing"
      ],
      category: "commerce",
      description: "Connect your BigCommerce store to sync products, orders, and customers"
    }
  },
  woocommerce: {
    type: "api_key",
    config: {
      category: "commerce",
      description: "Connect your WooCommerce store to sync products, orders, and customers",
      requiredParameters: ["store_url"],
      fields: [
        {
          name: "consumer_key",
          label: "Consumer Key",
          placeholder: "ck_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
          type: "text"
        },
        {
          name: "consumer_secret",
          label: "Consumer Secret",
          placeholder: "cs_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
          type: "password"
        }
      ]
    }
  },
  google_sheets: {
    type: "oauth",
    config: {
      clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || "",
      clientSecret: import.meta.env.VITE_GOOGLE_CLIENT_SECRET || "",
      authUrl: "https://accounts.google.com/o/oauth2/v2/auth",
      tokenUrl: "https://oauth2.googleapis.com/token",
      scopes: [
        "https://www.googleapis.com/auth/spreadsheets",
        "https://www.googleapis.com/auth/drive.file"
      ],
      category: "productivity",
      description: "Connect your Google Sheets to sync data across your spreadsheets"
    }
  },
  mailchimp: {
    type: "oauth",
    config: {
      clientId: import.meta.env.VITE_MAILCHIMP_CLIENT_ID || "",
      clientSecret: import.meta.env.VITE_MAILCHIMP_CLIENT_SECRET || "",
      authUrl: "https://login.mailchimp.com/oauth2/authorize",
      tokenUrl: "https://login.mailchimp.com/oauth2/token",
      scopes: [
        "campaigns_read",
        "campaigns_write",
        "lists_read",
        "lists_write",
        "subscribers_read",
        "subscribers_write"
      ],
      category: "marketing",
      description: "Connect your Mailchimp account to sync campaigns and subscriber data"
    }
  }
};

// Initiate OAuth flow
export const initiateOAuth = (
  provider: string,
  params: Record<string, string>,
  connectionName: string
) => {
  const providerConfig = providers[provider];
  if (!providerConfig) {
    throw new Error(`Unsupported provider: ${provider}`);
  }

  if (providerConfig.type !== "oauth") {
    throw new Error(`${provider} does not support OAuth authentication`);
  }

  const config = providerConfig.config as OAuthProviderConfig;
  
  if (!config.clientId || !config.clientSecret) {
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
    authUrl = authUrl.replace(`{${key}}`, value);
  }
  
  // Build redirect URI
  const redirectUri = import.meta.env[`VITE_${provider.toUpperCase()}_REDIRECT_URI`] || `${window.location.origin}/auth/callback`;
  
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
  const providerConfig = providers[provider];
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
      client_secret: config.clientSecret,
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
  state: string
) => {
  try {
    // Verify state parameter
    const storedState = sessionStorage.getItem("oauth_state");
    if (!storedState || storedState !== state) {
      throw new Error("Invalid state parameter");
    }
    sessionStorage.removeItem("oauth_state");

    // Decode state
    const stateData = JSON.parse(atob(state));
    const { provider, connectionName, timestamp, nonce, ...params } = stateData;
    
    // Verify timestamp to prevent replay attacks
    if (Date.now() - timestamp > 3600000) { // 1 hour
      throw new Error("OAuth state expired");
    }
    
    // Get user info
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      throw new Error("User not authenticated");
    }
    
    // Exchange code for tokens
    const tokenData = await exchangeToken(provider, code, {
      ...params,
      redirectUri: stateData.redirectUri
    });
    
    // Get integration info
    const { data: integrationData, error: integrationError } = await supabase
      .from("integrations")
      .select("id")
      .eq("name", provider)
      .single();
    
    if (integrationError) {
      throw new Error("Integration not found");
    }
    
    // Prepare auth data
    const authData = {
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_at: tokenData.expires_in ? Date.now() + (tokenData.expires_in * 1000) : null,
      provider,
      ...params,
      timestamp: new Date().toISOString()
    };
    
    // Create connection
    const { data, error } = await supabase
      .from("integration_connections")
      .insert([{
        integration_id: integrationData.id,
        connection_name: connectionName,
        connection_status: "active",
        user_id: sessionData.session.user.id,
        auth_data: authData
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

// Get provider configuration
export const getProviderConfig = (provider: string) => {
  return providers[provider];
};

// Get all available providers
export const getAvailableProviders = () => {
  return Object.entries(providers).map(([id, config]) => ({
    id,
    name: id.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
    type: config.type,
    category: config.config.category,
    description: config.config.description,
    ...(config.type === "oauth" ? {
      scopes: (config.config as OAuthProviderConfig).scopes,
      requiredParameters: (config.config as OAuthProviderConfig).requiredParameters
    } : {
      fields: (config.config as APIKeyConfig).fields,
      requiredParameters: (config.config as APIKeyConfig).requiredParameters
    })
  }));
};
