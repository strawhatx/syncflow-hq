import { ChangeDetectionStrategy } from '.';

export class AirtableChangeDetectionStrategy implements ChangeDetectionStrategy {
    async getChanges(syncConfig: any): Promise<any[]> {
        const { baseId, tableName, lastSyncedAt, accessToken, lastModifiedField } = syncConfig;

        let records: any[] = [];
        let offset: string | undefined = undefined;
        do {
            const url = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}?filterByFormula=${encodeURIComponent(`IS_AFTER({${lastModifiedField}}, '${lastSyncedAt}')`)}${offset ? `&offset=${offset}` : ''}`;
            const response = await fetch(url, {
                headers: { Authorization: `Bearer ${accessToken}` }
            });
            const data = await response.json();
            records = records.concat(data.records);
            offset = data.offset;
        } while (offset);
        return records;
    }

    async ensureChangeTrackingField(syncConfig: any): Promise<void> {
        const { baseId, tableName, lastSyncedAt, accessToken, lastModifiedField } = syncConfig;

        const url = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}`;
        const response = await fetch(url, {
            headers: { Authorization: `Bearer ${accessToken}` }
        });
    }
}