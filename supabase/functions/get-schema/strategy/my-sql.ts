import { DataSourceStrategy } from "./index.ts";
import { createPool } from "npm:mysql2@3.14.1/promise";

export class MySQLStrategy implements DataSourceStrategy {
    private config(config: Record<string, any>): Record<string, any> {
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

    private async connect(config: Record<string, any>): Promise<{ valid: boolean, pool: any, connection: any }> {
        try {
            // Convert boolean SSL to proper mysql2 SSL object format
            const mysqlConfig = this.config(config);

            const pool = createPool(mysqlConfig);
            const connection = await pool.getConnection();

            return { valid: true, pool, connection };
        } catch (error) {
            console.error(error);
            throw new Error(error.message || "Failed to connect to MySQL");
        }
    }

    async getSources(config: Record<string, any>): Promise<Record<string, any>[]> {
        // first validate the connection
        const { valid, pool, connection } = await this.connect(config);
        if (!valid) {
            throw new Error("Failed to connect to MySQL");
        }

        // get all databases
        const [rows] = await connection.query(`SHOW DATABASES`);
        
        // release the connection
        connection.release();
        await pool.end();

        // filter out system databases
        const userDatabases = rows.filter(
            (db: any) =>
                !["information_schema", "mysql", "performance_schema", "sys"].includes(db.Database)
        ).map((db: any) => ({
            id: db.Database,
            name: db.Database
        }));
        
        // return the databases
        return userDatabases;
    }

    async getTables(config: Record<string, any>): Promise<Record<string, any>[]> {
        // first validate the connection
        const { valid, pool, connection } = await this.connect(config);
        if (!valid) {
            throw new Error("Failed to connect to MySQL");
        }

        // must have a database
        if (!config.database) {
            throw new Error("Database is required");
        }

        // get all tables from the selected database
        const [rows] = await connection.query(
            `
            SELECT table_name FROM information_schema.tables
            WHERE table_schema = ? AND table_type = 'BASE TABLE';
            `,
            [config.database]
        );

        // release the connection
        connection.release();
        await pool.end();

        // return the tables
        return rows;
    }
}