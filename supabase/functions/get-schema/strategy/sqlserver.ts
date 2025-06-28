import { DataSourceStrategy } from ".";
import { Client } from "npm:mssql@10.2.0";

export class SQLServerStrategy implements DataSourceStrategy {
    async getSources(config: Record<string, any>): Promise<string[]> {
        const { valid, client } = await this.connect(config);
        if (!valid) {
            throw new Error("Failed to connect to SQL Server");
        }

        const result = await client.query("SELECT * FROM sys.databases");
        return result.recordset.map((database: any) => database.name);
    }

    async getTables(config: Record<string, any>): Promise<string[]> {
        const { valid, client } = await this.connect(config);
        if (!valid) {
            throw new Error("Failed to connect to SQL Server");
        }

        // must have a database
        if (!config.database) {
            throw new Error("Database is required");
        }

        const result = await client.query(`SELECT * FROM ${config.database}.sys.tables`);
        return result.recordset.map((table: any) => table.name);
    }

    private async connect(config: Record<string, any>): Promise<{ valid: boolean, client: Client }> {
        try {
            const client = new Client(config);
            await client.connect();
            return { valid: true, client };
        } catch (error) {
            return { valid: false, client: null };
        }
    }
}