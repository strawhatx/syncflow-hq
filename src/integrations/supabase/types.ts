export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      integration_connections: {
        Row: {
          api_key: string | null
          auth_data: Json | null
          connection_name: string
          connection_status: string
          created_at: string
          id: string
          integration_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          api_key?: string | null
          auth_data?: Json | null
          connection_name: string
          connection_status: string
          created_at?: string
          id?: string
          integration_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          api_key?: string | null
          auth_data?: Json | null
          connection_name?: string
          connection_status?: string
          created_at?: string
          id?: string
          integration_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "integration_connections_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "integrations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "integration_connections_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "integrations_public"
            referencedColumns: ["id"]
          },
        ]
      }
      integrations: {
        Row: {
          auth_type: string
          auth_url: string | null
          category: string
          client_id: string | null
          client_secret: string | null
          created_at: string
          description: string
          icon: string | null
          id: string
          name: string
          redirect_url: string | null
          required_parameters: string[] | null
          scopes: string[] | null
          token_url: string | null
          updated_at: string
        }
        Insert: {
          auth_type: string
          auth_url?: string | null
          category: string
          client_id?: string | null
          client_secret?: string | null
          created_at?: string
          description: string
          icon?: string | null
          id?: string
          name: string
          redirect_url?: string | null
          required_parameters?: string[] | null
          scopes?: string[] | null
          token_url?: string | null
          updated_at?: string
        }
        Update: {
          auth_type?: string
          auth_url?: string | null
          category?: string
          client_id?: string | null
          client_secret?: string | null
          created_at?: string
          description?: string
          icon?: string | null
          id?: string
          name?: string
          redirect_url?: string | null
          required_parameters?: string[] | null
          scopes?: string[] | null
          token_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          id: string
          updated_at: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          id: string
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          id?: string
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
      syncs: {
        Row: {
          id: string
          name: string
          user_id: string
          source_connection_id: string
          destination_connection_id: string
          entity_type: string
          sync_direction: 'one-way' | 'two-way'
          conflict_resolution: 'source' | 'destination' | 'latest'
          is_active: boolean
          created_at: string
          updated_at: string
          setup_stage: SetupStage
        }
        Insert: {
          id?: string
          name: string
          user_id: string
          source_connection_id: string
          destination_connection_id: string
          entity_type: string
          sync_direction: 'one-way' | 'two-way'
          conflict_resolution: 'source' | 'destination' | 'latest'
          is_active?: boolean
          created_at?: string
          updated_at?: string
          setup_stage?: SetupStage
        }
        Update: {
          id?: string
          name?: string
          user_id?: string
          source_connection_id?: string
          destination_connection_id?: string
          entity_type?: string
          sync_direction?: 'one-way' | 'two-way'
          conflict_resolution?: 'source' | 'destination' | 'latest'
          is_active?: boolean
          created_at?: string
          updated_at?: string
          setup_stage?: SetupStage
        }
        Relationships: [
          {
            foreignKeyName: "syncs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "syncs_source_connection_id_fkey"
            columns: ["source_connection_id"]
            isOneToOne: false
            referencedRelation: "integration_connections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "syncs_destination_connection_id_fkey"
            columns: ["destination_connection_id"]
            isOneToOne: false
            referencedRelation: "integration_connections"
            referencedColumns: ["id"]
          }
        ]
      }
      field_mappings: {
        Row: {
          id: string
          sync_id: string
          source_field_name: string
          source_field_type: string
          destination_field_name: string
          destination_field_type: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          sync_id: string
          source_field_name: string
          source_field_type: string
          destination_field_name: string
          destination_field_type: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          sync_id?: string
          source_field_name?: string
          source_field_type?: string
          destination_field_name?: string
          destination_field_type?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "field_mappings_sync_id_fkey"
            columns: ["sync_id"]
            isOneToOne: false
            referencedRelation: "syncs"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      integrations_public: {
        Row: {
          auth_type: string | null
          auth_url: string | null
          category: string | null
          client_id: string | null
          created_at: string | null
          description: string | null
          icon: string | null
          id: string | null
          name: string | null
          redirect_url: string | null
          required_parameters: string[] | null
          scopes: string[] | null
          token_url: string | null
          updated_at: string | null
        }
        Insert: {
          auth_type?: string | null
          auth_url?: string | null
          category?: string | null
          client_id?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string | null
          name?: string | null
          redirect_url?: string | null
          required_parameters?: string[] | null
          scopes?: string[] | null
          token_url?: string | null
          updated_at?: string | null
        }
        Update: {
          auth_type?: string | null
          auth_url?: string | null
          category?: string | null
          client_id?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string | null
          name?: string | null
          redirect_url?: string | null
          required_parameters?: string[] | null
          scopes?: string[] | null
          token_url?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

export type SyncDirection = 'one-way' | 'two-way';
export type ConflictResolution = 'source' | 'destination' | 'latest';
export type SetupStage = 'connect' | 'mapping' | 'authorize' | 'complete';

export interface Sync {
  id: string;
  name: string;
  source_connection_id: string;
  destination_connection_id: string;
  entity_type: string;
  sync_direction: SyncDirection;
  conflict_resolution: ConflictResolution;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  setup_stage: SetupStage;
}

export type TemplateCategory = {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
}

export type Template = {
  id: string;
  name: string;
  source_integration_id: string;
  destination_integration_id: string;
  sync_direction: SyncDirection;
  matching_key: string;
  field_mappings: Json;
  description: string | null;
  category_id: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  source_integration: {
    id: string;
    name: string;
    icon: string | null;
  };
  destination_integration: {
    id: string;
    name: string;
    icon: string | null;
  };
  category: {
    id: string;
    name: string;
  };
}
