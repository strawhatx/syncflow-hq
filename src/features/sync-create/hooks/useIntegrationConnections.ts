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

export const useIntegrationConnections = (selectedSource: string | null, selectedDestination: string | null) => {
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
  const { data: sourceConnections, isLoading: isLoadingSourceConnections } = useQuery<Connection[]>({
    queryKey: ['connections', selectedSource],
    queryFn: async () => {
      if (!selectedSource) return [];
      const { data, error } = await supabase
        .from('integration_connections')
        .select('*')
        .eq('integration_id', selectedSource);
      
      if (error) {
        console.error('Error fetching source connections:', error);
        throw error;
      }
      return data || [];
    },
    enabled: !!selectedSource,
  });

  // Fetch destination connections
  const { data: destinationConnections, isLoading: isLoadingDestinationConnections } = useQuery<Connection[]>({
    queryKey: ['connections', selectedDestination],
    queryFn: async () => {
      if (!selectedDestination) return [];
      const { data, error } = await supabase
        .from('integration_connections')
        .select('*')
        .eq('integration_id', selectedDestination);
      
      if (error) {
        console.error('Error fetching destination connections:', error);
        throw error;
      }
      return data || [];
    },
    enabled: !!selectedDestination,
  });

  // Filter integrations for destination
  const filteredIntegrations = integrations.filter(integration => integration.id !== selectedSource);

  return {
    integrations,
    sourceConnections,
    destinationConnections,
    filteredIntegrations,
    isLoadingIntegrations,
    isLoadingSourceConnections,
    isLoadingDestinationConnections,
  };
}; 