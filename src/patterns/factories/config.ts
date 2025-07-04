import { ConnectorProvider } from "@/types/connectors";

interface ConfigFactory {
    create(): Record<string, any>;
}

export class AirtableFactory implements ConfigFactory {
    constructor(private readonly value: string) {}

    create(): Record<string, any> {
        return { base_id: this.value };
    }
}

export class GoogleSheetsFactory implements ConfigFactory {
    constructor(private readonly value: Record<string, any>) {}

    create(): Record<string, any> {
        return { spreadsheet_id: this.value.id, sheet_name: this.value.name };
    }
}

export class SupabaseFactory implements ConfigFactory {
    constructor(private readonly value: string) {}

    create(): Record<string, any> {
        return { project_ref: this.value };
    }
}

export class NotionFactory implements ConfigFactory {
    constructor(private readonly value: string) {}

    create(): Record<string, any> {
        return { database_id: this.value };
    }
}

export class DefaultFactory implements ConfigFactory {
    constructor(private readonly value: string) {}

    create(): Record<string, any> {
        return { database_url: this.value };
    }
}


export class CreateConfigFactory {
    static create(provider: ConnectorProvider, value: any): Record<string, any> {
        switch (provider) {
            case "airtable":
                return new AirtableFactory(value).create();
            case "google_sheets":
                return new GoogleSheetsFactory(value).create();
            case "supabase":
                return new SupabaseFactory(value).create();
            case "notion":
                return new NotionFactory(value).create();
            default:
                return new DefaultFactory(value).create();
        }
    }
}

