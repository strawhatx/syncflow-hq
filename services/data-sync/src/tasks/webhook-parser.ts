import { WebhookProvider } from "@/types/provider";
import { Sync } from "../types/sync";
import { getConnectionTableByTableId, TableProperty } from "../services/connection";
import { getRelatedSyncsByTableId } from "@/services/sync";

const config = {
    airtable: {
        id: 'tableId',
        search: 'config->>table_id',
    },
    google_sheets: {
        id: 'sheetId',
        search: 'config->>sheet_id',
    },
    supabase: {
        id: 'databaseId',
        search: 'config->>database_id',
    },
    notion: {
        id: 'databaseId',
        search: 'config->>database_id',
    },
    default: {      
        id: 'tableName',
        search: 'config->>table_name',
    }
}

export const webhookParse = async (body: any, provider: WebhookProvider): Promise<Sync[]> => {
    const table = await getConnectionTableByTableId(
        body[config[provider].id] || body[config.default.id],
        config[provider].search as TableProperty || config.default.search as TableProperty
    );

    const syncs = await getRelatedSyncsByTableId(table.id);

    return syncs;
}