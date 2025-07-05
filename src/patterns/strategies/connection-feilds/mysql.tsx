// Strategy pattern for rendering connection fields

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ConnectionFieldsStrategy } from "./index";
import * as yup from "yup";

export class MySQLFieldsStrategy implements ConnectionFieldsStrategy {
    getDefaults(): Record<string, any> {
        return {
            host: "",
            port: "",
            database: "",
            username: "",
            password: "",
            ssl: false
        }
    }
    getSchema(): yup.ObjectSchema<any> {
        return yup.object().shape({
            name: yup.string().required(),
            host: yup.string().required(),
            port: yup.number().required(),
            database: yup.string().required(),
            username: yup.string().required(),
            password: yup.string().required(),
            ssl: yup.boolean().optional()
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
                        onChange={(e) => setConfig({ ...config, host: e.target.value })}
                    />
                    {errors.host && (
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
                        placeholder="3306"
                        value={config.port || ""}
                        onChange={(e) => setConfig({ ...config, port: parseInt(e.target.value) })}
                    />
                    {errors.port && (
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
                        onChange={(e) => setConfig({ ...config, database: e.target.value })}
                    />
                    {errors.database && (
                        <div className="text-sm text-red-500">
                            {errors.database}
                        </div>
                    )}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                        id="username"
                        placeholder="root"
                        value={config.user || ""}
                        onChange={(e) => setConfig({ ...config, user: e.target.value })}
                    />
                    {errors.username && (
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
                        onChange={(e) => setConfig({ ...config, password: e.target.value })}
                    />
                    {errors.password && (
                        <div className="text-sm text-red-500">
                            {errors.password}
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
                    {errors.ssl && (
                        <div className="text-sm text-red-500">
                            {errors.ssl}
                        </div>
                    )}
                </div>
            </>
        );
    }
}

