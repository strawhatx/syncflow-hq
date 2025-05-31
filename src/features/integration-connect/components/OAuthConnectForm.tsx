import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { initiateOAuth } from "@/services/oauthService";
import { Integration } from "@/services/integrationService";

interface OAuthConnectFormProps {
  integration: Integration;
  isConnecting: boolean;
  setIsConnecting: (value: boolean) => void;
  connectionName: string;
  setConnectionName: (value: string) => void;
}

const OAuthConnectForm = ({
  integration,
  isConnecting,
  setIsConnecting,
  connectionName,
  setConnectionName,
}: OAuthConnectFormProps) => {
  const [shopDomain, setShopDomain] = useState("");

  const handleOAuthConnect = async () => {
    if (!connectionName) {
      toast({
        title: "Error",
        description: "Please provide a name for this connection",
        variant: "destructive",
      });
      return;
    }

    // For Shopify, validate the shop domain
    if (integration.name.toLowerCase() === "shopify") {
      if (!shopDomain) {
        toast({
          title: "Error",
          description: "Please provide your Shopify store URL",
          variant: "destructive",
        });
        return;
      }

      // Validate myshopify.com domain
      if (!shopDomain.endsWith('.myshopify.com')) {
        toast({
          title: "Invalid Store URL",
          description: "Please enter your myshopify.com domain (e.g., your-store.myshopify.com). You can find this in your Shopify admin under Settings > Domains.",
          variant: "destructive",
        });
        return;
      }
    }

    try {
      setIsConnecting(true);
      
      // Prepare OAuth parameters
      const params: Record<string, string> = {};
      if (integration.name.toLowerCase() === "shopify") {
        params.shop = shopDomain;
      }
      
      // Initiate OAuth flow
      const oauthUrl = initiateOAuth(
        integration.name,
        params,
        connectionName
      );
      
      // Redirect to OAuth provider
      window.location.href = await oauthUrl;
    } catch (error) {
      console.error("Error initiating OAuth flow:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to start OAuth process. Please try again.",
        variant: "destructive",
      });
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
            placeholder="e.g., My Shopify Store"
            value={connectionName}
            onChange={(e) => setConnectionName(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            This helps you identify this specific connection
          </p>
        </div>

        {integration.name.toLowerCase() === "shopify" && (
          <div className="space-y-2">
            <Label htmlFor="shop-domain">Shopify Store URL</Label>
            <Input
              id="shop-domain"
              placeholder="your-store.myshopify.com"
              value={shopDomain}
              onChange={(e) => setShopDomain(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Enter your myshopify.com domain (e.g., your-store.myshopify.com). You can find this in your Shopify admin under Settings {'>'} Domains.
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-end">
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
      </CardFooter>
    </Card>
  );
};

export default OAuthConnectForm;
