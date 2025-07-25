// steps/NameStep.tsx
import { ArrowRightLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { useSync } from '@/contexts/SyncContext';
import { DatasourceFieldsStrategyFactory } from '@/patterns/strategies/data-source-field';
import { useDatabaseSelection } from "../hooks/useDatasourceSelection"; // adjust path as needed

export default function DataSourcesStep({ next }: { next: () => void }) {
  const { syncConfig, connectors, setDataSource, saveAndAdvance } = useSync();

  // Use the hook for both source and destination
  const source = useDatabaseSelection({
    accountId: syncConfig?.source_id,
    connectors,
    databaseId: syncConfig?.config?.schema?.source_database_id,
    setDatabaseId: (id: string) => setDataSource(id, "source_database_id"),
    side: "source",
  });

  const destination = useDatabaseSelection({
    accountId: syncConfig?.destination_id,
    connectors,
    databaseId: syncConfig?.config?.schema?.destination_database_id,
    setDatabaseId: (id: string) => setDataSource(id, "destination_database_id"),
    side: "destination",
  });

  // Render fields using your strategy
  const renderField = (hookResult: typeof source) =>
    hookResult.connector
      ? DatasourceFieldsStrategyFactory.getStrategy(hookResult.connector)
          .renderFields(
            hookResult.options,
            hookResult.isLoading,
            hookResult.setDatabaseId,
            hookResult.databaseId
          )
      : null;

  const handleNext = async () => {

    try {
      // save to database
      saveAndAdvance().then(() => {
        next(); // move to next step
      });
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
      <div className="flex w-full justify-between gap-4">
        <div className="flex flex-col w-full gap-2">{renderField(source)}</div>
        <div className="flex items-center justify-center">
          <ArrowRightLeft className="w-4 h-4" />
        </div>
        <div className="flex flex-col w-full gap-2">{renderField(destination)}</div>
      </div>
      <div className="mt-4">
        <Button
          onClick={handleNext}
          disabled={!source.databaseId || !destination.databaseId}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-1 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 h-8"
        >
          Next
        </Button>
      </div>
    </div>
  );
}
