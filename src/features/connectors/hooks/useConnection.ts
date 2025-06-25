import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import { fetchConnectionById, updateConnectionStatus, deleteConnection } from "@/services/connectionService";
import type { Database } from "@/integrations/supabase/types";

type Connection = Database['public']['Tables']['connections']['Row'];

export const useConnection = () => {
  const navigate = useNavigate();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [connection, setConnection] = useState<Connection | null>(null);

const loadConnection = async (connectionId:string) => {
      if (!connectionId) return;
      
      try {
        setIsLoading(true);
        const data = await fetchConnectionById(connectionId);
        if (!data) {
          throw new Error("Connection not found");
        }
        setConnection(data as Connection);
        setConnectionName(data.name);
        setSettings({
          syncInterval: (data.config as any)?.syncInterval || "daily",
          enableWebhooks: (data.config as any)?.enableWebhooks ?? true
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
  const handleUpdateSettings = async () => {
    setIsUpdating(true);
    
    try {
      await updateConnectionStatus(connection!.id, connection!.is_active);
      
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

  const handleDelete = async () => {
    try {
      await deleteConnection(connection!.id);
      
      toast({
        title: "Connection removed",
        description: `${connection!.connector_id} connection "${connection!.name}" has been removed`,
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

  return {
    connection,
    isUpdating,
    isLoading,
    loadConnection,
    handleUpdateSettings,
    handleDelete
  };
}; 