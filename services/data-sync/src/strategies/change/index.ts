
import { Provider, providerMap } from "@/types/provider";
import { SqlChangeDetectorStrategy } from "./sql";
import { AirtableChangeDetectorStrategy } from "./airtable";
import { GoogleSheetsChangeDetectorStrategy } from "./google-sheets";
import { SupabaseChangeDetectorStrategy } from "./supabase";
import { NotionChangeDetectorStrategy } from "./notion";

export interface ChangeDetectionStrategy {
  /**
   * Returns an array of changed records since the last sync.
   * @param syncConfig - The sync configuration (contains provider, table info, last_synced_at, etc.)
   */
  getChanges(syncConfig: any): Promise<any[]>;

  /**
   * Optionally ensures the best change tracking field exists (e.g., adds updated_at for SQL DBs).
   * For SaaS, this may prompt the user or do nothing.
   */
  ensureChangeTrackingField?(syncConfig: any): Promise<void>;
}


export class ChangeDetectorStrategyFactory {
    static getStrategy(provider: Provider, value: any): ChangeDetectionStrategy {
        switch (provider) {
            case providerMap.airtable:
                return new AirtableChangeDetectorStrategy(value);
            case providerMap.google_sheets:
                    return new GoogleSheetsChangeDetectorStrategy(value);
            case providerMap.supabase:
                return new SupabaseChangeDetectorStrategy(value);
            case providerMap.notion:
                return new NotionChangeDetectorStrategy(value);
            default:
                return new SqlChangeDetectorStrategy(value);
        }
    }
}

