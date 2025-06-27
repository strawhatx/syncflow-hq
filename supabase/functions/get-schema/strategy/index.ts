import { AirtableStrategy } from "./airtable";
import { SupabaseStrategy } from "./supabase";
import { MongoStrategy } from "./mongo";
import { MySQLStrategy } from "./my-sql";
import { PostgresStrategy } from "./postgres";
import { S3Strategy } from "./s3";

export interface DataSourceStrategy {
    getSources(config: Record<string, any>): Promise<string[]>;
    getTables(config: Record<string, any>): Promise<string[]>;
}

export class DataSourceStrategyFactory {
    static getStrategy(provider: string): DataSourceStrategy {
        switch (provider) {
            case "postgres":
                return new PostgresStrategy();
            case "mysql":
                return new MySQLStrategy();
            case "mongo":
                return new MongoStrategy();
            case "s3":
                return new S3Strategy();
            case "supabase":
                return new SupabaseStrategy();
            case "airtable":
                return new AirtableStrategy();
            default:
                throw new Error(`Unsupported provider: ${provider}`);
        }
    }
}