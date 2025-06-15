export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      teams: {
        Row: {
          id: string
          name: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
          updated_at?: string
        }
      }
      team_members: {
        Row: {
          id: string
          team_id: string
          user_id: string
          role: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          team_id: string
          user_id: string
          role: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          team_id?: string
          user_id?: string
          role?: string
          created_at?: string
          updated_at?: string
        }
      }
      team_invites: {
        Row: {
          id: string
          team_id: string
          email: string
          verification_code: string
          status: 'pending' | 'accepted' | 'expired'
          expires_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          team_id: string
          email: string
          verification_code: string
          status?: 'pending' | 'accepted' | 'expired'
          expires_at: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          team_id?: string
          email?: string
          verification_code?: string
          status?: 'pending' | 'accepted' | 'expired'
          expires_at?: string
          created_at?: string
          updated_at?: string
        }
      }
      connectors: {
        Row: {
          id: string
          name: string
          type: string
          provider: string
          config: Json
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          type: string
          provider: string
          config: Json
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          type?: string
          provider?: string
          config?: Json
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      connections: {
        Row: {
          id: string
          connector_id: string
          name: string
          config: Json
          team_id: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          connector_id: string
          name: string
          config: Json
          team_id: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          connector_id?: string
          name?: string
          config?: Json
          team_id?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      syncs: {
        Row: {
          id: string
          name: string
          source_id: string
          destination_id: string
          config: Json
          team_id: string
          setup_stage: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          source_id: string
          destination_id: string
          config: Json
          team_id: string
          setup_stage?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          source_id?: string
          destination_id?: string
          config?: Json
          team_id?: string
          setup_stage?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      field_mapping: {
        Row: {
          id: string
          sync_id: string
          source_field: string
          destination_field: string
          transformation_type: string | null
          transformation_config: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          sync_id: string
          source_field: string
          destination_field: string
          transformation_type?: string | null
          transformation_config?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          sync_id?: string
          source_field?: string
          destination_field?: string
          transformation_type?: string | null
          transformation_config?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
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
