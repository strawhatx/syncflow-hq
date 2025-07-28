import { supabase } from "@/config/supabase";
import { DataSyncJob, DataSyncJobStatus } from "@/types/job";



export async function createJob(jobData: Omit<DataSyncJob, 'id'>[]): Promise<DataSyncJob> {
  const { data, error } = await supabase
    .from('data_sync_jobs')
    .insert(jobData)
    .select()
    .single();

  if (error) {
    console.error('Error creating data sync job:', error);
    throw new Error(`Failed to create data sync job: ${error.message}`);
  }

  return data;
}

export async function updateJobStatus(jobId: string, status: DataSyncJobStatus, progress?: number, error?: string): Promise<DataSyncJob> {
  const updateData: any = { status };
  
  if (progress) {
    updateData.progress = progress;
  }
  
  if (error) {
    updateData.message = error;
  }
  
  if (status === 'processing') {
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