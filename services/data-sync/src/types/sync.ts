export type SyncDirection = "source-to-destination" | "destination-to-source" | "two-way";
type Schedule = "every 1 hour" | "every 1 day" | "every 1 week" | "every 1 month" | "every 1 year" | "every 1 minute" | "every 1 second";
type Backoff = "exponential" | "linear" | "constant";
type SyncStatus = "draft" | "active" | "paused" | "error";
type SyncStage = "accounts" | "data-sources" | "mappings" | "filters" | "ready";
type ConflictResolution = 'source' | 'destination' | 'latest';


interface SyncFieldMapping {
    source_field_id: string;
    destination_field_id: string;
    transformation?: string; // e.g., "combine", "toISOString", "uppercase"
    params?: Record<string, any>; // e.g., { separator: " " }
}

interface SyncFilter {
    field_id: string;
    operator: "eq" | "neq" | "gt" | "gte" | "lt" | "lte" | "in" | "nin" | "like" | "nlike" | "ilike" | "nilike" | "is" | "is_not" | "is_null" | "is_not_null";
    value: string | number | boolean | string[] | number[] | boolean[];
}

interface SyncTableMapping {
    id: string;
    source_table_id: string;
    destination_table_id: string;
    field_mappings: SyncFieldMapping[];
    direction: SyncDirection;         // NEW: direction per mapping
    filters: {
        source: SyncFilter[];
        destination: SyncFilter[];
    }
    last_synced_at: string;
}

export interface SyncSchema {
    source_database_id: string;
    destination_database_id: string;
    table_mappings: SyncTableMapping[];
}

interface SyncBatchSize {
    size: number;
    interval: number;
}

interface SyncRetryPolicy {
    max_retries: number;
    backoff: Backoff;
}

interface SyncNotifications {
    notify: string[];
    on_success: boolean;
    on_failure: boolean;
    on_partial_failure: boolean;
    on_retry: boolean;
    on_timeout: boolean;
}

interface SyncConfig {
    stage: SyncStage
    conflict_resolution: ConflictResolution
    schema: SyncSchema
    schedule: Schedule
    batch_size: SyncBatchSize
    retry_policy: SyncRetryPolicy
    notifications: SyncNotifications
}

export interface Sync {
    id: string
    name: string
    source_id: string
    destination_id: string
    created_by: string
    config: SyncConfig
    team_id: string
    status: SyncStatus
}
