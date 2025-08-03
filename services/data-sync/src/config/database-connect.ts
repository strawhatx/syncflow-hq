import { MongoClient } from "mongodb";
import { Client as PostgresClient } from "pg";
import {
    ConnectionPool as MSSQLConnectionPool,
    config as MSSQLConfig
} from "mssql";
import { createPool as createMySQLPool } from "mysql2/promise";

// ✅ mysql2 config 
interface MysqlConfig {
    host: string;
    port: number;
    user: string;
    password: string;
    database: string;
    ssl?: boolean | { rejectUnauthorized: boolean };
}

interface DatabaseConnect {
    connect(config: Record<string, any>): Promise<{ valid: boolean; client: any }>;
}

interface DatabaseConnectWithPool {
    connect(config: Record<string, any>): Promise<{ valid: boolean, pool: any, connection: any }>;
}

export class MongoConnect implements DatabaseConnect {
    async connect(config: Record<string, any>): Promise<{ valid: boolean; client: MongoClient }> {
        try {
            const client = new MongoClient(config.url);
            await client.connect();
            return { valid: true, client };
        } catch (error: any) {
            console.error(error);
            throw new Error(error.message || "Failed to connect to MongoDB");
        }
    }
}

export class PostgresConnect implements DatabaseConnect {
    async connect(config: Record<string, any>): Promise<{ valid: boolean, client: PostgresClient }> {
        try {
            const client = new PostgresClient(config);
            await client.connect();
            return { valid: true, client };
        } catch (error: any) {
            console.error(error);
            throw new Error(error.message || "Failed to connect to PostgreSQL");
        }
    }
}

export class SqlServerConnect implements DatabaseConnect {
    private config(config: Record<string, any>): MSSQLConfig {
        const { host, port, database, username, password, encrypt } = config;

        if (!host || !port || !database || !username || !password) {
            throw new Error("Missing required fields for SQL Server connection");
        }

        // Transform generic config to mssql-specific format
        return {
            server: host,
            port: port,
            database: database,
            user: username,
            password: password,
            options: {
                encrypt: encrypt !== false, // Default to true for Azure
                trustServerCertificate: true
            }
        };
    }

    async connect(config: Record<string, any>): Promise<{ valid: boolean, client: ConnectionPool | null }> {
        try {
            const mssqlConfig = this.config(config);
            const pool = new MSSQLConnectionPool(mssqlConfig);
            await pool.connect();
            return { valid: true, client: pool };
        } catch (error) {
            return { valid: false, client: null };
        }
    }
}

export class MySQLConnect implements DatabaseConnectWithPool {
    private config(config: Record<string, any>): Record<string, any> {
        // Convert boolean SSL to proper mysql2 SSL object format
        const mysqlConfig = { ...config as MysqlConfig };
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

            const pool = createMySQLPool(mysqlConfig);
            const connection = await pool.getConnection();

            return { valid: true, pool, connection };
        } catch (error: any) {
            console.error(error);
            throw new Error(error.message || "Failed to connect to MySQL");
        }
    }
}