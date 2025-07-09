import { saveColumns, saveDatabases, saveTable } from "../../../services/connection.ts";
import { DataSourceStrategy } from "./index.ts";

export class SupabaseStrategy implements DataSourceStrategy {
    private config = {
        projects: {
            url: `https://api.supabase.com/v1/projects`
        },
        query: {
            url: `https://api.supabase.com/v1/projects/{project_ref}/database/query`
        }
    };

    private getUrl(type: "projects" | "query", urlConfig: Record<string, any>): string {
        const { url } = this.config[type];
        return url.replace(/{(\w+)}/g, (_, key) => urlConfig[key] ?? "");
    }

    private async connect(
        type: "projects" | "query",
        config: Record<string, any>,
        query?: string
    ): Promise<{ valid: boolean; result: any }> {
        try {
            const { access_token } = config;
            if (!access_token) return { valid: false, result: null };

            const response = await fetch(this.getUrl(type, config), {
                method: type === "query" ? "POST" : "GET",
                headers: {
                    Authorization: `Bearer ${access_token}`,
                    "Content-Type": "application/json"
                },
                body: type === "query" ? JSON.stringify({ query }) : undefined
            });

            if (!response.ok) {
                throw new Error(await response.text());
            }

            const result = await response.json();
            return { valid: true, result };
        } catch (error: any) {
            console.error("Supabase connection error:", error);
            return { valid: false, result: null };
        }
    }

    async getSources(connection_id: string, config: Record<string, any>): Promise<Record<string, any>[]> {
        const { valid, result } = await this.connect("projects", config);
        if (!valid) throw new Error("Failed to fetch Supabase projects");

        const projects = await saveDatabases(
            result.projects.map((project: any) => ({
                connection_id,
                config: {
                    project_id: project.id,
                    project_name: project.name,
                    organization_id: project.organization_id,
                    region: project.region,
                    status: project.status
                }
            }))
        );

        return projects;
    }

    async getTables(config: Record<string, any>): Promise<Record<string, any>[]> {
        if (!config.project_ref) throw new Error("project_ref is required");

        // TODO: This is a temporary solution to get the tables and columns.
        // once supabase supports this, we can use the supabase api to get the tables and columns
        const sql = `
            SELECT
                t.table_name,
                c.column_name,
                c.data_type,
                c.is_nullable
            FROM information_schema.tables t
            JOIN information_schema.columns c
                ON t.table_name = c.table_name AND t.table_schema = c.table_schema
            WHERE t.table_schema = 'public'
            ORDER BY t.table_name, c.ordinal_position;
        `;

        // get tables and columns
        const { valid, result } = await this.connect("query", config, sql);
        if (!valid) throw new Error("Failed to fetch tables and columns");

        // group by table name
        const grouped: Record<string, any[]> = {};
        for (const row of result.data) {
            if (!grouped[row.table_name]) grouped[row.table_name] = [];
            grouped[row.table_name].push(row);
        }

        //use  object entries to navigate the grouped object
        // save tables & columns
        for (const [tableName, columns] of Object.entries(grouped)) {
            const tableData = await saveTable({
                database_id: config.project_ref,
                config: {
                    table_name: tableName
                }
            });

            await saveColumns(
                columns.map((col: any) => ({
                    table_id: tableData.id,
                    name: col.column_name,
                    data_type: col.data_type,
                    is_nullable: col.is_nullable === "YES"
                }))
            );
        }

        return result.data;
    }
}
