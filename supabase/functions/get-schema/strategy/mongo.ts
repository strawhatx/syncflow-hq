import { DataSourceStrategy } from ".";
import { MongoClient } from "npm:mongodb@6.17.0";

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

    async getSources(config: Record<string, any>): Promise<Record<string, any>[]> {
        // first validate the connection
        const { valid, client } = await this.connect(config);
        if (!valid) {
            throw new Error("Failed to connect to MongoDB");
        }

        // get all databases    
        const databases = await client.db().admin().listDatabases();

        // release the connection
        await client.close();

        // return the databases
        return databases.databases;
    }

    async getTables(config: Record<string, any>): Promise<Record<string, any>[]> {
        // first validate the connection
        const { valid, client } = await this.connect(config);
        if (!valid) {
            throw new Error("Failed to connect to MongoDB");
        }

        // must have a database
        if (!config.database) {
            throw new Error("Database is required");
        }

        // get all tables from the database
        const tables = await client.db(config.database).collection("system.namespaces").find({}).toArray();

        // release the connection
        await client.close();

        // return the tables
        return tables;
    }
}