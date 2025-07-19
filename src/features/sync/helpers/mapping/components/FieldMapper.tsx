import { SyncFieldMapping, SyncTableMapping } from "@/types/sync";
import { useSourceColumns, useDestinationColumns } from "../../../hooks/useDataSources";
import { CollapsibleContent } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { MappingRow } from "@/components/sync/MappingRow";

interface FieldMapperProps {
    tableMapping: SyncTableMapping;
    fieldMappings: SyncFieldMapping[];
    setFieldMappings: (fieldMappings: SyncFieldMapping[]) => void;
}

export const FieldMapper = (props: FieldMapperProps) => {
    const { tableMapping, fieldMappings, setFieldMappings } = props;
    const { data: sourceColumns = [], isLoading: isSourceColumnsLoading } = useSourceColumns(tableMapping.source_table_id);
    const { data: destinationColumns = [], isLoading: isDestinationColumnsLoading } = useDestinationColumns(tableMapping.destination_table_id);

    // add field mapping
    const addField = () => {
        setFieldMappings([...fieldMappings, {
            source_field_id: "",
            destination_field_id: ""
        }]);
    };

    const removeField = (index: number) => {
        setFieldMappings(fieldMappings.filter((_, i) => i !== index));
    };

    const updateField = (index: number, field: keyof SyncFieldMapping, value: string) => {
        setFieldMappings(fieldMappings.map((mapping, i) =>
            i === index ? { ...mapping, [field]: value } : mapping
        ));
    };

    return (
        <CollapsibleContent className="flex flex-col gap-2">
            <div className="border p-1 rounded">
                <div className="flex items-center justify-end">
                    <Button variant="link" className="py-1 text-sm text-purple-500" onClick={addField}>
                        + Add Field
                    </Button>
                </div>

                <hr className=" border-gray-200" />

                {fieldMappings?.map((mapping, index) => (
                    <MappingRow
                        index={index}
                        sourceValue={mapping.source_field_id}
                        destinationValue={mapping.destination_field_id}
                        sourceOptions={sourceColumns}
                        destinationOptions={destinationColumns}
                        isSourceLoading={isSourceColumnsLoading}
                        isDestinationLoading={isDestinationColumnsLoading}
                        onSourceChange={(value: string) => updateField(index, "source_field_id", value)}
                        onDestinationChange={(value: string) => updateField(index, "destination_field_id", value)}
                        onRemove={removeField}
                    />
                ))}
            </div>
        </CollapsibleContent>
    )
}