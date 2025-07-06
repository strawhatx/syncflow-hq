import { DataSourceStrategy } from "./index.ts";

// Airtable is not a standard datasource so we need to call
// the Airtable API to get the tables
export class AirtableStrategy implements DataSourceStrategy {
    private config = {
        tables: {
            url: `https://api.airtable.com/v0/meta/bases/{baseId}/tables`
        },
        sources: {
            url: `https://api.airtable.com/v0/meta/bases`
        }
    }

    private getUrl(type: "tables" | "sources", urlConfig: Record<string, any>): string {
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
    private async connect(type: "tables" | "sources" | "columns", config: Record<string, any>): Promise<{ valid: boolean, result: any }> {
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
        const { valid, result } = await this.connect("sources", config);
        if (!valid) {
            throw new Error("Failed to connect to Airtable");
        }

        return result.bases;
    }

    async getTables(config: Record<string, any>): Promise<Record<string, any>[]> {
        // must have a baseId
        if (!config.baseId) {
            throw new Error("Base ID is required");
        }

        // first validate the connection
        const { valid, result } = await this.connect("tables", config);
        if (!valid) {
            throw new Error("Failed to connect to Airtable");
        }

        return result.tables;
    }

    async getColumns(config: Record<string, any>): Promise<Record<string, any>[]> {
        // must have a baseId
        if (!config.baseId) {
            throw new Error("Base ID is required");
        }

        // first validate the connection
        const { valid, result } = await this.connect("tables", config);
        if (!valid) {
            throw new Error("Failed to connect to Airtable");
        }

        return result.tables;
    }
}
