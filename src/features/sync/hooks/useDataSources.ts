import { ConnectorProvider } from "@/types/connectors";
import { fetchWithAuth } from "@/lib/api";
import { useEffect, useState } from "react";
import { CreateConfigFactory } from "@/patterns/factories/config";

const fetchSources = async (connection_id: string, action: "sources" | "tables", provider?: ConnectorProvider, config?: Record<string, string>) => {
  if (!provider) return [];
  const result = await fetchWithAuth("/get-schema", {
    method: "POST",
    body: JSON.stringify({
      connection_id,
      provider,
      action,
      config: config || {}
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

    fetchSources(connection_id, "sources", provider).then(setData).finally(() => setIsLoading(false));
  }, [connection_id, provider]);

  return { data, isLoading };
}

export function useDestinationData(connection_id: string, provider?: ConnectorProvider) {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!connection_id || !provider) return;

    setIsLoading(true);

    fetchSources(connection_id, "sources", provider).then(setData).finally(() => setIsLoading(false));
  }, [connection_id, provider]);

  return { data, isLoading };
}

export function useSourceTable(connection_id: string, source_db: string, provider?: ConnectorProvider) {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!source_db || !provider) return;

    setIsLoading(true);

    //get config property from configMap and set the database
    const config = CreateConfigFactory.create(provider, source_db);

    fetchSources(connection_id, "tables", provider, config).then(setData).finally(() => setIsLoading(false));
  }, [connection_id, source_db, provider]);

  return { data, isLoading };
}

export function useDestinationTable(connection_id: string, destination_db: string, provider?: ConnectorProvider) {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!destination_db || !provider) return;

    setIsLoading(true);

    //get config property from configMap and set the database
    const config = CreateConfigFactory.create(provider, destination_db);

    fetchSources(connection_id, "tables", provider, config).then(setData).finally(() => setIsLoading(false));
  }, [connection_id, destination_db, provider]);

  return { data, isLoading };
}
