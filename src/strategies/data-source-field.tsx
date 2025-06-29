// Strategy pattern for rendering connection fields

import CloudFilePicker from "@/components/ui_custom/CloudFilePicker";
import { CustomSelect } from "@/components/ui_custom/CustomSelect";
import { Connector } from "@/types/connectors";

interface DatasourceFieldStrategy {
    renderFields(source: any[], setValue: (value: any) => void, type?: "source" | "destination", value?: any): React.ReactNode
}

class DropdownFieldStrategy implements DatasourceFieldStrategy {
    renderFields(source: any[], setValue: (value: any) => void, type?: "source" | "destination", value?: any): React.ReactNode {
        return (
            <>
                <CustomSelect
                    value={value}
                    onValueChange={(value) => setValue(value)}
                    options={source || []}
                    placeholder={`Select ${type} project`}
                    disabled={false}
                    isLoading={false}
                />
            </>
        );
    }
}

class FileFieldStrategy implements DatasourceFieldStrategy {
    renderFields(source: any[], setValue: (value: any) => void): React.ReactNode {
        return (
            <>
                <CloudFilePicker
                    files={source || []}
                    onClose={(file) => setValue(file)}
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
