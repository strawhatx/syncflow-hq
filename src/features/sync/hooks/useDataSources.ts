import { useQuery } from "@tanstack/react-query";
import { ConnectorProvider } from "@/types/connectors";
import { fetchWithAuth } from "@/lib/api";

const fetchSources = async (provider?: ConnectorProvider) => {
  if (!provider) return [];
  const result = await fetchWithAuth(`get-schema`, {
    method: "POST",
    body: JSON.stringify({
      provider,
      action: "sources",
      config: {}
    }),
  });
  return result.json();
};

export function useDataSources(provider?: ConnectorProvider) {
  return useQuery({
    queryKey: ["sources", provider],
    queryFn: () => fetchSources(provider),
    enabled: !!provider,
  });
}
