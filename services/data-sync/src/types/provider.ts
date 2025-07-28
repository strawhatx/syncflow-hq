export type Provider =
    "airtable" |
    "supabase" |
    "google_sheets" |
    "notion" |
    "postgresql" |
    "mysql" |
    "mongodb" |
    "sqlserver";

export type WebhookProvider =
    "airtable" |
    "google_sheets" |
    "notion";

export type SqlProvider =
    "supabase" |
    "postgresql" |
    "mysql" |
    "mongodb" |
    "sqlserver";

export const providerMap: Record<Provider, string> = {
    airtable: "airtable",
    supabase: "supabase",
    google_sheets: "google_sheets",
    notion: "notion",
    postgresql: "postgresql",
    mysql: "mysql",
    mongodb: "mongodb",
    sqlserver: "sqlserver",
}