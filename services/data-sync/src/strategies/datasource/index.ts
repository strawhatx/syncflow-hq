import { AirtableStrategy } from "./airtable";
import { providerMap } from "../../types/provider";

export interface DataSourceStrategy {
    getData(config: Record<string, any>): Promise<Record<string, any>[]>;
}

export class DataSourceStrategyFactory {
    static getStrategy(provider: string): DataSourceStrategy {
        switch (provider) {
            case providerMap.airtable:
                return new AirtableStrategy();
        
            default:
                throw new Error(`Unsupported provider: ${provider}`);
        }
    }
}