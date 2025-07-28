import { saveColumns, saveDatabases, saveTable } from "../../../services/connection";
import { DataSourceStrategy } from "./index";

// Airtable is not a standard datasource so we need to call
// the Airtable API to get the tables
export class AirtableStrategy implements DataSourceStrategy {

    private async connect(config: Record<string, any>): Promise<{ valid: boolean, result: any }> {
        // Airtable is not a standard datasource so we need to call
        // the Airtable API to get the tables
        try {
            const { access_token } = config;

            if (!access_token) {
                return { valid: false, result: null };
            }

            const url = `https://api.airtable.com/v0/meta/bases`;

            // get all tables via API 
            const response = await fetch(url, {
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

    async getData(config: Record<string, any>): Promise<Record<string, any>[]> {
        const { database_id, base_id, team_id } = config;

        // validate the necessary fields
        if (!database_id || !base_id || !team_id) {
            throw new Error("Database ID and team ID are required");
        }

        // first validate the connection
        const { valid, result } = await this.connect(config);
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
