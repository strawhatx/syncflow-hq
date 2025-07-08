import { AirtableStrategy } from "./airtable.ts";
import { SupabaseStrategy } from "./supabase.ts";
import { MongoStrategy } from "./mongo.ts";
import { MySQLStrategy } from "./my-sql.ts";
import { PostgresStrategy } from "./postgres.ts";
import { S3Strategy } from "./s3.ts";
import { GoogleSheetsStrategy } from "./google-sheets.ts";
import { NotionStrategy } from "./notion.ts";
import { providerMap } from "../../../util/providers.ts";

export interface DataSourceStrategy {
    getSources(connection_id: string, config: Record<string, any>): Promise<Record<string, any>[]>;
    getTables(config: Record<string, any>): Promise<Record<string, any>[]>;
}

// get the provider and config from the request
// provider: string
// action: "tables" | "sources"
// config: see below for the different providers

// example:
// airtable: {
//   baseId: string <= required for getting tables
//   access_token: string <= is pulled from the connection config in the db
// }
// supabase: {
//   project_ref: string <= required for getting tables
//   access_token: string <= is pulled from the connection config in the db
// }
// google_sheets: {
//   spreadsheet_id: string <= required for getting tables
//   sheet_name: string <= required for validating the sheet
//   access_token: string <= is pulled from the connection config in the db
// }
// notion: {
//   databaseId: string <= required for getting tables
//   access_token: string <= is pulled from the connection config in the db
// }
// postgres: {
//   database: string <= required for getting tables
//  ... other params <= pulled from the connection config in the db
// }
// mysql: {
//   database: string <= required for getting tables
//  ... other params <= pulled from the connection config in the db
// }
// mongo: {
//   database: string <= required for getting tables
//  ... other params <= pulled from the connection config in the db
// } 
// s3: {} <= pulled from the connection config in the db
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