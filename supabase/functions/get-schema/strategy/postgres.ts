import { DataSourceStrategy } from "./index.ts";
import { Client } from "npm:pg@8.16.2";

export class PostgresStrategy implements DataSourceStrategy {
    private async connect(config: Record<string, any>): Promise<{ valid: boolean, client: Client }> {
        try {
            const client = new Client(config);
            await client.connect();
            return { valid: true, client };
        } catch (error) {
            console.error(error);
            throw new Error(error.message || "Failed to connect to PostgreSQL");
        }
    }

    async getSources(config: Record<string, any>): Promise<Record<string, any>[]> {
        // first validate the connection
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

        // return the databases
        return result.rows;
    }

    async getTables(config: Record<string, any>): Promise<Record<string, any>[]> {
        // must have a database
        if (!config.database) {
            throw new Error("Database is required");
        }

        // first validate the connection to the selected database
        const { valid, client } = await this.connect({
            ...config,
            database: config.database
        });
        if (!valid) {
            throw new Error("Failed to connect to PostgreSQL");
        }

        // default schema to public if not provided
        const schema = config.schema || "public";

        // get all tables from the selected schema
        const result = await client.query(
            `
            SELECT table_name FROM information_schema.tables
            WHERE table_schema = $1 AND table_type = 'BASE TABLE';
            `,
            [schema]
        );

        // release the connection
        await client.end();

        // return the tables
        return result.rows;
    }
}
