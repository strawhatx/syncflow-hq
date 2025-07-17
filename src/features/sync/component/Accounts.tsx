// steps/NameStep.tsx

import { ConnectorWithConnections, fetchConnectors } from '@/services/connector/service';
import { ArrowRightLeft, Link } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CustomSelectButton } from '../../../components/ui_custom/CustomSelectButton';
import ConnectorConnectModal from '@/components/connector/ConnectorConnectModal';
import { useEffect, useState } from 'react';
import { Connection, Connector } from '@/types/connectors';
import { toast } from '@/hooks/use-toast';
import useSync from '../hooks/useSync';
import { useQuery } from '@tanstack/react-query';
import { CustomSelect } from '@/components/ui_custom/CustomSelect';
import { SyncData } from '../utils/sync-data';

const renderSection = (
  appId: string,
  setAppId: (arg0: any) => void,
  accountId: string,
  setAccountId: (arg0: any) => void,
  connectors: ConnectorWithConnections[],
  connections: Connection[],
  onCreateNew: () => void
) => {
  // Debugging: Log the appId value
  console.log("App ID:", appId);

  return (
    <div className='col-span-2'>
      <CustomSelect
        value={appId || ""}
        onValueChange={(value: any) => setAppId(value)}
        options={connectors?.map(conn => ({
          id: conn.id,
          name: conn.name,
          icon: conn.icon
        })) || []}
        placeholder={`Select app`}
        disabled={false}
        isLoading={false}
      />

      <div className="h-4"></div>

      <CustomSelectButton
        value={accountId || ""}
        onValueChange={(value: any) => setAccountId(value)}
        options={connections?.map(conn => ({
          id: conn.id,
          name: conn.name,
        })) || []}
        placeholder={`Select account`}
        isLoading={false}
        onCreateNew={onCreateNew}
      />
    </div>
  )
}

export default function AccountsStep({ next, sync }: { next: () => void, sync: SyncData }) {
  //App state
  const [sourceAppId, setSourceAppId] = useState<string>("");
  const [destinationAppId, setDestinationAppId] = useState<string>("");
  const [sourceAccountId, setSourceAccountId] = useState<string>("");
  const [destinationAccountId, setDestinationAccountId] = useState<string>("");
  const [connector, setConnector] = useState<Connector | null>(null);

  //
  const { id } = useParams();
  const { createSyncMutation } = useSync(id);

  const { data: connectors, isLoading, error } = useQuery({
    queryKey: ['connectors'],
    queryFn: fetchConnectors
  });

  // set the source and destination ids
  useEffect(() => {
    if (!sync) return;

    setSourceAppId(sync.source?.connector_id);
    setDestinationAppId(sync.destination?.connector_id);
    setSourceAccountId(sync.source?.id);
    setDestinationAccountId(sync.destination?.id);
  }, [sync]);

  // find connector by id (helper function)
  const findConnector = (id: string) => {
    return connectors?.find(connector => connector.id === id) as ConnectorWithConnections;
  }

  // find the source and destination connectors for later use
  const sourceConnector = findConnector(sourceAppId);
  const destinationConnector = findConnector(destinationAppId);

  // handle next button click (save the data to the database)
  const handleNext = () => {
    // check to see if there are changes to save
    // if there are no changes, move to next step
      if (sourceAppId === sync.source?.connector_id &&
        destinationAppId === sync.destination?.connector_id &&
        sourceAccountId === sync.source?.id &&
        destinationAccountId === sync.destination?.id) {
        return next(); // move to next step
      }

    // now well save the data to the database
    const dataToSave = {
      id,
      source_id: sourceAccountId,
      destination_id: destinationAccountId,
    }

    try {
      // save to database
      createSyncMutation.mutate({ step: 'connect', data: dataToSave as any });

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
        {renderSection(
          sourceAppId,
          setSourceAppId,
          sourceAccountId,
          setSourceAccountId,
          connectors,
          sourceConnector?.connections ?? [],
          () => {
            // open connector connect modal
            setConnector(sourceConnector);
          },
        )}

        <div className='flex items-center justify-center col-span-1'>
          <ArrowRightLeft className='w-6 h-6' />
        </div>

        {renderSection(
          destinationAppId,
          setDestinationAppId,
          destinationAccountId,
          setDestinationAccountId,
          connectors,
          destinationConnector?.connections ?? [],
          () => {
            // open connector connect modal
            setConnector(destinationConnector);
          },
        )}
      </div>

      <div className="mt-4">
        <Button
          onClick={handleNext}
          disabled={!sourceAppId || !destinationAppId || !sourceAccountId || !destinationAccountId}
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
