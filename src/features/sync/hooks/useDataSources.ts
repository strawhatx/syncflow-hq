import { useQuery } from "@tanstack/react-query";
import { ConnectorProvider } from "@/types/connectors";
import { fetchWithAuth } from "@/lib/api";

const fetchSources = async (connection_id: string, provider?: ConnectorProvider) => {
  if (!provider) return [];
  const result = await fetchWithAuth("/get-schema", {
    method: "POST",
    body: JSON.stringify({
      connection_id,
      provider,
      action: "sources",
      config: {}
    }),
  });
  return result.json();
};

export function useDataSources(connection_id: string, provider?: ConnectorProvider) {
  return useQuery({
    queryKey: ["sources", connection_id, provider],
    queryFn: () => fetchSources(connection_id, provider),
    enabled: !!provider,
  });
}
