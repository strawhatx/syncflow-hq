
import { supabase } from "@/integrations/supabase/client";
import { Connection, ConnectionStatus } from "@/components/integrations/IntegrationCard";

// Types for integrations
export interface Integration {
  id: string;
  name: string;
  icon: string;
  description: string;
  authType: string;
  category: string;
}

export interface IntegrationWithConnections extends Integration {
  connections: Connection[];
}

export interface OAuthConfig {
  clientId: string;
  redirectUri: string;
  scope?: string;
  state?: string;
}

// OAuth endpoints for different providers
const oauthEndpoints = {
  shopify: {
    authUrl: "https://[SHOP_NAME].myshopify.com/admin/oauth/authorize",
    tokenUrl: "https://[SHOP_NAME].myshopify.com/admin/oauth/access_token",
    scope: "read_products,write_products,read_orders",
  },
  // Add other OAuth providers as needed
};

// Fetch all available integrations
export const fetchIntegrations = async (): Promise<IntegrationWithConnections[]> => {
  try {
    // First, fetch all integrations from the database
    const { data: integrations, error: integrationsError } = await supabase
      .from('integrations')
      .select('*');

    if (integrationsError) {
      console.error("Error fetching integrations:", integrationsError);
      throw integrationsError;
    }

    // Get the user's connections from the database
    const { data: connections, error: connectionsError } = await supabase
      .from('integration_connections')
      .select('*');

    if (connectionsError) {
      console.error("Error fetching connections:", connectionsError);
      throw connectionsError;
    }

    // Map database integrations to our frontend model
    const integrationsWithConnections = integrations.map(integration => {
      const integrationConnections = connections?.filter(conn => conn.integration_id === integration.id) || [];
      
      return {
        id: integration.id,
        name: integration.name,
        icon: integration.icon,
        description: integration.description,
        authType: integration.auth_type,
        category: integration.category,
        connections: integrationConnections.map(conn => ({
          id: conn.id,
          name: conn.connection_name,
          status: conn.connection_status as ConnectionStatus
        }))
      };
    });

    return integrationsWithConnections;
  } catch (error) {
    console.error("Error in fetchIntegrations:", error);
    throw error;
  }
};

// Fetch a single integration by ID
export const fetchIntegrationById = async (integrationId: string): Promise<Integration | null> => {
  try {
    const { data, error } = await supabase
      .from('integrations')
      .select('*')
      .eq('id', integrationId)
      .single();

    if (error) {
      console.error("Error fetching integration:", error);
      throw error;
    }

    return data ? {
      id: data.id,
      name: data.name,
      icon: data.icon,
      description: data.description,
      authType: data.auth_type,
      category: data.category
    } : null;
  } catch (error) {
    console.error("Error in fetchIntegrationById:", error);
    throw error;
  }
};

// Fetch a single connection by ID
export const fetchConnectionById = async (connectionId: string) => {
  try {
    const { data, error } = await supabase
      .from('integration_connections')
      .select('*, integrations:integration_id(*)')
      .eq('id', connectionId)
      .single();

    if (error) {
      console.error("Error fetching connection:", error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error in fetchConnectionById:", error);
    throw error;
  }
};

// Create a new connection
export const createConnection = async (
  integrationId: string, 
  connectionName: string, 
  status: ConnectionStatus = "active",
  authData?: any,
  apiKey?: string
) => {
  try {
    const { data: session } = await supabase.auth.getSession();
    
    if (!session.session?.user) {
      throw new Error("User not authenticated");
    }

    const { data, error } = await supabase
      .from('integration_connections')
      .insert([
        { 
          integration_id: integrationId,
          connection_name: connectionName,
          connection_status: status,
          auth_data: authData,
          api_key: apiKey,
          user_id: session.session.user.id
        }
      ])
      .select();

    if (error) {
      console.error("Error creating connection:", error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error in createConnection:", error);
    throw error;
  }
};

// Update a connection status
export const updateConnectionStatus = async (connectionId: string, status: ConnectionStatus) => {
  try {
    const { data, error } = await supabase
      .from('integration_connections')
      .update({ 
        connection_status: status, 
        updated_at: new Date().toISOString()
      })
      .eq('id', connectionId)
      .select();

    if (error) {
      console.error("Error updating connection status:", error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error in updateConnectionStatus:", error);
    throw error;
  }
};

// Delete a connection
export const deleteConnection = async (connectionId: string) => {
  try {
    const { error } = await supabase
      .from('integration_connections')
      .delete()
      .eq('id', connectionId);

    if (error) {
      console.error("Error deleting connection:", error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error("Error in deleteConnection:", error);
    throw error;
  }
};

// Generate an OAuth URL for the specified provider
export const generateOAuthUrl = (
  provider: string,
  shopName: string | null = null,
  config: OAuthConfig
): string => {
  if (!oauthEndpoints[provider as keyof typeof oauthEndpoints]) {
    throw new Error(`Unsupported OAuth provider: ${provider}`);
  }

  const endpoint = oauthEndpoints[provider as keyof typeof oauthEndpoints];
  let authUrl = endpoint.authUrl;
  
  // Replace shop placeholder for Shopify
  if (provider === 'shopify' && shopName) {
    authUrl = authUrl.replace('[SHOP_NAME]', shopName);
  }

  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: 'code',
    scope: config.scope || endpoint.scope,
  });

  if (config.state) {
    params.append('state', config.state);
  }
  
  return `${authUrl}?${params.toString()}`;
};

// Handle OAuth callback
export const handleOAuthCallback = async (
  provider: string,
  code: string,
  shopName: string | null = null,
  connectionId: string | null = null,
  connectionName: string | null = null,
) => {
  try {
    // For demo purposes, we'll store a successful OAuth flow
    // In a real implementation, we would exchange the code for a token
    
    let authData = {
      access_token: "sample_access_token", // This would come from the OAuth provider in a real implementation
      provider,
      timestamp: new Date().toISOString(),
    };
    
    if (connectionId) {
      // Update existing connection
      const { data, error } = await supabase
        .from('integration_connections')
        .update({ 
          auth_data: authData,
          connection_status: "active",
          updated_at: new Date().toISOString()
        })
        .eq('id', connectionId)
        .select();
      
      if (error) throw error;
      return data;
    } else if (connectionName) {
      // Get integration ID from provider name
      const { data: integrationData, error: integrationError } = await supabase
        .from('integrations')
        .select('id')
        .eq('name', provider)
        .single();
      
      if (integrationError) throw integrationError;
      
      // Create new connection
      return await createConnection(
        integrationData.id,
        connectionName,
        "active",
        authData
      );
    }
    
    throw new Error("Either connectionId or connectionName must be provided");
  } catch (error) {
    console.error("Error handling OAuth callback:", error);
    throw error;
  }
};
