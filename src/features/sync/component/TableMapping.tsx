import { useEffect, useState } from 'react';
import useSync from '../hooks/useSync';
import { SyncBuilder } from '@/patterns/builders/sync';
import { SyncTableMapping } from '@/types/sync';
import { toast } from '@/hooks/use-toast';
import { useParams } from 'react-router-dom';
import { useDestinationTable, useSourceTable } from '../hooks/useDataSources';
import { ConnectorProvider } from '@/types/connectors';
import { ArrowLeftRight, XIcon } from 'lucide-react';
import { CustomSelectButton } from '@/components/ui_custom/CustomSelectButton';
import { Button } from '@/components/ui/button';
import { MappingStrategyFactory } from '@/patterns/strategies/mapping';
import { SyncData } from '../helpers/sync-data';
import { TableMappingBuilder } from '@/patterns/builders/sync';


export const TableMappingStep = ({ next, sync }: { next: () => void, sync: SyncData }) => {
  const { id } = useParams();
  const { createSyncMutation } = useSync(id);
  const [builders, setBuilders] = useState<TableMappingBuilder[]>([]);

  // source table options
  const { data: sourceTableOptions = [], isLoading: isSourceTableLoading } = useSourceTable(
    sync.source?.id,
    sync.config?.schema?.source_database,
    sync.source?.connector?.provider as ConnectorProvider
  );

  // destination table options
  const { data: destinationTableOptions = [], isLoading: isDestinationTableLoading } = useDestinationTable(
    sync.destination?.id,
    sync.config?.schema?.destination_database,
    sync.destination?.connector?.provider as ConnectorProvider
  );

  // Load or initialize builders
  useEffect(() => {
    if (!sync) return;

    // try to get intal data or just initalize the default row
    const initialMappings = sync.config?.schema?.table_mappings || [{
      id: "",
      source_table: "",
      destination_table: "",
      field_mappings: [],
    }];

    // map the initial maps to builders
    const initialBuilders = initialMappings.map(mapping => {
      const builder = new TableMappingBuilder(mapping.source_table, mapping.destination_table);
      mapping.field_mappings.forEach(fieldMapping => {
        builder.addFieldMapping(fieldMapping.source_field, fieldMapping.destination_field, fieldMapping.transformation, fieldMapping.params);
      });
      return builder;
    });

    setBuilders(initialBuilders);
  }, [sync]);

  const addTable = () => {
    setBuilders((prev) => [
      ...prev,
      new TableMappingBuilder("", "")
    ]);
  };

  const removeTable = (index: number) => {
    setBuilders((prev) => prev.filter((_, i) => i !== index));
  };

  const updateTable = (
    index: number,
    field: keyof SyncTableMapping,
    value: string
  ) => {
    // update the builders state
    setBuilders((prev) =>
      prev.map((builder, i) => {
        if (i === index) {
          // destination table builder mapping
          if (field === "source_table") {
            return new TableMappingBuilder(value, builder.build().destination_table);
          } 
          // destination table builder mapping
          else if (field === "destination_table") {
            return new TableMappingBuilder(builder.build().source_table, value);
          }
        }
        return builder;
      })
    );
  };

  const validateRow = (builder: TableMappingBuilder) => {
    const row = builder.build();
    return row.source_table && row.destination_table && row.field_mappings.length > 0;
  };

  const handleNext = () => {
    // if there are no changes, move to next step
    // these are objects so we need to compare the objects
    const mappings = builders.map(builder => builder.build());

    if (JSON.stringify(mappings) === JSON.stringify(sync.config?.schema?.table_mappings)) {
      return next();
    }

    const builder = new SyncBuilder();
    builder.setTableMappings(mappings);

    const config = builder.buildConfig();
    console.log("Built Config:", config);

    // Here you could call your API or do anything else
    // now well save the data to the database 
    // we need to make sure we arent overriding the config data
    const dataToSave = {
      id,
      config: {
        ...sync.config,
        schema: {
          ...sync.config.schema,
          table_mappings: config.table_mappings,
        }
      }
    }

    try {
      const result = createSyncMutation.mutate({ step: 'connect', data: dataToSave as any });
      next();
    }
    catch (error) {
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
        {builders.map((builder, index) => {
          const mapping = builder.build();
          return (
            <div key={index} className="flex flex-col gap-0">
              <div className="flex  text-black gap-2 items-center py-1">
                <div className="flex w-full justify-between gap-2 items-center">
                  <CustomSelectButton
                    value={mapping.source_table}
                    onValueChange={(value: string) => updateTable(index, "source_table", value)}
                    options={MappingStrategyFactory.getStrategy(sync.source?.connector?.provider as ConnectorProvider).map(sourceTableOptions, sync.source?.connector?.provider as ConnectorProvider)}
                    mergeClasses="border-none ring-offset-background-transparent focus:outline-none focus:ring-0 focus:ring-offset-0"
                    placeholder={`Select table`}
                    disabled={isSourceTableLoading}
                    isLoading={isSourceTableLoading}
                  />

                  <ArrowLeftRight className="w-8 h-8 text-gray-500" />

                  <CustomSelectButton
                    value={mapping.destination_table}
                    onValueChange={(value: string) => updateTable(index, "destination_table", value)}
                    options={MappingStrategyFactory.getStrategy(sync.destination?.connector?.provider as ConnectorProvider).map(destinationTableOptions, sync.destination?.connector?.provider as ConnectorProvider)}
                    mergeClasses="border-none ring-offset-background-transparent focus:outline-none focus:ring-0 focus:ring-offset-0"
                    placeholder={`Select table`}
                    disabled={isDestinationTableLoading}
                    isLoading={isDestinationTableLoading}
                  />
                </div>

                <Button
                  variant="link"
                  className="text-red-500 py-1 h-6 text-xs"
                  onClick={() => removeTable(index)}
                >
                  <XIcon className="w-4 h-4" />
                </Button>

              </div>
              {index !== builders.length - 1 && <hr className=" border-gray-200" />}
            </div>
          );
        })}
        
        <hr className=" border-gray-200" />

        <Button
          variant="link"
          className="py-1 h-4 text-xs text-purple-500"
          onClick={addTable}
        >
          + Add Table
        </Button>
      </div>

      <div className="mt-4">
        <Button
          onClick={handleNext}
          disabled={builders.some(validateRow)}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-1 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 h-8"
        >
          Next
        </Button>
      </div>
    </div>
  );
}
