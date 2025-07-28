import { DataSourceStrategy } from "./index";
import { MongoClient } from "mongodb";
import { saveDatabases, saveTable, saveColumns } from "../../../services/connection";

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

  async getSources(config: Record<string, any>): Promise<Record<string, any>[]> {
    const { connection_id, team_id } = config;

    // validate the necessary fields
    if (!connection_id || !team_id) {
      throw new Error("Connection ID and team ID are required");
    }

    // validate the connection
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
        team_id,
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
    const { database_id, database_name, team_id } = config;

    // validate the necessary fields
    if (!database_id || !database_name || !team_id) {
      throw new Error("Database ID and team ID are required");
    }

    // validate the connection
    const { valid, client } = await this.connect(config);
    if (!valid) throw new Error("Failed to connect to MongoDB");

    const db = client.db(database_name);
    const collections = await db.listCollections().toArray();

    for (const collection of collections) {
      const table = await saveTable({
        database_id,
        team_id,
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
        team_id,
        name: key,
        data_type: typeof sample[key],
        is_nullable: sample[key] === null || sample[key] === undefined
      })) || []);
    }

    await client.close();
    return collections;
  }
}
