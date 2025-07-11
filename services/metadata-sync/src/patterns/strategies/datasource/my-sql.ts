import { saveColumns, saveDatabases, saveTable } from "../../../services/connection.ts";
import { DataSourceStrategy } from "./index.ts";
import { createPool } from "mysql2/promise";

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

    async getSources(connection_id: string, config: Record<string, any>): Promise<Record<string, any>[]> {
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
        ).map((db: any) => ({ id: db.Database, name: db.Database }));

        // save the databases
        const databases = await saveDatabases(
            userDatabases.map((db: any) => ({
                connection_id,
                config: {
                    id: db.id,
                    name: db.Database
                }
            }))
        );

        // return the databases
        return databases;
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

        // Assuming `connection` is your database connection and `config.database` is your database name
        const [tables] = await connection.query(
            `
            SELECT table_name, table_id FROM information_schema.tables
            WHERE table_schema = ? AND table_type = 'BASE TABLE';
            `,
            [config.database]
        );

        for (const table of tables) {
            const tableName = table.table_name;

            // Query to get all columns for the current table
            const [columns] = await connection.query(
                `
                SELECT column_name, data_type, is_nullable, column_default
                FROM information_schema.columns
                WHERE table_schema = ? AND table_name = ?;
                `,
                [config.database, tableName]
            );

            // save the table
            const tableData = await saveTable({
                database_id: config.database_id,
                config: {
                    table_id: table.id,
                    table_name: tableName
                }
            });

            // save the columns
            await saveColumns(columns.map((col: any) => ({
                table_id: tableData.id,
                name: col.column_name,
                data_type: col.data_type,
                is_nullable: col.is_nullable
            })));
        }

        // release the connection
        connection.release();
        await pool.end();

        // return the tables
        return tables;
    }
}