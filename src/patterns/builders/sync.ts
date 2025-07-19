import { SyncTableMapping, SyncFieldMapping } from "@/types/sync";
import { v4 as uuidv4 } from 'uuid';

export class FieldMappingBuilder {
    private mapping: SyncFieldMapping;

    constructor(source: string, destination: string, transformation?: string, params?: Record<string, any>) {
        this.mapping = {
            source_field_id: source,
            destination_field_id: destination,
            transformation,
            params
        };
    }

    setSourceField(source: string) {
        this.mapping.source_field_id = source;
        return this;
    }

    setDestinationField(destination: string) {
        this.mapping.destination_field_id = destination;
        return this;
    }

    setTransformation(transformation: string, params?: Record<string, any>) {
        this.mapping.transformation = transformation;
        this.mapping.params = params;
        return this;
    }

    build() {
        return this.mapping;
    }
}

export class TableMappingBuilder {
    private mapping: SyncTableMapping;

    constructor(source: string, destination: string) {
        this.mapping = {
            id: uuidv4(),
            source_table_id: source,
            destination_table_id: destination,
            field_mappings: [],
            direction: "one-way",
            filters: [],
        };
    }

    addFieldMapping(
        source: string,
        destination: string,
        transformation?: string,
        params?: Record<string, any>
    ) {
        this.mapping.field_mappings.push({
            source_field_id: source,
            destination_field_id: destination,
            transformation,
            params
        });

        return this;
    }

    removeFieldMapping(index: number) {
        this.mapping.field_mappings.splice(index, 1);
        return this;
    }

    updateFieldMapping(
        index: number,
        source: string,
        destination: string,
        transformation?: string,
        params?: Record<string, any>
    ) {
        if (index >=0 && index < this.mapping.field_mappings.length) {
            this.mapping.field_mappings[index] = {
                source_field_id: source,
                destination_field_id: destination,
                transformation,
                params
            };
        }
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