import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { initiateOAuth } from "@/services/oauthService";
import { Integration } from "@/services/integrationService";

interface OAuthConnectFormProps {
  integration: Integration;
  isConnecting: boolean;
  setIsConnecting: (value: boolean) => void;
  connectionName: string;
  setConnectionName: (value: string) => void;
  onFormStateChange?: (state: { submit: () => Promise<void>; isValid: boolean; isConnecting: boolean }) => void;
}

const OAuthConnectForm = ({
  integration,
  isConnecting,
  setIsConnecting,
  connectionName,
  setConnectionName,
  onFormStateChange,
}: OAuthConnectFormProps) => {
  const [shopDomain, setShopDomain] = useState("");

  const isShopify = integration.name.toLowerCase() === "shopify";
  const isValid = !!connectionName && (!isShopify || !!shopDomain);

  const handleOAuthConnect = async () => {
    if (!connectionName) {
      toast({
        title: "Error",
        description: "Please provide a name for this connection",
        variant: "destructive",
      });
      return;
    }
    if (isShopify) {
      if (!shopDomain) {
        toast({
          title: "Error",
          description: "Please provide your Shopify store URL",
          variant: "destructive",
        });
        return;
      }
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
      const params: Record<string, string> = {};
      if (isShopify) params.shop = shopDomain;
      const oauthUrl = initiateOAuth(
        integration.name,
        params,
        connectionName
      );
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

  useEffect(() => {
    if (onFormStateChange) {
      onFormStateChange({ submit: handleOAuthConnect, isValid, isConnecting });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connectionName, shopDomain, isConnecting]);

  return (
    <form className="space-y-4 text-left" onSubmit={e => { e.preventDefault(); handleOAuthConnect(); }}>
      <div className="space-y-2">
        <Label htmlFor="connection-name">Connection Name</Label>
        <Input
          id="connection-name"
          placeholder="e.g., My Shopify Store"
          value={connectionName}
          onChange={(e) => setConnectionName(e.target.value)}
          disabled={isConnecting}
        />
        <p className="text-xs text-muted-foreground">
          This helps you identify this specific connection
        </p>
      </div>
      {isShopify && (
        <div className="space-y-2">
          <Label htmlFor="shop-domain">Shopify Store URL</Label>
          <Input
            id="shop-domain"
            placeholder="your-store.myshopify.com"
            value={shopDomain}
            onChange={(e) => setShopDomain(e.target.value)}
            disabled={isConnecting}
          />
          <p className="text-xs text-muted-foreground">
            Enter your myshopify.com domain (e.g., your-store.myshopify.com). You can find this in your Shopify admin under Settings {'>'} Domains.
          </p>
        </div>
      )}
    </form>
  );
};

export default OAuthConnectForm;
