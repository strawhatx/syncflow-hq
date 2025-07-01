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

  useEffect(() => {
    if (!connection_id || !provider) return;

    fetchSources(connection_id, provider).then(setData);
  }, [connection_id, provider]);

  return { data };
}

export function useDestinationData(connection_id: string, provider?: ConnectorProvider) {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    if (!connection_id || !provider) return;

    fetchSources(connection_id, provider).then(setData);
  }, [connection_id, provider]);

  return { data };
}
