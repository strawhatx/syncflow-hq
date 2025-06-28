import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

type Connector = Database['public']['Tables']['connectors']['Row'];
type Connection = Database['public']['Tables']['connections']['Row'];

export interface ConnectorWithConnections extends Connector { 
  connections: Connection[];
}

export const fetchConnectors = async (): Promise<ConnectorWithConnections[]> => {
  const { data: connectors, error } = await supabase
    .from('connectors_public')
    .select(`
      *,
      connections:connections(*)
    `);

  if (error) {
    throw error;
  }

  return connectors || [];
}; 