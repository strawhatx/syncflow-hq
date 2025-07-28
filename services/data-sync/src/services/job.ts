import { supabase } from "@/config/supabase";
import { DataSyncJob } from "@/types/job";

export async function createDataSyncJob(syncId: string, teamId: string, payload: any): Promise<DataSyncJob> {
  const { data, error } = await supabase
    .from('data_sync_jobs')
    .insert([
      {
        sync_id: syncId,
        team_id: teamId,
        payload: payload,
        status: 'pending',
        progress: 0,
      }
    ])
    .select()
    .single();

  if (error) {
    console.error('Error creating data sync job:', error);
    throw new Error(`Failed to create data sync job: ${error.message}`);
  }

  return data;
}

export async function updateJobStatus(jobId: string, status: DataSyncJob['status'], progress?: number, error?: string): Promise<DataSyncJob> {
  const updateData: any = { status };
  
  if (progress !== undefined) {
    updateData.progress = progress;
  }
  
  if (error !== undefined) {
    updateData.error = error;
  }
  
  if (status === 'running') {
    updateData.last_synced_at = new Date().toISOString();
  }

  const { data, error: updateError } = await supabase
    .from('data_sync_jobs')
    .update(updateData)
    .eq('id', jobId)
    .select()
    .single();

  if (updateError) {
    console.error('Error updating job status:', updateError);
    throw new Error(`Failed to update job status: ${updateError.message}`);
  }

  return data;
}