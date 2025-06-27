import { DataSourceStrategy } from ".";
import { Client } from "npm:pg@8.16.2";

export class PostgresStrategy implements DataSourceStrategy {
    private async connect(config: Record<string, any>): Promise<{ valid: boolean, client: Client }> {
        try {
            const client = new Client(config);
            await client.connect();
            return { valid: true, client };

        } catch (error) {
            return { valid: false, client: null };
        }
    }

    async getSources(config: Record<string, any>): Promise<string[]> {
        // first validate the connection
        const { client, valid } = await this.connect(config);
        if (!valid) {
            throw new Error("Failed to connect to PostgreSQL");
        }

        // get all databases
        const databases = await client.query(`
            SELECT datname FROM pg_database;
        `);

        // release the connection
        await client.end();

        return databases.rows.map((row: any) => row.datname);
    }

    async getTables(config: Record<string, any>): Promise<string[]> {
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