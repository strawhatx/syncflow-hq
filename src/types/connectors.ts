import { Json } from "@/integrations/supabase/types";

export type ConnectorType = 'oauth' | 'api_key';
export type ConnectorProvider = 'supabase'|'airtable' | 'postgresql' | 'mongodb' | 'mysql' | 'aws';

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