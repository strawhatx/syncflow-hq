
import { Provider, providerMap } from "@/types/provider";
import { SyncDirection } from "../types/sync";

interface ParameterStrategy {
    getParameters(): Record<string, any>;
}

class AirtableParameterStrategy implements ParameterStrategy {
    constructor(private readonly value: any) {}

    getParameters(): Record<string, any> {
        return {
            databaseId: this.value.baseId,
            tableId: this.value.tableId,
            tableName: this.value.tableName,
        };
    }
}

class GoogleSheetsParameterStrategy implements ParameterStrategy {
    constructor(private readonly value: any) {}

    getParameters(): Record<string, any> {
        return {
            databaseId: this.value.spreadsheetId,
            tableId: this.value.sheetId,
            tableName: this.value.sheetName,
        };
    }
}

class SupabaseParameterStrategy implements ParameterStrategy {
    constructor(private readonly value: any) {}

    getParameters(): Record<string, any> {
        return {
            databaseId: this.value.databaseId,
            schemaId: this.value.schemaId,
        };
    }
}

class NotionParameterStrategy implements ParameterStrategy {
    constructor(private readonly value: any) {}

    getParameters(): Record<string, any> {
        return {
            databaseId: this.value.databaseId,
            schemaId: this.value.schemaId,
        };
    }
}

export class ParameterStrategyFactory {
    static getStrategy(provider: Provider, value: any): ParameterStrategy {
        switch (provider) {
            case providerMap.airtable:
                return new AirtableParameterStrategy(value);
            case providerMap.google_sheets:
                return new GoogleSheetsParameterStrategy(value);
            case providerMap.supabase:
                return new SupabaseParameterStrategy(value);
            case providerMap.notion:
                return new NotionParameterStrategy(value);
            default:
                throw new Error(`Invalid provider: ${provider}`);
        }
    }
}

