import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { processOAuthCallback } from "@/services/oauthService";
import { Integration } from "@/services/integrationService";

export function useOAuthCallback(
  integration: Integration | null,
  isConnecting: boolean,
  setIsConnecting: (value: boolean) => void
) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  // Check if we're handling an OAuth callback
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');
  
  useEffect(() => {
    if (code && state && integration) {
      const handleCallback = async () => {
        try {
          setIsConnecting(true);
          
          // Process the OAuth callback
          await processOAuthCallback(code, state);
          
          // Invalidate integrations query to refresh the data
          queryClient.invalidateQueries({ queryKey: ['integrations'] });
          
          // Get connection name from state
          const stateData = JSON.parse(atob(state));
          
          toast({
            title: "Connection successful",
            description: `${integration.name} connection "${stateData.connectionName}" has been added`,
          });
          
          navigate("/integrations");
        } catch (err) {
          console.error("Error in OAuth callback:", err);
          toast({
            title: "Connection failed",
            description: err instanceof Error ? err.message : "Unable to complete OAuth connection. Please try again.",
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
  }, [code, state, error, integration, setIsConnecting, queryClient, navigate]);

  return { code, state, error };
}
