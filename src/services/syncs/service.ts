import { supabase } from "@/integrations/supabase/client";
import { defaultCreateSync, Sync } from "@/types/sync";
import { Team } from "@/types/team";
import { User } from "@supabase/supabase-js";

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
export const fetchSyncById = async (sync_id: string): Promise<Sync> => {
    if (!sync_id) throw new Error("Sync not found");

    const { data, error } = await supabase
        .from("syncs")
        .select("*")
        .eq("id", sync_id);

    if (error) throw error;

    return data[0] as Sync;
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
export const saveSync = async (syncId: string, data: Sync) => {
    const { data: sync, error } = await supabase
        .from('syncs')
        .update(data)
        .eq('id', syncId)
        .select()
        .single();

    if (error) {
        throw new Error(error.message);
    }

    return sync;
};