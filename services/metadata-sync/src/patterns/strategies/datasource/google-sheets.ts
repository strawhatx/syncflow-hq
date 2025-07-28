import { supabase } from "../../../config/supabase";
import { saveColumns, saveDatabases, saveTable } from "../../../services/connection";
import { DataSourceStrategy } from "./index";

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
            url: `https://sheets.googleapis.com/v4/spreadsheets/{spreadsheet_id}?includeGridData=true`
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
        } catch (error: any) {
            console.error(error);
            throw new Error(error.message || "Failed to connect to Google Sheets");
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
            throw new Error("Failed to connect to Google Sheets");
        }

        // save the spreadsheet files to the db
        const databases = await saveDatabases(
            result.files.map((file: any) => ({
                connection_id,
                team_id,
                config: {
                    spreadsheet_id: file.id,
                    spreadsheet_name: file.name,
                    modifiedTime: file.modifiedTime
                }
            }))
        );

        // return the list of spreadsheet files
        return databases;
    }

    async getTables(config: Record<string, any>): Promise<Record<string, any>[]> {
        const { database_id, team_id, spreadsheet_id, spreadsheet_name } = config;

        // validate the necessary fields
        if (!database_id || !team_id || !spreadsheet_id || !spreadsheet_name) {
            throw new Error("Team ID|Spreadsheet ID|Spreadsheet Name are required");
        }

        // validate the connection
        const { valid, result } = await this.connect("tables", config);
        if (!valid) {
            throw new Error("Failed to connect to Google Sheets");
        }

        // need to validate the first row of all sheets to try to 
        // determine if the sheet has a valid table 
        const sheets = await Promise.all(result.sheets.map(async (sheet: any) => {
            const cells = sheet.data?.[0]?.rowData?.[0]?.values || [];

            const validation = await this.validate(cells);

            return {
                isValid: validation.valid,
                cells,
                sheet_id: sheet.properties.sheetId,
                sheet_name: sheet.properties.title,
                sheet_type: sheet.properties.sheetType,
            };
        }));

        // filter out the sheets that are not valid
        const validSheets = sheets.filter(sheet => sheet.isValid);
        if (!validSheets.length) return [];

        // save the tables and columns
        for (const sheet of validSheets) {
            const { sheet_id, sheet_name, sheet_type, cells } = sheet;

            const sheetData = await saveTable({
                database_id: database_id,
                team_id,
                config: {
                    sheet_id,
                    sheet_name,
                    sheet_type,
                }
            });

            // get the set header row and filter out empty cells
            const header = cells.filter((cell: any) => cell.formattedValue);

            // save the columns to the db
            await saveColumns(
                header?.map((column: any) => ({
                    table_id: sheetData.id,
                    team_id,
                    //id: index,
                    name: column.formattedValue,
                    data_type: "text",
                    is_nullable: true
                }))
            );
        }

        // return the list of sheets
        return result.sheets;
    }
}