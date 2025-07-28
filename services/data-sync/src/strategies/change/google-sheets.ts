import { ChangeDetectionStrategy } from ".";

export class GoogleSheetsChangeDetectorStrategy implements ChangeDetectionStrategy {
    constructor(private readonly value: any) {}

    getChanges(): Record<string, any> {
        return {
            databaseId: this.value.spreadsheetId,
            tableId: this.value.sheetId,
            tableName: this.value.sheetName,
        };
    }
}