import { useState, forwardRef, useImperativeHandle } from 'react';
import { useCustomSelect } from './hooks/useCustomSelect';
import { CustomSelectButton } from '../sync/helpers/CustomSelectButton';
import { syncConfig, useIntegrationConnection } from './hooks/useIntegrationConnection';
import ConnectorConnectModal from "@/components/connector/ConnectorConnectModal";

interface Integration {
  id: string;
  name: string;
  icon: string;
  description: string;
  category: string;
  auth_type: "oauth" | "api_key" | "basic";
}

type ConfigType = 'source' | 'destination';

export interface ConnectionsStepRef {
  save: () => Promise<boolean>;
}

interface ConnectionsStepProps {
  type: ConfigType;
  syncId: string;
}

const SyncCreateConnections = forwardRef<ConnectionsStepRef, ConnectionsStepProps>(({ type, syncId }, ref) => {
  const [app, setApp] = useState<string | null>(null);
  const [connection, setConnection] = useState<string | null>(null);
  const { CustomSelect, LoadingState } = useCustomSelect();
  const { integrations, connections, isLoadingIntegrations, isLoadingConnections } = useIntegrationConnection(app);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [connectIntegration, setConnectIntegration] = useState<Integration | null>(null);

  useImperativeHandle(ref, () => ({
    save: async () => {
      if (!connection) return false;
      try {
        await syncConfig[type].save(syncId, connection);
        return true;
      } catch {
        return false;
      }
    }
  }));

  const handleConnectionChange = (connectionId: string) => {
    setConnection(connectionId);
  };

  const handleCreateNew = () => {
    const integration = integrations.find(i => i.id === app);
    setConnectIntegration(integration);
    setShowConnectModal(true);
  };

  if (isLoadingIntegrations) {
    return <LoadingState />;
  }

  return (
    <div className="flex flex-col md:flex-row gap-6 items-start">
      {/* Source Section */}
      <div className="w-full md:w-[45%] space-y-4">
        <CustomSelect
          value={app}
          onValueChange={setApp}
          options={integrations || []}
          placeholder={`Select ${type} integration`}
          disabled={false}
          isLoading={isLoadingIntegrations}
        />

        {app && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">Connection</h3>
            {isLoadingConnections ? (
              <LoadingState />
            ) : (
              <div>
                <CustomSelectButton
                  value={connection}
                  onValueChange={handleConnectionChange}
                  options={(connections ?? []).map(conn => ({
                    id: conn.id,
                    name: conn.connection_name,
                  }))}
                  placeholder={`Select ${type} connection`}
                  isLoading={isLoadingConnections}
                  onCreateNew={handleCreateNew}
                />
              </div>
            )}
          </div>
        )}
      </div>
      {showConnectModal && connectIntegration && (
        <ConnectorConnectModal
          isOpen={showConnectModal}
          onClose={() => setShowConnectModal(false)}
          connector={connectIntegration}
        />
      )}
    </div>
  );
});

export default SyncCreateConnections; 