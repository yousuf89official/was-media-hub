-- =============================================
-- WAS MEDIA HUB - COMPLETE DATABASE SCHEMA
-- Generated: 2025-12-01
-- PostgreSQL / Supabase Compatible
-- =============================================

-- =============================================
-- SECTION 1: ENUM TYPES
-- =============================================

CREATE TYPE public.app_role AS ENUM ('MasterAdmin', 'Director', 'Account', 'Client');

CREATE TYPE public.user_type_enum AS ENUM ('agency', 'client', 'guest');

CREATE TYPE public.channel_type AS ENUM ('Social', 'Programmatic', 'Display', 'PR', 'Email', 'Owned');

CREATE TYPE public.campaign_status AS ENUM ('draft', 'running', 'finished');

CREATE TYPE public.campaign_type_enum AS ENUM ('Branding.Brand', 'Branding.Category', 'Branding.Product', 'Performance.Product');

CREATE TYPE public.service_type_enum AS ENUM (
  'SocialMediaManagement', 'PaidMediaBuying', 'InfluencerMarketing', 'KOLManagement',
  'BrandActivation', 'ProgrammaticDisplay', 'ProgrammaticSocial', 'RetailMedia',
  'SEO', 'SEM', 'CRO', 'AnalyticsAndReporting'
);

CREATE TYPE public.funnel_type AS ENUM ('TOP', 'MID', 'BOTTOM');

CREATE TYPE public.engagement_level AS ENUM ('Low', 'Moderate', 'High', 'Viral');

CREATE TYPE public.sentiment_type AS ENUM ('Positive', 'Neutral', 'Negative');

CREATE TYPE public.placement_mock_type AS ENUM (
  'MobileFeedMock', 'StoryMock', 'ReelsMock', 'InStreamMock',
  'BillboardMock', 'SearchAdMock', 'DisplayAdMock'
);

CREATE TYPE public.metric_period_enum AS ENUM ('Daily', 'Weekly', 'Monthly', 'CampaignToDate');

CREATE TYPE public.metric_source_enum AS ENUM ('GoogleSheet', 'API', 'Manual');

-- =============================================
-- SECTION 2: SECURITY FUNCTIONS
-- =============================================

-- Function to check if user has a specific role
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Function to get user type
CREATE OR REPLACE FUNCTION public.get_user_type(_user_id uuid)
RETURNS user_type_enum
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT user_type FROM public.user_job_assignments WHERE user_id = _user_id),
    'guest'::user_type_enum
  )
$$;

-- Function to check feature permissions
CREATE OR REPLACE FUNCTION public.has_feature_permission(_user_id uuid, _feature_code text, _permission text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_job_assignments uja
    JOIN public.feature_permissions fp ON fp.job_title_id = uja.job_title_id
    JOIN public.features f ON f.id = fp.feature_id
    WHERE uja.user_id = _user_id
      AND f.code = _feature_code
      AND f.is_active = true
      AND (
        (_permission = 'view' AND fp.can_view = true) OR
        (_permission = 'create' AND fp.can_create = true) OR
        (_permission = 'edit' AND fp.can_edit = true) OR
        (_permission = 'delete' AND fp.can_delete = true) OR
        (_permission = 'export' AND fp.can_export = true)
      )
  )
  OR has_role(_user_id, 'MasterAdmin')
$$;

-- Function to check brand access
CREATE OR REPLACE FUNCTION public.can_access_brand(_user_id uuid, _brand_id uuid, _access_level text DEFAULT 'view')
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    (get_user_type(_user_id) = 'agency')
    OR has_role(_user_id, 'MasterAdmin')
    OR has_role(_user_id, 'Director')
    OR has_role(_user_id, 'Account')
    OR EXISTS (
      SELECT 1 FROM public.brand_access_grants bag
      WHERE bag.user_id = _user_id
        AND bag.brand_id = _brand_id
        AND bag.is_active = true
        AND (bag.expires_at IS NULL OR bag.expires_at > now())
        AND (
          (_access_level = 'view') OR
          (_access_level = 'edit' AND bag.access_level IN ('edit', 'admin')) OR
          (_access_level = 'admin' AND bag.access_level = 'admin')
        )
    )
$$;

-- Function to get user accessible features
CREATE OR REPLACE FUNCTION public.get_user_accessible_features(_user_id uuid)
RETURNS TABLE(
  feature_id uuid,
  feature_code text,
  feature_name text,
  can_view boolean,
  can_create boolean,
  can_edit boolean,
  can_delete boolean,
  can_export boolean
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    f.id,
    f.code,
    f.name,
    fp.can_view,
    fp.can_create,
    fp.can_edit,
    fp.can_delete,
    fp.can_export
  FROM public.user_job_assignments uja
  JOIN public.feature_permissions fp ON fp.job_title_id = uja.job_title_id
  JOIN public.features f ON f.id = fp.feature_id
  WHERE uja.user_id = _user_id
    AND f.is_active = true
    AND fp.can_view = true
$$;

-- Function to update updated_at column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_count INTEGER;
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email)
  )
  ON CONFLICT (id) DO UPDATE 
  SET 
    email = EXCLUDED.email,
    name = COALESCE(NEW.raw_user_meta_data->>'name', profiles.name),
    updated_at = NOW();
  
  SELECT COUNT(*) INTO user_count FROM public.profiles;
  
  IF user_count = 1 THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'MasterAdmin')
    ON CONFLICT (user_id, role) DO NOTHING;
  ELSE
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'Account')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;

-- =============================================
-- SECTION 3: USER & ACCESS CONTROL TABLES
-- =============================================

-- Profiles table (extends auth.users)
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  name text NOT NULL,
  username text UNIQUE,
  phone_number text,
  profile_picture_url text,
  bio text,
  gender text,
  date_of_birth date,
  address_line1 text,
  address_line2 text,
  city text,
  state text,
  postal_code text,
  country text,
  timezone text,
  language_preference text DEFAULT 'en',
  company_id uuid REFERENCES public.companies(id),
  company_name text,
  job_title text,
  industry text,
  website_url text,
  linkedin_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- User roles table
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Departments table
CREATE TABLE public.departments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text NOT NULL UNIQUE,
  description text,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Job titles table
CREATE TABLE public.job_titles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text NOT NULL UNIQUE,
  description text,
  department_id uuid REFERENCES public.departments(id),
  seniority_level integer DEFAULT 1,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Features table
CREATE TABLE public.features (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text NOT NULL UNIQUE,
  description text,
  feature_type text DEFAULT 'menu',
  icon_name text,
  route_path text,
  parent_id uuid REFERENCES public.features(id),
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Feature permissions table
CREATE TABLE public.feature_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_title_id uuid NOT NULL REFERENCES public.job_titles(id) ON DELETE CASCADE,
  feature_id uuid NOT NULL REFERENCES public.features(id) ON DELETE CASCADE,
  can_view boolean DEFAULT false,
  can_create boolean DEFAULT false,
  can_edit boolean DEFAULT false,
  can_delete boolean DEFAULT false,
  can_export boolean DEFAULT false,
  custom_rules jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (job_title_id, feature_id)
);

-- User job assignments table
CREATE TABLE public.user_job_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_type user_type_enum NOT NULL DEFAULT 'guest',
  job_title_id uuid REFERENCES public.job_titles(id),
  is_primary boolean DEFAULT true,
  assigned_by uuid REFERENCES public.profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Brand access grants table
CREATE TABLE public.brand_access_grants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  brand_id uuid NOT NULL REFERENCES public.brands(id) ON DELETE CASCADE,
  access_level text NOT NULL DEFAULT 'view',
  granted_by uuid REFERENCES public.profiles(id),
  expires_at timestamptz,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (user_id, brand_id)
);

-- User activity logs table
CREATE TABLE public.user_activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id),
  activity_type text NOT NULL,
  page_path text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- =============================================
-- SECTION 4: BRAND & COMPANY TABLES
-- =============================================

-- Companies table
CREATE TABLE public.companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  contact_email text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Brands table
CREATE TABLE public.brands (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  company_id uuid REFERENCES public.companies(id),
  logo_url text,
  website text,
  markets text[] DEFAULT '{}',
  categories text[] DEFAULT '{}',
  hero_products text[] DEFAULT '{}',
  social_handles jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Products table
CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id uuid NOT NULL REFERENCES public.brands(id) ON DELETE CASCADE,
  name text NOT NULL,
  category text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- =============================================
-- SECTION 5: CHANNEL & PLATFORM TABLES
-- =============================================

-- Channel categories table
CREATE TABLE public.channel_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  icon_url text,
  brand_color text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Channels table
CREATE TABLE public.channels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  channel_type channel_type NOT NULL,
  channel_category_id uuid REFERENCES public.channel_categories(id),
  parent_channel_id uuid REFERENCES public.channels(id),
  icon_url text,
  brand_color text,
  display_order integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Objectives table
CREATE TABLE public.objectives (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  channel_id uuid REFERENCES public.channels(id),
  funnel_type funnel_type,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Buying models table
CREATE TABLE public.buying_models (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  channel_id uuid REFERENCES public.channels(id),
  objective_id uuid REFERENCES public.objectives(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Channel objectives junction table
CREATE TABLE public.channel_objectives (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id uuid NOT NULL REFERENCES public.channels(id) ON DELETE CASCADE,
  objective_id uuid NOT NULL REFERENCES public.objectives(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE (channel_id, objective_id)
);

-- Channel buying models junction table
CREATE TABLE public.channel_buying_models (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id uuid NOT NULL REFERENCES public.channels(id) ON DELETE CASCADE,
  buying_model_id uuid NOT NULL REFERENCES public.buying_models(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE (channel_id, buying_model_id)
);

-- Placements table
CREATE TABLE public.placements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id uuid NOT NULL REFERENCES public.channels(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  aspect_ratio text,
  mock_type placement_mock_type NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Metric definitions table
CREATE TABLE public.metric_definitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  category text NOT NULL,
  data_type text DEFAULT 'number',
  formula text,
  aggregation_method text,
  icon_name text,
  display_order integer DEFAULT 0,
  is_system boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Channel metrics junction table
CREATE TABLE public.channel_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id uuid NOT NULL REFERENCES public.channels(id) ON DELETE CASCADE,
  metric_id uuid NOT NULL REFERENCES public.metric_definitions(id) ON DELETE CASCADE,
  is_primary boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE (channel_id, metric_id)
);

-- =============================================
-- SECTION 6: CAMPAIGN TABLES
-- =============================================

-- Campaign types table
CREATE TABLE public.campaign_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type_enum campaign_type_enum NOT NULL,
  description text,
  icon_name text DEFAULT 'Target',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Service types table
CREATE TABLE public.service_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type_enum service_type_enum NOT NULL,
  description text,
  icon_name text DEFAULT 'Settings',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Campaign service categories table
CREATE TABLE public.campaign_service_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  icon_name text DEFAULT 'Settings',
  display_order integer NOT NULL DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Campaign services table
CREATE TABLE public.campaign_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid NOT NULL REFERENCES public.campaign_service_categories(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Campaigns table
CREATE TABLE public.campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  brand_id uuid NOT NULL REFERENCES public.brands(id) ON DELETE CASCADE,
  product_id uuid REFERENCES public.products(id),
  channel_id uuid NOT NULL REFERENCES public.channels(id),
  channel_ids uuid[] DEFAULT '{}',
  campaign_type_id uuid REFERENCES public.campaign_types(id),
  funnel_type funnel_type NOT NULL,
  objective_id uuid REFERENCES public.objectives(id),
  buying_model_id uuid REFERENCES public.buying_models(id),
  start_date date NOT NULL,
  end_date date NOT NULL,
  status campaign_status NOT NULL DEFAULT 'draft',
  primary_kpi text,
  secondary_kpi text,
  kpi_target numeric,
  cost_idr numeric DEFAULT 0,
  markup_percent numeric DEFAULT 20,
  exchange_rate numeric DEFAULT 16000,
  services text[] DEFAULT '{}',
  markets text[] DEFAULT '{}',
  metadata jsonb DEFAULT '{}'::jsonb,
  created_by uuid NOT NULL REFERENCES public.profiles(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Campaign channel configs table
CREATE TABLE public.campaign_channel_configs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  channel_id uuid NOT NULL REFERENCES public.channels(id),
  objective_id uuid REFERENCES public.objectives(id),
  buying_model_id uuid REFERENCES public.buying_models(id),
  budget numeric DEFAULT 0,
  targeting jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (campaign_id, channel_id)
);

-- Campaign service assignments table
CREATE TABLE public.campaign_service_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  service_id uuid NOT NULL REFERENCES public.campaign_services(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'planned',
  allocated_budget numeric DEFAULT 0,
  responsible_team text,
  deliverables text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (campaign_id, service_id)
);

-- =============================================
-- SECTION 7: AD SET & CREATIVE TABLES
-- =============================================

-- Ad sets table
CREATE TABLE public.ad_sets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_channel_config_id uuid NOT NULL REFERENCES public.campaign_channel_configs(id) ON DELETE CASCADE,
  name text NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  audience_targeting jsonb DEFAULT '{}'::jsonb,
  placements text[],
  budget numeric DEFAULT 0,
  start_date date,
  end_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Ads table
CREATE TABLE public.ads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ad_set_id uuid NOT NULL REFERENCES public.ad_sets(id) ON DELETE CASCADE,
  name text NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  creative_url text,
  headline text,
  description text,
  cta_text text,
  destination_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Creatives table
CREATE TABLE public.creatives (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  placement_id uuid REFERENCES public.placements(id),
  name text NOT NULL,
  image_url text,
  video_url text,
  headline text,
  description text,
  cta_text text,
  display_url text,
  storage_path text,
  source text NOT NULL DEFAULT 'organic',
  is_collaboration boolean DEFAULT false,
  is_boosted boolean DEFAULT false,
  metrics jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- =============================================
-- SECTION 8: METRICS & ANALYTICS TABLES
-- =============================================

-- Metrics table (daily performance data)
CREATE TABLE public.metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  channel_id uuid NOT NULL REFERENCES public.channels(id),
  date date NOT NULL,
  impressions bigint DEFAULT 0,
  clicks bigint DEFAULT 0,
  engagements bigint DEFAULT 0,
  reach bigint DEFAULT 0,
  video_views bigint DEFAULT 0,
  spend numeric DEFAULT 0,
  followers bigint DEFAULT 0,
  sentiment_score numeric,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create index for metrics queries
CREATE INDEX idx_metrics_campaign_date ON public.metrics(campaign_id, date);
CREATE INDEX idx_metrics_channel_date ON public.metrics(channel_id, date);

-- =============================================
-- SECTION 9: AVE CALCULATOR TABLES
-- =============================================

-- CPM rates table
CREATE TABLE public.cpm_rates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id uuid NOT NULL REFERENCES public.channels(id) ON DELETE CASCADE,
  cpm_value numeric NOT NULL,
  currency text NOT NULL DEFAULT 'IDR',
  effective_from date NOT NULL DEFAULT CURRENT_DATE,
  effective_to date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Platform multipliers table
CREATE TABLE public.platform_multipliers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id uuid NOT NULL UNIQUE REFERENCES public.channels(id) ON DELETE CASCADE,
  multiplier numeric NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Engagement multipliers table
CREATE TABLE public.engagement_multipliers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  level engagement_level NOT NULL UNIQUE,
  multiplier numeric NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Sentiment multipliers table
CREATE TABLE public.sentiment_multipliers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sentiment sentiment_type NOT NULL UNIQUE,
  multiplier numeric NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- PR settings table
CREATE TABLE public.pr_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key text NOT NULL UNIQUE,
  setting_value numeric NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Media outlets table
CREATE TABLE public.media_outlets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  tier integer NOT NULL,
  average_monthly_visits bigint NOT NULL DEFAULT 0,
  average_page_views_per_article integer NOT NULL DEFAULT 0,
  ecpm numeric NOT NULL DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- AVE results table
CREATE TABLE public.ave_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  channels_used text[] NOT NULL,
  base_ave_per_channel jsonb NOT NULL,
  weighted_components jsonb NOT NULL,
  final_ave numeric NOT NULL,
  created_by uuid NOT NULL REFERENCES public.profiles(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- SOV results table
CREATE TABLE public.sov_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  period_start date NOT NULL,
  period_end date NOT NULL,
  share_of_voice_value numeric NOT NULL,
  basis_json jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Calculation logs table
CREATE TABLE public.calculation_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id),
  brand_id uuid REFERENCES public.brands(id),
  campaign_id uuid REFERENCES public.campaigns(id),
  calculation_type text NOT NULL DEFAULT 'AVE',
  inputs jsonb NOT NULL,
  results jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- =============================================
-- SECTION 10: DATA SOURCES TABLES
-- =============================================

-- Data sources table
CREATE TABLE public.data_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  source_type text NOT NULL DEFAULT 'google_sheets',
  brand_id uuid REFERENCES public.brands(id),
  campaign_id uuid REFERENCES public.campaigns(id),
  sheet_id text,
  sheet_url text,
  sheet_name text,
  sync_frequency text DEFAULT 'manual',
  last_synced_at timestamptz,
  is_active boolean DEFAULT true,
  created_by uuid REFERENCES public.profiles(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Data source mappings table
CREATE TABLE public.data_source_mappings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  data_source_id uuid NOT NULL REFERENCES public.data_sources(id) ON DELETE CASCADE,
  metric_key text NOT NULL,
  cell_range text NOT NULL,
  sheet_tab text,
  transform_type text DEFAULT 'none',
  is_active boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- =============================================
-- SECTION 11: LANDING PAGE & SITE TABLES
-- =============================================

-- Landing features table
CREATE TABLE public.landing_features (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  icon_name text NOT NULL,
  display_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Landing sections table
CREATE TABLE public.landing_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_key text NOT NULL UNIQUE,
  content jsonb NOT NULL,
  display_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Site images table
CREATE TABLE public.site_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  storage_path text NOT NULL,
  url text NOT NULL,
  alt_text text,
  usage_location text,
  width integer,
  height integer,
  file_size integer,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Site settings table
CREATE TABLE public.site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  value jsonb NOT NULL,
  category text NOT NULL,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- =============================================
-- SECTION 12: ROW LEVEL SECURITY POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_titles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.features ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_job_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_access_grants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channel_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.objectives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.buying_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channel_objectives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channel_buying_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.placements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.metric_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channel_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_channel_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_service_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creatives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cpm_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_multipliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.engagement_multipliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sentiment_multipliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pr_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_outlets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ave_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sov_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calculation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_source_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.landing_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.landing_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- User roles policies
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id OR has_role(auth.uid(), 'MasterAdmin'));
CREATE POLICY "Admins can manage all roles" ON public.user_roles FOR ALL USING (has_role(auth.uid(), 'MasterAdmin'));

-- Departments policies
CREATE POLICY "Everyone can view departments" ON public.departments FOR SELECT USING (true);
CREATE POLICY "MasterAdmin can manage departments" ON public.departments FOR ALL USING (has_role(auth.uid(), 'MasterAdmin'));

-- Job titles policies
CREATE POLICY "Everyone can view job_titles" ON public.job_titles FOR SELECT USING (true);
CREATE POLICY "MasterAdmin can manage job_titles" ON public.job_titles FOR ALL USING (has_role(auth.uid(), 'MasterAdmin'));

-- Features policies
CREATE POLICY "Everyone can view features" ON public.features FOR SELECT USING (true);
CREATE POLICY "MasterAdmin can manage features" ON public.features FOR ALL USING (has_role(auth.uid(), 'MasterAdmin'));

-- Feature permissions policies
CREATE POLICY "Everyone can view feature_permissions" ON public.feature_permissions FOR SELECT USING (true);
CREATE POLICY "MasterAdmin can manage feature_permissions" ON public.feature_permissions FOR ALL USING (has_role(auth.uid(), 'MasterAdmin'));

-- User job assignments policies
CREATE POLICY "Users can view own job_assignment" ON public.user_job_assignments FOR SELECT USING (auth.uid() = user_id OR has_role(auth.uid(), 'MasterAdmin') OR has_role(auth.uid(), 'Director'));
CREATE POLICY "MasterAdmin can manage job_assignments" ON public.user_job_assignments FOR ALL USING (has_role(auth.uid(), 'MasterAdmin') OR has_role(auth.uid(), 'Director'));

-- Brand access grants policies
CREATE POLICY "Users can view own brand_access" ON public.brand_access_grants FOR SELECT USING (auth.uid() = user_id OR has_role(auth.uid(), 'MasterAdmin') OR has_role(auth.uid(), 'Director') OR has_role(auth.uid(), 'Account'));
CREATE POLICY "Staff can manage brand_access" ON public.brand_access_grants FOR ALL USING (has_role(auth.uid(), 'MasterAdmin') OR has_role(auth.uid(), 'Director') OR has_role(auth.uid(), 'Account'));

-- User activity logs policies
CREATE POLICY "Users can view own activity logs" ON public.user_activity_logs FOR SELECT USING (auth.uid() = user_id OR has_role(auth.uid(), 'MasterAdmin'));
CREATE POLICY "Users can insert own activity logs" ON public.user_activity_logs FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Companies policies
CREATE POLICY "Authenticated users can view companies" ON public.companies FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can manage companies" ON public.companies FOR ALL USING (has_role(auth.uid(), 'MasterAdmin') OR has_role(auth.uid(), 'Director'));

-- Brands policies
CREATE POLICY "Authenticated users can view brands" ON public.brands FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Staff can manage brands" ON public.brands FOR ALL USING (has_role(auth.uid(), 'MasterAdmin') OR has_role(auth.uid(), 'Director') OR has_role(auth.uid(), 'Account'));

-- Products policies
CREATE POLICY "Authenticated users can view products" ON public.products FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Staff can manage products" ON public.products FOR ALL USING (has_role(auth.uid(), 'MasterAdmin') OR has_role(auth.uid(), 'Director') OR has_role(auth.uid(), 'Account'));

-- Channel categories policies
CREATE POLICY "Authenticated users can view channel_categories" ON public.channel_categories FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "MasterAdmin can manage channel_categories" ON public.channel_categories FOR ALL USING (has_role(auth.uid(), 'MasterAdmin'));

-- Channels policies
CREATE POLICY "Authenticated users can view channels" ON public.channels FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can manage channels" ON public.channels FOR ALL USING (has_role(auth.uid(), 'MasterAdmin'));

-- Objectives policies
CREATE POLICY "Authenticated users can view objectives" ON public.objectives FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can manage objectives" ON public.objectives FOR ALL USING (has_role(auth.uid(), 'MasterAdmin'));

-- Buying models policies
CREATE POLICY "Authenticated users can view buying_models" ON public.buying_models FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can manage buying_models" ON public.buying_models FOR ALL USING (has_role(auth.uid(), 'MasterAdmin'));

-- Channel objectives policies
CREATE POLICY "Authenticated users can view channel_objectives" ON public.channel_objectives FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "MasterAdmin can manage channel_objectives" ON public.channel_objectives FOR ALL USING (has_role(auth.uid(), 'MasterAdmin'));

-- Channel buying models policies
CREATE POLICY "Authenticated users can view channel_buying_models" ON public.channel_buying_models FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "MasterAdmin can manage channel_buying_models" ON public.channel_buying_models FOR ALL USING (has_role(auth.uid(), 'MasterAdmin'));

-- Placements policies
CREATE POLICY "Authenticated users can view placements" ON public.placements FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "MasterAdmin can manage placements" ON public.placements FOR ALL USING (has_role(auth.uid(), 'MasterAdmin'));

-- Metric definitions policies
CREATE POLICY "Authenticated users can view metric_definitions" ON public.metric_definitions FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "MasterAdmin can manage metric_definitions" ON public.metric_definitions FOR ALL USING (has_role(auth.uid(), 'MasterAdmin'));

-- Channel metrics policies
CREATE POLICY "Authenticated users can view channel_metrics" ON public.channel_metrics FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "MasterAdmin can manage channel_metrics" ON public.channel_metrics FOR ALL USING (has_role(auth.uid(), 'MasterAdmin'));

-- Campaign types policies
CREATE POLICY "Authenticated users can view campaign_types" ON public.campaign_types FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "MasterAdmin can manage campaign_types" ON public.campaign_types FOR ALL USING (has_role(auth.uid(), 'MasterAdmin'));

-- Service types policies
CREATE POLICY "Authenticated users can view service_types" ON public.service_types FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "MasterAdmin can manage service_types" ON public.service_types FOR ALL USING (has_role(auth.uid(), 'MasterAdmin'));

-- Campaign service categories policies
CREATE POLICY "Authenticated users can view campaign_service_categories" ON public.campaign_service_categories FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "MasterAdmin can manage campaign_service_categories" ON public.campaign_service_categories FOR ALL USING (has_role(auth.uid(), 'MasterAdmin'));

-- Campaign services policies
CREATE POLICY "Authenticated users can view campaign_services" ON public.campaign_services FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "MasterAdmin can manage campaign_services" ON public.campaign_services FOR ALL USING (has_role(auth.uid(), 'MasterAdmin'));

-- Campaigns policies
CREATE POLICY "Authenticated users can view campaigns" ON public.campaigns FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Staff can create campaigns" ON public.campaigns FOR INSERT WITH CHECK (has_role(auth.uid(), 'MasterAdmin') OR has_role(auth.uid(), 'Director') OR has_role(auth.uid(), 'Account'));
CREATE POLICY "Staff can update campaigns" ON public.campaigns FOR UPDATE USING (has_role(auth.uid(), 'MasterAdmin') OR has_role(auth.uid(), 'Director') OR has_role(auth.uid(), 'Account'));
CREATE POLICY "Admins can delete campaigns" ON public.campaigns FOR DELETE USING (has_role(auth.uid(), 'MasterAdmin') OR has_role(auth.uid(), 'Director'));

-- Campaign channel configs policies
CREATE POLICY "Authenticated users can view campaign_channel_configs" ON public.campaign_channel_configs FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Staff can manage campaign_channel_configs" ON public.campaign_channel_configs FOR ALL USING (has_role(auth.uid(), 'MasterAdmin') OR has_role(auth.uid(), 'Director') OR has_role(auth.uid(), 'Account'));

-- Campaign service assignments policies
CREATE POLICY "Authenticated users can view campaign_service_assignments" ON public.campaign_service_assignments FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Staff can manage campaign_service_assignments" ON public.campaign_service_assignments FOR ALL USING (has_role(auth.uid(), 'MasterAdmin') OR has_role(auth.uid(), 'Director') OR has_role(auth.uid(), 'Account'));

-- Ad sets policies
CREATE POLICY "Authenticated users can view ad_sets" ON public.ad_sets FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Staff can manage ad_sets" ON public.ad_sets FOR ALL USING (has_role(auth.uid(), 'MasterAdmin') OR has_role(auth.uid(), 'Director') OR has_role(auth.uid(), 'Account'));

-- Ads policies
CREATE POLICY "Authenticated users can view ads" ON public.ads FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Staff can manage ads" ON public.ads FOR ALL USING (has_role(auth.uid(), 'MasterAdmin') OR has_role(auth.uid(), 'Director') OR has_role(auth.uid(), 'Account'));

-- Creatives policies
CREATE POLICY "Authenticated users can view creatives" ON public.creatives FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Staff can manage creatives" ON public.creatives FOR ALL USING (has_role(auth.uid(), 'MasterAdmin') OR has_role(auth.uid(), 'Director') OR has_role(auth.uid(), 'Account'));

-- Metrics policies
CREATE POLICY "Authenticated users can view metrics" ON public.metrics FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Staff can manage metrics" ON public.metrics FOR ALL USING (has_role(auth.uid(), 'MasterAdmin') OR has_role(auth.uid(), 'Director') OR has_role(auth.uid(), 'Account'));

-- CPM rates policies
CREATE POLICY "Authenticated users can view cpm rates" ON public.cpm_rates FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can manage cpm rates" ON public.cpm_rates FOR ALL USING (has_role(auth.uid(), 'MasterAdmin'));

-- Platform multipliers policies
CREATE POLICY "Authenticated users can view platform multipliers" ON public.platform_multipliers FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can manage platform multipliers" ON public.platform_multipliers FOR ALL USING (has_role(auth.uid(), 'MasterAdmin'));

-- Engagement multipliers policies
CREATE POLICY "Authenticated users can view engagement multipliers" ON public.engagement_multipliers FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can manage engagement multipliers" ON public.engagement_multipliers FOR ALL USING (has_role(auth.uid(), 'MasterAdmin'));

-- Sentiment multipliers policies
CREATE POLICY "Authenticated users can view sentiment multipliers" ON public.sentiment_multipliers FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can manage sentiment multipliers" ON public.sentiment_multipliers FOR ALL USING (has_role(auth.uid(), 'MasterAdmin'));

-- PR settings policies
CREATE POLICY "Authenticated users can view pr settings" ON public.pr_settings FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "MasterAdmin can manage pr settings" ON public.pr_settings FOR ALL USING (has_role(auth.uid(), 'MasterAdmin'));

-- Media outlets policies
CREATE POLICY "Authenticated users can view media_outlets" ON public.media_outlets FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "MasterAdmin can manage media_outlets" ON public.media_outlets FOR ALL USING (has_role(auth.uid(), 'MasterAdmin'));

-- AVE results policies
CREATE POLICY "Authenticated users can view ave results" ON public.ave_results FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Staff can create ave results" ON public.ave_results FOR INSERT WITH CHECK (has_role(auth.uid(), 'MasterAdmin') OR has_role(auth.uid(), 'Director') OR has_role(auth.uid(), 'Account'));

-- SOV results policies
CREATE POLICY "Authenticated users can view sov results" ON public.sov_results FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Staff can create sov results" ON public.sov_results FOR INSERT WITH CHECK (has_role(auth.uid(), 'MasterAdmin') OR has_role(auth.uid(), 'Director') OR has_role(auth.uid(), 'Account'));

-- Calculation logs policies
CREATE POLICY "Users can view own calculation logs" ON public.calculation_logs FOR SELECT USING (auth.uid() = user_id OR has_role(auth.uid(), 'MasterAdmin'));
CREATE POLICY "Users can insert own calculation logs" ON public.calculation_logs FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Data sources policies
CREATE POLICY "Authenticated users can view data_sources" ON public.data_sources FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Staff can manage data_sources" ON public.data_sources FOR ALL USING (has_role(auth.uid(), 'MasterAdmin') OR has_role(auth.uid(), 'Director') OR has_role(auth.uid(), 'Account'));

-- Data source mappings policies
CREATE POLICY "Authenticated users can view data_source_mappings" ON public.data_source_mappings FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Staff can manage data_source_mappings" ON public.data_source_mappings FOR ALL USING (has_role(auth.uid(), 'MasterAdmin') OR has_role(auth.uid(), 'Director') OR has_role(auth.uid(), 'Account'));

-- Landing features policies
CREATE POLICY "Everyone can view landing features" ON public.landing_features FOR SELECT USING (true);
CREATE POLICY "MasterAdmin can manage landing features" ON public.landing_features FOR ALL USING (has_role(auth.uid(), 'MasterAdmin'));

-- Landing sections policies
CREATE POLICY "Everyone can view landing sections" ON public.landing_sections FOR SELECT USING (true);
CREATE POLICY "MasterAdmin can manage landing sections" ON public.landing_sections FOR ALL USING (has_role(auth.uid(), 'MasterAdmin'));

-- Site images policies
CREATE POLICY "Everyone can view site images" ON public.site_images FOR SELECT USING (true);
CREATE POLICY "MasterAdmin can manage site images" ON public.site_images FOR ALL USING (has_role(auth.uid(), 'MasterAdmin'));

-- Site settings policies
CREATE POLICY "Authenticated users can view site_settings" ON public.site_settings FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "MasterAdmin can manage site_settings" ON public.site_settings FOR ALL USING (has_role(auth.uid(), 'MasterAdmin'));

-- =============================================
-- SECTION 13: TRIGGERS
-- =============================================

-- Updated_at triggers for all tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_roles_updated_at BEFORE UPDATE ON public.user_roles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_departments_updated_at BEFORE UPDATE ON public.departments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_job_titles_updated_at BEFORE UPDATE ON public.job_titles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_features_updated_at BEFORE UPDATE ON public.features FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_feature_permissions_updated_at BEFORE UPDATE ON public.feature_permissions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_job_assignments_updated_at BEFORE UPDATE ON public.user_job_assignments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_brand_access_grants_updated_at BEFORE UPDATE ON public.brand_access_grants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON public.companies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_brands_updated_at BEFORE UPDATE ON public.brands FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_channel_categories_updated_at BEFORE UPDATE ON public.channel_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_channels_updated_at BEFORE UPDATE ON public.channels FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_objectives_updated_at BEFORE UPDATE ON public.objectives FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_buying_models_updated_at BEFORE UPDATE ON public.buying_models FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_placements_updated_at BEFORE UPDATE ON public.placements FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_metric_definitions_updated_at BEFORE UPDATE ON public.metric_definitions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_campaign_types_updated_at BEFORE UPDATE ON public.campaign_types FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_service_types_updated_at BEFORE UPDATE ON public.service_types FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_campaign_service_categories_updated_at BEFORE UPDATE ON public.campaign_service_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_campaign_services_updated_at BEFORE UPDATE ON public.campaign_services FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON public.campaigns FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_campaign_channel_configs_updated_at BEFORE UPDATE ON public.campaign_channel_configs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_campaign_service_assignments_updated_at BEFORE UPDATE ON public.campaign_service_assignments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ad_sets_updated_at BEFORE UPDATE ON public.ad_sets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ads_updated_at BEFORE UPDATE ON public.ads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_creatives_updated_at BEFORE UPDATE ON public.creatives FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_metrics_updated_at BEFORE UPDATE ON public.metrics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cpm_rates_updated_at BEFORE UPDATE ON public.cpm_rates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_platform_multipliers_updated_at BEFORE UPDATE ON public.platform_multipliers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_engagement_multipliers_updated_at BEFORE UPDATE ON public.engagement_multipliers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sentiment_multipliers_updated_at BEFORE UPDATE ON public.sentiment_multipliers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pr_settings_updated_at BEFORE UPDATE ON public.pr_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_media_outlets_updated_at BEFORE UPDATE ON public.media_outlets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ave_results_updated_at BEFORE UPDATE ON public.ave_results FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sov_results_updated_at BEFORE UPDATE ON public.sov_results FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_calculation_logs_updated_at BEFORE UPDATE ON public.calculation_logs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_data_sources_updated_at BEFORE UPDATE ON public.data_sources FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_data_source_mappings_updated_at BEFORE UPDATE ON public.data_source_mappings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_landing_features_updated_at BEFORE UPDATE ON public.landing_features FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_landing_sections_updated_at BEFORE UPDATE ON public.landing_sections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_site_images_updated_at BEFORE UPDATE ON public.site_images FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_site_settings_updated_at BEFORE UPDATE ON public.site_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- SECTION 14: SEED DATA
-- =============================================

-- Departments seed data
INSERT INTO public.departments (name, code, description, display_order) VALUES
('Executive & Leadership', 'EXEC', 'C-suite and senior leadership', 1),
('Client Leadership', 'CLIENT_LEAD', 'Client relationship management', 2),
('Strategy & Planning', 'STRATEGY', 'Strategic planning and insights', 3),
('Creative', 'CREATIVE', 'Creative and design team', 4),
('Performance & Digital Ads', 'PERFORMANCE', 'Paid media and performance marketing', 5),
('Social & Content', 'SOCIAL', 'Social media and content creation', 6),
('Technology + Data + Analytics', 'TECH_DATA', 'Technology, data, and analytics', 7),
('Tech & Digital Product', 'TECH_PRODUCT', 'Digital product development', 8),
('Execution & Delivery', 'EXECUTION', 'Project execution and delivery', 9),
('Support Functions', 'SUPPORT', 'Administrative and support roles', 10);

-- Job titles seed data
INSERT INTO public.job_titles (name, code, department_id, seniority_level, display_order) VALUES
('Chief Executive Officer', 'CEO', (SELECT id FROM departments WHERE code = 'EXEC'), 10, 1),
('Chief Marketing Officer', 'CMO', (SELECT id FROM departments WHERE code = 'EXEC'), 9, 2),
('Managing Director', 'MD', (SELECT id FROM departments WHERE code = 'EXEC'), 8, 3),
('Group Account Director', 'GAD', (SELECT id FROM departments WHERE code = 'CLIENT_LEAD'), 7, 1),
('Account Director', 'AD', (SELECT id FROM departments WHERE code = 'CLIENT_LEAD'), 6, 2),
('Senior Account Manager', 'SAM', (SELECT id FROM departments WHERE code = 'CLIENT_LEAD'), 5, 3),
('Account Manager', 'AM', (SELECT id FROM departments WHERE code = 'CLIENT_LEAD'), 4, 4),
('Account Executive', 'AE', (SELECT id FROM departments WHERE code = 'CLIENT_LEAD'), 3, 5),
('Strategy Director', 'SD', (SELECT id FROM departments WHERE code = 'STRATEGY'), 7, 1),
('Senior Strategist', 'SS', (SELECT id FROM departments WHERE code = 'STRATEGY'), 5, 2),
('Strategist', 'STRAT', (SELECT id FROM departments WHERE code = 'STRATEGY'), 4, 3),
('Creative Director', 'CD', (SELECT id FROM departments WHERE code = 'CREATIVE'), 7, 1),
('Senior Art Director', 'SAD', (SELECT id FROM departments WHERE code = 'CREATIVE'), 5, 2),
('Art Director', 'ART_DIR', (SELECT id FROM departments WHERE code = 'CREATIVE'), 4, 3),
('Senior Copywriter', 'SCW', (SELECT id FROM departments WHERE code = 'CREATIVE'), 5, 4),
('Copywriter', 'CW', (SELECT id FROM departments WHERE code = 'CREATIVE'), 4, 5),
('Designer', 'DES', (SELECT id FROM departments WHERE code = 'CREATIVE'), 3, 6),
('Performance Director', 'PD', (SELECT id FROM departments WHERE code = 'PERFORMANCE'), 7, 1),
('Paid Media Manager', 'PMM', (SELECT id FROM departments WHERE code = 'PERFORMANCE'), 5, 2),
('Paid Media Specialist', 'PMS', (SELECT id FROM departments WHERE code = 'PERFORMANCE'), 4, 3),
('Social Media Director', 'SMD', (SELECT id FROM departments WHERE code = 'SOCIAL'), 7, 1),
('Social Media Manager', 'SMM', (SELECT id FROM departments WHERE code = 'SOCIAL'), 5, 2),
('Content Creator', 'CC', (SELECT id FROM departments WHERE code = 'SOCIAL'), 3, 3),
('Data Director', 'DD', (SELECT id FROM departments WHERE code = 'TECH_DATA'), 7, 1),
('Data Analyst', 'DA', (SELECT id FROM departments WHERE code = 'TECH_DATA'), 4, 2),
('Project Manager', 'PM', (SELECT id FROM departments WHERE code = 'EXECUTION'), 5, 1),
('Traffic Manager', 'TM', (SELECT id FROM departments WHERE code = 'EXECUTION'), 4, 2);

-- Features seed data
INSERT INTO public.features (name, code, feature_type, icon_name, route_path, display_order) VALUES
('Dashboard', 'DASHBOARD', 'menu', 'LayoutDashboard', '/dashboard', 1),
('Brands', 'BRANDS', 'menu', 'Building2', '/brands', 2),
('Reports', 'REPORTS', 'menu', 'FileBarChart', '/reports', 3),
('Data Export', 'DATA_EXPORT', 'menu', 'Download', '/data-export', 4),
('AVE Calculator', 'AVE_CALCULATOR', 'menu', 'Calculator', '/ave-calculator', 5),
('Calculation Logs', 'CALCULATION_LOGS', 'menu', 'History', '/calculation-logs', 6),
('Brand & Campaign Management', 'BRAND_CAMPAIGN_MGMT', 'menu', 'Settings', '/brand-campaign-management', 7),
('Content Management', 'CONTENT_MGMT', 'menu', 'FileText', '/content-management', 8),
('User Management', 'USER_MGMT', 'menu', 'Users', '/user-management', 9),
('Media Outlets', 'MEDIA_OUTLETS', 'menu', 'Newspaper', '/media-outlets', 10);

-- Channel categories seed data
INSERT INTO public.channel_categories (name, icon_url, brand_color) VALUES
('Meta', NULL, '#0866FF'),
('Google', NULL, '#4285F4'),
('TikTok', NULL, '#000000'),
('LinkedIn', NULL, '#0A66C2'),
('X (Twitter)', NULL, '#000000'),
('YouTube', NULL, '#FF0000'),
('Programmatic', NULL, '#6366F1'),
('PR & Media Relations', NULL, '#059669');

-- Channels seed data
INSERT INTO public.channels (name, channel_type, channel_category_id, brand_color, display_order) VALUES
('Instagram', 'Social', (SELECT id FROM channel_categories WHERE name = 'Meta'), '#E4405F', 1),
('Facebook', 'Social', (SELECT id FROM channel_categories WHERE name = 'Meta'), '#0866FF', 2),
('TikTok', 'Social', (SELECT id FROM channel_categories WHERE name = 'TikTok'), '#000000', 3),
('YouTube', 'Social', (SELECT id FROM channel_categories WHERE name = 'YouTube'), '#FF0000', 4),
('LinkedIn', 'Social', (SELECT id FROM channel_categories WHERE name = 'LinkedIn'), '#0A66C2', 5),
('X (Twitter)', 'Social', (SELECT id FROM channel_categories WHERE name = 'X (Twitter)'), '#000000', 6),
('Google Ads', 'Display', (SELECT id FROM channel_categories WHERE name = 'Google'), '#4285F4', 7),
('DV360', 'Programmatic', (SELECT id FROM channel_categories WHERE name = 'Programmatic'), '#6366F1', 8),
('Media Relations', 'PR', (SELECT id FROM channel_categories WHERE name = 'PR & Media Relations'), '#059669', 9);

-- Campaign types seed data
INSERT INTO public.campaign_types (name, type_enum, description, icon_name) VALUES
('Brand Awareness', 'Branding.Brand', 'Build overall brand recognition and recall', 'Target'),
('Category Campaign', 'Branding.Category', 'Promote product category awareness', 'Layers'),
('Product Launch', 'Branding.Product', 'Launch and promote specific products', 'Package'),
('Performance Marketing', 'Performance.Product', 'Drive conversions and measurable results', 'TrendingUp');

-- Service types seed data
INSERT INTO public.service_types (name, type_enum, description, icon_name) VALUES
('Social Media Management', 'SocialMediaManagement', 'Organic social media content and community management', 'Users'),
('Paid Media Buying', 'PaidMediaBuying', 'Paid advertising across digital channels', 'DollarSign'),
('Influencer Marketing', 'InfluencerMarketing', 'Influencer partnerships and campaigns', 'Star'),
('KOL Management', 'KOLManagement', 'Key Opinion Leader relationship management', 'UserCheck'),
('Brand Activation', 'BrandActivation', 'Experiential and activation campaigns', 'Zap'),
('Programmatic Display', 'ProgrammaticDisplay', 'Automated display advertising', 'Monitor'),
('Programmatic Social', 'ProgrammaticSocial', 'Programmatic social media buying', 'Share2'),
('Retail Media', 'RetailMedia', 'E-commerce and retail platform advertising', 'ShoppingCart'),
('SEO', 'SEO', 'Search engine optimization', 'Search'),
('SEM', 'SEM', 'Search engine marketing and PPC', 'MousePointer'),
('CRO', 'CRO', 'Conversion rate optimization', 'ArrowUpRight'),
('Analytics & Reporting', 'AnalyticsAndReporting', 'Data analysis and performance reporting', 'BarChart');

-- Engagement multipliers seed data
INSERT INTO public.engagement_multipliers (level, multiplier) VALUES
('Low', 1.0),
('Moderate', 1.25),
('High', 1.5),
('Viral', 2.0);

-- Sentiment multipliers seed data
INSERT INTO public.sentiment_multipliers (sentiment, multiplier) VALUES
('Positive', 1.2),
('Neutral', 1.0),
('Negative', 0.5);

-- PR settings seed data
INSERT INTO public.pr_settings (setting_key, setting_value, description) VALUES
('default_ecpm', 50000, 'Default eCPM for PR calculations (IDR)'),
('tier1_multiplier', 1.5, 'Multiplier for Tier 1 media outlets'),
('tier2_multiplier', 1.25, 'Multiplier for Tier 2 media outlets'),
('tier3_multiplier', 1.0, 'Multiplier for Tier 3 media outlets');

-- Sample media outlets seed data
INSERT INTO public.media_outlets (name, tier, average_monthly_visits, average_page_views_per_article, ecpm) VALUES
('Kompas.com', 1, 180000000, 50000, 75000),
('Detik.com', 1, 200000000, 45000, 70000),
('Tribunnews.com', 1, 250000000, 40000, 65000),
('Liputan6.com', 1, 120000000, 35000, 60000),
('CNN Indonesia', 1, 80000000, 30000, 80000),
('Tempo.co', 2, 50000000, 25000, 55000),
('Republika.co.id', 2, 40000000, 20000, 50000),
('Suara.com', 2, 60000000, 22000, 52000),
('Merdeka.com', 2, 45000000, 18000, 48000),
('Okezone.com', 2, 70000000, 28000, 58000),
('IDN Times', 3, 30000000, 15000, 40000),
('JPNN.com', 3, 25000000, 12000, 35000),
('Bisnis.com', 3, 20000000, 10000, 45000),
('Kontan.co.id', 3, 18000000, 8000, 42000),
('SINDOnews.com', 3, 35000000, 14000, 38000);

-- Metric definitions seed data
INSERT INTO public.metric_definitions (key, name, category, description, data_type, is_system) VALUES
('impressions', 'Impressions', 'reach', 'Total number of times content was displayed', 'number', true),
('reach', 'Reach', 'reach', 'Unique users who saw the content', 'number', true),
('clicks', 'Clicks', 'engagement', 'Total clicks on content', 'number', true),
('engagements', 'Engagements', 'engagement', 'Total interactions (likes, comments, shares)', 'number', true),
('video_views', 'Video Views', 'engagement', 'Total video views', 'number', true),
('spend', 'Spend', 'cost', 'Total advertising spend', 'currency', true),
('ctr', 'CTR', 'performance', 'Click-through rate', 'percentage', true),
('cpm', 'CPM', 'cost', 'Cost per thousand impressions', 'currency', true),
('cpc', 'CPC', 'cost', 'Cost per click', 'currency', true),
('roas', 'ROAS', 'performance', 'Return on ad spend', 'number', true),
('conversions', 'Conversions', 'conversion', 'Total conversions', 'number', true),
('conversion_rate', 'Conversion Rate', 'conversion', 'Percentage of users who converted', 'percentage', true);

-- =============================================
-- END OF SCHEMA
-- =============================================
