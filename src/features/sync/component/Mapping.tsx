import { useState } from 'react';
import { Link } from 'lucide-react';
import { Button } from '@/components/ui/button';
import useSync, { SyncData } from '../hooks/useSync';
import { SyncBuilder } from '@/builders/sync';
import { SyncTableMapping } from '@/types/sync';
import { toast } from '@/hooks/use-toast';
import { useParams } from 'react-router-dom';

export default function TableMappingStep({ next, sync }: { next: () => void, sync: SyncData }) {
  const { id } = useParams();
  const { createSyncMutation } = useSync(id);
  const [mappings, setMappings] = useState<SyncTableMapping[]>([]);

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
      const result = await createSyncMutation.mutate({ step: 'connect', data: dataToSave as any });

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
      {mappings.map((mapping, index) => (
        <div key={index} className="border p-4 rounded">
          <div className="flex gap-2">
            <input
              className="border p-1"
              placeholder="Source Table"
              value={mapping.source_table}
              onChange={(e) =>
                updateTable(index, "source_table", e.target.value)
              }
            />
            <input
              className="border p-1"
              placeholder="Destination Table"
              value={mapping.destination_table}
              onChange={(e) =>
                updateTable(index, "destination_table", e.target.value)
              }
            />
            <button
              className="text-red-500"
              onClick={() => removeTable(index)}
            >
              Remove
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
          onClick={handleSave}
        >
          Save Config
        </button>
      </div>
    </div>
  );
}
