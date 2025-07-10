import { DataSourceStrategy } from "./index.ts";
import { MongoClient } from "mongodb";
import { saveDatabases, saveTable, saveColumns } from "../../../services/connection.ts";

export class MongoStrategy implements DataSourceStrategy {
  async connect(config: Record<string, any>): Promise<{ valid: boolean; client: MongoClient }> {
    try {
      const client = new MongoClient(config.url);
      await client.connect();
      return { valid: true, client };
    } catch (error: any) {
      console.error(error);
      throw new Error(error.message || "Failed to connect to MongoDB");
    }
  }

  async getSources(connection_id: string, config: Record<string, any>): Promise<Record<string, any>[]> {
    const { valid, client } = await this.connect(config);
    if (!valid) throw new Error("Failed to connect to MongoDB");

    const dbs = await client.db().admin().listDatabases();
    await client.close();

    // Filter out system databases
    const userDatabases = dbs.databases.filter(
      (db: any) => !["admin", "config", "local"].includes(db.name)
    );

    // Save to DB
    const databases = await saveDatabases(
      userDatabases.map((db: any) => ({
        connection_id,
        config: {
          name: db.name,
          sizeOnDisk: db.sizeOnDisk,
          empty: db.empty
        }
      }))
    );

    return databases;
  }

  async getTables(config: Record<string, any>): Promise<Record<string, any>[]> {
    if (!config.database) throw new Error("Database name is required");

    const { valid, client } = await this.connect(config);
    if (!valid) throw new Error("Failed to connect to MongoDB");

    const db = client.db(config.database);
    const collections = await db.listCollections().toArray();

    for (const collection of collections) {
      const table = await saveTable({
        database_id: config.database_id,
        config: {
          table_name: collection.name,
        }
      });

      // Sample 1 doc to infer column names/types
      const sample = await db.collection(collection.name).findOne();

      if (!sample) continue;

      // save the columns
      await saveColumns(Object.keys(sample).map((key) => ({
        table_id: table.id,
        name: key,
        data_type: typeof sample[key],
        is_nullable: sample[key] === null || sample[key] === undefined
      })) || []);
    }

    await client.close();
    return collections;
  }
}
