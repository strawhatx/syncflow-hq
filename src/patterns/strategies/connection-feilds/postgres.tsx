// Strategy pattern for rendering connection fields

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ConnectionFieldsStrategy } from "./index";
import { z } from "zod";
import { sanitizeField } from "@/lib/sanitize";

export class PostgresFieldsStrategy implements ConnectionFieldsStrategy {
    getDefaults(): Record<string, any> {
        return {
            host: "",
            port: "",
            database: "",
            username: "",
            password: "",
            schema: "",
            ssl: false
        }
    }
    getSchema(): z.ZodObject<any> {
        return z.object({
            name: z.string().min(1, "Name is required"),
            host: z.string().min(1, "Host is required"),
            port: z.number().min(1, "Port must be greater than 0"),
            database: z.string().min(1, "Database is required"),
            username: z.string().min(1, "Username is required"),
            password: z.string().min(1, "Password is required"),
            schema: z.string().optional(),
            ssl: z.boolean().optional(),
        })
    }
    renderFields(config: Record<string, any>, setConfig: (config: Record<string, any>) => void, errors?: Record<string, string>): React.ReactNode {
        return (
            <>
                <div className="space-y-2">
                    <Label htmlFor="host">Host</Label>
                    <Input
                        id="host"
                        placeholder="localhost"
                        value={config.host || ""}
                        onChange={(e) => setConfig({ ...config, host: sanitizeField(e.target.value, "hostname") })}
                    />
                    {errors?.host && (
                        <div className="text-sm text-red-500">
                            {errors.host}
                        </div>
                    )}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="port">Port</Label>
                    <Input
                        id="port"
                        type="number"
                        placeholder="5432"
                        value={config.port || ""}
                        onChange={(e) => setConfig({ ...config, port: parseInt(sanitizeField(e.target.value, "port")) || "" })}
                    />
                    {errors?.port && (
                        <div className="text-sm text-red-500">
                            {errors.port}
                        </div>
                    )}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="database">Database</Label>
                    <Input
                        id="database"
                        placeholder="mydb"
                        value={config.database || ""}
                        onChange={(e) => setConfig({ ...config, database: sanitizeField(e.target.value, "databaseName") })}
                    />
                    {errors?.database && (
                        <div className="text-sm text-red-500">
                            {errors.database}
                        </div>
                    )}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                        id="username"
                        placeholder="postgres"
                        value={config.username || ""}
                        onChange={(e) => setConfig({ ...config, username: sanitizeField(e.target.value, "text") })}
                    />
                    {errors?.username && (
                        <div className="text-sm text-red-500">
                            {errors.username}
                        </div>
                    )}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={config.password || ""}
                        onChange={(e) => setConfig({ ...config, password: sanitizeField(e.target.value, "text") })}
                    />
                    {errors?.password && (
                        <div className="text-sm text-red-500">
                            {errors.password}
                        </div>
                    )}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="schema">Schema (Optional)</Label>
                    <Input
                        id="schema"
                        placeholder="public"
                        value={config.schema || ""}
                        onChange={(e) => setConfig({ ...config, schema: sanitizeField(e.target.value, "databaseName") })}
                    />
                    {errors?.schema && (
                        <div className="text-sm text-red-500">
                            {errors.schema}
                        </div>
                    )}
                </div>
                <div className="flex items-center space-y-2 space-x-2">
                    <Switch
                        id="ssl"
                        checked={config.ssl || false}
                        onCheckedChange={(checked) => setConfig({ ...config, ssl: checked })}
                    />
                    <Label htmlFor="ssl">Use SSL</Label>
                    {errors?.ssl && (
                        <div className="text-sm text-red-500">
                            {errors.ssl}
                        </div>
                    )}
                </div>
            </>
        );
    }
}
