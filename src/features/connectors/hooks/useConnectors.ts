import { useQuery } from "@tanstack/react-query";
import { fetchConnectors, ConnectorWithConnections } from "@/services/connector/service";

interface UseConnectorsReturn {
  connectedConnectors: ConnectorWithConnections[];
  availableConnectors: ConnectorWithConnections[];
  isLoading: boolean;
  error: Error | null;
}

export const useConnectors = (): UseConnectorsReturn => {
  const { data: connectors, isLoading, error } = useQuery({
    queryKey: ['connectors'],
    queryFn: fetchConnectors
  });

  // Connected connectors have at least one connection
  const connectedConnectors = connectors?.filter(connector => connector.connections.length > 0);
  
  // Available connectors have no connections
  const availableConnectors = connectors?.filter(connector => connector.connections.length === 0);

  return {
    connectedConnectors,
    availableConnectors,
    isLoading,
    error: error as Error | null
  };
}; 