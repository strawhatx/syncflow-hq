import React from 'react';
import { useIntegrationConnections } from '../hooks/useIntegrationConnections';
import { useCustomSelect } from '../hooks/useCustomSelect';
import { CustomSelectButton } from './CustomSelectButton';

interface Integration {
  id: string;
  name: string;
  icon: string;
  description: string;
}

interface Connection {
  id: string;
  connection_name: string;
  connection_status: string;
  integration_id: string;
  user_id: string;
  api_key: string | null;
  auth_data: any | null;
  created_at: string;
  updated_at: string;
}

interface ConnectionStepProps {
  selectedSource: string | null;
  selectedDestination: string | null;
  selectedSourceConnection: string | null;
  selectedDestinationConnection: string | null;
  onSourceSelect: (source: string) => void;
  onDestinationSelect: (destination: string) => void;
  onSourceConnectionSelect: (connection: string) => void;
  onDestinationConnectionSelect: (connection: string) => void;
  onCreateNewConnection: (integrationId: string) => void;
  setIntegrations: (integrations: any[]) => void;
}

const ConnectionStep: React.FC<ConnectionStepProps> = ({
  selectedSource,
  selectedDestination,
  selectedSourceConnection,
  selectedDestinationConnection,
  onSourceSelect,
  onDestinationSelect,
  onSourceConnectionSelect,
  onDestinationConnectionSelect,
  onCreateNewConnection,
  setIntegrations,
}) => {
  const {
    integrations,
    sourceConnections,
    destinationConnections,
    filteredIntegrations,
    isLoadingIntegrations,
    isLoadingSourceConnections,
    isLoadingDestinationConnections,
  } = useIntegrationConnections(selectedSource, selectedDestination);

  // Update parent component with integrations
  React.useEffect(() => {
    if (integrations) {
      setIntegrations(integrations);
    }
  }, [integrations, setIntegrations]);

  const { CustomSelect, LoadingState } = useCustomSelect();

  // Integration selector component
  const IntegrationSelector = ({
    title,
    value,
    onChange,
    options,
    disabled,
    isLoading,
  }: {
    title: string;
    value: string | null;
    onChange: (value: string) => void;
    options: any[];
    disabled?: boolean;
    isLoading: boolean;
  }) => (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
      <CustomSelect
        value={value}
        onValueChange={onChange}
        options={options}
        placeholder="Select an integration"
        disabled={disabled}
        isLoading={isLoading}
      />
    </div>
  );

  // Connection selector component
  const ConnectionSelector = ({
    title,
    value,
    onChange,
    connections,
    isLoading,
    onCreateNew,
  }: {
    title: string;
    value: string | null;
    onChange: (value: string) => void;
    connections: any[] | undefined;
    isLoading: boolean;
    onCreateNew: () => void;
  }) => (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
      {isLoading ? (
        <LoadingState />
      ) : (
        <div>
          <CustomSelectButton
            value={value}
            onValueChange={onChange}
            options={(connections ?? []).map(conn => ({
              id: conn.id,
              name: conn.connection_name,
            }))}
            placeholder="Select a connection"
            isLoading={isLoading}
            onCreateNew={onCreateNew}
          />
        </div>
      )}
    </div>
  );

  if (isLoadingIntegrations) {
    return <LoadingState />;
  }

  return (
    <div className="flex flex-col md:flex-row gap-6 items-start">
      {/* Source Section */}
      <div className="w-full md:w-[45%] space-y-4">
        <IntegrationSelector
          title="Source Integration"
          value={selectedSource}
          onChange={onSourceSelect}
          options={integrations || []}
          isLoading={isLoadingIntegrations}
        />

        {selectedSource && (
          <ConnectionSelector
            title="Source Connection"
            value={selectedSourceConnection}
            onChange={onSourceConnectionSelect}
            connections={sourceConnections}
            isLoading={isLoadingSourceConnections}
            onCreateNew={() => onCreateNewConnection(selectedSource)}
          />
        )}
      </div>

      {/* Connection Icon */}
      <div className="hidden md:flex items-center justify-center w-[10%]">
        <div className="w-[1px] h-24 bg-border" />
      </div>

      {/* Destination Section */}
      <div className="w-full md:w-[45%] space-y-4">
        <IntegrationSelector
          title="Destination Integration"
          value={selectedDestination}
          onChange={onDestinationSelect}
          options={filteredIntegrations}
          isLoading={isLoadingIntegrations}
        />

        {selectedDestination && (
          <ConnectionSelector
            title="Destination Connection"
            value={selectedDestinationConnection}
            onChange={onDestinationConnectionSelect}
            connections={destinationConnections}
            isLoading={isLoadingDestinationConnections}
            onCreateNew={() => onCreateNewConnection(selectedDestination)}
          />
        )}
      </div>
    </div>
  );
};

export default ConnectionStep; 