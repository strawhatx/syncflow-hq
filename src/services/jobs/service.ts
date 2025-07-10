import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";


export const addMetadataSyncJob = async (connectionId: string, teamId: string) => {
    const { user } = useAuth();

    if (!user) {
        throw new Error("User not authenticated");
    }

    // add job to job queue
    const { data, error } = await supabase.functions.invoke('insert_metadata_sync_job', {
        body: {
            p_connection_id: connectionId,
            p_team_id: teamId,
            p_user_id: user?.id
        }
    });

    if (error) {
        throw error;
    }

    return data;
}