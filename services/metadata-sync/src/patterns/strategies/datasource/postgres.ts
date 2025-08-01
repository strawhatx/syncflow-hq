import { saveColumns, saveDatabases, saveTable } from "../../../services/connection";
import { DataSourceStrategy } from "./index";
import { Client } from "pg";

export class PostgresStrategy implements DataSourceStrategy {
    private async connect(config: Record<string, any>): Promise<{ valid: boolean, client: Client }> {
        try {
            const client = new Client(config);
            await client.connect();
            return { valid: true, client };
        } catch (error: any) {
            console.error(error);
            throw new Error(error.message || "Failed to connect to PostgreSQL");
        }
    }

    async getSources(config: Record<string, any>): Promise<Record<string, any>[]> {
        const { connection_id, team_id } = config;

        // validate the necessary fields
        if (!connection_id || !team_id) {
            throw new Error("Connection ID and team ID are required");
        }

        // validate the connection by getting the data
        const { valid, client } = await this.connect(config);
        if (!valid) {
            throw new Error("Failed to connect to PostgreSQL");
        }

        // get all databases, excluding templates
        const result = await client.query(`
            SELECT datname FROM pg_database
            WHERE datistemplate = false;
        `);

        // release the connection
        await client.end();

        // save the databases
        const databases = await saveDatabases(result.rows.map((db: any) => ({
            connection_id,
            team_id,
            config: {
                //id: db.datname,
                name: db.datname
            }
        })));

        // return the databases
        return databases;
    }

    async getTables(config: Record<string, any>): Promise<Record<string, any>[]> {
        const { database_id, team_id } = config;

        // validate the necessary fields
        if (!database_id || !team_id) {
            throw new Error("Database ID and team ID are required");
        }

        // first validate the connection to the selected database
        const { valid, client } = await this.connect({
            ...config,
            database: database_id
        });

        if (!valid) {
            throw new Error("Failed to connect to PostgreSQL");
        }

        // default schema to public if not provided
        const schema = config.schema || "public";

        // get all tables with the columns
        const result = await client.query(
            `
            SELECT table_name FROM information_schema.tables
            WHERE table_schema = $1 AND table_type = 'BASE TABLE';
            `,
            [schema]
        );

        // save the tables & columns
        for (const table of result.rows) {
            const tableData = await saveTable({
                database_id,
                team_id,
                config: {
                    table_name: table.table_name
                }
            });

            // get the columns
            const columns = await client.query(
                `
                SELECT column_name, data_type, is_nullable FROM information_schema.columns
                WHERE table_schema = $1 AND table_name = $2;
                `,
                [schema, table.table_name]
            );

            // save the columns
            await saveColumns(columns.rows.map((col: any) => ({
                table_id: tableData.id,
                team_id,
                name: col.column_name,
                data_type: col.data_type,
                is_nullable: col.is_nullable
            })));
        }

        // release the connection
        await client.end();

        // return the tables
        return result.rows;
    }
}
