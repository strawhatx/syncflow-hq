import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import { fetchWithAuth } from '@/lib/api';
import { Connector, ConnectorProvider } from "@/types/connectors";
import { DatasourceMapAdapterFactory } from '@/patterns/factories/mapper';
import getIcon from '@/features/sync/utils/util';

// types for connection related tables
type Connection = Database['public']['Tables']['connections']['Row'];
type ConnectionDatabase = Database['public']['Tables']['connection_databases']['Row'];
type ConnectionTable = Database['public']['Tables']['connection_tables']['Row'];
type ConnectionColumn = Database['public']['Tables']['connection_columns']['Row'];

// fetch connection by id via supabase
export const fetchConnectionById = async (id: string): Promise<Connection | null> => {
  const { data, error } = await supabase
    .from('connections')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
};

  // fetch connection databases
  export const fetchConnectionDatabases = async (connection_id: string): Promise<ConnectionDatabase[]> => {
  const { data, error } = await supabase
    .from('connection_databases')
    .select('*')
    .eq('connection_id', connection_id);

  if (error) throw error;
  return data;
};

// fetch tables for a connection database
export const fetchTablesByDatabaseId = async (database_id: string, provider: ConnectorProvider): Promise<TableOption[]> => {
  const { data, error } = await supabase
    .from('connection_tables')
    .select('*, connection_columns( id, name )')
    .eq('database_id', database_id);

  if (error) throw error;

  return data.map(DatasourceMapAdapterFactory.getAdapter(provider));
};

// fetch columns for a connection table
export const fetchColumnsByTableId = async (table_id: string): Promise<ConnectionColumn[]> => {
  const { data, error } = await supabase
    .from('connection_columns')
    .select('*')
    .eq('table_id', table_id);

  if (error) throw error;
  return data;
};

// create connection via supabase but must validate connection first
export const createConnection = async (team_id: string, connector: Connector, config: Record<string, any>) => {
  // Validate required fields 
  const missingFields = connector.required_fields.filter(
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
      name: config.name,
      //omit the name from the config
      config: omit(config, 'name'),
      team_id,
      is_active: true
    });

  if (insertError) throw insertError;
};

export const updateConnection = async (id: string, connector: Connector, config: Record<string, any>): Promise<void> => {
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
    .update({ config, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) throw error;
};

// delete connection via supabase
export const deleteConnection = async (id: string): Promise<void> => {
  // TODO: Should not be able to delete a connection if it is in use (syncing, webhooks, etc.)
  const { error } = await supabase
    .from('connections')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

// validate connection via endpoint with fields from connector
export const validateConnection = async (connector: Connector, config: Record<string, any>): Promise<boolean> => {
  const missingFields = connector.required_fields.filter(
    field => !config[field]
  );

  if (missingFields.length > 0) {
    throw new Error(`Missing required fields: ${missingFields.join(", ")}`);
  }

  return await validate(connector.provider, config);
};

// call endpoint to validate connection via  datasource connections
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

function omit(config: Record<string, any>, key: string): any {
  const { [key]: _, ...rest } = config;
  return rest;
}
