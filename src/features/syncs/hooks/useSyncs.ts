import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useCallback } from "react";

export type Sync = {
  id: string;
  name: string;
  is_active: boolean;
  lastSync?: string;
  source?: any;
  destination?: any;
  entityCount?: number;
  setup_stage?: string;
};

const fetchSyncs = async (): Promise<Sync[]> => {
  const { data, error } = await supabase.from("syncs").select("*");
  if (error) throw error;
  return data || [];
};

const useSyncs = (search: string) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: syncs = [], isLoading } = useQuery({
    queryKey: ["syncs"],
    queryFn: fetchSyncs,
  });

  const createSyncMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");
      const { data, error } = await supabase
        .from("syncs")
        .insert({
          name: "Untitled Sync",
          source_connection_id: null,
          destination_connection_id: null,
          entity_type: null,
          sync_direction: "two-way",
          conflict_resolution: "latest",
          is_active: true,
          user_id: user.id,
          setup_stage: "connections",
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["syncs"] });
      navigate(`/syncs/${data.id}`);
    },
  });

  const filteredSyncs = Array.isArray(syncs)
    ? syncs.filter(sync =>
        (sync.name || "").toLowerCase().includes(search.toLowerCase())
      )
    : [];

  return {
    syncs,
    isLoading,
    createSyncMutation,
    filteredSyncs,
  };
};

export default useSyncs; 