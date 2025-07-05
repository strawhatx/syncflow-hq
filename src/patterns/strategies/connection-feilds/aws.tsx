// Strategy pattern for rendering connection fields

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import * as yup from "yup";
import { ConnectionFieldsStrategy } from "./index";

export class S3FieldsStrategy implements ConnectionFieldsStrategy {
    getDefaults(): Record<string, any> {
        return {
            bucket: "",
            region: "",
            access_key_id: "",
            secret_access_key: ""
        }
    }
    getSchema(): yup.ObjectSchema<any> {
        return yup.object().shape({
            name: yup.string().required(),
            bucket: yup.string().required(),
            region: yup.string().required(),
            access_key_id: yup.string().required(),
            secret_access_key: yup.string().required(),
            prefix: yup.string().optional(),
            endpoint: yup.string().optional()
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
                        onChange={(e) => setConfig({ ...config, bucket: e.target.value })}
                    />
                    {errors.bucket && (
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
                        onChange={(e) => setConfig({ ...config, region: e.target.value })}
                    />
                    {errors.region && (
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
                        onChange={(e) => setConfig({ ...config, access_key_id: e.target.value })}
                    />
                    {errors.access_key_id && (
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
                        onChange={(e) => setConfig({ ...config, secret_access_key: e.target.value })}
                    />
                    {errors.secret_access_key && (
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
                        onChange={(e) => setConfig({ ...config, prefix: e.target.value })}
                    />
                    {errors.prefix && (
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
                        onChange={(e) => setConfig({ ...config, endpoint: e.target.value })}
                    />
                    {errors.endpoint && (
                        <div className="text-sm text-red-500">
                            {errors.endpoint}
                        </div>
                    )}
                </div>
            </>
        );
    }
}
