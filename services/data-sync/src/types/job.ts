export type DataSyncJobStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface DataSyncJob {
    id: string;
    sync_id: string;
    team_id: string;
    provider: string;
    status: DataSyncJobStatus;
    payload?: any;
    last_synced_at?: string;
    message?: string;
    created_at: string;
    updated_at: string;
    retry_count?: number;
}