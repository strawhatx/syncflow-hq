import { SyncTableMapping, SyncFieldMapping } from "@/types/sync";

export class TableMappingBuilder {
    private mapping: SyncTableMapping;

    constructor(source: string, destination: string) {
        this.mapping = {
            source_table: source,
            destination_table: destination,
            field_mappings: [],
        };
    }

    addFieldMapping(
        source: string,
        destination: string,
        transformation?: string,
        params?: Record<string, any>
    ) {
        this.mapping.field_mappings.push({
            source_field: source,
            destination_field: destination,
            transformation,
            params
        });

        return this;
    }

    build() {
        return this.mapping;
    }
}

export class SyncBuilder {
    private tableMappings: SyncTableMapping[] = [];

    addTableMapping(source: string, destination: string) {
        const builder = new TableMappingBuilder(source, destination);
        this.tableMappings.push(builder.build());

        return builder; // return the builder to allow chaining
    }

    setTableMappings(mappings: SyncTableMapping[]) {
        this.tableMappings = mappings;
        
        return this;
    }

    buildConfig() {
        return {
            table_mappings: this.tableMappings,
        };
    }
}