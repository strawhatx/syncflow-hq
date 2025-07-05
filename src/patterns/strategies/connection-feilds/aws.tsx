// Strategy pattern for rendering connection fields

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { z } from "zod";
import { ConnectionFieldsStrategy } from "./index";
import { sanitizeField } from "@/lib/sanitize";

export class S3FieldsStrategy implements ConnectionFieldsStrategy {
    getDefaults(): Record<string, any> {
        return {
            bucket: "",
            region: "",
            access_key_id: "",
            secret_access_key: ""
        }
    }
    getSchema(): z.ZodObject<any> {
        return z.object({
            name: z.string().min(1, "Name is required"),
            bucket: z.string().min(1, "Bucket name is required"),
            region: z.string().min(1, "Region is required"),
            access_key_id: z.string().min(1, "Access Key ID is required"),
            secret_access_key: z.string().min(1, "Secret Access Key is required"),
            prefix: z.string().optional(),
            endpoint: z.string().optional()
        })
    }
    renderFields(config: Record<string, any>, setConfig: (config: Record<string, any>) => void, errors?: Record<string, string>): React.ReactNode {
        return (
            <>
                <div className="space-y-2">
                    <Label htmlFor="bucket">Bucket Name</Label>
                    <Input
                        id="bucket"
                        placeholder="my-bucket"
                        value={config.bucket || ""}
                        onChange={(e) => setConfig({ ...config, bucket: sanitizeField(e.target.value, "text") })}
                    />
                    {errors?.bucket && (
                        <div className="text-sm text-red-500">
                            {errors.bucket}
                        </div>
                    )}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="region">Region</Label>
                    <Input
                        id="region"
                        placeholder="us-east-1"
                        value={config.region || ""}
                        onChange={(e) => setConfig({ ...config, region: sanitizeField(e.target.value, "awsRegion") })}
                    />
                    {errors?.region && (
                        <div className="text-sm text-red-500">
                            {errors.region}
                        </div>
                    )}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="access_key_id">Access Key ID</Label>
                    <Input
                        id="access_key_id"
                        placeholder="AKIA..."
                        value={config.access_key_id || ""}
                        onChange={(e) => setConfig({ ...config, access_key_id: sanitizeField(e.target.value, "awsAccessKey") })}
                    />
                    {errors?.access_key_id && (
                        <div className="text-sm text-red-500">
                            {errors.access_key_id}
                        </div>
                    )}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="secret_access_key">Secret Access Key</Label>
                    <Input
                        id="secret_access_key"
                        type="password"
                        placeholder="••••••••"
                        value={config.secret_access_key || ""}
                        onChange={(e) => setConfig({ ...config, secret_access_key: sanitizeField(e.target.value, "text") })}
                    />
                    {errors?.secret_access_key && (
                        <div className="text-sm text-red-500">
                            {errors.secret_access_key}
                        </div>
                    )}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="prefix">Prefix (Optional)</Label>
                    <Input
                        id="prefix"
                        placeholder="folder/"
                        value={config.prefix || ""}
                        onChange={(e) => setConfig({ ...config, prefix: sanitizeField(e.target.value, "filePath") })}
                    />
                    {errors?.prefix && (
                        <div className="text-sm text-red-500">
                            {errors.prefix}
                        </div>
                    )}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="endpoint">Custom Endpoint (Optional)</Label>
                    <Input
                        id="endpoint"
                        placeholder="https://custom-endpoint.com"
                        value={config.endpoint || ""}
                        onChange={(e) => setConfig({ ...config, endpoint: sanitizeField(e.target.value, "url") })}
                    />
                    {errors?.endpoint && (
                        <div className="text-sm text-red-500">
                            {errors.endpoint}
                        </div>
                    )}
                </div>
            </>
        );
    }
}
