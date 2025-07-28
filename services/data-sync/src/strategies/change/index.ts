
import { SqlServerChangeDetectionStrategy } from "./sql-server";
import { MySqlChangeDetectionStrategy } from "./mysql";

export interface ChangeDetectionStrategy {
    /**
     * Returns an array of changed records since the last sync.
     */
    getChanges(syncConfig: any): Promise<any[]>;

    /**
     * Ensures that the required change tracking field exists (if applicable).
     */
    ensureChangeTrackingField?(syncConfig: any): Promise<void>;

    /**
     * Sets up a database listener (if supported by the provider).
     */
    setupListener?(connectionConfig: any, tableName: string): Promise<void>;
}

/**
 * Factory function to get the appropriate change detection strategy for a provider.
 */
export function getChangeDetectionStrategy(provider: string): ChangeDetectionStrategy {
    switch (provider.toLowerCase()) {
        case 'sqlserver':
            return new SqlServerChangeDetectionStrategy();

        case 'mysql':
            return new MySqlChangeDetectionStrategy();
        default:
            throw new Error(`Unsupported provider: ${provider}`);
    }
}

