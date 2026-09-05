export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      ai_usage: {
        Row: {
          client_key: string
          created_at: string
          feature: string
          id: string
          request_count: number
          updated_at: string
          usage_date: string
        }
        Insert: {
          client_key: string
          created_at?: string
          feature: string
          id?: string
          request_count?: number
          updated_at?: string
          usage_date?: string
        }
        Update: {
          client_key?: string
          created_at?: string
          feature?: string
          id?: string
          request_count?: number
          updated_at?: string
          usage_date?: string
        }
        Relationships: []
      }
      daily_leaderboard: {
        Row: {
          created_at: string
          disqualified: boolean
          id: string
          quiz_date: string
          score: number
          tab_switches: number
          time_ms: number
          updated_at: string
          user_id: string
          username: string
        }
        Insert: {
          created_at?: string
          disqualified?: boolean
          id?: string
          quiz_date?: string
          score?: number
          tab_switches?: number
          time_ms?: number
          updated_at?: string
          user_id: string
          username: string
        }
        Update: {
          created_at?: string
          disqualified?: boolean
          id?: string
          quiz_date?: string
          score?: number
          tab_switches?: number
          time_ms?: number
          updated_at?: string
          user_id?: string
          username?: string
        }
        Relationships: []
      }
      daily_questions: {
        Row: {
          category: string | null
          choices: Json
          correct_index: number
          created_at: string
          id: string
          question: string
          question_order: number
          quiz_date: string
          quiz_number: number
        }
        Insert: {
          category?: string | null
          choices: Json
          correct_index: number
          created_at?: string
          id?: string
          question: string
          question_order: number
          quiz_date: string
          quiz_number: number
        }
        Update: {
          category?: string | null
          choices?: Json
          correct_index?: number
          created_at?: string
          id?: string
          question?: string
          question_order?: number
          quiz_date?: string
          quiz_number?: number
        }
        Relationships: []
      }
      leaderboard: {
        Row: {
          client_id: string
          created_at: string
          id: string
          score: number
          streak: number
          updated_at: string
          username: string
          xp: number
        }
        Insert: {
          client_id: string
          created_at?: string
          id?: string
          score?: number
          streak?: number
          updated_at?: string
          username: string
          xp?: number
        }
        Update: {
          client_id?: string
          created_at?: string
          id?: string
          score?: number
          streak?: number
          updated_at?: string
          username?: string
          xp?: number
        }
        Relationships: []
      }
      league_members: {
        Row: {
          id: string
          joined_at: string
          league_id: string
          user_id: string
        }
        Insert: {
          id?: string
          joined_at?: string
          league_id: string
          user_id: string
        }
        Update: {
          id?: string
          joined_at?: string
          league_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "league_members_league_id_fkey"
            columns: ["league_id"]
            isOneToOne: false
            referencedRelation: "leagues"
            referencedColumns: ["id"]
          },
        ]
      }
      leagues: {
        Row: {
          code: string
          created_at: string
          id: string
          name: string
          owner_id: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          name?: string
          owner_id: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          name?: string
          owner_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          id: string
          losses: number
          streak: number
          tier: string
          updated_at: string
          username: string
          wins: number
          xp: number
        }
        Insert: {
          created_at?: string
          id: string
          losses?: number
          streak?: number
          tier?: string
          updated_at?: string
          username?: string
          wins?: number
          xp?: number
        }
        Update: {
          created_at?: string
          id?: string
          losses?: number
          streak?: number
          tier?: string
          updated_at?: string
          username?: string
          wins?: number
          xp?: number
        }
        Relationships: []
      }
      question_history: {
        Row: {
          client_key: string | null
          created_at: string
          id: string
          question_hash: string
          question_text: string | null
          topic: string
          user_id: string | null
        }
        Insert: {
          client_key?: string | null
          created_at?: string
          id?: string
          question_hash: string
          question_text?: string | null
          topic: string
          user_id?: string | null
        }
        Update: {
          client_key?: string | null
          created_at?: string
          id?: string
          question_hash?: string
          question_text?: string | null
          topic?: string
          user_id?: string | null
        }
        Relationships: []
      }
      users: {
        Row: {
          active_tier: string
          created_at: string
          hearts: number
          hearts_updated_at: string
          id: string
          last_login: string
          migrated: boolean
          role: string
          streak: number
          updated_at: string
          xp: number
        }
        Insert: {
          active_tier?: string
          created_at?: string
          hearts?: number
          hearts_updated_at?: string
          id: string
          last_login?: string
          migrated?: boolean
          role?: string
          streak?: number
          updated_at?: string
          xp?: number
        }
        Update: {
          active_tier?: string
          created_at?: string
          hearts?: number
          hearts_updated_at?: string
          id?: string
          last_login?: string
          migrated?: boolean
          role?: string
          streak?: number
          updated_at?: string
          xp?: number
        }
        Relationships: []
      }
      vault_quests: {
        Row: {
          created_at: string
          difficulty: string
          id: string
          mode: string
          question_count: number
          questions: Json
          score: number
          topic: string
          total: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          difficulty?: string
          id?: string
          mode?: string
          question_count?: number
          questions?: Json
          score?: number
          topic: string
          total?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          difficulty?: string
          id?: string
          mode?: string
          question_count?: number
          questions?: Json
          score?: number
          topic?: string
          total?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      consume_ai_budget: {
        Args: { _client_key: string; _feature: string; _limit: number }
        Returns: boolean
      }
      is_league_member: {
        Args: { _league_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
