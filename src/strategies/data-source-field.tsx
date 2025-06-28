// Strategy pattern for rendering connection fields

import { CustomSelect } from "@/components/ui_custom/CustomSelect";
import { Connector } from "@/types/connectors";

interface DatasourceFieldStrategy {
    renderFields(type: "source" | "destination", value: any, source: any[], setValue: (value: any) => void): React.ReactNode
}

class DropdownFieldStrategy implements DatasourceFieldStrategy {
    renderFields(type: "source" | "destination", value: any, source: any[], setValue: (value: any) => void): React.ReactNode {
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
    renderFields(type: "source" | "destination", value: any, source: any[], setValue: (value: any) => void): React.ReactNode {
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

class DefaultDataSourceFieldsStrategy implements DatasourceFieldsStrategy {
    renderFields(config: Record<string, any>, setConfig: (config: Record<string, any>) => void): React.ReactNode {
        return (
            <></>
        );
    }
}

export class DatasourceFieldsStrategyFactory {
    static getStrategy(connector: Connector): DatasourceFieldsStrategy {
        switch (connector.provider) {
            case "dropdown":
                return new DropdownFieldStrategy();
            case "file":
                return new FileFieldStrategy();
            default:
                return new DefaultDataSourceFieldsStrategy();
        }
    }
}
