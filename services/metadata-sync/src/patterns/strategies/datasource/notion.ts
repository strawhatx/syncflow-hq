import { supabase } from "../../../config/supabase.ts";
import { saveColumns, saveDatabases, saveTable } from "../../../services/connection.ts";
import { DataSourceStrategy } from "./index.ts";

export class NotionStrategy implements DataSourceStrategy {
    private config = {
        tables: {
            // Retrieve database schema
            url: `https://api.notion.com/v1/databases/{database_ref}`,
            method: "GET"
        },
        sources: {
            // Search all objects
            url: "https://api.notion.com/v1/search",
            method: "POST"
        }
    }

    private getUrl(type: keyof typeof this.config, urlConfig: Record<string, any>): string {
        const { url } = this.config[type];
        return url.replace(/{(\w+)}/g, (_, key) => {
            return urlConfig[key] !== undefined ? urlConfig[key] : "";
        });
    }

    private async connect(
        type: keyof typeof this.config,
        config: Record<string, any>,
        body?: any
    ): Promise<{ valid: boolean, result: any }> {
        try {
            const { access_token } = config;
            if (!access_token) {
                return { valid: false, result: null };
            }

            const { method } = this.config[type];

            const response = await fetch(this.getUrl(type, config), {
                method,
                headers: {
                    "Authorization": `Bearer ${access_token}`,
                    "Notion-Version": "2022-06-28",
                    "Content-Type": "application/json"
                },
                body: method === "POST" ? JSON.stringify(body) : undefined
            });

            if (!response.ok) {
                throw new Error(response.statusText || "Failed to connect to Notion");
            }

            const result = await response.json();
            return { valid: true, result };
        } catch (error) {
            console.error(error);
            throw new Error(error.message || "Failed to connect to Notion");
        }
    }

    async getSources(config: Record<string, any>): Promise<Record<string, any>[]> {
        const { connection_id, team_id } = config;

        // validate the necessary fields
        if (!connection_id || !team_id) {
            throw new Error("Connection ID and team ID are required");
        }

        // validate the connection by getting the data
        const { valid, result } = await this.connect("sources", config, {
            filter: {
                value: "database",
                property: "object"
            }
        });

        if (!valid) {
            throw new Error("Failed to connect to Notion");
        }

        // save the databases to the db
        const databases = await saveDatabases(result.results.map((database: any) => ({
            connection_id,
            team_id,
            config: {
                database_id: database.id,
                database_name: database.title[0].plain_text
            }
        })));

        return databases;
    }

    async getTables(config: Record<string, any>): Promise<Record<string, any>[]> {
        const { database_id, database_ref, team_id } = config;

        // validate the necessary fields
        if (!database_id || !database_ref || !team_id) {
            throw new Error("Database ID|Database Ref|Team ID are required");
        }

        // validate the connection
        const { valid, result } = await this.connect("tables", config);
        if (!valid) {
            throw new Error("Failed to query Notion database");
        }

        // save the tables to the db
        for (const table of result.results) {
            const tableData = await saveTable({
                database_id,
                team_id,
                config: {
                    table_id: table.id,
                    table_name: table.title[0].plain_text
                }
            });

            // save the columns to the db
            await saveColumns(table.properties.properties.map((property: any) => ({
                table_id: tableData.id,
                team_id,
                id: property.id,
                name: property.name,
                data_type: property.type,
                is_nullable: property.is_nullable
            })));
        }

        return result.results;
    }
}
