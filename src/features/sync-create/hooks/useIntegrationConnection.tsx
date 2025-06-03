import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface Integration {
  id: string;
  name: string;
  icon: string;
  description: string;
}

interface Connection {
  id: string;
  connection_name: string;
  connection_status: string;
  integration_id: string;
  user_id: string;
  api_key: string | null;
  auth_data: any | null;
  created_at: string;
  updated_at: string;
}

export const syncConfig = {
  source: {
    save: async (sync_id: string, connection_id: string) => {
      // Update profile
      const { error: updateError } = await supabase
        .from('syncs')
        .update({
          source_connection_id: connection_id,
        })
        .eq('id', sync_id)
        .single();

      if (updateError) throw updateError;
    }
  },
  destination: {
    save: async (sync_id: string, connection_id: string) => {
      // Update profile
      const { error: updateError } = await supabase
        .from('syncs')
        .update({
          destination_connection_id: connection_id,
        })
        .eq('id', sync_id)
        .single();

      if (updateError) throw updateError;
    }
  }
};

export const useIntegrationConnection = (integrationId: string | null) => {
  // Fetch integrations
  const { data: integrations = [], isLoading: isLoadingIntegrations } = useQuery<Integration[], Error>({
    queryKey: ['integrations_public'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('integrations_public')
        .select('*');
      if (error) {
        console.error('Error fetching integrations:', error);
        throw error;
      }
      return data || [];
    },
  });

  // Fetch source connections
  const { data: connections, isLoading: isLoadingConnections } = useQuery<Connection[]>({
    queryKey: ['connections', integrationId],
    queryFn: async () => {
      if (!integrationId) return [];
      const { data, error } = await supabase
        .from('integration_connections')
        .select('*')
        .eq('integration_id', integrationId);

      if (error) {
        console.error('Error fetching source connections:', error);
        throw error;
      }
      return data || [];
    },
    enabled: !!integrationId,
  });

  return {
    integrations,
    connections,
    isLoadingIntegrations,
    isLoadingConnections,
  };
}; 