import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { MappingRow } from '@/components/sync/MappingRow';
import { MappingDialog } from '../helpers/mapping';
import { ArrowLeft, ArrowLeftRight, ArrowRight, Settings } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useTableMappingSelection } from '../hooks/useTableMappingSelection';
import { useSync } from '@/contexts/SyncContext';

export const MappingStep = ({ next }: { next: () => void }) => {
  const { setSelectedTableMappingId, selectedTableMappingId } = useSync();
  const {
    tableMappings,
    sourceTableOptions,
    destinationTableOptions,
    isSourceTableLoading,
    isDestinationTableLoading,
    isAutoMappingDisabled,
    addTable,
    removeTable,
    updateTable,
    autoMapTables,
    isAllMappingsValid,
    createSyncSeparator,
    saveAndAdvance,
  } = useTableMappingSelection();

  const handleNext = () => {
    try {
      saveAndAdvance().then(() => {
        next();
      });
      next();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const renderSyncSeparator = (index: number, direction: string) => {
    const { onDirectionChange } = createSyncSeparator(index, direction as any);

    return (
      <ToggleGroup type="single" value={direction} onValueChange={onDirectionChange} size="sm">
        <ToggleGroupItem 
        value="destination-to-source" 
        aria-label="Toggle bold"
        className="data-[state=on]:bg-purple-200"
        >
          <ArrowLeft className="h-4 w-4" />
        </ToggleGroupItem>
        <ToggleGroupItem 
        value="two-way" 
        aria-label="Toggle 2-way"
        className="data-[state=on]:bg-purple-200"
        >
          <ArrowLeftRight className="h-4 w-4" />
        </ToggleGroupItem>
        <ToggleGroupItem
          value="source-to-destination"
          aria-label="Toggle right"
          className="data-[state=on]:bg-purple-200"
          >
          <ArrowRight className="h-4 w-4" />
        </ToggleGroupItem>
      </ToggleGroup>
    );
  };

  return (
    <div className="space-y-4">
      <div className="p-1 rounded">
        <div className="flex items-center justify-end pb-2  gap-2">
          <Button
            variant="ghost"
            className="h-8 text-sm text-purple-400"
            onClick={addTable}
          >
            + Add
          </Button>

          <Button
            variant="default"
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-1 rounded-lg text-sm transition-all duration-200 flex items-center h-8 gap-2"
            disabled={isAutoMappingDisabled}
            onClick={autoMapTables}
          >
            Auto Map
          </Button>
        </div>

        {tableMappings.map((mapping, index) => (
          <div key={index} className="flex flex-col gap-2">
            <div className="flex items-center gap-4 px-4 py-2 bg-gray-50 rounded-lg">
              <Button
                variant="ghost"
                size="icon"
                className="size-8"
                onClick={() => setSelectedTableMappingId(mapping.id)}
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
                syncSeparator={() => renderSyncSeparator(index, mapping.direction)}
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
          disabled={!isAllMappingsValid()}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-1 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 h-8"
        >
          Next
        </Button>
      </div>

      {selectedTableMappingId && (
        <MappingDialog />
      )}
    </div>
  );
}
