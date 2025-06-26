import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { SetupStage } from "@/integrations/supabase/types";
import { useAuth } from "@/contexts/AuthContext";
import { useTeam } from "@/contexts/TeamContext";
import { defaultCreateSync } from "@/types/sync";

export type Sync = {
  id: string;
  name: string;
  is_active: boolean;
  lastSync?: string;
  source?: any;
  destination?: any;
  entityCount?: number;
  setup_stage?: SetupStage;
};

const fetchSyncs = async (teamId: string): Promise<Sync[]> => {
  if (!teamId) throw new Error("Team not found");
  
  const { data, error } = await supabase
    .from("syncs")
    .select("*")
    .eq("team_id", teamId);
    
  if (error) throw error;
  return data || [];
};

const useSyncs = (search: string) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { team } = useTeam();

  const { data: syncs = [], isLoading } = useQuery({
    queryKey: ["syncs"],
    queryFn: () => fetchSyncs(team?.id),
  });

  const createSyncMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("User not authenticated");
      const { data, error } = await supabase
        .from("syncs")
        .insert(defaultCreateSync(user, team))
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["syncs"] });
      navigate(`/syncs/edit/${data.id}`);
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