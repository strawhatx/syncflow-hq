import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ConnectionFieldsStrategy } from "./index";
import { z } from "zod";

export class SQLServerFieldsStrategy implements ConnectionFieldsStrategy {
    getDefaults(): Record<string, any> {
        return {
            host: "",
            port: 1433,
            database: "",
            username: "",
            password: ""
        }
    }
    getSchema(): z.ZodObject<any> {
        return z.object({
            host: z.string().min(1, "Host is required"),
            port: z.number().min(1, "Port is required"),
            database: z.string().min(1, "Database is required"),
            username: z.string().min(1, "Username is required"),
            password: z.string().min(1, "Password is required")
        })
    }
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
                        placeholder="1433"
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
                        placeholder="sa"
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
            </>
        );
    }
}
