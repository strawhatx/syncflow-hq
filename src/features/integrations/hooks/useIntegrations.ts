import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchIntegrations, IntegrationWithConnections } from "@/services/integrationService";

export const categories = [
  { id: "all", name: "All Integrations" },
  { id: "commerce", name: "E-commerce Platforms" },
  { id: "database", name: "Databases" },
  { id: "marketing", name: "Marketing Tools" },
  { id: "productivity", name: "Productivity" },
] as const;

export type CategoryId = typeof categories[number]["id"];

interface UseIntegrationsReturn {
  activeCategory: CategoryId;
  setActiveCategory: (category: CategoryId) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filteredIntegrations: IntegrationWithConnections[];
  connectedIntegrations: IntegrationWithConnections[];
  availableIntegrations: IntegrationWithConnections[];
  isLoading: boolean;
  error: Error | null;
}

export const useIntegrations = (): UseIntegrationsReturn => {
  const [activeCategory, setActiveCategory] = useState<CategoryId>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: integrations, isLoading, error } = useQuery({
    queryKey: ['integrations'],
    queryFn: fetchIntegrations
  });

  // Filter integrations based on category and search query
  const filteredIntegrations = integrations?.filter(integration => {
    // Filter by category
    const categoryMatch = activeCategory === "all" || integration.category === activeCategory;
    
    // Filter by search query
    const searchMatch = integration.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        integration.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    return categoryMatch && searchMatch;
  }) || [];

  // Connected integrations have at least one connection
  const connectedIntegrations = filteredIntegrations.filter(integration => integration.connections.length > 0);
  
  // Available integrations have no connections
  const availableIntegrations = filteredIntegrations.filter(integration => integration.connections.length === 0);

  return {
    activeCategory,
    setActiveCategory,
    searchQuery,
    setSearchQuery,
    filteredIntegrations,
    connectedIntegrations,
    availableIntegrations,
    isLoading,
    error: error as Error | null
  };
}; 