import { ConnectorProvider } from "@/types/connectors";

const iconMap = {
    airtable: "airtable-icon",
    supabase: "supabase-icon",
    google_sheets: "google_sheets-icon",
    notion: "notion-icon",
    postgresql: "postgresql-icon",
    mysql: "mysql-icon.svg",
    mongodb: "mongodb-icon",
    default: "default-icon"
}

const getIcon = (provider: ConnectorProvider) => {
    return iconMap[provider as keyof typeof iconMap] || iconMap.default;
}


export default getIcon;