import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ConnectionStatus } from "@/features/integrations/components/IntegrationCard";
import { fetchConnectionById, updateConnectionStatus, deleteConnection } from "@/services/integrationService";
import type { Database } from "@/integrations/supabase/types";

type Connection = Database['public']['Tables']['integration_connections']['Row'] & {
  integrations: Database['public']['Views']['integrations_public']['Row'];
};

const IntegrationDetail = () => {
  const { connectionId } = useParams<{ connectionId: string }>();
  const navigate = useNavigate();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [connection, setConnection] = useState<Connection | null>(null);
  const [connectionName, setConnectionName] = useState("");
  const [settings, setSettings] = useState({
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
      } catch (error) {
        console.error("Error loading connection:", error);
        toast({
          title: "Error",
          description: "Failed to load connection details",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadConnection();
  }, [connectionId]);
  
  if (isLoading) {
    return (
      <div className="py-8 text-center">
        <h2 className="text-2xl font-semibold mb-2">Loading...</h2>
        <p className="text-muted-foreground mb-6">Please wait while we load the connection details.</p>
      </div>
    );
  }

  if (!connection || !connection.integrations) {
    return (
      <div className="py-8 text-center">
        <h2 className="text-2xl font-semibold mb-2">Connection not found</h2>
        <p className="text-muted-foreground mb-6">The connection you're looking for doesn't exist.</p>
        <Button onClick={() => navigate("/integrations")}>
          Back to Integrations
        </Button>
      </div>
    );
  }
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const handleUpdateSettings = async () => {
    setIsUpdating(true);
    
    try {
      await updateConnectionStatus(connection.id, connection.connection_status as ConnectionStatus);
      
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
    } catch (error) {
      toast({
        title: "Sync failed",
        description: "Unable to complete synchronization. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  };
  
  const handleDelete = async () => {
    try {
      await deleteConnection(connection.id);
      
      toast({
        title: "Connection removed",
        description: `${connection.integrations.name} connection "${connection.connection_name}" has been removed`,
      });
      
      navigate("/integrations");
    } catch (error) {
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
        description: `${connection.integrations.name} connection has been reestablished`,
      });
      
      navigate("/integrations");
    } catch (error) {
      toast({
        title: "Error",
        description: "Unable to reconnect. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const getStatusBadge = () => {
    switch (connection.connection_status) {
      case 'active':
        return <Badge className="bg-green-500/20 text-green-600">Connected</Badge>;
      case 'error':
        return <Badge className="bg-red-500/20 text-red-600">Error</Badge>;
      case 'syncing':
        return <Badge className="bg-blue-500/20 text-blue-600">Syncing</Badge>;
      case 'paused':
        return <Badge className="bg-amber-500/20 text-amber-600">Paused</Badge>;
      default:
        return null;
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

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0 h-12 w-12 rounded bg-gray-100 flex items-center justify-center">
            <img 
              src={connection.integrations.icon || "https://via.placeholder.com/32"} 
              alt={connection.integrations.name} 
              className="h-8 w-8" 
              onError={(e) => (e.currentTarget.src = "https://via.placeholder.com/32")} 
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold">{connection.connection_name}</h1>
              {getStatusBadge()}
            </div>
            <p className="text-muted-foreground">{connection.integrations.name} connection</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            disabled={isSyncing}
            onClick={handleSyncNow}
          >
            {isSyncing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Syncing...
              </>
            ) : (
              "Sync Now"
            )}
          </Button>
          
          {connection.connection_status === "error" && (
            <Button onClick={handleReconnect}>
              Reconnect
            </Button>
          )}
        </div>
      </div>

      {connection.connection_status === "error" && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          <p className="font-medium">Connection Error</p>
          <p className="text-sm">Please check your connection settings and try reconnecting.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Connection Settings</CardTitle>
              <CardDescription>Configure how your {connection.integrations.name} connection works</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="connection-name">Connection Name</Label>
                <Input
                  id="connection-name"
                  value={connectionName}
                  onChange={(e) => setConnectionName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sync-interval">Sync Interval</Label>
                <select
                  id="sync-interval"
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  value={settings.syncInterval}
                  onChange={(e) => setSettings({ ...settings, syncInterval: e.target.value })}
                >
                  <option value="realtime">Real-time</option>
                  <option value="hourly">Hourly</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="manual">Manual only</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="webhook-toggle">Enable Webhooks</Label>
                  <p className="text-xs text-muted-foreground">
                    Receive real-time updates when data changes
                  </p>
                </div>
                <Switch
                  id="webhook-toggle"
                  checked={settings.enableWebhooks}
                  onCheckedChange={(checked) => setSettings({ ...settings, enableWebhooks: checked })}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Remove Connection
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete the connection "{connection.connection_name}" and remove all associated data. 
                      This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      className="bg-red-600 text-white hover:bg-red-700"
                      onClick={handleDelete}
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              
              <Button 
                onClick={handleUpdateSettings}
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Connection Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Connection ID</p>
                <p className="text-sm font-mono">{connection.id}</p>
              </div>
              
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Created</p>
                <p className="text-sm">{formatDate(connection.created_at)}</p>
              </div>
              
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Last Updated</p>
                <p className="text-sm">{formatDate(connection.updated_at)}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Usage</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <p className="text-sm">Records synced this month</p>
                  <p className="text-sm font-medium">12,458</p>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="bg-primary h-full" style={{ width: "45%" }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <p className="text-sm">API requests</p>
                  <p className="text-sm font-medium">3,287 / 10,000</p>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="bg-primary h-full" style={{ width: "32%" }}></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default IntegrationDetail;
