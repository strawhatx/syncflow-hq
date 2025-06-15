import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Connector, ConnectionConfig, isSupabaseConfig, isPostgresConfig, isMongoConfig, isMySQLConfig, isS3Config } from "@/types/connectors";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface ConnectorConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  connector: Connector;
}

export default function ConnectorConnectModal({ isOpen, onClose, connector }: ConnectorConnectModalProps) {
  const { toast } = useToast();
  const [connectionName, setConnectionName] = useState("");
  const [config, setConfig] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Validate required fields
      const missingFields = connector.config.required_fields.filter(
        field => !config[field]
      );

      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(", ")}`);
      }

      // Get the current team ID (you'll need to implement this)
      const { data: { team_id } } = await supabase
        .from('view_team_members')
        .select('team_id')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (!team_id) {
        throw new Error("No team found");
      }

      // Insert the connection
      const { data, error: insertError } = await supabase
        .from('connections')
        .insert({
          connector_id: connector.id,
          name: connectionName,
          config,
          team_id,
          is_active: true
        })
        .select()
        .single();

      if (insertError) throw insertError;

      toast({
        title: "Connection created",
        description: "Your connection has been successfully created.",
      });

      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderConfigFields = () => {
    switch (connector.provider) {
      case 'supabase':
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="url">Project URL</Label>
              <Input
                id="url"
                type="url"
                placeholder="https://your-project.supabase.co"
                value={config.url || ""}
                onChange={(e) => setConfig({ ...config, url: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="key">API Key</Label>
              <Input
                id="key"
                type="password"
                placeholder="your-api-key"
                value={config.key || ""}
                onChange={(e) => setConfig({ ...config, key: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="schema">Schema (Optional)</Label>
              <Input
                id="schema"
                placeholder="public"
                value={config.schema || ""}
                onChange={(e) => setConfig({ ...config, schema: e.target.value })}
              />
            </div>
          </>
        );

      case 'postgresql':
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="host">Host</Label>
              <Input
                id="host"
                placeholder="localhost"
                value={config.host || ""}
                onChange={(e) => setConfig({ ...config, host: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="port">Port</Label>
              <Input
                id="port"
                type="number"
                placeholder="5432"
                value={config.port || ""}
                onChange={(e) => setConfig({ ...config, port: parseInt(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="database">Database</Label>
              <Input
                id="database"
                placeholder="mydb"
                value={config.database || ""}
                onChange={(e) => setConfig({ ...config, database: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                placeholder="postgres"
                value={config.username || ""}
                onChange={(e) => setConfig({ ...config, username: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={config.password || ""}
                onChange={(e) => setConfig({ ...config, password: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="schema">Schema (Optional)</Label>
              <Input
                id="schema"
                placeholder="public"
                value={config.schema || ""}
                onChange={(e) => setConfig({ ...config, schema: e.target.value })}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="ssl"
                checked={config.ssl || false}
                onCheckedChange={(checked) => setConfig({ ...config, ssl: checked })}
              />
              <Label htmlFor="ssl">Use SSL</Label>
            </div>
          </>
        );

      case 'mongodb':
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="uri">Connection URI</Label>
              <Input
                id="uri"
                type="password"
                placeholder="mongodb://username:password@host:port"
                value={config.uri || ""}
                onChange={(e) => setConfig({ ...config, uri: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="database">Database</Label>
              <Input
                id="database"
                placeholder="mydb"
                value={config.database || ""}
                onChange={(e) => setConfig({ ...config, database: e.target.value })}
              />
            </div>
          </>
        );

      case 'mysql':
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="host">Host</Label>
              <Input
                id="host"
                placeholder="localhost"
                value={config.host || ""}
                onChange={(e) => setConfig({ ...config, host: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="port">Port</Label>
              <Input
                id="port"
                type="number"
                placeholder="3306"
                value={config.port || ""}
                onChange={(e) => setConfig({ ...config, port: parseInt(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="database">Database</Label>
              <Input
                id="database"
                placeholder="mydb"
                value={config.database || ""}
                onChange={(e) => setConfig({ ...config, database: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                placeholder="root"
                value={config.username || ""}
                onChange={(e) => setConfig({ ...config, username: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={config.password || ""}
                onChange={(e) => setConfig({ ...config, password: e.target.value })}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="ssl"
                checked={config.ssl || false}
                onCheckedChange={(checked) => setConfig({ ...config, ssl: checked })}
              />
              <Label htmlFor="ssl">Use SSL</Label>
            </div>
          </>
        );

      case 'aws':
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="bucket">Bucket Name</Label>
              <Input
                id="bucket"
                placeholder="my-bucket"
                value={config.bucket || ""}
                onChange={(e) => setConfig({ ...config, bucket: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="region">Region</Label>
              <Input
                id="region"
                placeholder="us-east-1"
                value={config.region || ""}
                onChange={(e) => setConfig({ ...config, region: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="access_key_id">Access Key ID</Label>
              <Input
                id="access_key_id"
                placeholder="AKIA..."
                value={config.access_key_id || ""}
                onChange={(e) => setConfig({ ...config, access_key_id: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="secret_access_key">Secret Access Key</Label>
              <Input
                id="secret_access_key"
                type="password"
                placeholder="••••••••"
                value={config.secret_access_key || ""}
                onChange={(e) => setConfig({ ...config, secret_access_key: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="prefix">Prefix (Optional)</Label>
              <Input
                id="prefix"
                placeholder="folder/"
                value={config.prefix || ""}
                onChange={(e) => setConfig({ ...config, prefix: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endpoint">Custom Endpoint (Optional)</Label>
              <Input
                id="endpoint"
                placeholder="https://custom-endpoint.com"
                value={config.endpoint || ""}
                onChange={(e) => setConfig({ ...config, endpoint: e.target.value })}
              />
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Connect to {connector.name}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Connection Name</Label>
            <Input
              id="name"
              placeholder="My Connection"
              value={connectionName}
              onChange={(e) => setConnectionName(e.target.value)}
              required
            />
          </div>
          
          {renderConfigFields()}

          {error && (
            <div className="text-sm text-red-500">
              {error}
            </div>
          )}

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Connecting..." : "Connect"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 