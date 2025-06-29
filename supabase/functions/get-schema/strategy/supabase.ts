import { DataSourceStrategy } from "./index.ts";

export class SupabaseStrategy implements DataSourceStrategy {
    private config = {
        projects: {
            url: `https://api.supabase.com/v1/projects`
        },
        tables: {
            url: `https://api.supabase.com/v1/projects/{project_ref}/tables`
        }
    }

    private getUrl(type: "projects" | "tables", urlConfig: Record<string, any>): string {
        const { url } = this.config[type];

        // Replace all {param} in the url with the value from urlConfig
        return url.replace(/{(\w+)}/g, (_, key) => {
            // If the param is missing, replace with an empty string or throw an error if you prefer
            return urlConfig[key] !== undefined ? urlConfig[key] : "";
        });
    }

    private async connect(type: "projects" | "tables", config: Record<string, any>): Promise<{ valid: boolean, result: any }> {
        // airtable is not a a standard datasource so we need to call
        // the airtable api to get the tables
        try {
            const { access_token } = config;

            if (!access_token) {
                return { valid: false, result: null };
            }

            // get all tables via api 
            const response = await fetch(this.getUrl(type, config), {
                headers: {
                    Authorization: `Bearer ${access_token}`
                }
            });

            if (!response.ok) {
                return { valid: false, result: null };
            }

            const result = await response.json();
            return { valid: true, result };
        } catch (error) {
            return { valid: false, result: null };
        }
    }

    async getSources(config: Record<string, any>): Promise<Record<string, any>[]> {
        const { valid, result } = await this.connect("projects", config);
        if (!valid) {
            throw new Error("Failed to connect to Supabase");
        }

        return result.projects;
    }

    async getTables(config: Record<string, any>): Promise<Record<string, any>[]> {
        // must have a project_ref
        if (!config.project_ref) {
            throw new Error("Project reference is required");
        }

        // first validate the connection
        const { valid, result } = await this.connect("tables", config);
        if (!valid) {
            throw new Error("Failed to connect to Airtable");
        }

        return result.tables;
    }
}
