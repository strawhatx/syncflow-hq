import { SyncFieldMapping, SyncTableMapping } from "@/types/sync";
import { useSourceColumns, useDestinationColumns } from "../../../hooks/useDataSources";
import { Button } from "@/components/ui/button";
import { MappingRow } from "@/components/sync/MappingRow";
import { ArrowLeft, ArrowLeftRight, ArrowRight } from "lucide-react";

interface FieldMapperProps {
    tableMapping: SyncTableMapping;
    fieldMappings: SyncFieldMapping[];
    setFieldMappings: React.Dispatch<React.SetStateAction<SyncFieldMapping[]>>
}

export const FieldMapper = (props: FieldMapperProps) => {
    const { tableMapping, fieldMappings, setFieldMappings } = props;
    const { data: sourceColumns = [], isLoading: isSourceColumnsLoading } = useSourceColumns(tableMapping?.source_table_id);
    const { data: destinationColumns = [], isLoading: isDestinationColumnsLoading } = useDestinationColumns(tableMapping?.destination_table_id);
    // add field mapping
    const addField = () => {
        setFieldMappings(prev => [...prev, {
            source_field_id: "",
            destination_field_id: ""
        }]);
    };

    const removeField = (index: number) => {
        setFieldMappings(prev => prev.filter((_, i) => i !== index));
    };

    const updateField = (index: number, field: keyof SyncFieldMapping, value: string) => {
        setFieldMappings(prev => prev.map((mapping, i) =>
            i === index ? { ...mapping, [field]: value } : mapping
        ));
    };

    const syncSeparatorConfig = {
        "source-to-destination": <ArrowRight className="h-4 w-4" />,
        "destination-to-source": <ArrowLeft className="h-4 w-4" />,
        "two-way": <ArrowLeftRight className="h-4 w-4" />
    }

    return (
        <div className="border p-1 rounded">
            <div className="flex items-center justify-end">
                <Button variant="link" className="py-1 text-sm text-purple-500" onClick={addField}>
                    + Add Field
                </Button>
            </div>

            <hr className=" border-gray-200" />

            {fieldMappings?.map((mapping, i) => (
                <MappingRow
                    key={i}
                    index={i}
                    sourceValue={mapping.source_field_id}
                    destinationValue={mapping.destination_field_id}
                    sourceOptions={sourceColumns}
                    destinationOptions={destinationColumns}
                    syncSeparator={() => syncSeparatorConfig[tableMapping.direction]}
                    isSourceLoading={isSourceColumnsLoading}
                    isDestinationLoading={isDestinationColumnsLoading}
                    onSourceChange={(value: string) => updateField(i, "source_field_id", value)}
                    onDestinationChange={(value: string) => updateField(i, "destination_field_id", value)}
                    onRemove={removeField}
                />
            ))}
        </div>
    )
}