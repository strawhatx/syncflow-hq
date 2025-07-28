import { supabase } from "@/integrations/supabase/client";

export const addMetadataSyncJob = async (connectionId: string, teamId: string) => {
    //validate connctionId  & teamId are valid guids
    if (!isValidUUID(connectionId)) {
        throw new Error('Invalid connectionId');
    }

    if (!isValidUUID(teamId)) {
        throw new Error('Invalid teamId');
    }

    // we only want to add a job if this is a new connection 
    // if it already exists, skip it
    const { error } = await supabase
        .from('metadata_sync_jobs')
        .insert({
            connection_id: connectionId,
            team_id: teamId
        });

    // if the job already exists, skip it
    if (error?.code === '23505') {
        return false;
    }

    if (error) {
        throw error;
    }

    return true;
}

const isValidUUID = (uuid: string) => {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(uuid);
}