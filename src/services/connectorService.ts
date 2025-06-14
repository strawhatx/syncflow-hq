import { supabase } from "@/lib/supabase";

export interface Connector {
  id: string;
  name: string;
  type: 'database' | 'warehouse' | 'saas' | 'file' | 'api';
  provider: string;
  description: string;
  icon: string;
}

export interface Connection {
  id: string;
  connector_id: string;
  name: string;
  config: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface ConnectorWithConnections extends Connector {
  connections: Connection[];
}

export const fetchConnectors = async (): Promise<ConnectorWithConnections[]> => {
  const { data: connectors, error } = await supabase
    .from('connectors')
    .select(`
      *,
      connections:connections(*)
    `);

  if (error) {
    throw error;
  }

  return connectors || [];
}; 