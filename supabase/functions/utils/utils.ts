export type Provider = "airtable" | "supabase"| "google_sheets" | "notion" | "postgresql" | "mysql" | "mongodb" | "s3";

export const providerMap: Record<Provider, string> = {
    airtable: "airtable",
    supabase: "supabase",
    google_sheets: "google_sheets",
    notion: "notion",
    postgresql: "postgresql",
    mysql: "mysql",
    mongodb: "mongodb",
    s3: "s3",
}