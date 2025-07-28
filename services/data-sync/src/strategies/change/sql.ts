import { ChangeDetectionStrategy } from ".";

export class SqlChangeDetectorStrategy implements ChangeDetectionStrategy {
    constructor(private readonly value: any) {}

    getChanges(): Record<string, any> {
        return {
            databaseId: this.value.databaseId,
            schemaId: this.value.schemaId,
        };
    }
}