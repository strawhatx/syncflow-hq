
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

// Fetch all available integrations
export const fetchIntegrations = async (): Promise<IntegrationWithConnections[]> => {
  try {
    // Fetch the base integrations list from mock data
    // In the future, this should be replaced with a database call
    const integrations = [
      {
        id: "1",
        name: "Shopify",
        icon: "https://cdn.shopify.com/s/files/1/0533/2089/files/shopify-logo-small.png",
        description: "Connect your Shopify store to sync products, orders, and customers",
        authType: "oauth",
        category: "commerce"
      },
      {
        id: "2",
        name: "Airtable",
        icon: "https://seeklogo.com/images/A/airtable-logo-216B9AF035-seeklogo.com.png",
        description: "Use Airtable as a powerful database for your e-commerce data",
        authType: "api_key",
        category: "database"
      },
      {
        id: "3",
        name: "Notion",
        icon: "https://upload.wikimedia.org/wikipedia/commons/4/45/Notion_app_logo.png",
        description: "Organize your e-commerce operations in Notion databases and pages",
        authType: "oauth",
        category: "productivity"
      },
      {
        id: "4",
        name: "Klaviyo",
        icon: "https://cdn.worldvectorlogo.com/logos/klaviyo-1.svg",
        description: "Sync customer data with Klaviyo for better email marketing",
        authType: "api_key",
        category: "marketing"
      },
      {
        id: "5",
        name: "BigCommerce",
        icon: "https://cdn.worldvectorlogo.com/logos/bigcommerce-1.svg",
        description: "Connect your BigCommerce store to sync products and orders",
        authType: "oauth",
        category: "commerce"
      },
      {
        id: "6",
        name: "WooCommerce",
        icon: "https://cdn.worldvectorlogo.com/logos/woocommerce.svg",
        description: "Sync your WooCommerce store data to other applications",
        authType: "oauth",
        category: "commerce"
      },
      {
        id: "7",
        name: "Google Sheets",
        icon: "https://upload.wikimedia.org/wikipedia/commons/3/30/Google_Sheets_logo_%282014-2020%29.svg",
        description: "Use Google Sheets to store and manage your e-commerce data",
        authType: "oauth",
        category: "database"
      },
      {
        id: "8",
        name: "Mailchimp",
        icon: "https://cdn.worldvectorlogo.com/logos/mailchimp-freddie-icon.svg",
        description: "Keep customer data in sync with your Mailchimp lists",
        authType: "api_key",
        category: "marketing"
      },
    ];

    // Get the user's connections from the database
    const { data: connections, error } = await supabase
      .from('integration_connections')
      .select('*');

    if (error) {
      console.error("Error fetching connections:", error);
      throw error;
    }

    // Map connections to their respective integrations
    const integrationsWithConnections = integrations.map(integration => {
      const integrationConnections = connections?.filter(conn => conn.integration_id === integration.id) || [];
      
      return {
        ...integration,
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
      .update({ connection_status: status, updated_at: new Date() })
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
