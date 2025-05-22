import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";

// Mock integration data
const getIntegration = (id: string) => {
  const integrations = [
    {
      id: "1",
      name: "Shopify",
      icon: "https://cdn.shopify.com/s/files/1/0533/2089/files/shopify-logo-small.png",
      description: "Connect your Shopify store to sync products, orders, and customers",
      authType: "oauth",
    },
    {
      id: "2",
      name: "Airtable",
      icon: "https://seeklogo.com/images/A/airtable-logo-216B9AF035-seeklogo.com.png",
      description: "Use Airtable as a powerful database for your e-commerce data",
      authType: "api_key",
    },
    // ... other integrations
  ];

  return integrations.find(integration => integration.id === id);
};

const IntegrationConnect = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [connectionName, setConnectionName] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  
  const integration = id ? getIntegration(id) : null;
  
  if (!integration) {
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

  const handleConnect = async () => {
    if (!connectionName) {
      toast({
        title: "Error",
        description: "Please provide a name for this connection",
        variant: "destructive",
      });
      return;
    }

    if (integration.authType === "api_key" && !apiKey) {
      toast({
        title: "Error",
        description: "API key is required",
        variant: "destructive",
      });
      return;
    }

    setIsConnecting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Connection successful",
        description: `${integration.name} connection "${connectionName}" has been added`,
      });
      
      navigate("/integrations");
    } catch (error) {
      toast({
        title: "Connection failed",
        description: "Unable to connect. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleOAuthConnect = () => {
    if (!connectionName) {
      toast({
        title: "Error",
        description: "Please provide a name for this connection",
        variant: "destructive",
      });
      return;
    }

    // In a real app, this would redirect to the OAuth provider
    window.open(`https://auth.example.com/oauth/${integration.id}?connection_name=${connectionName}`, "_blank");
  };

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
                  placeholder="e.g., My Shopify Store"
                  value={connectionName}
                  onChange={(e) => setConnectionName(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  This helps you identify this specific connection
                </p>
              </div>

              {integration.authType === "api_key" && (
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
              )}
            </CardContent>
            <CardFooter className="flex justify-end">
              {integration.authType === "oauth" ? (
                <Button
                  onClick={handleOAuthConnect}
                  disabled={isConnecting || !connectionName}
                >
                  Continue to {integration.name}
                </Button>
              ) : (
                <Button
                  onClick={handleConnect}
                  disabled={isConnecting || !connectionName || (integration.authType === "api_key" && !apiKey)}
                >
                  {isConnecting ? "Connecting..." : "Connect"}
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Connection Help</CardTitle>
              <CardDescription>Tips for setting up your connection</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <h3 className="font-medium mb-1">Where to find your credentials</h3>
                <p className="text-muted-foreground">
                  Log in to your {integration.name} account and navigate to the API settings page. 
                  You can generate a new API key there.
                </p>
              </div>
              <div>
                <h3 className="font-medium mb-1">Permissions needed</h3>
                <p className="text-muted-foreground">
                  Make sure your API key has permissions for reading and writing to the resources you want to sync.
                </p>
              </div>
              <div>
                <h3 className="font-medium mb-1">Need help?</h3>
                <p className="text-muted-foreground">
                  Check our <a href="#" className="text-primary hover:underline">documentation</a> or 
                  contact <a href="#" className="text-primary hover:underline">support</a>.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default IntegrationConnect;
