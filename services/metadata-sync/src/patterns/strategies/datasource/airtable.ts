import { supabase } from "../../../config/supabase.ts";
import { saveColumns, saveDatabases, saveTable } from "../../../services/connection.ts";
import { DataSourceStrategy } from "../index.ts";

// Airtable is not a standard datasource so we need to call
// the Airtable API to get the tables
export class AirtableStrategy implements DataSourceStrategy {
    private config = {
        tables: {
            url: `https://api.airtable.com/v0/meta/bases/{base_id}/tables`
        },
        sources: {
            url: `https://api.airtable.com/v0/meta/bases`
        }
    }

    private getUrl(type: "tables" | "sources" | "columns", urlConfig: Record<string, any>): string {
        const { url } = this.config[type];

        // Replace all {param} in the url with the value from urlConfig
        return url.replace(/{(\w+)}/g, (_, key) => {
            // If the param is missing, replace with an empty string or throw an error if you prefer
            return urlConfig[key] !== undefined ? urlConfig[key] : "";
        });
    }

    // get all bases via API 
    // format:
    // {
    //   "bases": [
    //     {
    //       "id": "app1234567890",
    //       "name": "My Base"
    //     },
    //     ...
    //   ]
    // }
    private async connect(type: "tables" | "sources", config: Record<string, any>): Promise<{ valid: boolean, result: any }> {
        // Airtable is not a standard datasource so we need to call
        // the Airtable API to get the tables
        try {
            const { access_token } = config;

            if (!access_token) {
                return { valid: false, result: null };
            }

            // get all tables via API 
            const response = await fetch(this.getUrl(type, config), {
                headers: {
                    Authorization: `Bearer ${access_token}`
                }
            });

            if (!response.ok) {
                throw new Error(response.statusText || "Failed to connect to Airtable");
            }

            const result = await response.json();
            return { valid: true, result };
        } catch (error) {
            return { valid: false, result: null };
        }
    }

    async getSources(config: Record<string, any>): Promise<Record<string, any>[]> {
        const { connection_id, team_id } = config;

        // validate the necessary fields
        if (!connection_id || !team_id) {
            throw new Error("Connection ID and team ID are required");
        }

        // validate the connection by getting the data
        const { valid, result } = await this.connect("sources", config);
        if (!valid) {
            throw new Error("Failed to connect to Airtable");
        }

        // save the bases to the db
        const databases = await saveDatabases(
            result.bases.map((base: any) => ({
                connection_id,
                team_id,
                config: {
                    base_id: base.id,
                    base_name: base.name,
                    permission_level: config.permission_level
                }
            }))
        );

        return databases;
    }

    async getTables(config: Record<string, any>): Promise<Record<string, any>[]> {
        const { database_id, base_id, team_id } = config;

        // validate the necessary fields
        if (!database_id || !base_id || !team_id) {
            throw new Error("Database ID and team ID are required");
        }

        // first validate the connection
        const { valid, result } = await this.connect("tables", config);
        if (!valid) {
            throw new Error("Failed to connect to Airtable");
        }

        // save the tables and cilumns
        for (const table of result.tables) {
            // save the table to the db
            const tableData = await saveTable({
                database_id,
                team_id,
                config: {
                    table_id: table.id,
                    table_name: table.name
                }
            });

            // save the columns to the db
            await saveColumns(table.fields.map((column: any) => ({
                    table_id: tableData.id,
                    team_id,
                    //id: column.id,
                    name: column.name,
                    data_type: column.type,
                    is_nullable: column.is_nullable
                }))
            );
        }

        return result.tables;
    }
}
