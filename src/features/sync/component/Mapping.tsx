import { useEffect, useState } from 'react';
import useSync from '../hooks/useSync';
import { toast } from '@/hooks/use-toast';
import { useParams } from 'react-router-dom';
import {
  useDestinationColumns,
  useDestinationTable,
  useSourceColumns,
  useSourceTable
} from '../hooks/useDataSources';
import { ConnectorProvider } from '@/types/connectors';
import { ArrowLeftRight, ChevronsUpDown, Cog, Settings, XIcon } from 'lucide-react';
import { CustomSelectButton } from '@/components/ui_custom/CustomSelectButton';
import { Button } from '@/components/ui/button';
import { SyncData } from '../utils/sync-data';
import { SyncFieldMapping, SyncTableMapping } from '@/types/sync';
import { autoMap } from '../utils/auto-mapp';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

interface MapSidesProps {
  index: number;
  tableMapping: SyncTableMapping;
  sourceValue: string;
  destinationValue: string;
  sourceOptions: any[];
  destinationOptions: any[];
  isSourceLoading: boolean;
  isDestinationLoading: boolean;
  onSourceChange: (value: string) => void;
  onDestinationChange: (value: string) => void;
  onRemove: (value: number) => void;
}

const Form = ({
  index,
  sourceValue,
  destinationValue,
  sourceOptions,
  destinationOptions,
  isSourceLoading,
  isDestinationLoading,
  onSourceChange,
  onDestinationChange,
  onRemove
}: Omit<MapSidesProps, 'tableMapping'>) => {
  return (
    <div key={index} className="flex w-full text-black gap-2 items-center py-1">
      <div className="flex w-full justify-between gap-2">
        <CustomSelectButton
          value={sourceValue}
          onValueChange={(value: string) => onSourceChange(value)}
          options={sourceOptions}
          mergeClasses="border-none ring-offset-background-transparent focus:outline-none focus:ring-0 focus:ring-offset-0"
          placeholder="Select source table"
          disabled={isSourceLoading}
          isLoading={isSourceLoading}
        />

        <ArrowLeftRight className="w-8 h-8 text-gray-500" />

        <CustomSelectButton
          value={destinationValue}
          onValueChange={(value: string) => onDestinationChange(value)}
          options={destinationOptions}
          mergeClasses="border-none ring-offset-background-transparent focus:outline-none focus:ring-0 focus:ring-offset-0"
          placeholder="Select destination table"
          disabled={isDestinationLoading}
          isLoading={isDestinationLoading}
        />
      </div>

      <Button
        variant="link"
        className="text-red-500 py-1 h-6 text-xs"
        onClick={() => onRemove(index)}
      >
        <XIcon className="w-4 h-4" />
      </Button>
    </div>
  )
}

const TableMappingForm = (props: MapSidesProps) => {
  const { index, sourceValue, destinationValue, sourceOptions, destinationOptions, isSourceLoading, isDestinationLoading, onSourceChange, onDestinationChange, onRemove } = props;
  return (
    <Form
      index={index}
      sourceValue={sourceValue}
      destinationValue={destinationValue}
      sourceOptions={sourceOptions}
      destinationOptions={destinationOptions}
      isSourceLoading={isSourceLoading}
      isDestinationLoading={isDestinationLoading}
      onSourceChange={(value: string) => onSourceChange(value)}
      onDestinationChange={(value: string) => onDestinationChange(value)}
      onRemove={onRemove}
    />
  )
}

const TableCollapseHeader = (props: MapSidesProps) => {
  return (
    <div className="flex items-center gap-4 px-4">
      <CollapsibleTrigger asChild>
        <Button variant="ghost" size="icon" className="size-8">
          <Settings className="w-4 h-4 text-gray-500" />
          <span className="sr-only">Toggle</span>
        </Button>
      </CollapsibleTrigger>

      <TableMappingForm {...props} />
    </div>
  )
}

const TableCollapse = (props: MapSidesProps) => {
  const { tableMapping } = props;
  const [isOpen, setIsOpen] = useState(false);
  const [fieldMappings, setFieldMappings] = useState<SyncFieldMapping[]>([]);
  const { data: sourceColumns = [], isLoading: isSourceColumnsLoading } = useSourceColumns(tableMapping.source_table_id);
  const { data: destinationColumns = [], isLoading: isDestinationColumnsLoading } = useDestinationColumns(tableMapping.destination_table_id);

  // Load initial mappings
  useEffect(() => {
    if (!tableMapping) return;

    const initialMappings = tableMapping.field_mappings || [
      {
        id: "",
        source_field_id: "",
        destination_field_id: "",
      }];

    setFieldMappings(initialMappings);
  }, [tableMapping]);

  // add field mapping
  const addField = () => {
    setFieldMappings(prev => [...prev, {
      id: "",
      source_field_id: "",
      destination_field_id: "",
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

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
    >
      <TableCollapseHeader {...props} />

      <CollapsibleContent className="flex flex-col gap-2">
        <div className="border p-1 rounded">
          {fieldMappings?.map((mapping, index) => (
            <Form
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
          <hr className=" border-gray-200" />

          <div className="flex justify-end">
            <Button
              variant="link"
              className="py-1 h-4 text-xs text-purple-500"
              onClick={addField}
            >
              + Add Field
            </Button>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}

export const MappingStep = ({ next, sync }: { next: () => void, sync: SyncData }) => {
  const { id } = useParams();
  const { createSyncMutation } = useSync(id);
  const [tableMappings, setTableMappings] = useState<SyncTableMapping[]>([]);

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

    const initialMappings = sync.config?.schema?.table_mappings || [
      {
        id: "",
        source_table_id: "",
        destination_table_id: "",
        field_mappings: [],
      }];

    setTableMappings(initialMappings);
  }, [sync]);

  const addTable = () => {
    setTableMappings(prev => [...prev, {
      id: "",
      source_table_id: "",
      destination_table_id: "",
      field_mappings: [],
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

  return (
    <div className="space-y-4">
      <div className="border p-1 rounded">
        {tableMappings.map((mapping, index) => (
          <div key={index} className="flex flex-col gap-0">
            <TableCollapse
              index={index}
              tableMapping={mapping}
              sourceValue={mapping.source_table_id}
              destinationValue={mapping.destination_table_id}
              sourceOptions={sourceTableOptions}
              destinationOptions={destinationTableOptions}
              isSourceLoading={isSourceTableLoading}
              isDestinationLoading={isDestinationTableLoading}
              onSourceChange={(value: string) => updateTable(index, "source_table_id", value)}
              onDestinationChange={(value: string) => updateTable(index, "destination_table_id", value)}
              onRemove={removeTable}
            />
            {index !== tableMappings.length - 1 && <hr className=" border-gray-200" />}
          </div>
        ))}

        <hr className=" border-gray-200" />

        <div className="flex justify-end">
          <Button
            variant="link"
            className="py-1 h-4 text-xs text-purple-500"
            onClick={addTable}
          >
            + Add Table
          </Button>

          <Button
            variant="default"
            className="py-1 h-4 text-xs text-purple-500"
            onClick={autoMapTables}
          >
            Auto Map Tables
          </Button>
        </div>

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
    </div>
  );
}
