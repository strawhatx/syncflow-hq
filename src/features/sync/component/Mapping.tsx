import { useEffect, useState } from 'react';
import useSync from '../hooks/useSync';
import { toast } from '@/hooks/use-toast';
import { useParams } from 'react-router-dom';
import { useDestinationTable, useSourceTable } from '../hooks/useDataSources';
import { ConnectorProvider } from '@/types/connectors';
import { Button } from '@/components/ui/button';
import { SyncData } from '../utils/sync-data';
import { SyncDirection, SyncTableMapping } from '@/types/sync';
import { autoMap } from '../utils/auto-mapp';
import { MappingRow } from '@/components/sync/MappingRow';
import { MappingDialog } from '../helpers/mapping';
import { ArrowLeft, ArrowLeftRight, ArrowRight, Settings } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

export const MappingStep = ({ next, sync }: { next: () => void, sync: SyncData }) => {
  const { id } = useParams();
  const { createSyncMutation } = useSync(id);
  const [tableMappings, setTableMappings] = useState<SyncTableMapping[]>([]);
  const [selectedTableMapping, setSelectedTableMapping] = useState<SyncTableMapping | null>(null);

  // if no tables or only one table with no source and destination, disable auto mapping
  let isAutoMappingDisabled = tableMappings.length === 0;

  // source table options
  const {
    data: sourceTableOptions = [],
    isLoading: isSourceTableLoading
  } = useSourceTable(
    sync.config?.schema?.source_database_id,
    sync.source?.connector?.provider as ConnectorProvider
  );

  // destination table options
  const {
    data: destinationTableOptions = [],
    isLoading: isDestinationTableLoading
  } = useDestinationTable(
    sync.config?.schema?.destination_database_id,
    sync.destination?.connector?.provider as ConnectorProvider
  );

  // Load initial mappings
  useEffect(() => {
    if (!sync) return;

    // if no tables, add a default to start with
    const initialMappings = sync.config?.schema?.table_mappings || [];

    setTableMappings(initialMappings);
  }, [sync]);

  const addTable = () => {
    setTableMappings(prev => [...prev, {
      id: "",
      source_table_id: "",
      destination_table_id: "",
      field_mappings: [],
      direction: "one-way",
      filters: [],
    }]);
  };

  const autoMapTables = () => {
    const mappings = autoMap(sourceTableOptions, destinationTableOptions);
    setTableMappings(mappings as SyncTableMapping[]);
  };

  const removeTable = (index: number) => {
    setTableMappings(prev => prev.filter((_, i) => i !== index));
  };

  const updateTable = (index: number, field: keyof SyncTableMapping, value: string) => {
    setTableMappings(prev => prev.map((mapping, i) =>
      i === index ? { ...mapping, [field]: value } : mapping
    ));
  };

  const isValidMapping = (mapping: SyncTableMapping) => {
    return mapping.source_table_id && mapping.destination_table_id && mapping.field_mappings.length > 0;
  };

  const handleNext = () => {
    // Check if there are changes
    const hasChanges = JSON.stringify(tableMappings) !== JSON.stringify(sync.config?.schema?.table_mappings);

    if (!hasChanges) {
      return next();
    }

    // Save changes
    const dataToSave = {
      id,
      config: {
        ...sync.config,
        schema: {
          ...sync.config.schema,
          table_mappings: tableMappings,
        }
      }
    };

    try {
      const result = createSyncMutation.mutate({ step: 'connect', data: dataToSave as any });
      next();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const syncSeparator = (index: number, direction: SyncDirection) => (
    <ToggleGroup type="single" value={direction} onValueChange={(value) => updateTable(index, "direction", value)}>
      <ToggleGroupItem value="bold" aria-label="Toggle bold">
        <ArrowLeft className="h-4 w-4" />
      </ToggleGroupItem>
      <ToggleGroupItem value="italic" aria-label="Toggle italic">
        <ArrowLeftRight className="h-4 w-4" />
      </ToggleGroupItem>
      <ToggleGroupItem value="strikethrough" aria-label="Toggle strikethrough">
        <ArrowRight className="h-4 w-4" />
      </ToggleGroupItem>
    </ToggleGroup>
  )

  return (
    <div className="space-y-4">
      <div className="p-1 rounded">
        <div className="flex items-center justify-end">
          <Button
            variant="link"
            className="py-1 text-sm text-purple-400"
            onClick={addTable}
          >
            + Add Table
          </Button>

          <Button
            variant="default"
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-1 rounded-lg text-sm transition-all duration-200 flex items-center gap-2 h-8"
            disabled={isAutoMappingDisabled}
            onClick={autoMapTables}
          >
            Auto Map Tables
          </Button>
        </div>

        <hr className=" border-gray-200" />

        {tableMappings.map((mapping, index) => (
          <div key={index} className="flex flex-col gap-0">
            <div className="flex items-center gap-4 px-4">
              <Button
                variant="ghost"
                size="icon"
                className="size-8"
                onClick={() => setSelectedTableMapping(mapping)}
                disabled={!mapping.source_table_id || !mapping.destination_table_id}
              >
                <Settings className="w-4 h-4 text-gray-500" />
                <span className="sr-only">Toggle</span>
              </Button>

              <MappingRow
                index={index}
                sourceValue={mapping.source_table_id}
                destinationValue={mapping.destination_table_id}
                sourceOptions={sourceTableOptions}
                destinationOptions={destinationTableOptions}
                syncSeparator={() => syncSeparator(index, mapping.direction)}
                isSourceLoading={isSourceTableLoading}
                isDestinationLoading={isDestinationTableLoading}
                onSourceChange={(value: string) => updateTable(index, "source_table_id", value)}
                onDestinationChange={(value: string) => updateTable(index, "destination_table_id", value)}
                onRemove={removeTable}
              />
            </div>

            {index !== tableMappings.length - 1 && <hr className=" border-gray-200" />}
          </div>
        ))}
      </div>

      <div className="mt-4">
        <Button
          onClick={handleNext}
          disabled={tableMappings.some(mapping => !isValidMapping(mapping))}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-1 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 h-8"
        >
          Next
        </Button>
      </div>

      {selectedTableMapping && (
        <MappingDialog
          tableMapping={selectedTableMapping}
          isOpen={!!selectedTableMapping}
          onClose={() => setSelectedTableMapping(null)}
        />
      )}
    </div>
  );
}
