import { DataSourceStrategy } from "./index.ts";
import { S3Client, ListBucketsCommand } from "npm:@aws-sdk/client-s3@3.832.0";

export class S3Strategy implements DataSourceStrategy {

    private async connect(config: Record<string, any>): Promise<{ valid: boolean, client: S3Client }> {
        try {
            const client = new S3Client({
                region: config.region,
                credentials: {
                    accessKeyId: config.accessKeyId,
                    secretAccessKey: config.secretAccessKey
                }
            });
            return { valid: true, client };
        } catch (error) {
            console.error(error);
            throw new Error(error.message || "Failed to connect to S3");
        }
    }

    getSources(config: Record<string, any>): Promise<Record<string, any>[]> {
        throw new Error("Method not implemented.");
    }

    async getTables(config: Record<string, any>): Promise<Record<string, any>[]> {
        // first validate the connection
        const { valid, client } = await this.connect(config);
        if (!valid) {
            throw new Error("Failed to connect to S3");
        }

        // get all tables
        const tables = await client.send(new ListBucketsCommand({}));

        // release the connection
        await client.destroy();

        // return the tables
        return tables.Buckets;
    }
}