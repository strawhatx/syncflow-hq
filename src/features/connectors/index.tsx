import { useState } from "react";
import { Loader2 } from "lucide-react";
import ConnectorCard from "./components/ConnectorCard";
import { Button } from "@/components/ui/button";
import { useConnectors } from "./hooks/useConnectors";
import ConnectorConnectModal from "../../components/connector/ConnectorConnectModal";
import { ConnectorWithConnections } from "@/services/connectorService";
import { Connector } from "@/types/connectors";

const Connectors = () => {
  const {
    connectedConnectors,
    availableConnectors,
    isLoading,
    error
  } = useConnectors();

  const [selectedConnector, setSelectedConnector] = useState<ConnectorWithConnections | null>(null);
  const [connectionId, setConnectionId] = useState<string | null>(null);

  const handleConnect = (connector: ConnectorWithConnections) => {
    setSelectedConnector(connector);
    setConnectionId(undefined);
  };

  const handleManage = (connectionId: string, connector: ConnectorWithConnections) => {
    setConnectionId(connectionId);
    setSelectedConnector(connector);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-8 text-center">
        <h2 className="text-2xl font-semibold mb-2">Error loading connectors</h2>
        <p className="text-muted-foreground">There was a problem loading your connectors. Please try again.</p>
        <Button className="mt-4" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div>
      {connectedConnectors.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-medium mb-4">Connected</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {connectedConnectors.map(connector => (
              <ConnectorCard
                key={connector.id}
                name={connector.name}
                icon={connector.icon}
                description={connector.description}
                isConnected={true}
                connections={connector.connections}
                onConnect={() => handleConnect(connector)}
                onManage={(connectionId) => handleManage(connectionId, connector)}
              />
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-lg font-medium mb-4">Available Connectors</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {availableConnectors.map(connector => (
            <ConnectorCard
              key={connector.id}
              name={connector.name}
              icon={connector.icon}
              description={connector.description}
              isConnected={false}
              connections={[]}
              onConnect={() => handleConnect(connector)}
            />
          ))}
        </div>
      </div>

      {selectedConnector && (
        <ConnectorConnectModal
          isOpen={!!selectedConnector}
          onClose={() => setSelectedConnector(null)}
          connector={selectedConnector as unknown as Connector}
          connection_id={connectionId}
        />
      )}
    </div>
  );
};

export default Connectors;
