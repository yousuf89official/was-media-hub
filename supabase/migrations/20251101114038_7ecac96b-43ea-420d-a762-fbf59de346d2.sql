-- Create CMS Tables for dynamic content management

-- Table for general site settings (key-value store)
CREATE TABLE public.site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  value jsonb NOT NULL,
  category text NOT NULL, -- 'branding', 'content', 'seo', 'navigation'
  description text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Table for image assets
CREATE TABLE public.site_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  storage_path text NOT NULL,
  url text NOT NULL,
  alt_text text,
  usage_location text, -- 'header', 'sidebar', 'footer', 'landing', 'general'
  width integer,
  height integer,
  file_size integer,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Table for landing page feature cards
CREATE TABLE public.landing_features (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  icon_name text NOT NULL, -- Lucide icon name
  display_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Table for landing page sections
CREATE TABLE public.landing_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_key text NOT NULL UNIQUE, -- 'hero', 'features', 'cta'
  content jsonb NOT NULL,
  display_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.landing_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.landing_sections ENABLE ROW LEVEL SECURITY;

-- RLS Policies for site_settings
CREATE POLICY "Everyone can view site settings"
  ON public.site_settings FOR SELECT
  USING (true);

CREATE POLICY "MasterAdmin can manage site settings"
  ON public.site_settings FOR ALL
  USING (has_role(auth.uid(), 'MasterAdmin'::app_role));

-- RLS Policies for site_images
CREATE POLICY "Everyone can view site images"
  ON public.site_images FOR SELECT
  USING (true);

CREATE POLICY "MasterAdmin can manage site images"
  ON public.site_images FOR ALL
  USING (has_role(auth.uid(), 'MasterAdmin'::app_role));

-- RLS Policies for landing_features
CREATE POLICY "Everyone can view landing features"
  ON public.landing_features FOR SELECT
  USING (true);

CREATE POLICY "MasterAdmin can manage landing features"
  ON public.landing_features FOR ALL
  USING (has_role(auth.uid(), 'MasterAdmin'::app_role));

-- RLS Policies for landing_sections
CREATE POLICY "Everyone can view landing sections"
  ON public.landing_sections FOR SELECT
  USING (true);

CREATE POLICY "MasterAdmin can manage landing sections"
  ON public.landing_sections FOR ALL
  USING (has_role(auth.uid(), 'MasterAdmin'::app_role));

-- Create storage bucket for site assets
INSERT INTO storage.buckets (id, name, public) 
VALUES ('site-assets', 'site-assets', true);

-- Storage policies for site-assets bucket
CREATE POLICY "Public can view site assets"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'site-assets');

CREATE POLICY "MasterAdmin can upload site assets"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'site-assets' AND has_role(auth.uid(), 'MasterAdmin'::app_role));

CREATE POLICY "MasterAdmin can update site assets"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'site-assets' AND has_role(auth.uid(), 'MasterAdmin'::app_role));

CREATE POLICY "MasterAdmin can delete site assets"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'site-assets' AND has_role(auth.uid(), 'MasterAdmin'::app_role));

-- Add triggers for updated_at
CREATE TRIGGER update_site_settings_updated_at
  BEFORE UPDATE ON public.site_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_site_images_updated_at
  BEFORE UPDATE ON public.site_images
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_landing_features_updated_at
  BEFORE UPDATE ON public.landing_features
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_landing_sections_updated_at
  BEFORE UPDATE ON public.landing_sections
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed initial data from current Landing.tsx
INSERT INTO public.landing_sections (section_key, content, display_order) VALUES
('hero', '{
  "title": "Social Media Intelligence That Drives Results",
  "subtitle": "Track, measure, and optimize your social media campaigns with real-time AVE and SOV calculations. Built for We Are Social Indonesia.",
  "primaryCtaText": "Get Started",
  "primaryCtaAction": "/auth",
  "secondaryCtaText": "Learn More",
  "secondaryCtaAction": "#features"
}'::jsonb, 1),
('features', '{
  "title": "Powerful Features for Modern Teams"
}'::jsonb, 2),
('cta', '{
  "title": "Ready to Transform Your Media Analytics?",
  "description": "Join leading brands using WAS Media Hub to drive campaign success",
  "buttonText": "Start Tracking Now",
  "buttonAction": "/auth"
}'::jsonb, 3);

-- Seed landing features
INSERT INTO public.landing_features (title, description, icon_name, display_order) VALUES
('Campaign Tracking', 'Monitor earned, owned, and paid media metrics in real-time', 'BarChart3', 1),
('AVE Calculation', 'Automatic Advertising Value Equivalent with weighted multipliers', 'TrendingUp', 2),
('Client Portal', 'Secure client access to view campaigns and reports', 'Users', 3),
('Share of Voice', 'Track your brand''s presence against competitors', 'Award', 4);

-- Seed site settings
INSERT INTO public.site_settings (key, value, category, description) VALUES
('site_title', '"WAS Media Hub"'::jsonb, 'branding', 'Main site title'),
('footer_text', '"© 2025 We Are Social Indonesia. All rights reserved."'::jsonb, 'content', 'Footer copyright text'),
('header_login_text', '"Login"'::jsonb, 'content', 'Header login button text'),
('meta_description', '"Track, measure, and optimize your social media campaigns with real-time AVE and SOV calculations."'::jsonb, 'seo', 'Site meta description'),
('meta_keywords', '"social media, analytics, AVE, SOV, campaign tracking"'::jsonb, 'seo', 'Site meta keywords');