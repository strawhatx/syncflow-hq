import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchConnectors, ConnectorWithConnections } from "@/services/connectorService";

interface UseConnectorsReturn {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filteredConnectors: ConnectorWithConnections[];
  connectedConnectors: ConnectorWithConnections[];
  availableConnectors: ConnectorWithConnections[];
  isLoading: boolean;
  error: Error | null;
}

export const useConnectors = (): UseConnectorsReturn => {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: connectors, isLoading, error } = useQuery({
    queryKey: ['connectors'],
    queryFn: fetchConnectors
  });

  // Filter connectors based on search query
  const filteredConnectors = connectors?.filter(connector => {
    // Filter by search query
    const searchMatch = connector.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                       connector.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    return searchMatch;
  }) || [];

  // Connected connectors have at least one connection
  const connectedConnectors = filteredConnectors.filter(connector => connector.connections.length > 0);
  
  // Available connectors have no connections
  const availableConnectors = filteredConnectors.filter(connector => connector.connections.length === 0);

  return {
    searchQuery,
    setSearchQuery,
    filteredConnectors,
    connectedConnectors,
    availableConnectors,
    isLoading,
    error: error as Error | null
  };
}; 