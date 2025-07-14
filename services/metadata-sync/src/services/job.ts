import { supabase } from "../config/supabase";
import { MetadataSyncJob } from "../types/job";

export const getPendingJob = async () => {
    // Get pending jobs with a transaction to ensure no other Lambda grabs the same job
    const { data, error } = await supabase
        .from("metadata_sync_jobs")
        .select('*, connection:connection_id(id, connector:connector_id(id, provider))')
        .eq("status", "pending")
        .limit(1)
        .single();

    if (error) {
        if (error.code === 'PGRST116') {
            console.log("No pending jobs found");
            return;
        }

        throw error;
    }

    return data as MetadataSyncJob;
}

export const updateJobStatus = async (jobId: string, status: string, searchStatus: string): Promise<boolean> => {
    // Update job to processing
    const { error } = await supabase
        .from("metadata_sync_jobs")
        .update({
            status: status,
            started_at: new Date().toISOString()
        })
        .eq("id", jobId)
        .eq("status", searchStatus); // only update if the status matches

    return !error;
}

export const failJob = async (jobId: string, errorMessage: string) => {
    await supabase
        .from("metadata_sync_jobs")
        .update({
            status: "failed",
            error_message: errorMessage,
            completed_at: new Date().toISOString()
        })
        .eq("id", jobId)
        .eq("status", "processing"); // Only update if still processing
}