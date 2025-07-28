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