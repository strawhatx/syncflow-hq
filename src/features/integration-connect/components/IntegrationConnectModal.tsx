import { useState } from "react";
import { X, Zap } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import OAuthConnectForm from "./OAuthConnectForm";
import ApiKeyConnectForm from "./ApiKeyConnectForm";

interface Integration {
  id: string;
  name: string;
  icon: string;
  description: string;
  category: string;
  authType: "oauth" | "api_key" | "basic";
}

interface IntegrationConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  integration: Integration;
}

const IntegrationConnectModal = ({ isOpen, onClose, integration }: IntegrationConnectModalProps) => {
  const [connectionName, setConnectionName] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);

  // State to control the Authorize button
  const [formState, setFormState] = useState<{
    submit: (() => Promise<void>) | null;
    isValid: boolean;
    isConnecting: boolean;
  }>({ submit: null, isValid: false, isConnecting: false });

  const getImagePath = (icon_name: string) => {
    if (!icon_name) return;
    return `/svg/${icon_name}.svg`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px] p-0 overflow-visible">
        <div className="flex flex-col items-center text-center px-8 py-8">
          <div className="flex items-center justify-center gap-4 mb-4">
            <img src={getImagePath(integration.icon)} alt={integration.name} className="h-14 w-14" />
            <span className="text-3xl font-bold">+</span>
            <div className="flex aspect-square size-14 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Zap className="size-7" />
          </div>
          </div>
          <h2 className="text-2xl font-bold mb-2">Connect {integration.name} with syncflow.io</h2>
          <p className="text-muted-foreground mb-6">
            To make a connection between {integration.name} and syncflow.io you need to click the button below and select your {integration.name} account.
          </p>

          {/* Show the connection form here */}
          <div className="w-full max-w-md mb-6">
            {integration.authType === "oauth" ? (
              <OAuthConnectForm
                integration={integration}
                isConnecting={isConnecting}
                setIsConnecting={setIsConnecting}
                connectionName={connectionName}
                setConnectionName={setConnectionName}
                onFormStateChange={state => setFormState(state)}
              />
            ) : (
              <ApiKeyConnectForm
                integration={integration}
                isConnecting={isConnecting}
                setIsConnecting={setIsConnecting}
                connectionName={connectionName}
                setConnectionName={setConnectionName}
                onFormStateChange={state => setFormState(state)}
              />
            )}
          </div>

          <div className="flex gap-3 justify-end w-full">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button
              onClick={() => formState.submit && formState.submit()}
              disabled={!formState.isValid || formState.isConnecting}
            >
              {formState.isConnecting ? "Authorizing..." : "Authorize"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default IntegrationConnectModal; 