import { DataSourceStrategy } from ".";

// Airtable is not a standard datasource so we need to call
// the airtable api to get the tables
export class GoogleSheetsStrategy implements DataSourceStrategy {
    private config = {
        tables: {
            url: `https://sheets.googleapis.com/v4/spreadsheets/{spreadsheetId}`
        },
        sources: {
            url: `https://www.googleapis.com/drive/v3/files?q=mimeType='application/vnd.google-apps.spreadsheet'&fields=files(id,name,dqq)`
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
        const { valid, result } = await this.connect("sources", config);
        if (!valid) {
            throw new Error("Failed to connect to Google Sheets");
        }

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

        return result.sheets;
    }
}