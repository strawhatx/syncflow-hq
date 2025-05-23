
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { generateOAuthUrl } from "@/services/integrationService";
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
              Enter your Shopify store URL (e.g., your-store.myshopify.com)
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
