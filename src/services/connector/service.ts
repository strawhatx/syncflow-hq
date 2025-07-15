import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { Connector } from "@/types/connectors";

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

  // convert the code_challenge_required to a boolean
  return connectors.map((connector) => ({
    ...connector,
    code_challenge_required: connector.code_challenge_required === 'true'
  })) || [];
}; 