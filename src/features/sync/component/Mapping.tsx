import { useEffect, useState } from 'react';
import useSync, { SyncData } from '../hooks/useSync';
import { SyncBuilder } from '@/builders/sync';
import { SyncTableMapping } from '@/types/sync';
import { toast } from '@/hooks/use-toast';
import { useParams } from 'react-router-dom';
import { useDestinationTable, useSourceTable } from '../hooks/useDataSources';
import { ConnectorProvider } from '@/types/connectors';
import { XIcon } from 'lucide-react';
import { CustomInnerSelect } from '@/components/ui_custom/CustomInnerSelect';
import getIcon from '../helpers/util';
import { CustomSelect } from '@/components/ui_custom/CustomSelect';

export default function TableMappingStep({ next, sync }: { next: () => void, sync: SyncData }) {
  const { id } = useParams();
  const { createSyncMutation } = useSync(id);
  const [mappings, setMappings] = useState<SyncTableMapping[]>([]);
  const [sourceIcon, setSourceIcon] = useState<string>("");
  const [destinationIcon, setDestinationIcon] = useState<string>("");

  const { data: sourceTableOptions = [], isLoading: isSourceTableLoading } = useSourceTable(
    sync.source?.id,
    sync.config?.schema?.source_database,
    sync.source?.connector?.provider as ConnectorProvider
  );

  const { data: destinationTableOptions = [], isLoading: isDestinationTableLoading } = useDestinationTable(
    sync.destination?.id,
    sync.destination?.connector?.provider as ConnectorProvider
  );

  // load or initalize mappings
  useEffect(() => {
    if(!sync) return;

    setSourceIcon(getIcon(sync.source?.connector?.provider as ConnectorProvider));
    setDestinationIcon(getIcon(sync.destination?.connector?.provider as ConnectorProvider));
    setMappings(sync.config?.schema?.table_mappings || [{
      source_table: null,
      destination_table: null,
      field_mappings: [],
    }]);
  }, [sync]);

  const addTable = () => {
    setMappings((prev) => [
      ...prev,
      {
        source_table: "",
        destination_table: "",
        field_mappings: [],
      },
    ]);
  };

  const removeTable = (index: number) => {
    setMappings((prev) => prev.filter((_, i) => i !== index));
  };

  const updateTable = (
    index: number,
    field: keyof SyncTableMapping,
    value: string
  ) => {
    setMappings((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    );
  };

  const handleNext = () => {
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
      // save to database
      const result = createSyncMutation.mutate({ step: 'connect', data: dataToSave as any });

      next(); // move to next step
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
      {mappings?.map((mapping, index) => (
        <div key={index} className="border p-1 rounded">
          <div className="flex justify-between">
             <CustomSelect
                    value={mapping?.source_table || null}
                    onValueChange={(value) => updateTable(index, "source_table", value)}
                    options={sourceTableOptions?.map((item: any) => ({
                        // since were pulling datasources its not guaranteed to have ids
                        id: item.id || item.name,
                        name: item.name,
                        icon: sourceIcon
                    })) || []}
                    placeholder={`Select table`}
                    disabled={isSourceTableLoading}
                    isLoading={isSourceTableLoading}
                />
                <CustomSelect
                    value={mapping?.destination_table || null}
                    onValueChange={(value) => updateTable(index, "destination_table", value)}
                    options={destinationTableOptions?.map((item: any) => ({
                        // since were pulling datasources its not guaranteed to have ids
                        id: item.id || item.name,
                        name: item.name,
                        icon: destinationIcon
                    })) || []}
                    placeholder={`Select table`}
                  disabled={isDestinationTableLoading}
                    isLoading={isDestinationTableLoading}
                />
           
            <button
              className="text-red-500"
              onClick={() => removeTable(index)}
            >
              <XIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}

      <div className="flex gap-2 mt-4">
        <button
          className="bg-blue-500 text-white px-3 py-1 rounded"
          onClick={addTable}
        >
          Add Table
        </button>
        <button
          className="bg-green-500 text-white px-3 py-1 rounded"
          onClick={handleNext}
        >
          Save Config
        </button>
      </div>
    </div>
  );
}
