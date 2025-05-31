
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
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
}

const ApiKeyConnectForm = ({
  integration,
  isConnecting,
  setIsConnecting,
  connectionName,
  setConnectionName,
}: ApiKeyConnectFormProps) => {
  const [apiKey, setApiKey] = useState("");
  const navigate = useNavigate();
  const queryClient = useQueryClient();

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
      // Save connection to database
      await createConnection(
        integration.id, 
        connectionName, 
        "active",
        null, // auth data for OAuth
        apiKey
      );
      
      // Invalidate integrations query to refresh the data
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

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0 h-12 w-12 rounded bg-gray-100 flex items-center justify-center">
            <img 
              src={integration.icon} 
              alt={integration.name} 
              className="h-8 w-8" 
              onError={(e) => (e.currentTarget.src = "https://via.placeholder.com/32")} 
            />
          </div>
          <div>
            <CardTitle>{integration.name}</CardTitle>
            <CardDescription>{integration.description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="connection-name">Connection Name</Label>
          <Input
            id="connection-name"
            placeholder="e.g., My API Connection"
            value={connectionName}
            onChange={(e) => setConnectionName(e.target.value)}
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
          />
          <p className="text-xs text-muted-foreground">
            You can find your API key in your {integration.name} account settings
          </p>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button
          onClick={handleConnect}
          disabled={isConnecting || !connectionName || !apiKey}
        >
          {isConnecting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Connecting...
            </>
          ) : (
            "Connect"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ApiKeyConnectForm;
