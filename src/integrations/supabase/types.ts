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
      ad_sets: {
        Row: {
          audience_targeting: Json | null
          budget: number | null
          campaign_channel_config_id: string
          created_at: string | null
          end_date: string | null
          id: string
          name: string
          placements: string[] | null
          start_date: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          audience_targeting?: Json | null
          budget?: number | null
          campaign_channel_config_id: string
          created_at?: string | null
          end_date?: string | null
          id?: string
          name: string
          placements?: string[] | null
          start_date?: string | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          audience_targeting?: Json | null
          budget?: number | null
          campaign_channel_config_id?: string
          created_at?: string | null
          end_date?: string | null
          id?: string
          name?: string
          placements?: string[] | null
          start_date?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ad_sets_campaign_channel_config_id_fkey"
            columns: ["campaign_channel_config_id"]
            isOneToOne: false
            referencedRelation: "campaign_channel_configs"
            referencedColumns: ["id"]
          },
        ]
      }
      ads: {
        Row: {
          ad_set_id: string
          created_at: string | null
          creative_url: string | null
          cta_text: string | null
          description: string | null
          destination_url: string | null
          headline: string | null
          id: string
          name: string
          status: string
          updated_at: string | null
        }
        Insert: {
          ad_set_id: string
          created_at?: string | null
          creative_url?: string | null
          cta_text?: string | null
          description?: string | null
          destination_url?: string | null
          headline?: string | null
          id?: string
          name: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          ad_set_id?: string
          created_at?: string | null
          creative_url?: string | null
          cta_text?: string | null
          description?: string | null
          destination_url?: string | null
          headline?: string | null
          id?: string
          name?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ads_ad_set_id_fkey"
            columns: ["ad_set_id"]
            isOneToOne: false
            referencedRelation: "ad_sets"
            referencedColumns: ["id"]
          },
        ]
      }
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
      brand_access_grants: {
        Row: {
          access_level: string
          brand_id: string
          created_at: string | null
          expires_at: string | null
          granted_by: string | null
          id: string
          is_active: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          access_level?: string
          brand_id: string
          created_at?: string | null
          expires_at?: string | null
          granted_by?: string | null
          id?: string
          is_active?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          access_level?: string
          brand_id?: string
          created_at?: string | null
          expires_at?: string | null
          granted_by?: string | null
          id?: string
          is_active?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "brand_access_grants_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brand_access_grants_granted_by_fkey"
            columns: ["granted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brand_access_grants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      brands: {
        Row: {
          categories: string[] | null
          company_id: string | null
          created_at: string
          hero_products: string[] | null
          id: string
          logo_url: string | null
          markets: string[] | null
          name: string
          social_handles: Json | null
          updated_at: string
          website: string | null
        }
        Insert: {
          categories?: string[] | null
          company_id?: string | null
          created_at?: string
          hero_products?: string[] | null
          id?: string
          logo_url?: string | null
          markets?: string[] | null
          name: string
          social_handles?: Json | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          categories?: string[] | null
          company_id?: string | null
          created_at?: string
          hero_products?: string[] | null
          id?: string
          logo_url?: string | null
          markets?: string[] | null
          name?: string
          social_handles?: Json | null
          updated_at?: string
          website?: string | null
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
      campaign_channel_configs: {
        Row: {
          budget: number | null
          buying_model_id: string | null
          campaign_id: string
          channel_id: string
          created_at: string | null
          id: string
          objective_id: string | null
          targeting: Json | null
          updated_at: string | null
        }
        Insert: {
          budget?: number | null
          buying_model_id?: string | null
          campaign_id: string
          channel_id: string
          created_at?: string | null
          id?: string
          objective_id?: string | null
          targeting?: Json | null
          updated_at?: string | null
        }
        Update: {
          budget?: number | null
          buying_model_id?: string | null
          campaign_id?: string
          channel_id?: string
          created_at?: string | null
          id?: string
          objective_id?: string | null
          targeting?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaign_channel_configs_buying_model_id_fkey"
            columns: ["buying_model_id"]
            isOneToOne: false
            referencedRelation: "buying_models"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_channel_configs_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_channel_configs_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "channels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_channel_configs_objective_id_fkey"
            columns: ["objective_id"]
            isOneToOne: false
            referencedRelation: "objectives"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_service_assignments: {
        Row: {
          allocated_budget: number | null
          campaign_id: string
          created_at: string | null
          deliverables: string[] | null
          id: string
          responsible_team: string | null
          service_id: string
          status: string
          updated_at: string | null
        }
        Insert: {
          allocated_budget?: number | null
          campaign_id: string
          created_at?: string | null
          deliverables?: string[] | null
          id?: string
          responsible_team?: string | null
          service_id: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          allocated_budget?: number | null
          campaign_id?: string
          created_at?: string | null
          deliverables?: string[] | null
          id?: string
          responsible_team?: string | null
          service_id?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaign_service_assignments_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_service_assignments_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "campaign_services"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_service_categories: {
        Row: {
          code: string
          created_at: string | null
          description: string | null
          display_order: number
          icon_name: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          description?: string | null
          display_order?: number
          icon_name?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          description?: string | null
          display_order?: number
          icon_name?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      campaign_services: {
        Row: {
          category_id: string
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          category_id: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          category_id?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaign_services_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "campaign_service_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_types: {
        Row: {
          created_at: string | null
          description: string | null
          icon_name: string | null
          id: string
          is_active: boolean | null
          name: string
          type_enum: Database["public"]["Enums"]["campaign_type_enum"]
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          icon_name?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          type_enum: Database["public"]["Enums"]["campaign_type_enum"]
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          icon_name?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          type_enum?: Database["public"]["Enums"]["campaign_type_enum"]
          updated_at?: string | null
        }
        Relationships: []
      }
      campaigns: {
        Row: {
          brand_id: string
          buying_model_id: string | null
          campaign_type_id: string | null
          channel_id: string
          channel_ids: string[] | null
          cost_idr: number | null
          created_at: string
          created_by: string
          end_date: string
          exchange_rate: number | null
          funnel_type: Database["public"]["Enums"]["funnel_type"]
          id: string
          kpi_target: number | null
          markets: string[] | null
          markup_percent: number | null
          metadata: Json | null
          name: string
          objective_id: string | null
          primary_kpi: string | null
          product_id: string | null
          secondary_kpi: string | null
          services: string[] | null
          start_date: string
          status: Database["public"]["Enums"]["campaign_status"]
          updated_at: string
        }
        Insert: {
          brand_id: string
          buying_model_id?: string | null
          campaign_type_id?: string | null
          channel_id: string
          channel_ids?: string[] | null
          cost_idr?: number | null
          created_at?: string
          created_by: string
          end_date: string
          exchange_rate?: number | null
          funnel_type: Database["public"]["Enums"]["funnel_type"]
          id?: string
          kpi_target?: number | null
          markets?: string[] | null
          markup_percent?: number | null
          metadata?: Json | null
          name: string
          objective_id?: string | null
          primary_kpi?: string | null
          product_id?: string | null
          secondary_kpi?: string | null
          services?: string[] | null
          start_date: string
          status?: Database["public"]["Enums"]["campaign_status"]
          updated_at?: string
        }
        Update: {
          brand_id?: string
          buying_model_id?: string | null
          campaign_type_id?: string | null
          channel_id?: string
          channel_ids?: string[] | null
          cost_idr?: number | null
          created_at?: string
          created_by?: string
          end_date?: string
          exchange_rate?: number | null
          funnel_type?: Database["public"]["Enums"]["funnel_type"]
          id?: string
          kpi_target?: number | null
          markets?: string[] | null
          markup_percent?: number | null
          metadata?: Json | null
          name?: string
          objective_id?: string | null
          primary_kpi?: string | null
          product_id?: string | null
          secondary_kpi?: string | null
          services?: string[] | null
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
            foreignKeyName: "campaigns_campaign_type_id_fkey"
            columns: ["campaign_type_id"]
            isOneToOne: false
            referencedRelation: "campaign_types"
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
      channel_buying_models: {
        Row: {
          buying_model_id: string
          channel_id: string
          created_at: string | null
          id: string
        }
        Insert: {
          buying_model_id: string
          channel_id: string
          created_at?: string | null
          id?: string
        }
        Update: {
          buying_model_id?: string
          channel_id?: string
          created_at?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "channel_buying_models_buying_model_id_fkey"
            columns: ["buying_model_id"]
            isOneToOne: false
            referencedRelation: "buying_models"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "channel_buying_models_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "channels"
            referencedColumns: ["id"]
          },
        ]
      }
      channel_categories: {
        Row: {
          brand_color: string | null
          created_at: string | null
          icon_url: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          brand_color?: string | null
          created_at?: string | null
          icon_url?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          brand_color?: string | null
          created_at?: string | null
          icon_url?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      channel_metrics: {
        Row: {
          channel_id: string
          created_at: string | null
          id: string
          is_primary: boolean | null
          metric_id: string
        }
        Insert: {
          channel_id: string
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          metric_id: string
        }
        Update: {
          channel_id?: string
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          metric_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "channel_metrics_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "channels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "channel_metrics_metric_id_fkey"
            columns: ["metric_id"]
            isOneToOne: false
            referencedRelation: "metric_definitions"
            referencedColumns: ["id"]
          },
        ]
      }
      channel_objectives: {
        Row: {
          channel_id: string
          created_at: string | null
          id: string
          objective_id: string
        }
        Insert: {
          channel_id: string
          created_at?: string | null
          id?: string
          objective_id: string
        }
        Update: {
          channel_id?: string
          created_at?: string | null
          id?: string
          objective_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "channel_objectives_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "channels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "channel_objectives_objective_id_fkey"
            columns: ["objective_id"]
            isOneToOne: false
            referencedRelation: "objectives"
            referencedColumns: ["id"]
          },
        ]
      }
      channels: {
        Row: {
          brand_color: string | null
          channel_category_id: string | null
          channel_type: Database["public"]["Enums"]["channel_type"]
          created_at: string
          display_order: number | null
          icon_url: string | null
          id: string
          name: string
          parent_channel_id: string | null
          updated_at: string | null
        }
        Insert: {
          brand_color?: string | null
          channel_category_id?: string | null
          channel_type: Database["public"]["Enums"]["channel_type"]
          created_at?: string
          display_order?: number | null
          icon_url?: string | null
          id?: string
          name: string
          parent_channel_id?: string | null
          updated_at?: string | null
        }
        Update: {
          brand_color?: string | null
          channel_category_id?: string | null
          channel_type?: Database["public"]["Enums"]["channel_type"]
          created_at?: string
          display_order?: number | null
          icon_url?: string | null
          id?: string
          name?: string
          parent_channel_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "channels_channel_category_id_fkey"
            columns: ["channel_category_id"]
            isOneToOne: false
            referencedRelation: "channel_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "channels_parent_channel_id_fkey"
            columns: ["parent_channel_id"]
            isOneToOne: false
            referencedRelation: "channels"
            referencedColumns: ["id"]
          },
        ]
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
      creatives: {
        Row: {
          campaign_id: string
          created_at: string | null
          cta_text: string | null
          description: string | null
          display_url: string | null
          headline: string | null
          id: string
          image_url: string | null
          is_boosted: boolean | null
          is_collaboration: boolean | null
          metrics: Json | null
          name: string
          placement_id: string | null
          source: string
          storage_path: string | null
          updated_at: string | null
          video_url: string | null
        }
        Insert: {
          campaign_id: string
          created_at?: string | null
          cta_text?: string | null
          description?: string | null
          display_url?: string | null
          headline?: string | null
          id?: string
          image_url?: string | null
          is_boosted?: boolean | null
          is_collaboration?: boolean | null
          metrics?: Json | null
          name: string
          placement_id?: string | null
          source?: string
          storage_path?: string | null
          updated_at?: string | null
          video_url?: string | null
        }
        Update: {
          campaign_id?: string
          created_at?: string | null
          cta_text?: string | null
          description?: string | null
          display_url?: string | null
          headline?: string | null
          id?: string
          image_url?: string | null
          is_boosted?: boolean | null
          is_collaboration?: boolean | null
          metrics?: Json | null
          name?: string
          placement_id?: string | null
          source?: string
          storage_path?: string | null
          updated_at?: string | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "creatives_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "creatives_placement_id_fkey"
            columns: ["placement_id"]
            isOneToOne: false
            referencedRelation: "placements"
            referencedColumns: ["id"]
          },
        ]
      }
      data_source_mappings: {
        Row: {
          cell_range: string
          created_at: string
          data_source_id: string
          id: string
          is_active: boolean | null
          metric_key: string
          sheet_tab: string | null
          transform_type: string | null
          updated_at: string
        }
        Insert: {
          cell_range: string
          created_at?: string
          data_source_id: string
          id?: string
          is_active?: boolean | null
          metric_key: string
          sheet_tab?: string | null
          transform_type?: string | null
          updated_at?: string
        }
        Update: {
          cell_range?: string
          created_at?: string
          data_source_id?: string
          id?: string
          is_active?: boolean | null
          metric_key?: string
          sheet_tab?: string | null
          transform_type?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "data_source_mappings_data_source_id_fkey"
            columns: ["data_source_id"]
            isOneToOne: false
            referencedRelation: "data_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      data_sources: {
        Row: {
          brand_id: string | null
          campaign_id: string | null
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean | null
          last_synced_at: string | null
          name: string
          sheet_id: string | null
          sheet_name: string | null
          sheet_url: string | null
          source_type: string
          sync_frequency: string | null
          updated_at: string
        }
        Insert: {
          brand_id?: string | null
          campaign_id?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          last_synced_at?: string | null
          name: string
          sheet_id?: string | null
          sheet_name?: string | null
          sheet_url?: string | null
          source_type?: string
          sync_frequency?: string | null
          updated_at?: string
        }
        Update: {
          brand_id?: string | null
          campaign_id?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          last_synced_at?: string | null
          name?: string
          sheet_id?: string | null
          sheet_name?: string | null
          sheet_url?: string | null
          source_type?: string
          sync_frequency?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "data_sources_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "data_sources_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "data_sources_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      departments: {
        Row: {
          code: string
          created_at: string | null
          description: string | null
          display_order: number | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
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
      feature_permissions: {
        Row: {
          can_create: boolean | null
          can_delete: boolean | null
          can_edit: boolean | null
          can_export: boolean | null
          can_view: boolean | null
          created_at: string | null
          custom_rules: Json | null
          feature_id: string
          id: string
          job_title_id: string
          updated_at: string | null
        }
        Insert: {
          can_create?: boolean | null
          can_delete?: boolean | null
          can_edit?: boolean | null
          can_export?: boolean | null
          can_view?: boolean | null
          created_at?: string | null
          custom_rules?: Json | null
          feature_id: string
          id?: string
          job_title_id: string
          updated_at?: string | null
        }
        Update: {
          can_create?: boolean | null
          can_delete?: boolean | null
          can_edit?: boolean | null
          can_export?: boolean | null
          can_view?: boolean | null
          created_at?: string | null
          custom_rules?: Json | null
          feature_id?: string
          id?: string
          job_title_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "feature_permissions_feature_id_fkey"
            columns: ["feature_id"]
            isOneToOne: false
            referencedRelation: "features"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feature_permissions_job_title_id_fkey"
            columns: ["job_title_id"]
            isOneToOne: false
            referencedRelation: "job_titles"
            referencedColumns: ["id"]
          },
        ]
      }
      features: {
        Row: {
          code: string
          created_at: string | null
          description: string | null
          display_order: number | null
          feature_type: string | null
          icon_name: string | null
          id: string
          is_active: boolean | null
          name: string
          parent_id: string | null
          route_path: string | null
          updated_at: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          feature_type?: string | null
          icon_name?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          parent_id?: string | null
          route_path?: string | null
          updated_at?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          feature_type?: string | null
          icon_name?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          parent_id?: string | null
          route_path?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "features_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "features"
            referencedColumns: ["id"]
          },
        ]
      }
      job_titles: {
        Row: {
          code: string
          created_at: string | null
          department_id: string | null
          description: string | null
          display_order: number | null
          id: string
          is_active: boolean | null
          name: string
          seniority_level: number | null
          updated_at: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          department_id?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          name: string
          seniority_level?: number | null
          updated_at?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          department_id?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          name?: string
          seniority_level?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_titles_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      landing_features: {
        Row: {
          created_at: string
          description: string
          display_order: number
          icon_name: string
          id: string
          is_active: boolean
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          display_order?: number
          icon_name: string
          id?: string
          is_active?: boolean
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          display_order?: number
          icon_name?: string
          id?: string
          is_active?: boolean
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      landing_sections: {
        Row: {
          content: Json
          created_at: string
          display_order: number
          id: string
          is_active: boolean
          section_key: string
          updated_at: string
        }
        Insert: {
          content: Json
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          section_key: string
          updated_at?: string
        }
        Update: {
          content?: Json
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          section_key?: string
          updated_at?: string
        }
        Relationships: []
      }
      media_outlets: {
        Row: {
          average_monthly_visits: number
          average_page_views_per_article: number
          created_at: string | null
          ecpm: number
          id: string
          is_active: boolean | null
          name: string
          tier: number
          updated_at: string | null
        }
        Insert: {
          average_monthly_visits?: number
          average_page_views_per_article?: number
          created_at?: string | null
          ecpm?: number
          id?: string
          is_active?: boolean | null
          name: string
          tier: number
          updated_at?: string | null
        }
        Update: {
          average_monthly_visits?: number
          average_page_views_per_article?: number
          created_at?: string | null
          ecpm?: number
          id?: string
          is_active?: boolean | null
          name?: string
          tier?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      metric_definitions: {
        Row: {
          aggregation_method: string | null
          category: string
          created_at: string | null
          data_type: string | null
          description: string | null
          display_order: number | null
          formula: string | null
          icon_name: string | null
          id: string
          is_active: boolean | null
          is_system: boolean | null
          key: string
          name: string
          updated_at: string | null
        }
        Insert: {
          aggregation_method?: string | null
          category: string
          created_at?: string | null
          data_type?: string | null
          description?: string | null
          display_order?: number | null
          formula?: string | null
          icon_name?: string | null
          id?: string
          is_active?: boolean | null
          is_system?: boolean | null
          key: string
          name: string
          updated_at?: string | null
        }
        Update: {
          aggregation_method?: string | null
          category?: string
          created_at?: string | null
          data_type?: string | null
          description?: string | null
          display_order?: number | null
          formula?: string | null
          icon_name?: string | null
          id?: string
          is_active?: boolean | null
          is_system?: boolean | null
          key?: string
          name?: string
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
      placements: {
        Row: {
          aspect_ratio: string | null
          channel_id: string
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          mock_type: Database["public"]["Enums"]["placement_mock_type"]
          name: string
          updated_at: string | null
        }
        Insert: {
          aspect_ratio?: string | null
          channel_id: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          mock_type: Database["public"]["Enums"]["placement_mock_type"]
          name: string
          updated_at?: string | null
        }
        Update: {
          aspect_ratio?: string | null
          channel_id?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          mock_type?: Database["public"]["Enums"]["placement_mock_type"]
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "placements_channel_id_fkey"
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
      pr_settings: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          setting_key: string
          setting_value: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          setting_key: string
          setting_value: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          setting_key?: string
          setting_value?: number
          updated_at?: string | null
        }
        Relationships: []
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
          address_line1: string | null
          address_line2: string | null
          bio: string | null
          city: string | null
          company_id: string | null
          company_name: string | null
          country: string | null
          created_at: string
          date_of_birth: string | null
          email: string
          gender: string | null
          id: string
          industry: string | null
          job_title: string | null
          language_preference: string | null
          linkedin_url: string | null
          name: string
          phone_number: string | null
          postal_code: string | null
          profile_picture_url: string | null
          state: string | null
          timezone: string | null
          updated_at: string
          username: string | null
          website_url: string | null
        }
        Insert: {
          address_line1?: string | null
          address_line2?: string | null
          bio?: string | null
          city?: string | null
          company_id?: string | null
          company_name?: string | null
          country?: string | null
          created_at?: string
          date_of_birth?: string | null
          email: string
          gender?: string | null
          id: string
          industry?: string | null
          job_title?: string | null
          language_preference?: string | null
          linkedin_url?: string | null
          name: string
          phone_number?: string | null
          postal_code?: string | null
          profile_picture_url?: string | null
          state?: string | null
          timezone?: string | null
          updated_at?: string
          username?: string | null
          website_url?: string | null
        }
        Update: {
          address_line1?: string | null
          address_line2?: string | null
          bio?: string | null
          city?: string | null
          company_id?: string | null
          company_name?: string | null
          country?: string | null
          created_at?: string
          date_of_birth?: string | null
          email?: string
          gender?: string | null
          id?: string
          industry?: string | null
          job_title?: string | null
          language_preference?: string | null
          linkedin_url?: string | null
          name?: string
          phone_number?: string | null
          postal_code?: string | null
          profile_picture_url?: string | null
          state?: string | null
          timezone?: string | null
          updated_at?: string
          username?: string | null
          website_url?: string | null
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
      service_types: {
        Row: {
          created_at: string | null
          description: string | null
          icon_name: string | null
          id: string
          is_active: boolean | null
          name: string
          type_enum: Database["public"]["Enums"]["service_type_enum"]
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          icon_name?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          type_enum: Database["public"]["Enums"]["service_type_enum"]
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          icon_name?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          type_enum?: Database["public"]["Enums"]["service_type_enum"]
          updated_at?: string | null
        }
        Relationships: []
      }
      site_images: {
        Row: {
          alt_text: string | null
          created_at: string
          file_size: number | null
          height: number | null
          id: string
          name: string
          storage_path: string
          updated_at: string
          url: string
          usage_location: string | null
          width: number | null
        }
        Insert: {
          alt_text?: string | null
          created_at?: string
          file_size?: number | null
          height?: number | null
          id?: string
          name: string
          storage_path: string
          updated_at?: string
          url: string
          usage_location?: string | null
          width?: number | null
        }
        Update: {
          alt_text?: string | null
          created_at?: string
          file_size?: number | null
          height?: number | null
          id?: string
          name?: string
          storage_path?: string
          updated_at?: string
          url?: string
          usage_location?: string | null
          width?: number | null
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          id?: string
          key: string
          updated_at?: string
          value: Json
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          key?: string
          updated_at?: string
          value?: Json
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
      user_job_assignments: {
        Row: {
          assigned_by: string | null
          created_at: string | null
          id: string
          is_primary: boolean | null
          job_title_id: string | null
          updated_at: string | null
          user_id: string
          user_type: Database["public"]["Enums"]["user_type_enum"]
        }
        Insert: {
          assigned_by?: string | null
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          job_title_id?: string | null
          updated_at?: string | null
          user_id: string
          user_type?: Database["public"]["Enums"]["user_type_enum"]
        }
        Update: {
          assigned_by?: string | null
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          job_title_id?: string | null
          updated_at?: string | null
          user_id?: string
          user_type?: Database["public"]["Enums"]["user_type_enum"]
        }
        Relationships: [
          {
            foreignKeyName: "user_job_assignments_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_job_assignments_job_title_id_fkey"
            columns: ["job_title_id"]
            isOneToOne: false
            referencedRelation: "job_titles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_job_assignments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
      can_access_brand: {
        Args: { _access_level?: string; _brand_id: string; _user_id: string }
        Returns: boolean
      }
      get_user_accessible_features: {
        Args: { _user_id: string }
        Returns: {
          can_create: boolean
          can_delete: boolean
          can_edit: boolean
          can_export: boolean
          can_view: boolean
          feature_code: string
          feature_id: string
          feature_name: string
        }[]
      }
      get_user_type: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["user_type_enum"]
      }
      has_feature_permission: {
        Args: { _feature_code: string; _permission: string; _user_id: string }
        Returns: boolean
      }
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
      campaign_type_enum:
        | "Branding.Brand"
        | "Branding.Category"
        | "Branding.Product"
        | "Performance.Product"
      channel_type:
        | "Social"
        | "Programmatic"
        | "Display"
        | "PR"
        | "Email"
        | "Owned"
      engagement_level: "Low" | "Moderate" | "High" | "Viral"
      funnel_type: "TOP" | "MID" | "BOTTOM"
      metric_period_enum: "Daily" | "Weekly" | "Monthly" | "CampaignToDate"
      metric_source_enum: "GoogleSheet" | "API" | "Manual"
      placement_mock_type:
        | "MobileFeedMock"
        | "StoryMock"
        | "ReelsMock"
        | "InStreamMock"
        | "BillboardMock"
        | "SearchAdMock"
        | "DisplayAdMock"
      sentiment_type: "Positive" | "Neutral" | "Negative"
      service_type_enum:
        | "SocialMediaManagement"
        | "PaidMediaBuying"
        | "InfluencerMarketing"
        | "KOLManagement"
        | "BrandActivation"
        | "ProgrammaticDisplay"
        | "ProgrammaticSocial"
        | "RetailMedia"
        | "SEO"
        | "SEM"
        | "CRO"
        | "AnalyticsAndReporting"
      user_type_enum: "agency" | "client" | "guest"
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
      campaign_type_enum: [
        "Branding.Brand",
        "Branding.Category",
        "Branding.Product",
        "Performance.Product",
      ],
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
      metric_period_enum: ["Daily", "Weekly", "Monthly", "CampaignToDate"],
      metric_source_enum: ["GoogleSheet", "API", "Manual"],
      placement_mock_type: [
        "MobileFeedMock",
        "StoryMock",
        "ReelsMock",
        "InStreamMock",
        "BillboardMock",
        "SearchAdMock",
        "DisplayAdMock",
      ],
      sentiment_type: ["Positive", "Neutral", "Negative"],
      service_type_enum: [
        "SocialMediaManagement",
        "PaidMediaBuying",
        "InfluencerMarketing",
        "KOLManagement",
        "BrandActivation",
        "ProgrammaticDisplay",
        "ProgrammaticSocial",
        "RetailMedia",
        "SEO",
        "SEM",
        "CRO",
        "AnalyticsAndReporting",
      ],
      user_type_enum: ["agency", "client", "guest"],
    },
  },
} as const
