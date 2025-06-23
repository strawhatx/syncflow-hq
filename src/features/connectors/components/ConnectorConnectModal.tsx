import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Connector } from "@/types/connectors";
import { useTeam } from "@/contexts/TeamContext";
import { ConnectionFieldsStrategyFactory } from "@/strategies/connection-fields";
import { Zap } from "lucide-react";
import { ConnectionActionsStrategyFactory } from "@/strategies/connection-actions";
import { ConnectorWithConnections } from "@/services/connectorService";

interface ConnectorConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  connector: ConnectorWithConnections;
}

export default function ConnectorConnectModal({ isOpen, onClose, connector }: ConnectorConnectModalProps) {
  const { team } = useTeam();
  const [connectionName, setConnectionName] = useState("");
  const [config, setConfig] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center justify-center gap-4 mb-4">
            <img src={`/svg/${connector.config.icon}.svg`} alt={connector.name} className="h-14 w-14" />
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
        <form onSubmit={handleSubmit} className="space-y-4">
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

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>

            {renderActions()}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 