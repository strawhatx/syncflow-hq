// Strategy pattern for rendering connection fields

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Connector } from "@/types/connectors";

interface ConnectionFieldsStrategy {
    renderFields(config?: Record<string, any>, setConfig?: (config: Record<string, any>) => void): React.ReactNode
}

class PostgresFieldsStrategy implements ConnectionFieldsStrategy {
    renderFields(config: Record<string, any>, setConfig: (config: Record<string, any>) => void): React.ReactNode {
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
    }
}

class MongoFieldsStrategy implements ConnectionFieldsStrategy {
    renderFields(config: Record<string, any>, setConfig: (config: Record<string, any>) => void): React.ReactNode {
        return (
            <>
                <div className="space-y-2">
                    <Label htmlFor="uri">Connection URL</Label>
                    <Input
                        id="url"
                        type="password"
                        placeholder="mongodb://username:password@host:port"
                        value={config.url || ""}
                        onChange={(e) => setConfig({ ...config, url: e.target.value })}
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
    }
}

class MySQLFieldsStrategy implements ConnectionFieldsStrategy {
    renderFields(config: Record<string, any>, setConfig: (config: Record<string, any>) => void): React.ReactNode {
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
                        value={config.user || ""}
                        onChange={(e) => setConfig({ ...config, user: e.target.value })}
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
    }
}

class S3FieldsStrategy implements ConnectionFieldsStrategy {
    renderFields(config: Record<string, any>, setConfig: (config: Record<string, any>) => void): React.ReactNode {
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
    }
}

class DefaultFieldsStrategy implements ConnectionFieldsStrategy {
    renderFields(): React.ReactNode {
        return (
            <></>
        );
    }
}

export class ConnectionFieldsStrategyFactory {
    static getStrategy(connector: Connector): ConnectionFieldsStrategy {
        switch (connector.provider) {
            case "postgresql":
                return new PostgresFieldsStrategy();
            case "mongodb":
                return new MongoFieldsStrategy();
            case "mysql":
                return new MySQLFieldsStrategy();
            case "aws":
                return new S3FieldsStrategy();
        
            default:
                return new DefaultFieldsStrategy();
        }
    }
}
