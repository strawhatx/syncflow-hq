// Strategy pattern for rendering connection fields

import CloudFilePicker from "@/components/ui_custom/CloudFilePicker";
import { CustomSelectButton } from "@/components/ui_custom/CustomSelectButton";
import getIcon from "@/features/sync/utils/util";
import { Connector, ConnectorProvider } from "@/types/connectors";

interface DatasourceFieldStrategy {
    renderFields(source: any[], isLoading: boolean, setValue: (value: any) => void, value?: any): React.ReactNode
}

class DatasourceMapAdapter {
    mapper = {
        airtable: {
            map: (item: any) => ({
                id: item?.id,
                name: item?.config?.base_name,
            })
        },
        google_sheets: {
            map: (item: any) => ({
                id: item?.id,
                name: item?.config?.spreadsheet_name,
                size: item?.config?.size || 0,
                last_modified: item?.config?.modifiedTime
            })
        },
        supabase: {
            map: (item: any) => ({
                id: item?.id,
                name: item?.config?.project_name,
            })
        },
        notion: {
            map: (item: any) => ({
                id: item?.id,
                name: item?.config?.database_name,
            })
        },
        default: {
            map: (item: any) => ({
                id: item?.id,
                name: item?.config?.name,
            })
        }
    }
}

class DropdownFieldStrategy implements DatasourceFieldStrategy {
    constructor(private provider: ConnectorProvider) { }
    // define mapper for different providers

    // render a dropdown field for a datasource
    renderFields(source: any[], isLoading: boolean, setValue: (value: any) => void, value?: any): React.ReactNode {
        const mapper = new DatasourceMapAdapter();
        const mapOrDefault = mapper.mapper[this.provider]?.map || mapper.mapper.default.map;

        return (
            <>
                <CustomSelectButton
                    value={value}
                    onValueChange={(value) => setValue(value)}
                    options={source.map((item) => {
                        const mapped = mapOrDefault(item);
                        mapped.icon = getIcon(this.provider);
                        return mapped;
                    }) || []}
                    placeholder={`Select datasource`}
                    disabled={isLoading}
                    isLoading={isLoading}
                />
            </>
        );
    }
}

class FileFieldStrategy implements DatasourceFieldStrategy {
    constructor(private provider: ConnectorProvider) { }

    renderFields(source: any[], isLoading: boolean, setValue: (value: any) => void, value?: any): React.ReactNode {
        const mapper = new DatasourceMapAdapter();
        const mapOrDefault = mapper.mapper[this.provider]?.map || mapper.mapper.default.map;

        return (
            <>
                <CloudFilePicker
                    value={value}
                    files={source.map(mapOrDefault) || []}
                    onClose={(file) => setValue(file)}
                    disabled={isLoading}
                    isLoading={isLoading}
                />
            </>
        );
    }
}

export class DatasourceFieldsStrategyFactory {
    static getStrategy(connector: Connector): DatasourceFieldStrategy {
        // Only google and spradsheet like apps use file field
        switch (connector.provider) {
            case "google_sheets":
                return new FileFieldStrategy(connector.provider);
            default:
                return new DropdownFieldStrategy(connector.provider);
        }
    }
}
