import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import { fetchWithAuth } from '@/lib/api';
import { Connector, ConnectorProvider } from "@/types/connectors";

type Connection = Database['public']['Tables']['connections']['Row'];

export const fetchConnectionById = async (id: string): Promise<Connection | null> => {
  const { data, error } = await supabase
    .from('connections')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
};

export const createConnection = async (team_id: string, connector: Connector, connectionName: string, config: Record<string, any>) => {
  // Validate required fields 
  const missingFields = connector.config.required_fields.filter(
    field => !config[field]
  );

  if (missingFields.length > 0) {
    throw new Error(`Missing required fields: ${missingFields.join(", ")}`);
  }

  // Should not be able to create a connection if the team does not exist
  if (!team_id) {
    throw new Error("No team found");
  }

  // Should not be able to create a connection if the connection is invalid
  const isValid = await validateConnection(connector, config);
  if (!isValid) {
    throw new Error("Invalid connection configuration");
  }

  // Insert the connection
  const { error: insertError } = await supabase
    .from('connections')
    .insert({
      connector_id: connector.id,
      name: connectionName,
      config,
      team_id,
      is_active: true
    });

  if (insertError) throw insertError;
};

export const updateConnection = async (id: string, name: string, connector: Connector, config: Record<string, any>): Promise<void> => {

  // Should not be able to update a connection if the connection does not exist
  const connection = await fetchConnectionById(id);
  if (!connection) {
    throw new Error("Connection not found");
  }

  // Should not be able to update a connection if the connection is invalid
  const isValid = await validateConnection(connector, config);
  if (!isValid) {
    throw new Error("Invalid connection configuration");
  }

  const { error } = await supabase
    .from('connections')
    .update({ name, config })
    .eq('id', id);

  if (error) throw error;
};

export const deleteConnection = async (id: string): Promise<void> => {
  // TODO: Should not be able to delete a connection if it is in use (syncing, webhooks, etc.)
  const { error } = await supabase
    .from('connections')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

export const validateConnection = async (connector: Connector, config: Record<string, any>): Promise<boolean> => {
  const missingFields = connector.config.required_fields.filter(
    field => !config[field]
  );

  if (missingFields.length > 0) {
    throw new Error(`Missing required fields: ${missingFields.join(", ")}`);
  }

  return await validate(connector.provider, config);
};

const validate = async (provider: ConnectorProvider, config: Record<string, any>): Promise<boolean> => {
  try {
    const result = await fetchWithAuth("/validate-connection", {
      method: "POST",
      body: JSON.stringify({ provider, config }),
    });

    return result.valid as boolean;
  } catch (error) {
    console.error('Connection validation error:', error);
    return false;
  }
}