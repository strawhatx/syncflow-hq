import { Client } from "npm:pg@8.16.2";
import { MongoClient } from "npm:mongodb@6.17.0";
import { createPool } from "npm:mysql2@3.14.1/promise";
import { S3Client, ListBucketsCommand } from "npm:@aws-sdk/client-s3@3.832.0";

interface ValidationResponse {
    valid: boolean;
    error?: string;
}

interface DataSourceStrategy {
    connect(config: Record<string, any>): Promise<ValidationResponse>;
}

export class MongoStrategy implements DataSourceStrategy {
    async connect(config: Record<string, any>): Promise<ValidationResponse> {
        try {
            const client = new MongoClient(config.url);
            await client.connect();
            await client.close();
            return { valid: true };
        } catch (error) {
            return {
                valid: false,
                error: error instanceof Error ? error.message : 'Unknown MongoDB error'
            };
        }
    }
}

export class MySQLStrategy implements DataSourceStrategy {
    config(config: Record<string, any>): Record<string, any> {
        // Convert boolean SSL to proper mysql2 SSL object format
        const mysqlConfig = { ...config };
        if (typeof mysqlConfig.ssl === 'boolean') {
            if (mysqlConfig.ssl) {
                mysqlConfig.ssl = { rejectUnauthorized: false };
            } else {
                delete mysqlConfig.ssl;
            }
        }

        return mysqlConfig;
    }

    async connect(config: Record<string, any>): Promise<ValidationResponse> {
        try {
            // Convert boolean SSL to proper mysql2 SSL object format
            const mysqlConfig = this.config(config);

            const pool = createPool(mysqlConfig);
            const connection = await pool.getConnection();
            connection.release();
            await pool.end();

            return { valid: true };
        } catch (error) {
            return {
                valid: false,
                error: error instanceof Error ? error.message : 'Unknown MySQL error'
            };
        }
    }
}

export class PostgresStrategy implements DataSourceStrategy {
    async connect(config: Record<string, any>): Promise<ValidationResponse> {
        try {
            const client = new Client(config);
            await client.connect();
            await client.end();
            return { valid: true };
        } catch (error) {
            return {
                valid: false,
                error: error instanceof Error ? error.message : 'Unknown PostgreSQL error'
            };
        }
    }
}

export class S3Strategy implements DataSourceStrategy {
    async connect(config: Record<string, any>): Promise<ValidationResponse> {
        try {
            const client = new S3Client(config);
            await client.send(new ListBucketsCommand({}));
            return { valid: true };
        } catch (error) {
            return {
                valid: false,
                error: error instanceof Error ? error.message : 'Unknown S3 error'
            };
        }
    }
}

export class DataSourceStrategyFactory {
    static getStrategy(provider: "postgresql" | "mongodb" | "mysql" | "aws"): DataSourceStrategy {
        // TODO: add more providers
        switch (provider) {
            case 'postgresql':
                return new PostgresStrategy();
            case 'mongodb':
                return new MongoStrategy();
            case 'mysql':
                return new MySQLStrategy();
            case 'aws':
                return new S3Strategy();
            default:
                throw new Error(`Unsupported provider: ${provider}`);
        }
    }
}