import { supabase } from "@/config/supabase";

const fetchActiveSyncs = async () => {
  const { data, error } = await supabase
    .from('syncs')
    .select('*')
    .eq('status', 'active');

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export const processSyncs = async () => {
  const syncs = await fetchActiveSyncs();
  
  //map syncs to jobs
  const jobs = syncs.map((sync) => {
    return {
      id: sync.id,
      sync_id: sync.id,
      team_id: sync.team_id,
      status: 'pending',
      progress: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  })

  // create jobs but only if they don't already exist and are pending  
  // meaning we dont want to have jobs that are already running but if 
  // jobs are already completed than thats ok
  const { data: jobData, error: jobError } = await supabase
    .from('data_sync_jobs')
    .upsert(jobs, { onConflict: 'sync_id, team_id, status' })
    .select();

  if (jobError) {
    throw new Error(jobError.message);
  }

  return jobData;
}

export const getSync = async (syncId: string) => {
  const { data, error } = await supabase
    .from('syncs')
    .select('*')
    .eq('id', syncId)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}