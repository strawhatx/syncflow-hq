// Strategy pattern for rendering connection fields

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ConnectionFieldsStrategy } from "./index";
import { z } from "zod";
import { sanitizeField } from "@/lib/sanitize";

export class MongoFieldsStrategy implements ConnectionFieldsStrategy {
    getDefaults(): Record<string, any> {
        return {
            url: "",
            database: ""
        }
    }
    getSchema(): z.ZodObject<any> {
        return z.object({
            name: z.string().min(1, "Name is required"),
            url: z.string().min(1, "Connection URL is required"),
            database: z.string().min(1, "Database is required")
        })
    }
    renderFields(config: Record<string, any>, setConfig: (config: Record<string, any>) => void, errors?: Record<string, string>): React.ReactNode {
        return (
            <>
                <div className="space-y-2">
                    <Label htmlFor="uri">Connection URL</Label>
                    <Input
                        id="url"
                        type="password"
                        placeholder="mongodb://username:password@host:port"
                        value={config.url || ""}
                        onChange={(e) => setConfig({ ...config, url: sanitizeField(e.target.value, "url") })}
                    />
                    {errors?.url && (
                        <div className="text-sm text-red-500">
                            {errors.url}
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
            </>
        );
    }
}
