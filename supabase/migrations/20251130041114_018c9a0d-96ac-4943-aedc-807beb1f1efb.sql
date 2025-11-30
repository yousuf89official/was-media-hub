-- Phase 1: Database Schema for Brand Performance Dashboard System

-- 1. Create new enums
DO $$ BEGIN
  CREATE TYPE campaign_type_enum AS ENUM (
    'Branding.Brand',
    'Branding.Category', 
    'Branding.Product',
    'Performance.Product'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE service_type_enum AS ENUM (
    'SocialMediaManagement',
    'PaidMediaBuying',
    'InfluencerMarketing',
    'KOLManagement',
    'BrandActivation',
    'ProgrammaticDisplay',
    'ProgrammaticSocial',
    'RetailMedia',
    'SEO',
    'SEM',
    'CRO',
    'AnalyticsAndReporting'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE placement_mock_type AS ENUM (
    'MobileFeedMock',
    'StoryMock',
    'ReelsMock',
    'InStreamMock',
    'BillboardMock',
    'SearchAdMock',
    'DisplayAdMock'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE metric_source_enum AS ENUM (
    'GoogleSheet',
    'API',
    'Manual'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE metric_period_enum AS ENUM (
    'Daily',
    'Weekly',
    'Monthly',
    'CampaignToDate'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 2. Create campaign_types table
CREATE TABLE IF NOT EXISTS public.campaign_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  type_enum campaign_type_enum NOT NULL,
  description text,
  icon_name text DEFAULT 'Target',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.campaign_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view campaign_types" ON public.campaign_types
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "MasterAdmin can manage campaign_types" ON public.campaign_types
  FOR ALL USING (has_role(auth.uid(), 'MasterAdmin'));

-- Seed campaign_types
INSERT INTO public.campaign_types (name, type_enum, description, icon_name) VALUES
  ('Brand Awareness', 'Branding.Brand', 'Build overall brand recognition and recall', 'Megaphone'),
  ('Category Leadership', 'Branding.Category', 'Establish dominance in product category', 'Crown'),
  ('Product Launch', 'Branding.Product', 'Launch and promote specific products', 'Rocket'),
  ('Performance Marketing', 'Performance.Product', 'Drive conversions and sales', 'TrendingUp')
ON CONFLICT (name) DO NOTHING;

-- 3. Create service_types table
CREATE TABLE IF NOT EXISTS public.service_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  type_enum service_type_enum NOT NULL,
  description text,
  icon_name text DEFAULT 'Settings',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.service_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view service_types" ON public.service_types
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "MasterAdmin can manage service_types" ON public.service_types
  FOR ALL USING (has_role(auth.uid(), 'MasterAdmin'));

-- Seed service_types
INSERT INTO public.service_types (name, type_enum, description, icon_name) VALUES
  ('Social Media Management', 'SocialMediaManagement', 'Organic social content creation and community management', 'Users'),
  ('Paid Media Buying', 'PaidMediaBuying', 'Paid advertising across digital channels', 'CreditCard'),
  ('Influencer Marketing', 'InfluencerMarketing', 'Micro and macro influencer partnerships', 'Star'),
  ('KOL Management', 'KOLManagement', 'Key Opinion Leader campaigns and collaborations', 'Award'),
  ('Brand Activation', 'BrandActivation', 'Experiential and activation campaigns', 'Zap'),
  ('Programmatic Display', 'ProgrammaticDisplay', 'Automated display advertising', 'Monitor'),
  ('Programmatic Social', 'ProgrammaticSocial', 'Automated social advertising', 'Share2'),
  ('Retail Media', 'RetailMedia', 'E-commerce and marketplace advertising', 'ShoppingCart'),
  ('SEO', 'SEO', 'Search engine optimization', 'Search'),
  ('SEM', 'SEM', 'Search engine marketing', 'MousePointerClick'),
  ('CRO', 'CRO', 'Conversion rate optimization', 'Target'),
  ('Analytics & Reporting', 'AnalyticsAndReporting', 'Data analysis and performance reporting', 'BarChart3')
ON CONFLICT (name) DO NOTHING;

-- 4. Create channel_categories table
CREATE TABLE IF NOT EXISTS public.channel_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  icon_url text,
  brand_color text, -- hex color
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.channel_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view channel_categories" ON public.channel_categories
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "MasterAdmin can manage channel_categories" ON public.channel_categories
  FOR ALL USING (has_role(auth.uid(), 'MasterAdmin'));

-- Seed channel_categories
INSERT INTO public.channel_categories (name, brand_color) VALUES
  ('Meta', '#0081FB'),
  ('Google', '#4285F4'),
  ('TikTok', '#000000'),
  ('YouTube', '#FF0000'),
  ('Programmatic', '#6366F1'),
  ('Retail', '#FF9900'),
  ('Email', '#00D4AA'),
  ('Messaging', '#25D366'),
  ('OOH', '#8B5CF6')
ON CONFLICT (name) DO NOTHING;

-- 5. Extend channels table
ALTER TABLE public.channels 
  ADD COLUMN IF NOT EXISTS channel_category_id uuid REFERENCES public.channel_categories(id),
  ADD COLUMN IF NOT EXISTS parent_channel_id uuid REFERENCES public.channels(id),
  ADD COLUMN IF NOT EXISTS icon_url text,
  ADD COLUMN IF NOT EXISTS brand_color text,
  ADD COLUMN IF NOT EXISTS display_order integer DEFAULT 0;

-- 6. Create metric_definitions table
CREATE TABLE IF NOT EXISTS public.metric_definitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  key text NOT NULL UNIQUE,
  description text,
  category text NOT NULL, -- 'awareness', 'engagement', 'conversion', 'financial'
  data_type text DEFAULT 'number', -- 'number', 'currency', 'percentage', 'ratio'
  aggregation_method text DEFAULT 'sum', -- 'sum', 'average', 'last', 'max', 'min'
  formula text, -- for calculated metrics
  is_system boolean DEFAULT true,
  is_active boolean DEFAULT true,
  icon_name text,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.metric_definitions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view metric_definitions" ON public.metric_definitions
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "MasterAdmin can manage metric_definitions" ON public.metric_definitions
  FOR ALL USING (has_role(auth.uid(), 'MasterAdmin'));

-- Seed metric_definitions
INSERT INTO public.metric_definitions (name, key, description, category, data_type, icon_name, display_order) VALUES
  ('Impressions', 'impressions', 'Total number of times content was displayed', 'awareness', 'number', 'Eye', 1),
  ('Reach', 'reach', 'Unique users who saw the content', 'awareness', 'number', 'Users', 2),
  ('Views', 'views', 'Total video views', 'awareness', 'number', 'Play', 3),
  ('View 100%', 'view_100', 'Complete video views', 'awareness', 'number', 'CheckCircle', 4),
  ('Clicks', 'clicks', 'Total clicks on content', 'engagement', 'number', 'MousePointerClick', 5),
  ('Link Clicks', 'link_clicks', 'Clicks to external links', 'engagement', 'number', 'ExternalLink', 6),
  ('CTR', 'ctr', 'Click-through rate', 'engagement', 'percentage', 'Percent', 7),
  ('Engagements', 'engagements', 'Total interactions (likes, comments, shares)', 'engagement', 'number', 'Heart', 8),
  ('Likes', 'likes', 'Total likes', 'engagement', 'number', 'ThumbsUp', 9),
  ('Comments', 'comments', 'Total comments', 'engagement', 'number', 'MessageSquare', 10),
  ('Shares', 'shares', 'Total shares', 'engagement', 'number', 'Share2', 11),
  ('Saves', 'saves', 'Total saves', 'engagement', 'number', 'Bookmark', 12),
  ('Followers Gained', 'followers_gained', 'New followers acquired', 'engagement', 'number', 'UserPlus', 13),
  ('Sessions', 'sessions', 'Website sessions', 'conversion', 'number', 'Activity', 14),
  ('Add to Cart', 'add_to_cart', 'Items added to cart', 'conversion', 'number', 'ShoppingCart', 15),
  ('Purchases', 'purchases', 'Completed purchases', 'conversion', 'number', 'CreditCard', 16),
  ('Conversions', 'conversions', 'Total conversions', 'conversion', 'number', 'Target', 17),
  ('Conversion Rate', 'conversion_rate', 'Conversion rate percentage', 'conversion', 'percentage', 'TrendingUp', 18),
  ('Spend', 'spend', 'Total media spend', 'financial', 'currency', 'DollarSign', 19),
  ('Revenue', 'revenue', 'Total revenue generated', 'financial', 'currency', 'Wallet', 20),
  ('ROAS', 'roas', 'Return on ad spend', 'financial', 'ratio', 'PiggyBank', 21),
  ('CPM', 'cpm', 'Cost per mille (thousand impressions)', 'financial', 'currency', 'Calculator', 22),
  ('CPC', 'cpc', 'Cost per click', 'financial', 'currency', 'MousePointer', 23),
  ('CPA', 'cpa', 'Cost per acquisition', 'financial', 'currency', 'Receipt', 24),
  ('CPV', 'cpv', 'Cost per view', 'financial', 'currency', 'Video', 25)
ON CONFLICT (key) DO NOTHING;

-- 7. Create placements table
CREATE TABLE IF NOT EXISTS public.placements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id uuid REFERENCES public.channels(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text,
  mock_type placement_mock_type NOT NULL,
  aspect_ratio text, -- '1:1', '9:16', '16:9', etc.
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(channel_id, name)
);

ALTER TABLE public.placements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view placements" ON public.placements
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "MasterAdmin can manage placements" ON public.placements
  FOR ALL USING (has_role(auth.uid(), 'MasterAdmin'));

-- 8. Extend brands table
ALTER TABLE public.brands
  ADD COLUMN IF NOT EXISTS logo_url text,
  ADD COLUMN IF NOT EXISTS website text,
  ADD COLUMN IF NOT EXISTS markets text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS categories text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS hero_products text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS social_handles jsonb DEFAULT '{}';

-- 9. Extend campaigns table
ALTER TABLE public.campaigns
  ADD COLUMN IF NOT EXISTS campaign_type_id uuid REFERENCES public.campaign_types(id),
  ADD COLUMN IF NOT EXISTS services text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS kpi_target numeric,
  ADD COLUMN IF NOT EXISTS cost_idr numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS markup_percent numeric DEFAULT 20,
  ADD COLUMN IF NOT EXISTS exchange_rate numeric DEFAULT 16000,
  ADD COLUMN IF NOT EXISTS markets text[] DEFAULT '{}';

-- 10. Create channel_metrics junction table (which metrics apply to which channels)
CREATE TABLE IF NOT EXISTS public.channel_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id uuid REFERENCES public.channels(id) ON DELETE CASCADE NOT NULL,
  metric_id uuid REFERENCES public.metric_definitions(id) ON DELETE CASCADE NOT NULL,
  is_primary boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE(channel_id, metric_id)
);

ALTER TABLE public.channel_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view channel_metrics" ON public.channel_metrics
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "MasterAdmin can manage channel_metrics" ON public.channel_metrics
  FOR ALL USING (has_role(auth.uid(), 'MasterAdmin'));

-- 11. Create channel_objectives junction table
CREATE TABLE IF NOT EXISTS public.channel_objectives (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id uuid REFERENCES public.channels(id) ON DELETE CASCADE NOT NULL,
  objective_id uuid REFERENCES public.objectives(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(channel_id, objective_id)
);

ALTER TABLE public.channel_objectives ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view channel_objectives" ON public.channel_objectives
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "MasterAdmin can manage channel_objectives" ON public.channel_objectives
  FOR ALL USING (has_role(auth.uid(), 'MasterAdmin'));

-- 12. Create channel_buying_models junction table
CREATE TABLE IF NOT EXISTS public.channel_buying_models (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id uuid REFERENCES public.channels(id) ON DELETE CASCADE NOT NULL,
  buying_model_id uuid REFERENCES public.buying_models(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(channel_id, buying_model_id)
);

ALTER TABLE public.channel_buying_models ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view channel_buying_models" ON public.channel_buying_models
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "MasterAdmin can manage channel_buying_models" ON public.channel_buying_models
  FOR ALL USING (has_role(auth.uid(), 'MasterAdmin'));

-- Create updated_at triggers for new tables
CREATE TRIGGER update_campaign_types_updated_at BEFORE UPDATE ON public.campaign_types
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_service_types_updated_at BEFORE UPDATE ON public.service_types
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_channel_categories_updated_at BEFORE UPDATE ON public.channel_categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_metric_definitions_updated_at BEFORE UPDATE ON public.metric_definitions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_placements_updated_at BEFORE UPDATE ON public.placements
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();