import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { MappingRow } from '@/components/sync/MappingRow';
import { MappingDialog } from '../helpers/mapping';
import { ArrowLeft, ArrowLeftRight, ArrowRight, Settings } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useTableMappingSelection } from '../hooks/useTableMappingSelection';

export const MappingStep = ({ next }: { next: () => void }) => {
  const {
    tableMappings,
    selectedTableMapping,
    selectedTableMappingIndex,
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
    openMappingDialog,
    closeMappingDialog,
    updateSelectedFieldMappings,
    updateSelectedFilters,
    createSyncSeparator,
    save,
  } = useTableMappingSelection();

  const handleNext = () => {
    try {
      save().then(() => {
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
      <ToggleGroup type="single" value={direction} onValueChange={onDirectionChange}>
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
    );
  };

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
                onClick={() => openMappingDialog(mapping, index)}
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

      {selectedTableMapping && (
        <MappingDialog
          tableMapping={selectedTableMapping}
          setFieldMapping={updateSelectedFieldMappings}
          setFilter={updateSelectedFilters}
          isOpen={!!selectedTableMapping}
          onClose={closeMappingDialog}
        />
      )}
    </div>
  );
}
