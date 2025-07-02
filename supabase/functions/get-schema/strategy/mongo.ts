import { DataSourceStrategy } from "./index.ts";
import { MongoClient } from "npm:mongodb@6.17.0";

export class MongoStrategy implements DataSourceStrategy {
  async connect(config: Record<string, any>): Promise<{ valid: boolean; client: MongoClient }> {
    try {
      const client = new MongoClient(config.url);
      await client.connect();
      return { valid: true, client };
    } catch (error) {
      console.error(error);
      throw new Error(error.message || "Failed to connect to MongoDB");
    }
  }

  async getSources(config: Record<string, any>): Promise<Record<string, any>[]> {
    const { valid, client } = await this.connect(config);
    if (!valid) {
      throw new Error("Failed to connect to MongoDB");
    }

    const dbs = await client.db().admin().listDatabases();

    await client.close();

    // Filter out system databases
    const userDatabases = dbs.databases.filter(
      (db: any) => !["admin", "config", "local"].includes(db.name)
    );

    return userDatabases;
  }

  async getTables(config: Record<string, any>): Promise<Record<string, any>[]> {
    const { valid, client } = await this.connect(config);
    if (!valid) {
      throw new Error("Failed to connect to MongoDB");
    }

    if (!config.database) {
      throw new Error("Database is required");
    }

    const collections = await client
      .db(config.database)
      .listCollections()
      .toArray();

    await client.close();

    return collections;
  }
}
