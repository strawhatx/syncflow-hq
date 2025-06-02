import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useConnection } from "./hooks/useConnection";
import { ConnectionSettingsCard } from "./components/ConnectionSettingsCard";
import { ConnectionInfoCard } from "./components/ConnectionInfoCard";
import { UsageCard } from "./components/UsageCard";

const IntegrationDetail = () => {
  const { connectionId } = useParams<{ connectionId: string }>();
  const navigate = useNavigate();
  const {
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
  } = useConnection(connectionId);

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
          <ConnectionSettingsCard
            connectionName={connectionName}
            setConnectionName={setConnectionName}
            settings={settings}
            setSettings={setSettings}
            isUpdating={isUpdating}
            onUpdateSettings={handleUpdateSettings}
            onDelete={handleDelete}
            integrationName={connection.integrations.name}
          />
        </div>

        <div className="space-y-6">
          <ConnectionInfoCard
            connectionId={connection.id}
            createdAt={connection.created_at}
            updatedAt={connection.updated_at}
          />
          
          <UsageCard
            recordsSynced={12458}
            recordsSyncedLimit={50000}
            apiRequests={3287}
            apiRequestsLimit={10000}
          />
        </div>
      </div>
    </div>
  );
};

export default IntegrationDetail;
