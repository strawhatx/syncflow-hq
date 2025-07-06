import { DataSourceStrategy } from "./index.ts";

type HeaderValidationResult = {
    valid: boolean;
    result: string[];
} | {
    valid: false;
    error: string;
};

// Google Sheets is not a standard datasource so we need to call
// the Google Sheets API to get the tables
export class GoogleSheetsStrategy implements DataSourceStrategy {
    private config = {
        // Get spreadsheet metadata (including sheets & first row)
        tables: {
            url: `https://sheets.googleapis.com/v4/spreadsheets/{spreadsheet_id}?includeGridData=true&ranges={range}`
        },

        // List all spreadsheet files in the user's Drive
        sources: {
            url: `https://www.googleapis.com/drive/v3/files?q=mimeType='application/vnd.google-apps.spreadsheet'&fields=files(id,name,createdTime,modifiedTime)`
        }
    };

    private getUrl(type: "tables" | "sources", urlConfig: Record<string, any>): string {
        const { url } = this.config[type];

        // if the type is tables, we build the range
        // we need to encode the sheet name and range to to revent the wrong encoding
        // via spaces in the sheet name
        if (type === "tables") {
            const sheetName = urlConfig.sheet_name;
            if (!sheetName) throw new Error("Sheet name is required");

            const range = encodeURIComponent(`'${sheetName}'!A1:Z1`);
            urlConfig.range = range;
        }

        // Replace all {param} in the URL with the value from urlConfig
        return url.replace(/{(\w+)}/g, (_, key) => {
            // If the param is missing, replace with an empty string or throw an error if you prefer
            return urlConfig[key] !== undefined ? urlConfig[key] : "";
        });
    }

    private async validate(cells: { formattedValue?: string }[], minColumns: number = 2): Promise<HeaderValidationResult> {
        if (!cells || cells.length === 0) {
            return { valid: false, error: "The first row of the sheet is empty" };
        }

        // extract trimmed headers & filter out empty headers
        const headers = cells
            .map((cell) => (cell.formattedValue || "").trim())
            .filter((h) => h !== "");

        // check if the headers are valid
        if (headers.length < minColumns) {
            return { valid: false, error: `The header row must have at least ${minColumns} columns with names.` };
        }

        // check if the headers are numbers
        const hasNumericHeaders = headers.some((h) => !isNaN(Number(h)));
        if (hasNumericHeaders) {
            return { valid: false, error: "The header row must have column names, not numbers." };
        }

        // check if the headers are unique
        // utilize a set to check for uniqueness check to see
        // if any headers are filtered out (i.e. duplicates)
        const uniqueHeaders = new Set(headers);
        if (uniqueHeaders.size !== headers.length) {
            return { valid: false, error: "The header row must have unique column names." };
        }

        //check for really long headers
        const hasLongHeaders = headers.some((h) => h.length > 100);
        if (hasLongHeaders) {
            return { valid: false, error: "One or more column names are too long (over 100 characters)." };
        }

        // all checks passed, return the headers
        return { valid: true, result: headers };
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
        if (!config.spreadsheet_id) {
            throw new Error("Spreadsheet ID is required");
        }

        // if the sheetName is not provided, use the first sheet
        if (!config.sheet_name) {
            throw new Error("Spreadsheet name is required");
        }

        // first validate the connection
        const { valid, result } = await this.connect("tables", config);
        if (!valid) {
            throw new Error("Failed to connect to Google Sheets");
        }

        // need to validate the first row of all sheets to try to 
        // determine if the sheet has a valid table 
        const isSheetValid = await Promise.all(result.sheets.map(async (sheet: any) => {
            const cells = sheet.data?.[0]?.rowData?.[0]?.values || [];

            const validation = await this.validate(cells);

            return validation.valid;
        })).then(results => results.some(valid => valid));

        if (!isSheetValid) {
            throw new Error("Sheet is invalid, please check the header row, or select a different sheet");
        }

        // return the list of sheets
        return result.sheets;
    }
}