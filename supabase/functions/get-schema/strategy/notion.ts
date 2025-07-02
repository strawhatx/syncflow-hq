import { DataSourceStrategy } from "./index.ts";

export class NotionStrategy implements DataSourceStrategy {
    private config = {
        tables: {
            // Query a database to get rows
            url: `https://api.notion.com/v1/databases/{databaseId}/query`,
            method: "POST"
        },
        databaseMeta: {
            // Retrieve database schema
            url: `https://api.notion.com/v1/databases/{databaseId}`,
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
        const { valid, result } = await this.connect("sources", config, {
            filter: {
                value: "database",
                property: "object"
            }
        });
        if (!valid) {
            throw new Error("Failed to connect to Notion");
        }
        return result.results;
    }

    async getTables(config: Record<string, any>): Promise<Record<string, any>[]> {
        if (!config.databaseId) {
            throw new Error("Database ID is required");
        }

        const { valid, result } = await this.connect("tables", config);
        if (!valid) {
            throw new Error("Failed to query Notion database");
        }
        return result.results;
    }

    async getDatabaseMeta(config: Record<string, any>): Promise<Record<string, any>> {
        if (!config.databaseId) {
            throw new Error("Database ID is required");
        }

        const { valid, result } = await this.connect("databaseMeta", config);
        if (!valid) {
            throw new Error("Failed to retrieve Notion database metadata");
        }
        return result;
    }
}
