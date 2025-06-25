import { SetupStage } from "@/integrations/supabase/types";

export type SyncDirection = "one-way" | "two-way";
export type ConflictResolution = "latest" | "previous" | "custom";
export type Schedule = "every 1 hour" | "every 1 day" | "every 1 week" | "every 1 month" | "every 1 year" | "every 1 minute" | "every 1 second";
export type Backoff = "exponential" | "linear" | "constant";

export interface SyncFieldMapping {
    source_field: string;
    destination_field: string;
    transformation?: string; // e.g., "combine", "toISOString", "uppercase"
    params?: Record<string, any>; // e.g., { separator: " " }
}

export interface SyncTableMapping {
    source_table: string;
    destination_table: string;
    field_mapping: SyncFieldMapping[];
}

export interface SyncFilter {
    source_field: string;
    operator: "eq" | "neq" | "gt" | "gte" | "lt" | "lte" | "in" | "nin" | "like" | "nlike" | "ilike" | "nilike" | "is" | "is_not" | "is_null" | "is_not_null";
    value: string | number | boolean | string[] | number[] | boolean[];
}

export interface SyncBatchSize {
    size: number;
    interval: number;
}

export interface SyncRetryPolicy {
    max_retries: number;
    backoff: Backoff;
}

export interface SyncNotifications {
    notify: string[];
    on_success: boolean;
    on_failure: boolean;
    on_partial_failure: boolean;
    on_retry: boolean;
    on_timeout: boolean;
}

export interface SyncConfig {
    conflict_resolution: ConflictResolution;
    table_mappings: SyncTableMapping[];
    schedule: Schedule;
    filters: SyncFilter[];
    batch_size: SyncBatchSize;
    retry_policy: SyncRetryPolicy;
    notifications: SyncNotifications;
}

export interface Sync {
    id: string
    name: string
    source_id: string
    destination_id: string
    config: SyncConfig
    team_id: string
    setup_stage: SetupStage
    is_active: boolean
    sync_direction: SyncDirection
}