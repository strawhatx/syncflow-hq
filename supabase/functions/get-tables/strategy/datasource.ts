import { Client } from "npm:pg@8.16.2";
import { MongoClient } from "npm:mongodb@6.17.0";
import { createPool } from "npm:mysql2@3.14.1/promise";
import { S3Client, ListBucketsCommand } from "npm:@aws-sdk/client-s3@3.832.0";


interface Result {
    tables: string[];
    views: string[];
}

interface DataSourceStrategy {
    getTables(config: Record<string, any>): Promise<Result[]>;
}

export class SupabaseStrategy implements DataSourceStrategy {
    async connect(config: Record<string, any>): Promise<{ valid: boolean, result: any }> {
        // airtable is not a a standard datasource so we need to call
        // the airtable api to get the tables
        try {
            const { project_ref, access_token } = config;

            if (!project_ref || !access_token) {
                return { valid: false, result: null };
            }

            // get all tables via api 
            const response = await fetch(`https://api.supabase.com/v1/projects/${project_ref}/tables`, {
                headers: {
                    Authorization: `Bearer ${access_token}`
                }
            });

            if (!response.ok) {
                return { valid: false, result: null };
            }

            const result = await response.json();
            return { valid: true, result };
        } catch (error) {
            return { valid: false, result: null };
        }
    }

    async getTables(config: Record<string, any>): Promise<Result[]> {
        // first validate the connection
        const { valid, result } = await this.connect(config);
        if (!valid) {
            throw new Error("Failed to connect to Airtable");
        }

        return result.tables.map((table: any) => table.name);
    }
}

export class AirtableStrategy implements DataSourceStrategy {
    async connect(config: Record<string, any>): Promise<{ valid: boolean, result: any }> {
        // airtable is not a a standard datasource so we need to call
        // the airtable api to get the tables
        try {
            const { baseId, access_token } = config;

            if (!baseId || !access_token) {
                return { valid: false, result: null };
            }

            // get all tables via api 
            const response = await fetch(`https://api.airtable.com/v0/meta/bases/${baseId}/tables`, {
                headers: {
                    Authorization: `Bearer ${access_token}`
                }
            });

            if (!response.ok) {
                return { valid: false, result: null };
            }

            const result = await response.json();
            return { valid: true, result };
        } catch (error) {
            return { valid: false, result: null };
        }
    }

    async getTables(config: Record<string, any>): Promise<Result[]> {
        // first validate the connection
        const { valid, result } = await this.connect(config);
        if (!valid) {
            throw new Error("Failed to connect to Airtable");
        }

        return result.tables.map((table: any) => table.name);
    }
}

export class MongoStrategy implements DataSourceStrategy {
    async connect(config: Record<string, any>): Promise<{ valid: boolean, client: MongoClient }> {
        try {
            const client = new MongoClient(config.url);
            await client.connect();
            return { valid: true, client };
        } catch (error) {
            return { valid: false, client: null };
        }
    }

    async getTables(config: Record<string, any>): Promise<Result[]> {
        // first validate the connection
        const { valid, client } = await this.connect(config);
        if (!valid) {
            throw new Error("Failed to connect to MongoDB");
        }

        // get all tables
        const tables = await client.db().collection("system.namespaces").find({}).toArray();

        // release the connection
        await client.close();

        // return the tables
        return tables.map((table: any) => table.name);
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

    async connect(config: Record<string, any>): Promise<{ valid: boolean, pool: any, connection: any }> {
        try {
            // Convert boolean SSL to proper mysql2 SSL object format
            const mysqlConfig = this.config(config);

            const pool = createPool(mysqlConfig);
            const connection = await pool.getConnection();


            return { valid: true, pool, connection };
        } catch (error) {
            return { valid: false, pool: null, connection: null };
        }
    }
    async getTables(config: Record<string, any>): Promise<Result[]> {
        // first validate the connection
        const { valid, pool, connection } = await this.connect(config);
        if (!valid) {
            throw new Error("Failed to connect to MySQL");
        }

        // get all tables
        const tables = await connection.query(`
            SELECT table_name FROM information_schema.tables
            WHERE table_schema='public' AND table_type='BASE TABLE';
        `);

        // release the connection
        connection.release();
        await pool.end();

        // return the tables
        return tables.rows.map((row: any) => row.table_name);
    }
}

export class PostgresStrategy implements DataSourceStrategy {
    async connect(config: Record<string, any>): Promise<{ valid: boolean, client: Client }> {
        try {
            const client = new Client(config);
            await client.connect();
            return { valid: true, client };

        } catch (error) {
            return { valid: false, client: null };
        }
    }

    async getTables(config: Record<string, any>): Promise<Result[]> {
        // first validate the connection
        const { client, valid } = await this.connect(config);
        if (!valid) {
            throw new Error("Failed to connect to PostgreSQL");
        }

        // get all tables
        const tables = await client.query(`
            SELECT table_name FROM information_schema.tables
            WHERE table_schema='public' AND table_type='BASE TABLE';
        `);

        // release the connection
        await client.end();

        return tables.rows.map((row: any) => row.table_name);
    }
}

export class S3Strategy implements DataSourceStrategy {
    async connect(config: Record<string, any>): Promise<{ valid: boolean, client: S3Client }> {
        try {
            const client = new S3Client(config);
            return { valid: true, client };
        } catch (error) {
            return { valid: false, client: null };
        }
    }
    async getTables(config: Record<string, any>): Promise<Result[]> {
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
        return tables.Buckets.map((bucket: any) => bucket.Name);
    }
}


export class DataSourceStrategyFactory {
    static getStrategy(type: "postgres"): DataSourceStrategy {
        return new PostgresStrategy();
    }
}