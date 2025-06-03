import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createConnection, Integration } from "@/services/integrationService";

interface ApiKeyConnectFormProps {
  integration: Integration;
  isConnecting: boolean;
  setIsConnecting: (value: boolean) => void;
  connectionName: string;
  setConnectionName: (value: string) => void;
  onFormStateChange?: (state: { submit: () => Promise<void>; isValid: boolean; isConnecting: boolean }) => void;
}

const ApiKeyConnectForm = ({
  integration,
  isConnecting,
  setIsConnecting,
  connectionName,
  setConnectionName,
  onFormStateChange,
}: ApiKeyConnectFormProps) => {
  const [apiKey, setApiKey] = useState("");
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const isValid = !!connectionName && !!apiKey;

  const handleConnect = async () => {
    if (!connectionName) {
      toast({
        title: "Error",
        description: "Please provide a name for this connection",
        variant: "destructive",
      });
      return;
    }
    if (!apiKey) {
      toast({
        title: "Error",
        description: "API key is required",
        variant: "destructive",
      });
      return;
    }
    setIsConnecting(true);
    try {
      await createConnection(
        integration.id, 
        connectionName, 
        "active",
        null, // auth data for OAuth
        apiKey
      );
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
      toast({
        title: "Connection successful",
        description: `${integration.name} connection "${connectionName}" has been added`,
      });
      navigate("/integrations");
    } catch (error) {
      console.error("Connection error:", error);
      toast({
        title: "Connection failed",
        description: "Unable to connect. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  useEffect(() => {
    if (onFormStateChange) {
      onFormStateChange({ submit: handleConnect, isValid, isConnecting });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connectionName, apiKey, isConnecting]);

  return (
    <form className="space-y-4" onSubmit={e => { e.preventDefault(); handleConnect(); }}>
      <div className="space-y-2">
        <Label htmlFor="connection-name">Connection Name</Label>
        <Input
          id="connection-name"
          placeholder="e.g., My API Connection"
          value={connectionName}
          onChange={(e) => setConnectionName(e.target.value)}
          disabled={isConnecting}
        />
        <p className="text-xs text-muted-foreground">
          This helps you identify this specific connection
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="api-key">API Key</Label>
        <Input
          id="api-key"
          type="password"
          placeholder="Enter your API key"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          disabled={isConnecting}
        />
        <p className="text-xs text-muted-foreground">
          You can find your API key in your {integration.name} account settings
        </p>
      </div>
    </form>
  );
};

export default ApiKeyConnectForm;
