import { DataSourceStrategy } from ".";
import { ConnectionPool, config as MSSQLConfig } from "mssql";
import { saveColumns, saveDatabases, saveTable } from "../../../services/connection";

export class SQLServerStrategy implements DataSourceStrategy {
    private config(config: Record<string, any>): MSSQLConfig {
        // Transform generic config to mssql-specific format
        return {
            server: config.host,
            port: config.port,
            database: config.database,
            user: config.username,
            password: config.password,
            options: {
                encrypt: config.encrypt !== false, // Default to true for Azure
                trustServerCertificate: true
            }
        };
    }

    private async connect(config: Record<string, any>): Promise<{ valid: boolean, client: ConnectionPool | null }> {
        try {
            const mssqlConfig = this.config(config);
            const pool = new ConnectionPool(mssqlConfig);
            await pool.connect();
            return { valid: true, client: pool };
        } catch (error) {
            return { valid: false, client: null };
        }
    }

    async getSources(config: Record<string, any>): Promise<Record<string, any>[]> {
        const { connection_id, team_id } = config;

        // validate the necessary fields
        if (!connection_id || !team_id) {
            throw new Error("Connection ID and team ID are required");
        }

        // validate the connection
        const { valid, client } = await this.connect(config);
        if (!valid || !client) {
            throw new Error("Failed to connect to SQL Server");
        }

        const result = await client.query("SELECT * FROM sys.databases");

        // save the databases
        const databases = await saveDatabases(
            result.recordset.map((db: any) => ({
                connection_id,
                team_id,
                config: {
                    id: db.id,
                    name: db.name
                }
            }))
        );

        return databases;
    }

    async getTables(config: Record<string, any>): Promise<Record<string, any>[]> {
        const { database_id, database_name, team_id } = config;

        // validate the necessary fields
        if (!database_id || !database_name || !team_id) {
            throw new Error("Database ID and team ID are required");
        }

        // validate the connection
        const { valid, client } = await this.connect(config);
        if (!valid || !client) {
            throw new Error("Failed to connect to SQL Server");
        }

        const result = await client.query(`SELECT * FROM ${config.database}.sys.tables`);

        // save the tables
        for (const table of result.recordset) {
            const tableData = await saveTable({
                database_id,
                team_id,
                config: {
                    table_id: table.id,
                    table_name: table.name
                }
            });

            // get the columns
            const columns = await client.query(`SELECT * FROM ${database_name}.sys.columns WHERE object_id = ${table.id}`);

            // save the columns
            await saveColumns(columns.recordset.map((col: any) => ({
                table_id: tableData.id,
                team_id,
                name: col.name,
                data_type: col.system_type_name,
                is_nullable: col.is_nullable
            })));
        }

        // return the tables
        return result.recordset;
    }
}