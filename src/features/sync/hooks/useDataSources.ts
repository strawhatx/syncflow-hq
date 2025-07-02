import { useQuery } from "@tanstack/react-query";
import { ConnectorProvider } from "@/types/connectors";
import { fetchWithAuth } from "@/lib/api";
import { useEffect, useState } from "react";

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
  return result;
};

export function useSourceData(connection_id: string, provider?: ConnectorProvider) {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!connection_id || !provider) return;

    setIsLoading(true);

    fetchSources(connection_id, provider).then(setData).finally(() => setIsLoading(false));
  }, [connection_id, provider]);

  return { data, isLoading };
}

export function useDestinationData(connection_id: string, provider?: ConnectorProvider) {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!connection_id || !provider) return;

    setIsLoading(true);

    fetchSources(connection_id, provider).then(setData).finally(() => setIsLoading(false));
  }, [connection_id, provider]);

  return { data, isLoading };
}
