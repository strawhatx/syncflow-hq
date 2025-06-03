import { useState } from 'react';
import { useCustomSelect } from '../hooks/useCustomSelect';
import { CustomSelectButton } from '../helpers/CustomSelectButton';
import { useIntegrationConnection } from '../hooks/useIntegrationConnection';

interface Integration {
  id: string;
  name: string;
  icon: string;
  description: string;
}

type ConfigType = 'source' | 'destination';

interface AppStepProps {
  type: ConfigType;
  onCreateNewConnection: (integration: Integration) => void;
  onValidated?: (value: boolean) => void;
}

const AppStep = ({ type, onCreateNewConnection, onValidated }: AppStepProps) => {
  const [app, setApp] = useState<string | null>(null);
  const [connection, setConnection] = useState<string | null>(null);
  const { CustomSelect, LoadingState } = useCustomSelect();
  const { integrations, connections, isLoadingIntegrations, isLoadingConnections } = useIntegrationConnection(app);

  const handleConnectionChange = (connectionId: string) => {
    setConnection(connectionId);

    if (app && connection) onValidated(true);
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
                  onCreateNew={() => onCreateNewConnection(integrations.find(i => i.id === app))}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AppStep; 