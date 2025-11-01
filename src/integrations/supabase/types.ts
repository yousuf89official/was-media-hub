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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      ave_results: {
        Row: {
          base_ave_per_channel: Json
          campaign_id: string
          channels_used: string[]
          created_at: string
          created_by: string
          final_ave: number
          id: string
          updated_at: string | null
          weighted_components: Json
        }
        Insert: {
          base_ave_per_channel: Json
          campaign_id: string
          channels_used: string[]
          created_at?: string
          created_by: string
          final_ave: number
          id?: string
          updated_at?: string | null
          weighted_components: Json
        }
        Update: {
          base_ave_per_channel?: Json
          campaign_id?: string
          channels_used?: string[]
          created_at?: string
          created_by?: string
          final_ave?: number
          id?: string
          updated_at?: string | null
          weighted_components?: Json
        }
        Relationships: [
          {
            foreignKeyName: "ave_results_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ave_results_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      brands: {
        Row: {
          company_id: string | null
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          company_id?: string | null
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "brands_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      buying_models: {
        Row: {
          channel_id: string | null
          created_at: string
          description: string | null
          id: string
          name: string
          objective_id: string | null
          updated_at: string | null
        }
        Insert: {
          channel_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          objective_id?: string | null
          updated_at?: string | null
        }
        Update: {
          channel_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          objective_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "buying_models_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "channels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "buying_models_objective_id_fkey"
            columns: ["objective_id"]
            isOneToOne: false
            referencedRelation: "objectives"
            referencedColumns: ["id"]
          },
        ]
      }
      calculation_logs: {
        Row: {
          brand_id: string | null
          calculation_type: string
          campaign_id: string | null
          created_at: string
          id: string
          inputs: Json
          results: Json
          updated_at: string | null
          user_id: string
        }
        Insert: {
          brand_id?: string | null
          calculation_type?: string
          campaign_id?: string | null
          created_at?: string
          id?: string
          inputs: Json
          results: Json
          updated_at?: string | null
          user_id: string
        }
        Update: {
          brand_id?: string | null
          calculation_type?: string
          campaign_id?: string | null
          created_at?: string
          id?: string
          inputs?: Json
          results?: Json
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "calculation_logs_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calculation_logs_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          brand_id: string
          buying_model_id: string | null
          channel_id: string
          created_at: string
          created_by: string
          end_date: string
          funnel_type: Database["public"]["Enums"]["funnel_type"]
          id: string
          metadata: Json | null
          name: string
          objective_id: string | null
          primary_kpi: string | null
          product_id: string | null
          secondary_kpi: string | null
          start_date: string
          status: Database["public"]["Enums"]["campaign_status"]
          updated_at: string
        }
        Insert: {
          brand_id: string
          buying_model_id?: string | null
          channel_id: string
          created_at?: string
          created_by: string
          end_date: string
          funnel_type: Database["public"]["Enums"]["funnel_type"]
          id?: string
          metadata?: Json | null
          name: string
          objective_id?: string | null
          primary_kpi?: string | null
          product_id?: string | null
          secondary_kpi?: string | null
          start_date: string
          status?: Database["public"]["Enums"]["campaign_status"]
          updated_at?: string
        }
        Update: {
          brand_id?: string
          buying_model_id?: string | null
          channel_id?: string
          created_at?: string
          created_by?: string
          end_date?: string
          funnel_type?: Database["public"]["Enums"]["funnel_type"]
          id?: string
          metadata?: Json | null
          name?: string
          objective_id?: string | null
          primary_kpi?: string | null
          product_id?: string | null
          secondary_kpi?: string | null
          start_date?: string
          status?: Database["public"]["Enums"]["campaign_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaigns_buying_model_id_fkey"
            columns: ["buying_model_id"]
            isOneToOne: false
            referencedRelation: "buying_models"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaigns_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "channels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaigns_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaigns_objective_id_fkey"
            columns: ["objective_id"]
            isOneToOne: false
            referencedRelation: "objectives"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaigns_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      channels: {
        Row: {
          channel_type: Database["public"]["Enums"]["channel_type"]
          created_at: string
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          channel_type: Database["public"]["Enums"]["channel_type"]
          created_at?: string
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          channel_type?: Database["public"]["Enums"]["channel_type"]
          created_at?: string
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      companies: {
        Row: {
          contact_email: string | null
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          contact_email?: string | null
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          contact_email?: string | null
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      cpm_rates: {
        Row: {
          channel_id: string
          cpm_value: number
          created_at: string
          currency: string
          effective_from: string
          effective_to: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          channel_id: string
          cpm_value: number
          created_at?: string
          currency?: string
          effective_from?: string
          effective_to?: string | null
          id?: string
          updated_at?: string | null
        }
        Update: {
          channel_id?: string
          cpm_value?: number
          created_at?: string
          currency?: string
          effective_from?: string
          effective_to?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cpm_rates_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "channels"
            referencedColumns: ["id"]
          },
        ]
      }
      engagement_multipliers: {
        Row: {
          created_at: string
          id: string
          level: Database["public"]["Enums"]["engagement_level"]
          multiplier: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          level: Database["public"]["Enums"]["engagement_level"]
          multiplier: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          level?: Database["public"]["Enums"]["engagement_level"]
          multiplier?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      metrics: {
        Row: {
          campaign_id: string
          channel_id: string
          clicks: number | null
          created_at: string
          date: string
          engagements: number | null
          followers: number | null
          id: string
          impressions: number | null
          reach: number | null
          sentiment_score: number | null
          spend: number | null
          updated_at: string | null
          video_views: number | null
        }
        Insert: {
          campaign_id: string
          channel_id: string
          clicks?: number | null
          created_at?: string
          date: string
          engagements?: number | null
          followers?: number | null
          id?: string
          impressions?: number | null
          reach?: number | null
          sentiment_score?: number | null
          spend?: number | null
          updated_at?: string | null
          video_views?: number | null
        }
        Update: {
          campaign_id?: string
          channel_id?: string
          clicks?: number | null
          created_at?: string
          date?: string
          engagements?: number | null
          followers?: number | null
          id?: string
          impressions?: number | null
          reach?: number | null
          sentiment_score?: number | null
          spend?: number | null
          updated_at?: string | null
          video_views?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "metrics_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "metrics_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "channels"
            referencedColumns: ["id"]
          },
        ]
      }
      objectives: {
        Row: {
          channel_id: string | null
          created_at: string
          description: string | null
          funnel_type: Database["public"]["Enums"]["funnel_type"] | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          channel_id?: string | null
          created_at?: string
          description?: string | null
          funnel_type?: Database["public"]["Enums"]["funnel_type"] | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          channel_id?: string | null
          created_at?: string
          description?: string | null
          funnel_type?: Database["public"]["Enums"]["funnel_type"] | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "objectives_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "channels"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_multipliers: {
        Row: {
          channel_id: string
          created_at: string
          id: string
          multiplier: number
          updated_at: string | null
        }
        Insert: {
          channel_id: string
          created_at?: string
          id?: string
          multiplier: number
          updated_at?: string | null
        }
        Update: {
          channel_id?: string
          created_at?: string
          id?: string
          multiplier?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "platform_multipliers_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: true
            referencedRelation: "channels"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          brand_id: string
          category: string | null
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          brand_id: string
          category?: string | null
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          brand_id?: string
          category?: string | null
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          company_id: string | null
          created_at: string
          email: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          email: string
          id: string
          name: string
          updated_at?: string
        }
        Update: {
          company_id?: string | null
          created_at?: string
          email?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      sentiment_multipliers: {
        Row: {
          created_at: string
          id: string
          multiplier: number
          sentiment: Database["public"]["Enums"]["sentiment_type"]
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          multiplier: number
          sentiment: Database["public"]["Enums"]["sentiment_type"]
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          multiplier?: number
          sentiment?: Database["public"]["Enums"]["sentiment_type"]
          updated_at?: string | null
        }
        Relationships: []
      }
      sov_results: {
        Row: {
          basis_json: Json
          campaign_id: string
          created_at: string
          id: string
          period_end: string
          period_start: string
          share_of_voice_value: number
          updated_at: string | null
        }
        Insert: {
          basis_json: Json
          campaign_id: string
          created_at?: string
          id?: string
          period_end: string
          period_start: string
          share_of_voice_value: number
          updated_at?: string | null
        }
        Update: {
          basis_json?: Json
          campaign_id?: string
          created_at?: string
          id?: string
          period_end?: string
          period_start?: string
          share_of_voice_value?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sov_results_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      user_activity_logs: {
        Row: {
          activity_type: string
          created_at: string
          id: string
          metadata: Json | null
          page_path: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          activity_type: string
          created_at?: string
          id?: string
          metadata?: Json | null
          page_path: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          activity_type?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          page_path?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "MasterAdmin" | "Director" | "Account" | "Client"
      campaign_status: "draft" | "running" | "finished"
      channel_type:
        | "Social"
        | "Programmatic"
        | "Display"
        | "PR"
        | "Email"
        | "Owned"
      engagement_level: "Low" | "Moderate" | "High" | "Viral"
      funnel_type: "TOP" | "MID" | "BOTTOM"
      sentiment_type: "Positive" | "Neutral" | "Negative"
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["MasterAdmin", "Director", "Account", "Client"],
      campaign_status: ["draft", "running", "finished"],
      channel_type: [
        "Social",
        "Programmatic",
        "Display",
        "PR",
        "Email",
        "Owned",
      ],
      engagement_level: ["Low", "Moderate", "High", "Viral"],
      funnel_type: ["TOP", "MID", "BOTTOM"],
      sentiment_type: ["Positive", "Neutral", "Negative"],
    },
  },
} as const
