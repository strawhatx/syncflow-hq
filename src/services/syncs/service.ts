import { supabase } from "@/integrations/supabase/client";
import { SetupStage } from "@/integrations/supabase/types";
import { defaultCreateSync, Sync, SyncConfig } from "@/types/sync";
import { Team } from "@/types/team";
import { User } from "@supabase/supabase-js";
import { ConnectorWithConnections } from "../connector/service";

// fetch syncs by team id
export const fetchSyncsByTeamId = async (teamId: string): Promise<Sync[]> => {
    if (!teamId) throw new Error("Team not found");

    const { data, error } = await supabase
        .from("syncs")
        .select("*")
        .eq("team_id", teamId);

    if (error) throw error;
    return data || [];
};

// fetch sync by id
export const fetchSyncById = async (sync_id: string): Promise<any> => {
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

    return data;
};

// create sync
export const createInitialSync = async (user: User, team: Team) => {
    if (!user) throw new Error("User not authenticated");
    const { data, error } = await supabase
        .from("syncs")
        .insert(defaultCreateSync(user, team))
        .select()
        .single();
    if (error) throw error;
    return data;
}

// update sync step data
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