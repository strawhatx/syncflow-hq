// Base interface for all database configurations
export interface BaseDatabaseConfig {
  id: string;
  name: string;
  connection_id: string;
  config: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

// Provider-specific configuration interfaces
export interface NotionDatabaseConfig extends BaseDatabaseConfig {
  config: {
    database_id: string;
  };
}

export interface SupabaseDatabaseConfig extends BaseDatabaseConfig {
  config: {
    project_id: string;
    project_name: string;
    organization_id: string;
    region: string;
    status: string;
  };
}

export interface AirtableDatabaseConfig extends BaseDatabaseConfig {
  config: {
    base_id: string;
    permission_level: string;
  };
}

export interface GoogleSheetsDatabaseConfig extends BaseDatabaseConfig {
  config: {
    spreadsheet_id: string;
    createdTime: string;
    modifiedTime: string;
  };
}

export interface PostgresDatabaseConfig extends BaseDatabaseConfig {
  config: {
    database_name: string;
    schema?: string;
  };
}

export interface MySQLDatabaseConfig extends BaseDatabaseConfig {
  config: {
    database_name: string;
  };
}

export interface MongoDatabaseConfig extends BaseDatabaseConfig {
  config: {
    database_name: string;
  };
}

// Union type for all possible database configurations
export type DatabaseConfig = 
  | NotionDatabaseConfig
  | SupabaseDatabaseConfig
  | AirtableDatabaseConfig
  | GoogleSheetsDatabaseConfig
  | PostgresDatabaseConfig
  | MySQLDatabaseConfig
  | MongoDatabaseConfig;

// Helper function to type-check database configs
export function isNotionConfig(config: DatabaseConfig): config is NotionDatabaseConfig {
  return 'database_id' in config.config;
}

export function isSupabaseConfig(config: DatabaseConfig): config is SupabaseDatabaseConfig {
  return 'project_id' in config.config;
}

export function isAirtableConfig(config: DatabaseConfig): config is AirtableDatabaseConfig {
  return 'base_id' in config.config;
}

export function isGoogleSheetsConfig(config: DatabaseConfig): config is GoogleSheetsDatabaseConfig {
  return 'spreadsheet_id' in config.config;
} 