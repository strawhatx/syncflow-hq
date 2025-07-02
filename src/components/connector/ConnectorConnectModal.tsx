import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTeam } from "@/contexts/TeamContext";
import { ConnectionFieldsStrategyFactory } from "@/strategies/connection-fields";
import { Zap } from "lucide-react";
import { ConnectionActionsStrategyFactory } from "@/strategies/connection-actions";
import { Connector } from "@/types/connectors";
import { fetchConnectionById } from "@/services/connectionService";

interface ConnectorConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  connector: Connector;
  connection_id?: string;
}

export default function ConnectorConnectModal({ isOpen, onClose, connector, connection_id }: ConnectorConnectModalProps) {
  const { team } = useTeam();
  const [connectionName, setConnectionName] = useState("");
  const [config, setConfig] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // if editing get data
  useEffect(() => {
    if (isOpen && connection_id)
      fetchConnectionById(connection_id).then(connection => {
        setConnectionName(connection.name);

        // parse the json config
        setConfig(
          typeof connection.config === "string"
            ? JSON.parse(connection.config)
            : (connection.config as Record<string, any>)
        );
      })
  }, [isOpen, connection_id]);

  const renderActions = () => {
    const strategy = ConnectionActionsStrategyFactory.getStrategy(connector.type);
    return strategy.renderActions(isLoading);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await ConnectionActionsStrategyFactory.getStrategy(connector.type).handleSubmitAction(
      connector,
      connectionName,
      e,
      setIsLoading,
      setError,
      team.id,
      // If the connection is being created, create a new connection to do that 
      // we need to set the connection_id to undefined
      isOpen && connection_id ? connection_id : undefined,
      config,
      onClose
    );
  }

  const renderConfigFields = () => {
    const strategy = ConnectionFieldsStrategyFactory.getStrategy(connector);
    return strategy.renderFields(config, setConfig);
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-fit max-w-full md:max-w-xl lg:max-w-3xl">
        <DialogHeader>
          <div className="flex items-center justify-center gap-4 mb-4">
            <img src={`/svg/${connector.icon}.svg`} alt={connector.name} className="h-14 w-14" />
            <span className="text-3xl font-bold">+</span>
            <div className="flex aspect-square size-14 items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white transition-all duration-200">
              <Zap className="size-7" />
            </div>
          </div>
          <DialogTitle className="text-center">Connect {connector.name} with syncflow.io</DialogTitle>
          <DialogDescription className="text-center">
            To make a connection between {connector.name} and syncflow.io you need to fill in the form below.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-3">
          <div className="max-h-[300px] px-2 overflow-x-scroll">
            <div className="space-y-2">
              <Label htmlFor="name">Connection Name</Label>
              <Input
                id="name"
                placeholder="My Connection"
                value={connectionName}
                onChange={(e) => setConnectionName(e.target.value)}
                required
              />
            </div>

            {renderConfigFields()}


            {error && (
              <div className="text-sm text-red-500">
                {error}
              </div>
            )}
          </div>

          <DialogFooter className="flex px-2 md:justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>

            {renderActions()}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 