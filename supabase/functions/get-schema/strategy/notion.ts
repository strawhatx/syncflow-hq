import { DataSourceStrategy } from "./index.ts";

export class NotionStrategy implements DataSourceStrategy {
    private config = {
        tables: {
            url: `https://api.notion.com/v1/databases/{database_id}`
        },
        sources: {
            url: "https://api.notion.com/v1/search"
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

    private async connect(type: "tables" | "sources", config: Record<string, any>): Promise<{ valid: boolean, result: any }> {
        // google sheets is not a standard datasource so we need to call
        // the google sheets api to get the tables
        try {
            const { access_token } = config;

            if (!access_token) {
                return { valid: false, result: null };
            }

            // get all tables via api 
            const response = await fetch(this.getUrl(type, config), {
                headers: {
                    "Authorization": `Bearer ${access_token}`,
                    "Notion-Version": "2022-06-28",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    filter: {
                        value: "database",
                        property: "object"
                    }
                })
            });

            if (!response.ok) {
                throw new Error(response.statusText || "Failed to connect to Google Sheets");
            }

            const result = await response.json();
            return { valid: true, result };
        } catch (error) {
            console.error(error);
            throw new Error(error.message || "Failed to connect to Notion");
        }
    }

    async getTables(config: Record<string, any>): Promise<Record<string, any>[]> {
        // must have a databaseId
        if (!config.databaseId) {
            throw new Error("Database ID is required");
        }

        // first validate the connection
        const { valid, result } = await this.connect("tables", config);
        if (!valid) {
            throw new Error("Failed to connect to Notion");
        }

        return result.results;
    }

    async getSources(config: Record<string, any>): Promise<Record<string, any>[]> {
        const { valid, result } = await this.connect("sources", config);
        if (!valid) {
            throw new Error("Failed to connect to Notion");
        }

        return result.results;
    }
}