
-- Create campaign service categories table (a-j)
CREATE TABLE public.campaign_service_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  icon_name TEXT DEFAULT 'Settings',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create campaign services table
CREATE TABLE public.campaign_services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID NOT NULL REFERENCES public.campaign_service_categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create campaign service assignments table
CREATE TABLE public.campaign_service_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES public.campaign_services(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'live', 'completed')),
  allocated_budget NUMERIC DEFAULT 0,
  responsible_team TEXT,
  deliverables TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(campaign_id, service_id)
);

-- Create campaign channel configs table (budget per channel)
CREATE TABLE public.campaign_channel_configs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  channel_id UUID NOT NULL REFERENCES public.channels(id) ON DELETE CASCADE,
  budget NUMERIC DEFAULT 0,
  objective_id UUID REFERENCES public.objectives(id),
  buying_model_id UUID REFERENCES public.buying_models(id),
  targeting JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(campaign_id, channel_id)
);

-- Create ad sets table
CREATE TABLE public.ad_sets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_channel_config_id UUID NOT NULL REFERENCES public.campaign_channel_configs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed')),
  audience_targeting JSONB DEFAULT '{}'::jsonb,
  placements UUID[],
  budget NUMERIC DEFAULT 0,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create ads (creatives) table
CREATE TABLE public.ads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ad_set_id UUID NOT NULL REFERENCES public.ad_sets(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed')),
  creative_url TEXT,
  headline TEXT,
  description TEXT,
  cta_text TEXT,
  destination_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add channel_ids array to campaigns table
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS channel_ids UUID[] DEFAULT '{}';

-- Enable RLS on all new tables
ALTER TABLE public.campaign_service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_service_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_channel_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ads ENABLE ROW LEVEL SECURITY;

-- RLS Policies for campaign_service_categories
CREATE POLICY "Authenticated users can view campaign_service_categories" ON public.campaign_service_categories FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "MasterAdmin can manage campaign_service_categories" ON public.campaign_service_categories FOR ALL USING (has_role(auth.uid(), 'MasterAdmin'::app_role));

-- RLS Policies for campaign_services
CREATE POLICY "Authenticated users can view campaign_services" ON public.campaign_services FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "MasterAdmin can manage campaign_services" ON public.campaign_services FOR ALL USING (has_role(auth.uid(), 'MasterAdmin'::app_role));

-- RLS Policies for campaign_service_assignments
CREATE POLICY "Authenticated users can view campaign_service_assignments" ON public.campaign_service_assignments FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Staff can manage campaign_service_assignments" ON public.campaign_service_assignments FOR ALL USING (has_role(auth.uid(), 'MasterAdmin'::app_role) OR has_role(auth.uid(), 'Director'::app_role) OR has_role(auth.uid(), 'Account'::app_role));

-- RLS Policies for campaign_channel_configs
CREATE POLICY "Authenticated users can view campaign_channel_configs" ON public.campaign_channel_configs FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Staff can manage campaign_channel_configs" ON public.campaign_channel_configs FOR ALL USING (has_role(auth.uid(), 'MasterAdmin'::app_role) OR has_role(auth.uid(), 'Director'::app_role) OR has_role(auth.uid(), 'Account'::app_role));

-- RLS Policies for ad_sets
CREATE POLICY "Authenticated users can view ad_sets" ON public.ad_sets FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Staff can manage ad_sets" ON public.ad_sets FOR ALL USING (has_role(auth.uid(), 'MasterAdmin'::app_role) OR has_role(auth.uid(), 'Director'::app_role) OR has_role(auth.uid(), 'Account'::app_role));

-- RLS Policies for ads
CREATE POLICY "Authenticated users can view ads" ON public.ads FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Staff can manage ads" ON public.ads FOR ALL USING (has_role(auth.uid(), 'MasterAdmin'::app_role) OR has_role(auth.uid(), 'Director'::app_role) OR has_role(auth.uid(), 'Account'::app_role));

-- Seed service categories (a-j)
INSERT INTO public.campaign_service_categories (code, name, description, display_order, icon_name) VALUES
('a', 'Strategy & Research', 'Brand/comms strategy, consumer research & insight, competitive/category audit', 1, 'Lightbulb'),
('b', 'Creative & Content', 'Brand platform & key visuals, social content production, creative for performance ads, landing pages/microsites', 2, 'Palette'),
('c', 'Social Media Management', 'Channel management, community management, social customer care', 3, 'Users'),
('d', 'Paid Media Buying', 'Paid social, programmatic display/video/CTV, search, retail media/commerce media, OLV/CTV', 4, 'DollarSign'),
('e', 'Influencer / KOL Marketing', 'Seeding, paid KOLs, affiliate KOLs, creators/UGC', 5, 'Star'),
('f', 'PR & Communications', 'Media relations, press releases, PR events, crisis comms', 6, 'Megaphone'),
('g', 'Brand Activation & Experiential', 'Pop-ups, roadshows, sampling, in-store demos, events', 7, 'Sparkles'),
('h', 'CRM & Lifecycle', 'Email, SMS, WhatsApp, loyalty programs', 8, 'Mail'),
('i', 'SEO & Content Marketing', 'Technical SEO, on-page, content hub, blog, YouTube SEO', 9, 'Search'),
('j', 'Data & Analytics', 'Dashboards, MMM, brand lift, sentiment, social listening, media mix optimization', 10, 'BarChart3');

-- Seed services for each category
-- a. Strategy & Research
INSERT INTO public.campaign_services (category_id, name, description) 
SELECT id, 'Brand / Comms Strategy', 'Strategic brand positioning and communication planning' FROM public.campaign_service_categories WHERE code = 'a';
INSERT INTO public.campaign_services (category_id, name, description) 
SELECT id, 'Consumer Research & Insight', 'Market research and consumer behavior analysis' FROM public.campaign_service_categories WHERE code = 'a';
INSERT INTO public.campaign_services (category_id, name, description) 
SELECT id, 'Competitive / Category Audit', 'Competitor analysis and category landscape review' FROM public.campaign_service_categories WHERE code = 'a';

-- b. Creative & Content
INSERT INTO public.campaign_services (category_id, name, description) 
SELECT id, 'Brand Platform & Key Visuals', 'Core brand identity and visual assets development' FROM public.campaign_service_categories WHERE code = 'b';
INSERT INTO public.campaign_services (category_id, name, description) 
SELECT id, 'Social Content Production (Always-on)', 'Ongoing social media content creation' FROM public.campaign_service_categories WHERE code = 'b';
INSERT INTO public.campaign_services (category_id, name, description) 
SELECT id, 'Creative for Performance Ads', 'Static, video, UGC, motion graphics for paid campaigns' FROM public.campaign_service_categories WHERE code = 'b';
INSERT INTO public.campaign_services (category_id, name, description) 
SELECT id, 'Landing Pages / Microsites', 'Campaign-specific web properties' FROM public.campaign_service_categories WHERE code = 'b';

-- c. Social Media Management
INSERT INTO public.campaign_services (category_id, name, description) 
SELECT id, 'Channel Management', 'IG, TikTok, FB, X, YouTube, LinkedIn, Pinterest management' FROM public.campaign_service_categories WHERE code = 'c';
INSERT INTO public.campaign_services (category_id, name, description) 
SELECT id, 'Community Management', 'Audience engagement and community building' FROM public.campaign_service_categories WHERE code = 'c';
INSERT INTO public.campaign_services (category_id, name, description) 
SELECT id, 'Social Customer Care', 'Customer support via social channels' FROM public.campaign_service_categories WHERE code = 'c';

-- d. Paid Media Buying
INSERT INTO public.campaign_services (category_id, name, description) 
SELECT id, 'Paid Social', 'Meta, TikTok, X, Snapchat, Pinterest advertising' FROM public.campaign_service_categories WHERE code = 'd';
INSERT INTO public.campaign_services (category_id, name, description) 
SELECT id, 'Programmatic Display / Video / CTV', 'Programmatic advertising across display, video, and connected TV' FROM public.campaign_service_categories WHERE code = 'd';
INSERT INTO public.campaign_services (category_id, name, description) 
SELECT id, 'Search Ads', 'Google Ads, Microsoft Ads campaigns' FROM public.campaign_service_categories WHERE code = 'd';
INSERT INTO public.campaign_services (category_id, name, description) 
SELECT id, 'Retail Media / Commerce Media', 'Marketplace and retailer advertising' FROM public.campaign_service_categories WHERE code = 'd';
INSERT INTO public.campaign_services (category_id, name, description) 
SELECT id, 'OLV / CTV', 'Online video and connected TV campaigns' FROM public.campaign_service_categories WHERE code = 'd';

-- e. Influencer / KOL Marketing
INSERT INTO public.campaign_services (category_id, name, description) 
SELECT id, 'Seeding', 'Product seeding to influencers' FROM public.campaign_service_categories WHERE code = 'e';
INSERT INTO public.campaign_services (category_id, name, description) 
SELECT id, 'Paid KOLs', 'Paid influencer partnerships' FROM public.campaign_service_categories WHERE code = 'e';
INSERT INTO public.campaign_services (category_id, name, description) 
SELECT id, 'Affiliate KOLs', 'Performance-based influencer programs' FROM public.campaign_service_categories WHERE code = 'e';
INSERT INTO public.campaign_services (category_id, name, description) 
SELECT id, 'Creators / UGC', 'User-generated content and creator partnerships' FROM public.campaign_service_categories WHERE code = 'e';

-- f. PR & Communications
INSERT INTO public.campaign_services (category_id, name, description) 
SELECT id, 'Media Relations', 'Press and media relationship management' FROM public.campaign_service_categories WHERE code = 'f';
INSERT INTO public.campaign_services (category_id, name, description) 
SELECT id, 'Press Releases', 'Press release creation and distribution' FROM public.campaign_service_categories WHERE code = 'f';
INSERT INTO public.campaign_services (category_id, name, description) 
SELECT id, 'PR Events', 'Press events and media briefings' FROM public.campaign_service_categories WHERE code = 'f';
INSERT INTO public.campaign_services (category_id, name, description) 
SELECT id, 'Crisis Communications', 'Crisis management and response' FROM public.campaign_service_categories WHERE code = 'f';

-- g. Brand Activation & Experiential
INSERT INTO public.campaign_services (category_id, name, description) 
SELECT id, 'Pop-ups', 'Pop-up retail experiences' FROM public.campaign_service_categories WHERE code = 'g';
INSERT INTO public.campaign_services (category_id, name, description) 
SELECT id, 'Roadshows', 'Mobile brand activations' FROM public.campaign_service_categories WHERE code = 'g';
INSERT INTO public.campaign_services (category_id, name, description) 
SELECT id, 'Sampling', 'Product sampling campaigns' FROM public.campaign_service_categories WHERE code = 'g';
INSERT INTO public.campaign_services (category_id, name, description) 
SELECT id, 'In-store Demos', 'Retail demonstration programs' FROM public.campaign_service_categories WHERE code = 'g';
INSERT INTO public.campaign_services (category_id, name, description) 
SELECT id, 'Events', 'Brand events and experiential marketing' FROM public.campaign_service_categories WHERE code = 'g';

-- h. CRM & Lifecycle
INSERT INTO public.campaign_services (category_id, name, description) 
SELECT id, 'Email Marketing', 'Email campaigns and automation' FROM public.campaign_service_categories WHERE code = 'h';
INSERT INTO public.campaign_services (category_id, name, description) 
SELECT id, 'SMS Marketing', 'SMS campaigns and messaging' FROM public.campaign_service_categories WHERE code = 'h';
INSERT INTO public.campaign_services (category_id, name, description) 
SELECT id, 'WhatsApp Marketing', 'WhatsApp business messaging' FROM public.campaign_service_categories WHERE code = 'h';
INSERT INTO public.campaign_services (category_id, name, description) 
SELECT id, 'Loyalty Programs', 'Customer loyalty and rewards programs' FROM public.campaign_service_categories WHERE code = 'h';

-- i. SEO & Content Marketing
INSERT INTO public.campaign_services (category_id, name, description) 
SELECT id, 'Technical SEO', 'Website technical optimization' FROM public.campaign_service_categories WHERE code = 'i';
INSERT INTO public.campaign_services (category_id, name, description) 
SELECT id, 'On-page SEO', 'Content and page optimization' FROM public.campaign_service_categories WHERE code = 'i';
INSERT INTO public.campaign_services (category_id, name, description) 
SELECT id, 'Content Hub', 'Central content repository and strategy' FROM public.campaign_service_categories WHERE code = 'i';
INSERT INTO public.campaign_services (category_id, name, description) 
SELECT id, 'Blog', 'Blog content creation and management' FROM public.campaign_service_categories WHERE code = 'i';
INSERT INTO public.campaign_services (category_id, name, description) 
SELECT id, 'YouTube SEO', 'Video content optimization' FROM public.campaign_service_categories WHERE code = 'i';

-- j. Data & Analytics
INSERT INTO public.campaign_services (category_id, name, description) 
SELECT id, 'Dashboards', 'Performance dashboards and reporting' FROM public.campaign_service_categories WHERE code = 'j';
INSERT INTO public.campaign_services (category_id, name, description) 
SELECT id, 'MMM (Marketing Mix Modeling)', 'Marketing effectiveness measurement' FROM public.campaign_service_categories WHERE code = 'j';
INSERT INTO public.campaign_services (category_id, name, description) 
SELECT id, 'Brand Lift Studies', 'Brand awareness and perception measurement' FROM public.campaign_service_categories WHERE code = 'j';
INSERT INTO public.campaign_services (category_id, name, description) 
SELECT id, 'Sentiment Analysis', 'Social sentiment monitoring' FROM public.campaign_service_categories WHERE code = 'j';
INSERT INTO public.campaign_services (category_id, name, description) 
SELECT id, 'Social Listening', 'Social media monitoring and insights' FROM public.campaign_service_categories WHERE code = 'j';
INSERT INTO public.campaign_services (category_id, name, description) 
SELECT id, 'Media Mix Optimization', 'Channel allocation optimization' FROM public.campaign_service_categories WHERE code = 'j';

-- Create triggers for updated_at
CREATE TRIGGER update_campaign_service_categories_updated_at BEFORE UPDATE ON public.campaign_service_categories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_campaign_services_updated_at BEFORE UPDATE ON public.campaign_services FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_campaign_service_assignments_updated_at BEFORE UPDATE ON public.campaign_service_assignments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_campaign_channel_configs_updated_at BEFORE UPDATE ON public.campaign_channel_configs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_ad_sets_updated_at BEFORE UPDATE ON public.ad_sets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_ads_updated_at BEFORE UPDATE ON public.ads FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
