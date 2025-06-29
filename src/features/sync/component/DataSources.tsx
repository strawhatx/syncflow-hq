// steps/NameStep.tsx

import { useWizard } from '@/contexts/WizardContext';
import { Link } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Connector, ConnectorConfig, ConnectorProvider } from '@/types/connectors';
import { toast } from '@/hooks/use-toast';
import useSync from '../hooks/useSync';
import { useDataSources } from '../hooks/useDataSources';
import { DatasourceFieldsStrategyFactory } from '@/strategies/data-source-field';

export default function DataSourcesStep({ next }) {
  const { data, setData } = useWizard();
  const { id } = useParams();
  const { createSyncMutation } = useSync(id);

  const { data: sourceOptions = [], isLoading: isSourceLoading } = useDataSources(
    data.source?.connector?.provider as ConnectorProvider
  );

  const { data: destinationOptions = [], isLoading: isDestinationLoading } = useDataSources(
    data.destination?.connector?.provider as ConnectorProvider
  );

  // render source field
  const renderSourceField = () => {
    if (isSourceLoading) {
      return <div>Loading...</div>
    }

    return DatasourceFieldsStrategyFactory.getStrategy(data.source?.connector as unknown as Connector)
      .renderFields(sourceOptions, setData, "source", data.source?.database);
  }

  // render destination field
  const renderDestinationField = () => {
    if (isDestinationLoading) {
      return <div>Loading...</div>
    }

    return DatasourceFieldsStrategyFactory.getStrategy(data.destination?.connector as unknown as Connector)
      .renderFields(destinationOptions, setData, "destination", data.destination?.database);
  }

  const handleNext = async () => {
    // now well save the data to the database
    const dataToSave = {
      id,
      source_db: data.source.database,
      destination_db: data.destination.database
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
          disabled={!data.source?.database || !data.destination?.database}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-1 rounded-lg font-medium transition-all duration-200 flex items-center gap-2"
        >
          Next
        </Button>
      </div>
    </div>
  );
}
