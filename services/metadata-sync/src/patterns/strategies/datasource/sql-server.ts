import { DataSourceStrategy } from ".";
import { Client } from "mssql";
import { saveColumns, saveDatabases, saveTable } from "../../../services/connection";

export class SQLServerStrategy implements DataSourceStrategy {
    private async connect(config: Record<string, any>): Promise<{ valid: boolean, client: Client }> {
        try {
            const client = new Client(config);
            await client.connect();
            return { valid: true, client };
        } catch (error) {
            return { valid: false, client: null };
        }
    }

    async getSources(connection_id: string, config: Record<string, any>): Promise<Record<string, any>[]> {
        const { valid, client } = await this.connect(config);
        if (!valid) {
            throw new Error("Failed to connect to SQL Server");
        }

        const result = await client.query("SELECT * FROM sys.databases");

        // save the databases
        const databases = await saveDatabases(
            result.recordset.map((db: any) => ({
                connection_id,
                config: {
                    id: db.id,
                    name: db.name
                }
            }))
        );

        return databases;
    }

    async getTables(config: Record<string, any>): Promise<Record<string, any>[]> {
        const { valid, client } = await this.connect(config);
        if (!valid) {
            throw new Error("Failed to connect to SQL Server");
        }

        // must have a database
        if (!config.database) {
            throw new Error("Database is required");
        }

        const result = await client.query(`SELECT * FROM ${config.database}.sys.tables`);

        // save the tables
        for (const table of result.recordset) {
            const tableData = await saveTable({
                database_id: config.database_id,
                config: {
                    table_id: table.id,
                    table_name: table.name
                }
            });

            // get the columns
            const columns = await client.query(`SELECT * FROM ${config.database}.sys.columns WHERE object_id = ${table.id}`);

            // save the columns
            await saveColumns(columns.recordset.map((col: any) => ({
                table_id: tableData.id,
                name: col.name,
                data_type: col.system_type_name,
                is_nullable: col.is_nullable
            })));
        }

        // return the tables
        return result.recordset;
    }
}