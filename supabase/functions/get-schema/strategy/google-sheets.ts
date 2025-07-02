import { DataSourceStrategy } from "./index.ts";

// Google Sheets is not a standard datasource so we need to call
// the Google Sheets API to get the tables
export class GoogleSheetsStrategy implements DataSourceStrategy {
    private config = {
        // Get spreadsheet metadata (including sheets)
        tables: {
            url: `https://sheets.googleapis.com/v4/spreadsheets/{spreadsheetId}`
        },
        // List all spreadsheet files in the user's Drive
        sources: {
            url: `https://www.googleapis.com/drive/v3/files?q=mimeType='application/vnd.google-apps.spreadsheet'&fields=files(id,name,createdTime,modifiedTime)`
        }
    };

    private getUrl(type: "tables" | "sources", urlConfig: Record<string, any>): string {
        const { url } = this.config[type];

        // Replace all {param} in the URL with the value from urlConfig
        return url.replace(/{(\w+)}/g, (_, key) => {
            // If the param is missing, replace with an empty string or throw an error if you prefer
            return urlConfig[key] !== undefined ? urlConfig[key] : "";
        });
    }

    private async connect(
        type: "tables" | "sources",
        config: Record<string, any>
    ): Promise<{ valid: boolean; result: any }> {
        // Google Sheets is not a standard datasource so we need to call
        // the Google Sheets API to get the tables
        try {
            const { access_token } = config;

            if (!access_token) {
                return { valid: false, result: null };
            }

            // Get all tables via API
            const response = await fetch(this.getUrl(type, config), {
                headers: {
                    Authorization: `Bearer ${access_token}`
                }
            });

            if (!response.ok) {
                throw new Error(response.statusText || "Failed to connect to Google Sheets");
            }

            const result = await response.json();
            return { valid: true, result };
        } catch (error) {
            console.error(error);
            throw new Error(error.message || "Failed to connect to Google Sheets");
        }
    }

    async getSources(config: Record<string, any>): Promise<Record<string, any>[]> {
        // first validate the connection
        const { valid, result } = await this.connect("sources", config);
        if (!valid) {
            throw new Error("Failed to connect to Google Sheets");
        }

        // return the list of spreadsheet files
        return result.files;
    }

    async getTables(config: Record<string, any>): Promise<Record<string, any>[]> {
        // must have a spreadsheetId
        if (!config.spreadsheetId) {
            throw new Error("Spreadsheet ID is required");
        }

        // first validate the connection
        const { valid, result } = await this.connect("tables", config);
        if (!valid) {
            throw new Error("Failed to connect to Google Sheets");
        }

        // return the list of sheets
        return result.sheets;
    }
}