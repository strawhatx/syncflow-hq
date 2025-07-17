import getIcon from "@/features/sync/utils/util";
import { ConnectorProvider, TableOption } from "@/types/connectors";

class DatasourceMapAdapter {
    constructor(private provider: ConnectorProvider) {}
    mapper = {
        google_sheets: {
            map: (item: any): TableOption => ({
                id: item?.id,
                name: item?.config?.sheet_name,
                columns: item?.connection_columns,
                icon: getIcon(this.provider)
            })
        },
        default: {
            map: (item: any): TableOption => ({
                id: item?.id,
                name: item?.config?.table_name,
                columns: item?.connection_columns,
                icon: getIcon(this.provider)
            })
        }
    }
}

export class DatasourceMapAdapterFactory {
    static getAdapter(provider: ConnectorProvider): (item: any) => TableOption {
        return new DatasourceMapAdapter(provider).mapper[provider]?.map || new DatasourceMapAdapter(provider).mapper.default.map;
    }
}