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
    connector: ConnectorWithConnections;
    database: any;
  };
  destination?: {
    id: string;
    connector: ConnectorWithConnections;
    database: any;
  };
  config?: SyncConfig;
  entityCount?: number;
  setup_stage?: SetupStage;
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
  return data[0] as SyncData;
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

  const { data: sync = {} as SyncData, isLoading } = useQuery({
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