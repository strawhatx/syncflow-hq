export type ConnectorType = 'database' | 'warehouse' | 'saas' | 'file' | 'api';
export type ConnectorProvider = 'supabase' | 'postgresql' | 'mongodb' | 'mysql' | 'aws';

export interface ConnectorConfig {
  required_fields: string[];
  optional_fields: string[];
  description: string;
  icon: string;
}

export interface Connector {
  id: string;
  name: string;
  type: ConnectorType;
  provider: ConnectorProvider;
  config: ConnectorConfig;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

// Connection configuration types for each provider
export interface SupabaseConnectionConfig {
  url: string;
  key: string;
  schema?: string;
}

export interface PostgresConnectionConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  schema?: string;
  ssl?: boolean;
}

export interface MongoConnectionConfig {
  uri: string;
  database: string;
  options?: Record<string, any>;
}

export interface MySQLConnectionConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl?: boolean;
}

export interface S3ConnectionConfig {
  bucket: string;
  region: string;
  access_key_id: string;
  secret_access_key: string;
  prefix?: string;
  endpoint?: string;
}

export type ConnectionConfig = 
  | SupabaseConnectionConfig 
  | PostgresConnectionConfig 
  | MongoConnectionConfig 
  | MySQLConnectionConfig 
  | S3ConnectionConfig;

export interface Connection {
  id: string;
  connector_id: string;
  name: string;
  config: ConnectionConfig;
  team_id: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

// Type guard functions to check connection config types
export function isSupabaseConfig(config: ConnectionConfig): config is SupabaseConnectionConfig {
  return 'url' in config && 'key' in config;
}

export function isPostgresConfig(config: ConnectionConfig): config is PostgresConnectionConfig {
  return 'host' in config && 'port' in config && 'database' in config;
}

export function isMongoConfig(config: ConnectionConfig): config is MongoConnectionConfig {
  return 'uri' in config && 'database' in config;
}

export function isMySQLConfig(config: ConnectionConfig): config is MySQLConnectionConfig {
  return 'host' in config && 'port' in config && 'database' in config;
}

export function isS3Config(config: ConnectionConfig): config is S3ConnectionConfig {
  return 'bucket' in config && 'region' in config && 'access_key_id' in config;
} 