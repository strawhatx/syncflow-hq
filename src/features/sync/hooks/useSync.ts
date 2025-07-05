import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { SyncData, defaultSyncData } from "../helpers/sync-data";
import { fetchSyncById, saveStepData } from "@/services/syncs/service";

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
    },
    config: {
      ...item.config
    }
  }));

  return result[0] || defaultSyncData as SyncData;
};

const useSync = (sync_id: string) => {
  const queryClient = useQueryClient();

  const { data: sync = defaultSyncData, isLoading } = useQuery({
    queryKey: ["sync"],
    queryFn: () => fetchSyncById(sync_id).then(mapSyncData),
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