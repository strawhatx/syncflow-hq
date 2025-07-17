import { Json } from "@/integrations/supabase/types";

export type ConnectorType = 'oauth' | 'api_key';
export type ConnectorProvider =
  'supabase' |
  'airtable' |
  'google_sheets' |
  'notion' |
  'postgresql' |
  'mongodb' |
  'mysql' |
  'aws' |
  'sqlserver';

export interface ConnectorConfig {
  required_fields: string[];
  optional_fields: string[];
  description: string;
  icon: string;
}

export interface Connector {
  id: string;
  icon: string;
  name: string;
  description: string;
  type: ConnectorType;
  provider: ConnectorProvider;
  client_id: string;
  auth_url: string;
  token_url: string;
  redirect_url: string;
  scopes: string[];
  required_fields: string[];
  required_parameters: string[];
  code_challenge_required: boolean;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Connection {
  id: string;
  connector_id: string;
  name: string;
  config: Json;
  team_id: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ColumnOption {
  id: string;
  name: string;
}

export interface TableOption {         
  id: string;
  name: string;
  columns: ColumnOption[];
  icon: string;
}