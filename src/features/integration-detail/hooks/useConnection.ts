import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import { fetchConnectionById, updateConnectionStatus, deleteConnection } from "@/services/integrationService";
import type { Database } from "@/integrations/supabase/types";
import { ConnectionStatus } from "@/features/integrations/components/IntegrationCard";

type Connection = Database['public']['Tables']['integration_connections']['Row'] & {
  integrations: Database['public']['Views']['integrations_public']['Row'];
};

interface ConnectionSettings {
  syncInterval: string;
  enableWebhooks: boolean;
}

export const useConnection = (connectionId: string | undefined) => {
  const navigate = useNavigate();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [connection, setConnection] = useState<Connection | null>(null);
  const [connectionName, setConnectionName] = useState("");
  const [settings, setSettings] = useState<ConnectionSettings>({
    syncInterval: "daily",
    enableWebhooks: true
  });

  useEffect(() => {
    const loadConnection = async () => {
      if (!connectionId) return;
      
      try {
        setIsLoading(true);
        const data = await fetchConnectionById(connectionId);
        if (!data) {
          throw new Error("Connection not found");
        }
        setConnection(data as Connection);
        setConnectionName(data.connection_name);
        setSettings({
          syncInterval: (data.auth_data as any)?.syncInterval || "daily",
          enableWebhooks: (data.auth_data as any)?.enableWebhooks ?? true
        });
      } 
      
      catch (error) {
        console.error("Error loading connection:", error);
        toast({
          title: "Error",
          description: "Failed to load connection details",
          variant: "destructive",
        });
      } 
      
      finally {
        setIsLoading(false);
      }
    };

    loadConnection();
  }, [connectionId]);

  const handleUpdateSettings = async () => {
    setIsUpdating(true);
    
    try {
      await updateConnectionStatus(connection!.id, connection!.connection_status as ConnectionStatus);
      
      toast({
        title: "Settings updated",
        description: "Your connection settings have been updated",
      });
    } catch (error) {
      toast({
        title: "Update failed",
        description: "Unable to update settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSyncNow = async () => {
    setIsSyncing(true);
    
    try {
      // TODO: Implement sync functionality
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Sync complete",
        description: "Data has been successfully synchronized",
      });
    } 
    catch (error) {
      toast({
        title: "Sync failed",
        description: "Unable to complete synchronization. Please try again.",
        variant: "destructive",
      });
    } 
    finally {
      setIsSyncing(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteConnection(connection!.id);
      
      toast({
        title: "Connection removed",
        description: `${connection!.integrations.name} connection "${connection!.connection_name}" has been removed`,
      });
      
      navigate("/integrations");
    } 
    catch (error) {
      toast({
        title: "Error",
        description: "Unable to remove connection. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleReconnect = async () => {
    try {
      // TODO: Implement reconnect functionality
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Reconnection successful",
        description: `${connection!.integrations.name} connection has been reestablished`,
      });
      
      navigate("/integrations");
    } 
    catch (error) {
      toast({
        title: "Error",
        description: "Unable to reconnect. Please try again.",
        variant: "destructive",
      });
    }
  };

  return {
    connection,
    connectionName,
    setConnectionName,
    settings,
    setSettings,
    isUpdating,
    isSyncing,
    isLoading,
    handleUpdateSettings,
    handleSyncNow,
    handleDelete,
    handleReconnect
  };
}; 