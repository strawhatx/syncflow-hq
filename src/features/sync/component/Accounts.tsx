// steps/NameStep.tsx

import { useWizard } from '@/contexts/WizardContext';
import { ConnectorWithConnections, fetchConnectors } from '@/services/connectorService';
import { Link } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CustomSelectButton } from '../../../components/ui_custom/CustomSelectButton';
import ConnectorConnectModal from '@/components/connector/ConnectorConnectModal';
import { useState } from 'react';
import { Connector } from '@/types/connectors';
import { toast } from '@/hooks/use-toast';
import useSync from '../hooks/useSync';

export default function AccountsStep({ next }) {
  const [connector, setConnector] = useState<Connector | null>(null);
  const { data, setData } = useWizard();
  const { id } = useParams();
  const { createSyncMutation } = useSync(id);

  
  const handleNext = async () => {
    // now well save the data to the database
    const dataToSave = {
      id,
      source_id: data.source.id,
      destination_id: data.destination.id,
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

  const handleConnect = (connector: ConnectorWithConnections) => {
    setConnector(connector as unknown as Connector);
  };

  return (
    <div>
      <div className="grid items-center grid-cols-1 md:grid-cols-5 gap-4">
        <div className='col-span-2'>
          <CustomSelectButton
            value={data.source?.id}
            onValueChange={(value) => setData({
              ...data,
              source: {
                ...data.source,
                id: value
              }
            })}
            options={(data.source?.connector?.connections ?? []).map(conn => ({
              id: conn.id,
              name: conn.name,
            }))}
            placeholder={`Select source connection`}
            isLoading={data.source?.connector?.connections.length === 0}
            onCreateNew={() => handleConnect(data.source?.connector)}
          />
        </div>

        <div className='flex items-center justify-center col-span-1'>
          <Link className='w-4 h-4' />
        </div>
        <div className='col-span-2'>
          <CustomSelectButton
            value={data.destination?.id}
            onValueChange={(value) => setData({
              ...data,
              destination: {
                ...data.destination,
                id: value
              }
            })}
            options={(data.destination?.connector?.connections ?? []).map(conn => ({
              id: conn.id,
              name: conn.name,
            }))}
            placeholder={`Select destination connection`}
            disabled={false}
            isLoading={data.destination?.connector?.connections.length === 0}
            onCreateNew={() => handleConnect(data.destination?.connector)}
          />
        </div>
      </div>
      <div className="mt-4">
        <Button
          onClick={handleNext}
          disabled={!data.source?.id || !data.destination?.id}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-1 rounded-lg font-medium transition-all duration-200 flex items-center gap-2"
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
