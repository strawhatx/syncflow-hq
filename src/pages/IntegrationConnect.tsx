
import { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { 
  createConnection, 
  fetchIntegrationById, 
  generateOAuthUrl, 
  handleOAuthCallback 
} from "@/services/integrationService";
import { ConnectionStatus } from "@/components/integrations/IntegrationCard";
import { useQueryClient } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

const IntegrationConnect = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [connectionName, setConnectionName] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [shopDomain, setShopDomain] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  
  // Check if we're handling an OAuth callback
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');
  
  // Fetch the integration from Supabase
  const { data: integration, isLoading, error: fetchError } = useQuery({
    queryKey: ['integration', id],
    queryFn: async () => {
      if (!id) return null;
      return await fetchIntegrationById(id);
    }
  });
  
  // Handle OAuth callback
  useEffect(() => {
    if (code && state && integration) {
      const handleCallback = async () => {
        try {
          setIsConnecting(true);
          
          // Parse state which contains the connection name
          const stateData = JSON.parse(atob(state));
          
          await handleOAuthCallback(
            integration.name.toLowerCase(),
            code,
            stateData.shopName,
            null,
            stateData.connectionName
          );
          
          // Invalidate integrations query to refresh the data
          queryClient.invalidateQueries({ queryKey: ['integrations'] });
          
          toast({
            title: "Connection successful",
            description: `${integration.name} connection "${stateData.connectionName}" has been added`,
          });
          
          navigate("/integrations");
        } catch (err) {
          console.error("Error in OAuth callback:", err);
          toast({
            title: "Connection failed",
            description: "Unable to complete OAuth connection. Please try again.",
            variant: "destructive",
          });
        } finally {
          setIsConnecting(false);
        }
      };
      
      handleCallback();
    }
    
    if (error) {
      toast({
        title: "Authorization failed",
        description: `Error: ${error}`,
        variant: "destructive",
      });
    }
  }, [code, state, error, integration, queryClient, navigate]);
  
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
      // Save connection to database
      await createConnection(
        integration.id, 
        connectionName, 
        "active" as ConnectionStatus,
        null, // auth data for OAuth
        integration.authType === "api_key" ? apiKey : null
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

  const handleOAuthConnect = () => {
    if (!connectionName) {
      toast({
        title: "Error",
        description: "Please provide a name for this connection",
        variant: "destructive",
      });
      return;
    }

    // For Shopify, make sure we have a shop domain
    if (integration.name.toLowerCase() === "shopify" && !shopDomain) {
      toast({
        title: "Error",
        description: "Please provide your Shopify store URL",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsConnecting(true);
      
      // Encode connection name in the state parameter to retrieve it in the callback
      const stateParam = btoa(JSON.stringify({
        connectionName,
        shopName: shopDomain
      }));
      
      // In a real implementation, these would be environment variables
      // For demo purposes, we're using placeholders
      const clientId = "your-client-id"; // Would be retrieved from environment variables
      const redirectUri = window.location.origin + window.location.pathname;
      
      // Generate OAuth URL
      const oauthUrl = generateOAuthUrl(
        integration.name.toLowerCase(),
        integration.name.toLowerCase() === "shopify" ? shopDomain : null,
        {
          clientId,
          redirectUri,
          state: stateParam
        }
      );
      
      // Redirect to OAuth provider
      window.location.href = oauthUrl;
    } catch (error) {
      console.error("Error generating OAuth URL:", error);
      toast({
        title: "Error",
        description: "Failed to start OAuth process. Please try again.",
        variant: "destructive",
      });
      setIsConnecting(false);
    }
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

              {integration.authType === "oauth" && integration.name.toLowerCase() === "shopify" && (
                <div className="space-y-2">
                  <Label htmlFor="shop-domain">Shopify Store URL</Label>
                  <Input
                    id="shop-domain"
                    placeholder="your-store.myshopify.com"
                    value={shopDomain}
                    onChange={(e) => setShopDomain(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter your Shopify store URL (e.g., your-store.myshopify.com)
                  </p>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-end">
              {integration.authType === "oauth" ? (
                <Button
                  onClick={handleOAuthConnect}
                  disabled={isConnecting || !connectionName || (integration.name.toLowerCase() === "shopify" && !shopDomain)}
                >
                  {isConnecting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    `Continue to ${integration.name}`
                  )}
                </Button>
              ) : (
                <Button
                  onClick={handleConnect}
                  disabled={isConnecting || !connectionName || (integration.authType === "api_key" && !apiKey)}
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
              {integration.authType === "oauth" ? (
                <>
                  <div>
                    <h3 className="font-medium mb-1">OAuth Setup</h3>
                    <p className="text-muted-foreground">
                      You'll be redirected to {integration.name} to authorize access. 
                      You'll need to login and approve the permissions.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Required Permissions</h3>
                    <p className="text-muted-foreground">
                      We'll request permissions to access your {integration.name.toLowerCase() === "shopify" ? "products and orders" : "data"} 
                      to enable synchronization with other services.
                    </p>
                  </div>
                </>
              ) : (
                <>
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
                </>
              )}
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
