import { SetupStage } from "@/integrations/supabase/types";
import { User } from "@supabase/supabase-js";
import { Team } from "./team";
import Sync from "@/features/sync";

export type SyncDirection = "source-to-destination" | "destination-to-source" | "two-way";
export type ConflictResolution = "latest" | "previous" | "custom";
export type Schedule = "every 1 hour" | "every 1 day" | "every 1 week" | "every 1 month" | "every 1 year" | "every 1 minute" | "every 1 second";
export type Backoff = "exponential" | "linear" | "constant";

export interface SyncFieldMapping {
    source_field_id: string;
    destination_field_id: string;
    transformation?: string; // e.g., "combine", "toISOString", "uppercase"
    params?: Record<string, any>; // e.g., { separator: " " }
}

export interface SyncFilter {
    source_field: string;
    operator: "eq" | "neq" | "gt" | "gte" | "lt" | "lte" | "in" | "nin" | "like" | "nlike" | "ilike" | "nilike" | "is" | "is_not" | "is_null" | "is_not_null";
    value: string | number | boolean | string[] | number[] | boolean[];
}

export interface SyncTableMapping {
    id: string;
    source_table_id: string;
    destination_table_id: string;
    field_mappings: SyncFieldMapping[];
    direction: SyncDirection;         // NEW: direction per mapping
    filters: SyncFilter[];            // NEW: filters per mapping
}

export interface SyncSchema {
    source_database_id: string;
    destination_database_id: string;
    table_mappings: SyncTableMapping[];
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
    schema: SyncSchema;
    schedule: Schedule;
    batch_size: SyncBatchSize;
    retry_policy: SyncRetryPolicy;
    notifications: SyncNotifications;
    // REMOVE: filters: SyncFilter[]; // Now handled per table mapping
}

export interface Sync {
    id: string
    name: string
    source_id: string
    destination_id: string
    created_by: string
    config: SyncConfig
    team_id: string
    setup_stage: SetupStage
    is_active: boolean
}

const defaultData = (user: User): Omit<Sync, "id" | "created_by" | "team_id"> => {
    return {
        name: "Untitled Sync",
        source_id: null,
        destination_id: null,

        config: {
            conflict_resolution: "latest" as ConflictResolution,
            schema: {
                source_database_id: null,
                destination_database_id: null,
                table_mappings: [],
            },
            schedule: "every 1 hour" as Schedule,
            batch_size: {
                size: 100,
                interval: 1000,
            },
            retry_policy: {
                max_retries: 3,
                backoff: "exponential"
            },
            notifications: {
                notify: [user?.email || ""],
                on_success: true,
                on_failure: true,
                on_partial_failure: true,
                on_retry: false,
                on_timeout: true,
            },
        } as SyncConfig,
        is_active: true,
        setup_stage: "source" as SetupStage,

    }
}

export const defaultCreateSync = (user: User, team: Team): Omit<Sync, "id"> => {
    return {
        ...defaultData(user),
        created_by: user.id,
        team_id: team?.id,
    }
}

export const defaultUpdateSync = (sync_id: string, user: User): Omit<Sync, "created_by" | "team_id"> => {
    return {
        ...defaultData(user),
        id: sync_id
    }
}
