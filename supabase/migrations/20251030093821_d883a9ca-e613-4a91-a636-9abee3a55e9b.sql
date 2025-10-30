-- Create enums
CREATE TYPE public.app_role AS ENUM ('MasterAdmin', 'Director', 'Account', 'Client');
CREATE TYPE public.funnel_type AS ENUM ('TOP', 'MID', 'BOTTOM');
CREATE TYPE public.campaign_status AS ENUM ('draft', 'running', 'finished');
CREATE TYPE public.channel_type AS ENUM ('Social', 'Programmatic', 'Display', 'PR', 'Email', 'Owned');
CREATE TYPE public.engagement_level AS ENUM ('Low', 'Moderate', 'High', 'Viral');
CREATE TYPE public.sentiment_type AS ENUM ('Positive', 'Neutral', 'Negative');

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  company_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User roles table (separate for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- Companies table
CREATE TABLE public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  contact_email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Brands table
CREATE TABLE public.brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Products table
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID REFERENCES public.brands(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  category TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Channels table
CREATE TABLE public.channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  channel_type channel_type NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Objectives table
CREATE TABLE public.objectives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  channel_id UUID REFERENCES public.channels(id) ON DELETE SET NULL,
  funnel_type funnel_type,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Buying models table
CREATE TABLE public.buying_models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  channel_id UUID REFERENCES public.channels(id) ON DELETE SET NULL,
  objective_id UUID REFERENCES public.objectives(id) ON DELETE SET NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Campaigns table
CREATE TABLE public.campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID REFERENCES public.brands(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  channel_id UUID REFERENCES public.channels(id) ON DELETE RESTRICT NOT NULL,
  funnel_type funnel_type NOT NULL,
  objective_id UUID REFERENCES public.objectives(id) ON DELETE SET NULL,
  buying_model_id UUID REFERENCES public.buying_models(id) ON DELETE SET NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status campaign_status NOT NULL DEFAULT 'draft',
  primary_kpi TEXT,
  secondary_kpi TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Metrics table
CREATE TABLE public.metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE NOT NULL,
  channel_id UUID REFERENCES public.channels(id) ON DELETE RESTRICT NOT NULL,
  date DATE NOT NULL,
  impressions BIGINT DEFAULT 0,
  clicks BIGINT DEFAULT 0,
  engagements BIGINT DEFAULT 0,
  reach BIGINT DEFAULT 0,
  video_views BIGINT DEFAULT 0,
  spend NUMERIC(15,2) DEFAULT 0,
  followers BIGINT DEFAULT 0,
  sentiment_score NUMERIC(3,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- CPM rates table
CREATE TABLE public.cpm_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID REFERENCES public.channels(id) ON DELETE CASCADE NOT NULL,
  currency TEXT NOT NULL DEFAULT 'IDR',
  cpm_value NUMERIC(10,2) NOT NULL,
  effective_from DATE NOT NULL DEFAULT CURRENT_DATE,
  effective_to DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Platform multipliers table
CREATE TABLE public.platform_multipliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID REFERENCES public.channels(id) ON DELETE CASCADE NOT NULL UNIQUE,
  multiplier NUMERIC(4,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Engagement multipliers table
CREATE TABLE public.engagement_multipliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  level engagement_level NOT NULL UNIQUE,
  multiplier NUMERIC(4,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Sentiment multipliers table
CREATE TABLE public.sentiment_multipliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sentiment sentiment_type NOT NULL UNIQUE,
  multiplier NUMERIC(4,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- AVE results table
CREATE TABLE public.ave_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE NOT NULL,
  channels_used UUID[] NOT NULL,
  base_ave_per_channel JSONB NOT NULL,
  weighted_components JSONB NOT NULL,
  final_ave NUMERIC(15,2) NOT NULL,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- SOV results table
CREATE TABLE public.sov_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  share_of_voice_value NUMERIC(5,2) NOT NULL,
  basis_json JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add foreign key to profiles
ALTER TABLE public.profiles ADD CONSTRAINT profiles_company_id_fkey 
  FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE SET NULL;

-- Create indexes for performance
CREATE INDEX idx_campaigns_brand_id ON public.campaigns(brand_id);
CREATE INDEX idx_campaigns_channel_id ON public.campaigns(channel_id);
CREATE INDEX idx_campaigns_status ON public.campaigns(status);
CREATE INDEX idx_campaigns_dates ON public.campaigns(start_date, end_date);
CREATE INDEX idx_metrics_campaign_id ON public.metrics(campaign_id);
CREATE INDEX idx_metrics_channel_id ON public.metrics(channel_id);
CREATE INDEX idx_metrics_date ON public.metrics(date);
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email)
  );
  RETURN NEW;
END;
$$;

-- Trigger for new user
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to check user role (security definer to avoid RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
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

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON public.companies
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_brands_updated_at BEFORE UPDATE ON public.brands
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON public.campaigns
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.objectives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.buying_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cpm_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_multipliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.engagement_multipliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sentiment_multipliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ave_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sov_results ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for user_roles (only viewable by user themselves and admins)
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT 
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'MasterAdmin'));
CREATE POLICY "Admins can manage all roles" ON public.user_roles FOR ALL 
  USING (public.has_role(auth.uid(), 'MasterAdmin'));

-- RLS Policies for companies (authenticated users can view, admins can manage)
CREATE POLICY "Authenticated users can view companies" ON public.companies FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can manage companies" ON public.companies FOR ALL 
  USING (public.has_role(auth.uid(), 'MasterAdmin') OR public.has_role(auth.uid(), 'Director'));

-- RLS Policies for brands
CREATE POLICY "Authenticated users can view brands" ON public.brands FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Staff can manage brands" ON public.brands FOR ALL 
  USING (public.has_role(auth.uid(), 'MasterAdmin') OR public.has_role(auth.uid(), 'Director') OR public.has_role(auth.uid(), 'Account'));

-- RLS Policies for products
CREATE POLICY "Authenticated users can view products" ON public.products FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Staff can manage products" ON public.products FOR ALL 
  USING (public.has_role(auth.uid(), 'MasterAdmin') OR public.has_role(auth.uid(), 'Director') OR public.has_role(auth.uid(), 'Account'));

-- RLS Policies for channels (read-only for all authenticated)
CREATE POLICY "Authenticated users can view channels" ON public.channels FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can manage channels" ON public.channels FOR ALL USING (public.has_role(auth.uid(), 'MasterAdmin'));

-- RLS Policies for objectives (read-only for all authenticated)
CREATE POLICY "Authenticated users can view objectives" ON public.objectives FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can manage objectives" ON public.objectives FOR ALL USING (public.has_role(auth.uid(), 'MasterAdmin'));

-- RLS Policies for buying_models (read-only for all authenticated)
CREATE POLICY "Authenticated users can view buying models" ON public.buying_models FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can manage buying models" ON public.buying_models FOR ALL USING (public.has_role(auth.uid(), 'MasterAdmin'));

-- RLS Policies for campaigns
CREATE POLICY "Authenticated users can view campaigns" ON public.campaigns FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Staff can create campaigns" ON public.campaigns FOR INSERT 
  WITH CHECK (public.has_role(auth.uid(), 'MasterAdmin') OR public.has_role(auth.uid(), 'Director') OR public.has_role(auth.uid(), 'Account'));
CREATE POLICY "Staff can update campaigns" ON public.campaigns FOR UPDATE 
  USING (public.has_role(auth.uid(), 'MasterAdmin') OR public.has_role(auth.uid(), 'Director') OR public.has_role(auth.uid(), 'Account'));
CREATE POLICY "Admins can delete campaigns" ON public.campaigns FOR DELETE 
  USING (public.has_role(auth.uid(), 'MasterAdmin') OR public.has_role(auth.uid(), 'Director'));

-- RLS Policies for metrics
CREATE POLICY "Authenticated users can view metrics" ON public.metrics FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Staff can manage metrics" ON public.metrics FOR ALL 
  USING (public.has_role(auth.uid(), 'MasterAdmin') OR public.has_role(auth.uid(), 'Director') OR public.has_role(auth.uid(), 'Account'));

-- RLS Policies for CPM rates (read-only for all authenticated, manage for admins)
CREATE POLICY "Authenticated users can view cpm rates" ON public.cpm_rates FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can manage cpm rates" ON public.cpm_rates FOR ALL USING (public.has_role(auth.uid(), 'MasterAdmin'));

-- RLS Policies for multipliers (read-only for all authenticated, manage for admins)
CREATE POLICY "Authenticated users can view platform multipliers" ON public.platform_multipliers FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can manage platform multipliers" ON public.platform_multipliers FOR ALL USING (public.has_role(auth.uid(), 'MasterAdmin'));

CREATE POLICY "Authenticated users can view engagement multipliers" ON public.engagement_multipliers FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can manage engagement multipliers" ON public.engagement_multipliers FOR ALL USING (public.has_role(auth.uid(), 'MasterAdmin'));

CREATE POLICY "Authenticated users can view sentiment multipliers" ON public.sentiment_multipliers FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can manage sentiment multipliers" ON public.sentiment_multipliers FOR ALL USING (public.has_role(auth.uid(), 'MasterAdmin'));

-- RLS Policies for AVE results
CREATE POLICY "Authenticated users can view ave results" ON public.ave_results FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Staff can create ave results" ON public.ave_results FOR INSERT 
  WITH CHECK (public.has_role(auth.uid(), 'MasterAdmin') OR public.has_role(auth.uid(), 'Director') OR public.has_role(auth.uid(), 'Account'));

-- RLS Policies for SOV results
CREATE POLICY "Authenticated users can view sov results" ON public.sov_results FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Staff can create sov results" ON public.sov_results FOR INSERT 
  WITH CHECK (public.has_role(auth.uid(), 'MasterAdmin') OR public.has_role(auth.uid(), 'Director') OR public.has_role(auth.uid(), 'Account'));

-- Seed channels
INSERT INTO public.channels (name, channel_type) VALUES
  ('Facebook', 'Social'),
  ('Instagram', 'Social'),
  ('TikTok', 'Social'),
  ('YouTube', 'Social'),
  ('LinkedIn', 'Social'),
  ('X', 'Social');

-- Seed CPM rates (IDR)
INSERT INTO public.cpm_rates (channel_id, currency, cpm_value)
SELECT id, 'IDR', cpm FROM (
  SELECT id, 65000 as cpm FROM public.channels WHERE name = 'Facebook'
  UNION ALL SELECT id, 75000 FROM public.channels WHERE name = 'Instagram'
  UNION ALL SELECT id, 35000 FROM public.channels WHERE name = 'TikTok'
  UNION ALL SELECT id, 40000 FROM public.channels WHERE name = 'YouTube'
  UNION ALL SELECT id, 85000 FROM public.channels WHERE name = 'LinkedIn'
  UNION ALL SELECT id, 56000 FROM public.channels WHERE name = 'X'
) rates;

-- Seed platform multipliers
INSERT INTO public.platform_multipliers (channel_id, multiplier)
SELECT id, mult FROM (
  SELECT id, 1.60 as mult FROM public.channels WHERE name = 'Facebook'
  UNION ALL SELECT id, 2.00 FROM public.channels WHERE name = 'Instagram'
  UNION ALL SELECT id, 3.50 FROM public.channels WHERE name = 'TikTok'
  UNION ALL SELECT id, 2.50 FROM public.channels WHERE name = 'YouTube'
  UNION ALL SELECT id, 2.50 FROM public.channels WHERE name = 'LinkedIn'
  UNION ALL SELECT id, 1.30 FROM public.channels WHERE name = 'X'
) mults;

-- Seed engagement multipliers
INSERT INTO public.engagement_multipliers (level, multiplier) VALUES
  ('Low', 1.50),
  ('Moderate', 1.80),
  ('High', 2.50),
  ('Viral', 4.00);

-- Seed sentiment multipliers
INSERT INTO public.sentiment_multipliers (sentiment, multiplier) VALUES
  ('Positive', 1.50),
  ('Neutral', 1.00),
  ('Negative', 0.80);