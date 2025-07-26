import { supabase } from "@/config/supabase";

export interface DataSyncJob {
  id: string;
  sync_id: string;
  team_id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  last_synced_at?: string;
  error?: string;
  created_at: string;
  updated_at: string;
}

export async function createDataSyncJob(syncId: string, teamId: string): Promise<DataSyncJob> {
  const { data, error } = await supabase
    .from('data_sync_jobs')
    .insert([
      {
        sync_id: syncId,
        team_id: teamId,
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

export async function getPendingJobs(): Promise<DataSyncJob[]> {
  const { data, error } = await supabase
    .from('data_sync_jobs')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching pending jobs:', error);
    throw new Error(`Failed to fetch pending jobs: ${error.message}`);
  }

  return data || [];
}

export async function getJobById(jobId: string): Promise<DataSyncJob | null> {
  const { data, error } = await supabase
    .from('data_sync_jobs')
    .select('*')
    .eq('id', jobId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Job not found
    }
    console.error('Error fetching job:', error);
    throw new Error(`Failed to fetch job: ${error.message}`);
  }

  return data;
} 