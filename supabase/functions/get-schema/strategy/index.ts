import { AirtableStrategy } from "./airtable.ts";
import { SupabaseStrategy } from "./supabase.ts";
import { MongoStrategy } from "./mongo.ts";
import { MySQLStrategy } from "./my-sql.ts";
import { PostgresStrategy } from "./postgres.ts";
import { S3Strategy } from "./s3.ts";
import { GoogleSheetsStrategy } from "./google-sheets.ts";
import { NotionStrategy } from "./notion.ts";
import { providerMap } from "../../utils/utils.ts";

export interface DataSourceStrategy {
    getSources(config: Record<string, any>): Promise<Record<string, any>[]>;
    getTables(config: Record<string, any>): Promise<Record<string, any>[]>;
}

export class DataSourceStrategyFactory {
    static getStrategy(provider: string): DataSourceStrategy {
        switch (provider) {
            case providerMap.postgresql:
                return new PostgresStrategy();
            case providerMap.mysql:
                return new MySQLStrategy();
            case providerMap.mongodb:
                return new MongoStrategy();
            case providerMap.s3:
                return new S3Strategy();
            case providerMap.supabase:
                return new SupabaseStrategy();
            case providerMap.airtable:
                return new AirtableStrategy();
            case providerMap.google_sheets:
                return new GoogleSheetsStrategy();
            case providerMap.notion:
                return new NotionStrategy();
            default:
                throw new Error(`Unsupported provider: ${provider}`);
        }
    }
}