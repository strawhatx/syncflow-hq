
import { useState } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIntegrationDetails } from "@/hooks/useIntegrationDetails";
import { useOAuthCallback } from "@/hooks/useOAuthCallback";
import OAuthConnectForm from "@/components/integrations/OAuthConnectForm";
import ApiKeyConnectForm from "@/components/integrations/ApiKeyConnectForm";
import ConnectionHelpCard from "@/components/integrations/ConnectionHelpCard";

const IntegrationConnect = () => {
  const [connectionName, setConnectionName] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  
  const { integration, isLoading, fetchError, navigate } = useIntegrationDetails();
  
  // Handle OAuth callback if present in URL
  useOAuthCallback(integration, isConnecting, setIsConnecting);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }
  
  if (fetchError || !integration) {
    return (
      <div className="py-8 text-center">
        <h2 className="text-2xl font-semibold mb-2">Integration not found</h2>
        <p className="text-muted-foreground mb-6">The integration you're looking for doesn't exist.</p>
        <Button onClick={() => navigate("/integrations")}>
          Back to Integrations
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <button 
          className="flex items-center text-muted-foreground hover:text-foreground transition-colors"
          onClick={() => navigate("/integrations")}
        >
          <ArrowLeft size={16} className="mr-1" />
          <span>Back to Integrations</span>
        </button>
      </div>

      <div className="mb-8">
        <h1 className="text-2xl font-semibold mb-2">Connect {integration.name}</h1>
        <p className="text-muted-foreground">Set up a new connection to {integration.name}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          {integration.authType === "oauth" ? (
            <OAuthConnectForm
              integration={integration}
              isConnecting={isConnecting}
              setIsConnecting={setIsConnecting}
              connectionName={connectionName}
              setConnectionName={setConnectionName}
            />
          ) : (
            <ApiKeyConnectForm
              integration={integration}
              isConnecting={isConnecting}
              setIsConnecting={setIsConnecting}
              connectionName={connectionName}
              setConnectionName={setConnectionName}
            />
          )}
        </div>

        <div>
          <ConnectionHelpCard 
            authType={integration.authType} 
            integrationName={integration.name} 
          />
        </div>
      </div>
    </div>
  );
};

export default IntegrationConnect;
