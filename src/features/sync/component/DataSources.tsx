// steps/NameStep.tsx
import { useEffect, useState } from 'react';
import { Link } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Connector, ConnectorProvider } from '@/types/connectors';
import { toast } from '@/hooks/use-toast';
import useSync, { SyncData } from '../hooks/useSync';;
import { DatasourceFieldsStrategyFactory } from '@/strategies/data-source-field';
import { useDestinationData, useSourceData } from '../hooks/useDataSources';

export default function DataSourcesStep({ next, sync }: { next: () => void, sync: SyncData }) {
  const [sourceDatabase, setSourceDatabase] = useState("");
  const [destinationDatabase, setDestinationDatabase] = useState("");

  const { id } = useParams();
  const { createSyncMutation } = useSync(id);

  const { data: sourceOptions = [], isLoading: isSourceLoading } = useSourceData(
    sync.source?.id,
    sync.source?.connector?.provider as ConnectorProvider
  );

  const { data: destinationOptions = [], isLoading: isDestinationLoading } = useDestinationData(
    sync.destination?.id,
    sync.destination?.connector?.provider as ConnectorProvider
  );

  // set the source and destination ids
  useEffect(() => {
    setSourceDatabase(sync.config?.schema?.source_database);
    setDestinationDatabase(sync.config?.schema?.destination_database);
  }, [sync]);

  // render source field
  const renderSourceField = () => {
    return DatasourceFieldsStrategyFactory.getStrategy(sync.source?.connector as unknown as Connector)
      .renderFields(sourceOptions, isSourceLoading, setSourceDatabase, "source", sourceDatabase);
  }

  // render destination field
  const renderDestinationField = () => {
    return DatasourceFieldsStrategyFactory.getStrategy(sync.destination?.connector as unknown as Connector)
      .renderFields(destinationOptions, isDestinationLoading, setDestinationDatabase, "destination", destinationDatabase);
  }

  const handleNext = async () => {
    // now well save the data to the database 
    // we need to make sure we arent overriding the config data
    const dataToSave = {
      id,
      config: {
        ...sync.config,
        schema: {
          ...sync.config.schema,
          source_database: sourceDatabase,
          destination_database: destinationDatabase,
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
    <div>
      <div className="grid items-center grid-cols-1 md:grid-cols-5 gap-4">
        <div className='col-span-2'>
          {renderSourceField()}
        </div>

        <div className='flex items-center justify-center col-span-1'>
          <Link className='w-4 h-4' />
        </div>
        <div className='col-span-2'>
          {renderDestinationField()}
        </div>
      </div>
      <div className="mt-4">
        <Button
          onClick={handleNext}
          disabled={!sourceDatabase || !destinationDatabase}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-1 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 h-8"
        >
          Next
        </Button>
      </div>
    </div>
  );
}
