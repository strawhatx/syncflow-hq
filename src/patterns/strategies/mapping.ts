import getIcon from "@/features/sync/helpers/util";
import { ConnectorProvider } from "@/types/connectors";

interface MappingStrategy {
    map(data: any[], provider: ConnectorProvider): { id: string; name: string; icon?: string }[];
}

export class GoogleSheetsMappingStrategy implements MappingStrategy {
    map(data: any[], provider: ConnectorProvider): { id: string; name: string; icon?: string }[] {
        const icon = getIcon(provider);

        return data.map((item) => ({ 
            id: item.properties.sheetId, 
            name: item.properties.title, 
            icon 
        }));
    }
}

export class DefaultMappingStrategy implements MappingStrategy {
    map(data: any[], provider: ConnectorProvider): { id: string; name: string; icon?: string }[] {
        const icon = getIcon(provider);

        return data.map((item) => ({ 
            id: item.id || item.name, 
            name: item.name, 
            icon 
        }));
    }
}

export class MappingStrategyFactory {
    static getStrategy(provider: string): MappingStrategy {
        switch (provider) {
            case "google_sheets":
                return new GoogleSheetsMappingStrategy();
            default:
                return new DefaultMappingStrategy();
        }
    }
}