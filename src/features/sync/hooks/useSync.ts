import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SetupStage } from "@/integrations/supabase/types";
import { SyncConfig } from "@/types/sync";
import { ConnectorWithConnections } from "@/services/connectorService";

export type SyncData = {
  id: string;
  name: string;
  is_active: boolean;
  lastSync?: string;
  source?: {
    id: string;
    connector_id: string;
    connector: ConnectorWithConnections;
    database: any;
  };
  destination?: {
    id: string;
    connector_id: string;
    connector: ConnectorWithConnections;
    database: any;
  };
  config?: SyncConfig;
  entityCount?: number;
  setup_stage?: SetupStage;
};

const defaultSyncData: SyncData = {
  id: "",
  name: "",
  is_active: false,
  source: {
    id: "",
    connector_id: "",
    connector: undefined,
    database: "",
  },
  destination: {
    id: "",
    connector_id: "",
    connector: undefined,
    database: "",
  },
};

const mapSyncData = (data: any[]): SyncData => {

  var result = data.map((item: any) => ({
    ...item,
    source: {
      ...item.source,
      connector: item.source.connectors_public
    },
    destination: {
      ...item.destination,
      connector: item.destination.connectors_public
    }
  }));

  return result[0] || defaultSyncData as SyncData;
};

const fetchSync = async (sync_id: string): Promise<SyncData> => {
  if (!sync_id) throw new Error("Sync not found");

  const { data, error } = await supabase
    .from("syncs")
    .select(`
      *, 
      source:source_id(
        *, 
        connectors_public(*, connections(*))
      ), 
      destination:destination_id(
        *, 
        connectors_public(*, connections(*))
      )
    `)
    .eq("id", sync_id);

  if (error) throw error;

  return mapSyncData(data);
};

export const saveStepData = async (syncId: string, step: string, data: Record<string, any>) => {
  console.log(`Saving step data for sync ${syncId} step ${step} with data ${JSON.stringify(data)}`);

  const { data: sync, error } = await supabase
    .from('syncs')
    .update(data)
    .eq('id', syncId)
    .select()
    .single();

  if (error) {
    console.error(`Error saving step data for sync ${syncId} step ${step}: ${error.message}`);
    throw new Error(error.message);
  }

  return sync;
};

const useSync = (sync_id: string) => {
  const queryClient = useQueryClient();

  const { data: sync = defaultSyncData, isLoading } = useQuery({
    queryKey: ["sync"],
    queryFn: () => fetchSync(sync_id),
  });

  const createSyncMutation = useMutation({
    mutationFn: async ({ step, data }: { step: string; data: Record<string, any> }) => saveStepData(sync_id, step, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sync"] });
    },
  });

  return {
    sync,
    isLoading,
    createSyncMutation,
  };
};

export default useSync; 