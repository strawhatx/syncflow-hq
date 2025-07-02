// Strategy pattern for rendering connection fields

import CloudFilePicker from "@/components/ui_custom/CloudFilePicker";
import { CustomSelect } from "@/components/ui_custom/CustomSelect";
import { Connector } from "@/types/connectors";

interface DatasourceFieldStrategy {
    renderFields(source: any[], isLoading: boolean, setValue: (value: any) => void, type?: "source" | "destination", value?: any): React.ReactNode
}

class DropdownFieldStrategy implements DatasourceFieldStrategy {
    renderFields(source: any[], isLoading: boolean, setValue: (value: any) => void, type?: "source" | "destination", value?: any): React.ReactNode {
        return (
            <>
                <CustomSelect
                    value={value}
                    onValueChange={(value) => setValue(value)}
                    options={source.map((item: any) => ({
                        // since were pulling datasources its not guaranteed to have ids
                        id: item.id || item.name,
                        name: item.name
                    })) || []}
                    placeholder={`Select datasource`}
                    disabled={isLoading}
                    isLoading={isLoading}
                />
            </>
        );
    }
}

class FileFieldStrategy implements DatasourceFieldStrategy {
    renderFields(source: any[], isLoading: boolean, setValue: (value: any) => void, type?: "source" | "destination", value?: any): React.ReactNode {
        return (
            <>
                <CloudFilePicker
                    value={value}
                    files={source.map((item: any) => ({
                        // since were pulling datasources its not guaranteed to have ids
                        id: item.id || item.name,
                        name: item.name,
                        type: item.type,
                        size: item.size || 0,
                        last_modified: item.modifiedTime
                    })) || []}
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
                return new FileFieldStrategy();
            default:
                return new DropdownFieldStrategy();
        }
    }
}
