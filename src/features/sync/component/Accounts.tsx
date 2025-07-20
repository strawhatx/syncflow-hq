// steps/NameStep.tsx
import { ArrowRightLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ConnectorConnectModal from '@/components/connector/ConnectorConnectModal';
import { useState } from 'react';
import { Connector } from '@/types/connectors';
import { toast } from '@/hooks/use-toast';
import { useSync } from '@/contexts/SyncContext';
import { SyncData } from '../utils/sync-data';
import { FormSide } from '../helpers/accounts/FormSide';
import { useAccountSelection } from "../hooks/useAccountSelection"; // adjust path as needed

export default function AccountsStep({ next }: { next: () => void }) {
  //App state
  const [connector, setConnector] = useState<Connector | null>(null);
  const { syncConfig, setAccount, connectors } = useSync();

  // Use the hook for both source and destination
  const source = useAccountSelection({
    connectors,
    accountId: syncConfig?.source_id,
    setAccount,
    field: "source_id"
  });
  const destination = useAccountSelection({
    connectors,
    accountId: syncConfig?.destination_id,
    setAccount,
    field: "destination_id"
  });

  // handle next button click (save the data to the database)
  const handleNext = () => {
    if (!source.accountId || !destination.accountId) return;

    try {
      // save the current sync changes

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
      <div className='grid items-center grid-cols-1 md:grid-cols-5 gap-4'>
        <FormSide
          appId={source.appId}
          setAppId={source.setAppId}
          accountId={source.accountId}
          setAccountId={source.setAccountId}
          connectors={connectors}
          connections={source.connections}
          onCreateNew={() => setConnector(connectors?.find(conn => conn.id === source.appId))}
        />

        <div className='flex items-center justify-center col-span-1'>
          <ArrowRightLeft className='w-6 h-6' />
        </div>

        <FormSide
          appId={destination.appId}
          setAppId={destination.setAppId}
          accountId={destination.accountId}
          setAccountId={destination.setAccountId}
          connectors={connectors}
          connections={destination.connections}
          onCreateNew={() => setConnector(connectors?.find(conn => conn.id === destination.appId))}
        />
      </div>

      <div className="mt-4">
        <Button
          onClick={handleNext}
          disabled={!source.appId || !destination.appId || !source.accountId || !destination.accountId}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-1 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 h-8"
        >
          Next
        </Button>
      </div>

      {/* connector connect modal */}
      {connector && (
        <ConnectorConnectModal
          isOpen={!!connector}
          onClose={() => setConnector(null)}
          connector={connector}
        />
      )}
    </div>
  );
}
