
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
        updated_at: new Date().toISOString() // Fix: Convert Date to string
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
