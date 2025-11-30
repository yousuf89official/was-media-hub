
-- =====================================================
-- ENTERPRISE RBAC SYSTEM FOR WAS MEDIA HUB
-- =====================================================

-- 1. Create user_type enum
CREATE TYPE public.user_type_enum AS ENUM ('agency', 'client', 'guest');

-- 2. Create departments table (Agency organizational structure)
CREATE TABLE public.departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Create job_titles table
CREATE TABLE public.job_titles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  department_id UUID REFERENCES public.departments(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  seniority_level INTEGER DEFAULT 1,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Create features table (all controllable features/menus)
CREATE TABLE public.features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID REFERENCES public.features(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  feature_type TEXT DEFAULT 'menu',
  icon_name TEXT,
  route_path TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Create feature_permissions table (job_title → feature → permissions)
CREATE TABLE public.feature_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_title_id UUID REFERENCES public.job_titles(id) ON DELETE CASCADE NOT NULL,
  feature_id UUID REFERENCES public.features(id) ON DELETE CASCADE NOT NULL,
  can_view BOOLEAN DEFAULT false,
  can_create BOOLEAN DEFAULT false,
  can_edit BOOLEAN DEFAULT false,
  can_delete BOOLEAN DEFAULT false,
  can_export BOOLEAN DEFAULT false,
  custom_rules JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(job_title_id, feature_id)
);

-- 6. Create user_job_assignments table
CREATE TABLE public.user_job_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  user_type user_type_enum NOT NULL DEFAULT 'guest',
  job_title_id UUID REFERENCES public.job_titles(id) ON DELETE SET NULL,
  is_primary BOOLEAN DEFAULT true,
  assigned_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Create brand_access_grants table (client access to specific brands)
CREATE TABLE public.brand_access_grants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  brand_id UUID REFERENCES public.brands(id) ON DELETE CASCADE NOT NULL,
  access_level TEXT NOT NULL DEFAULT 'view',
  granted_by UUID REFERENCES public.profiles(id),
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, brand_id)
);

-- =====================================================
-- ENABLE RLS ON ALL TABLES
-- =====================================================

ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_titles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.features ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_job_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_access_grants ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- SECURITY FUNCTIONS
-- =====================================================

-- Get user type
CREATE OR REPLACE FUNCTION public.get_user_type(_user_id UUID)
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

-- Check if user has feature permission
CREATE OR REPLACE FUNCTION public.has_feature_permission(_user_id UUID, _feature_code TEXT, _permission TEXT)
RETURNS BOOLEAN
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
  -- MasterAdmin always has access
  OR has_role(_user_id, 'MasterAdmin')
$$;

-- Check if user can access a brand
CREATE OR REPLACE FUNCTION public.can_access_brand(_user_id UUID, _brand_id UUID, _access_level TEXT DEFAULT 'view')
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    -- Agency users can access all brands
    (get_user_type(_user_id) = 'agency')
    -- MasterAdmin/Director/Account roles have full access
    OR has_role(_user_id, 'MasterAdmin')
    OR has_role(_user_id, 'Director')
    OR has_role(_user_id, 'Account')
    -- Client users need explicit brand access
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

-- Get all accessible features for a user
CREATE OR REPLACE FUNCTION public.get_user_accessible_features(_user_id UUID)
RETURNS TABLE(
  feature_id UUID,
  feature_code TEXT,
  feature_name TEXT,
  can_view BOOLEAN,
  can_create BOOLEAN,
  can_edit BOOLEAN,
  can_delete BOOLEAN,
  can_export BOOLEAN
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

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- Departments: Everyone can view, MasterAdmin can manage
CREATE POLICY "Everyone can view departments" ON public.departments FOR SELECT USING (true);
CREATE POLICY "MasterAdmin can manage departments" ON public.departments FOR ALL USING (has_role(auth.uid(), 'MasterAdmin'));

-- Job titles: Everyone can view, MasterAdmin can manage
CREATE POLICY "Everyone can view job_titles" ON public.job_titles FOR SELECT USING (true);
CREATE POLICY "MasterAdmin can manage job_titles" ON public.job_titles FOR ALL USING (has_role(auth.uid(), 'MasterAdmin'));

-- Features: Everyone can view, MasterAdmin can manage
CREATE POLICY "Everyone can view features" ON public.features FOR SELECT USING (true);
CREATE POLICY "MasterAdmin can manage features" ON public.features FOR ALL USING (has_role(auth.uid(), 'MasterAdmin'));

-- Feature permissions: Authenticated can view, MasterAdmin can manage
CREATE POLICY "Authenticated can view feature_permissions" ON public.feature_permissions FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "MasterAdmin can manage feature_permissions" ON public.feature_permissions FOR ALL USING (has_role(auth.uid(), 'MasterAdmin'));

-- User job assignments: Users can view own, admins can manage all
CREATE POLICY "Users can view own job_assignment" ON public.user_job_assignments FOR SELECT USING (auth.uid() = user_id OR has_role(auth.uid(), 'MasterAdmin') OR has_role(auth.uid(), 'Director'));
CREATE POLICY "MasterAdmin can manage job_assignments" ON public.user_job_assignments FOR ALL USING (has_role(auth.uid(), 'MasterAdmin') OR has_role(auth.uid(), 'Director'));

-- Brand access grants: Users can view own, agency staff can manage
CREATE POLICY "Users can view own brand_access" ON public.brand_access_grants FOR SELECT USING (auth.uid() = user_id OR has_role(auth.uid(), 'MasterAdmin') OR has_role(auth.uid(), 'Director') OR has_role(auth.uid(), 'Account'));
CREATE POLICY "Staff can manage brand_access" ON public.brand_access_grants FOR ALL USING (has_role(auth.uid(), 'MasterAdmin') OR has_role(auth.uid(), 'Director') OR has_role(auth.uid(), 'Account'));

-- =====================================================
-- SEED DATA: DEPARTMENTS
-- =====================================================

INSERT INTO public.departments (code, name, description, display_order) VALUES
('executive', 'Executive & Leadership', 'Agency vision, growth, large accounts, commercial outcomes', 1),
('client_leadership', 'Client Leadership', 'Client relationship management and business outcomes', 2),
('strategy', 'Strategy & Planning', 'Insight, segmentation, positioning, consumer & competitive analysis', 3),
('creative', 'Creative', 'Big ideas, comms concept, creative positioning, asset production', 4),
('performance', 'Performance & Digital Ads', 'ROI, cost efficiency, revenue, CRO', 5),
('social_content', 'Social & Content', 'Social ecosystem, content strategy, brand voice', 6),
('data_analytics', 'Technology + Data + Analytics', 'Performance insights, dashboards, attribution', 7),
('tech_product', 'Tech & Digital Product', 'UX/UI, development, CRM automation', 8),
('execution', 'Execution & Delivery', 'Daily optimization, campaign management, QA', 9),
('support', 'Support Functions', 'Finance, HR, Project Management', 10);

-- =====================================================
-- SEED DATA: JOB TITLES
-- =====================================================

INSERT INTO public.job_titles (department_id, code, name, description, seniority_level, display_order)
SELECT d.id, 'ceo', 'Chief Executive Officer', 'Agency vision, growth, large accounts', 10, 1 FROM public.departments d WHERE d.code = 'executive'
UNION ALL SELECT d.id, 'cso', 'Chief Strategy Officer', 'Full funnel strategy, brand strategy', 9, 2 FROM public.departments d WHERE d.code = 'executive'
UNION ALL SELECT d.id, 'cmo', 'Chief Marketing Officer', 'Marketing transformation & client growth', 9, 3 FROM public.departments d WHERE d.code = 'executive'
UNION ALL SELECT d.id, 'client_director', 'Client Director', 'Owns client relationship and business outcomes', 8, 1 FROM public.departments d WHERE d.code = 'client_leadership'
UNION ALL SELECT d.id, 'account_manager', 'Account Manager', 'Campaign orchestration, briefs, timelines', 6, 2 FROM public.departments d WHERE d.code = 'client_leadership'
UNION ALL SELECT d.id, 'account_executive', 'Account Executive', 'Admin ops, communications, coordination', 4, 3 FROM public.departments d WHERE d.code = 'client_leadership'
UNION ALL SELECT d.id, 'head_of_strategy', 'Head of Strategy', 'Brand strategy & comms architecture', 8, 1 FROM public.departments d WHERE d.code = 'strategy'
UNION ALL SELECT d.id, 'media_planning_director', 'Media Planning Director', 'Channel strategy, flighting, mix modeling', 8, 2 FROM public.departments d WHERE d.code = 'strategy'
UNION ALL SELECT d.id, 'media_planner', 'Media Planner', 'Executable media plans, budget splits', 5, 3 FROM public.departments d WHERE d.code = 'strategy'
UNION ALL SELECT d.id, 'creative_director', 'Creative Director', 'Big idea, comms concept, creative positioning', 8, 1 FROM public.departments d WHERE d.code = 'creative'
UNION ALL SELECT d.id, 'art_director', 'Art Director', 'Develop and refine creative outputs', 6, 2 FROM public.departments d WHERE d.code = 'creative'
UNION ALL SELECT d.id, 'copy_director', 'Copy Director', 'Messaging and brand stories', 6, 3 FROM public.departments d WHERE d.code = 'creative'
UNION ALL SELECT d.id, 'designer', 'Designer', 'Asset production, KV variations', 4, 4 FROM public.departments d WHERE d.code = 'creative'
UNION ALL SELECT d.id, 'performance_lead', 'Performance Marketing Lead', 'ROI, cost efficiency, CRO', 7, 1 FROM public.departments d WHERE d.code = 'performance'
UNION ALL SELECT d.id, 'social_ads_specialist', 'Social Media Ads Specialist', 'Meta, TikTok, LinkedIn ads', 5, 2 FROM public.departments d WHERE d.code = 'performance'
UNION ALL SELECT d.id, 'sem_specialist', 'Search & SEM Specialist', 'Search architecture, bidding', 5, 3 FROM public.departments d WHERE d.code = 'performance'
UNION ALL SELECT d.id, 'programmatic_trader', 'Programmatic Trader', 'DSP/SSP/CDP precision marketing', 5, 4 FROM public.departments d WHERE d.code = 'performance'
UNION ALL SELECT d.id, 'head_of_social', 'Head of Social', 'Social ecosystem, content strategy', 8, 1 FROM public.departments d WHERE d.code = 'social_content'
UNION ALL SELECT d.id, 'content_strategist', 'Content Strategist', 'Content plan, calendar, narrative', 6, 2 FROM public.departments d WHERE d.code = 'social_content'
UNION ALL SELECT d.id, 'community_manager', 'Community Manager', 'Engagement & community building', 4, 3 FROM public.departments d WHERE d.code = 'social_content'
UNION ALL SELECT d.id, 'data_analyst', 'Data Analyst', 'Dashboards, attribution, reporting', 5, 1 FROM public.departments d WHERE d.code = 'data_analytics'
UNION ALL SELECT d.id, 'bi_lead', 'BI & Analytics Lead', 'Advanced analytics, MMM', 7, 2 FROM public.departments d WHERE d.code = 'data_analytics'
UNION ALL SELECT d.id, 'martech_specialist', 'Tracking & Martech Specialist', 'Pixels, SDK, events, CDP, CRM', 5, 3 FROM public.departments d WHERE d.code = 'data_analytics'
UNION ALL SELECT d.id, 'ux_designer', 'UX/UI Designer', 'CRO, landing pages, brand experiences', 5, 1 FROM public.departments d WHERE d.code = 'tech_product'
UNION ALL SELECT d.id, 'developer', 'Web/App Developer', 'Site builds, conversion pages', 5, 2 FROM public.departments d WHERE d.code = 'tech_product'
UNION ALL SELECT d.id, 'crm_specialist', 'CRM/Automation Specialist', 'Lifecycle flows, retention, nurturing', 5, 3 FROM public.departments d WHERE d.code = 'tech_product'
UNION ALL SELECT d.id, 'campaign_manager', 'Campaign Manager', 'Daily optimization, troubleshooting, scaling', 6, 1 FROM public.departments d WHERE d.code = 'execution'
UNION ALL SELECT d.id, 'qa_specialist', 'QA & Compliance Specialist', 'Tracking, naming, brand safety', 4, 2 FROM public.departments d WHERE d.code = 'execution'
UNION ALL SELECT d.id, 'finance_manager', 'Finance Manager', 'Billing, budgets, media spend control', 6, 1 FROM public.departments d WHERE d.code = 'support'
UNION ALL SELECT d.id, 'project_manager', 'Project Manager', 'Timeline management, resourcing', 6, 2 FROM public.departments d WHERE d.code = 'support'
UNION ALL SELECT d.id, 'hr_manager', 'HR Manager', 'Recruitment, training, development', 6, 3 FROM public.departments d WHERE d.code = 'support';

-- =====================================================
-- SEED DATA: FEATURES
-- =====================================================

INSERT INTO public.features (code, name, description, feature_type, icon_name, route_path, display_order) VALUES
('dashboard', 'Dashboard', 'Main dashboard overview', 'menu', 'Home', '/dashboard', 1),
('brands', 'Brands', 'Brand management', 'menu', 'Package', '/brands', 2),
('brands.view', 'View Brands', 'View brand details', 'action', NULL, NULL, 1),
('brands.create', 'Create Brands', 'Create new brands', 'action', NULL, NULL, 2),
('brands.edit', 'Edit Brands', 'Edit brand information', 'action', NULL, NULL, 3),
('brands.delete', 'Delete Brands', 'Delete brands', 'action', NULL, NULL, 4),
('campaigns', 'Campaigns', 'Campaign management', 'menu', 'Megaphone', NULL, 3),
('campaigns.view', 'View Campaigns', 'View campaign details', 'action', NULL, NULL, 1),
('campaigns.create', 'Create Campaigns', 'Create new campaigns', 'action', NULL, NULL, 2),
('campaigns.edit', 'Edit Campaigns', 'Edit campaign settings', 'action', NULL, NULL, 3),
('campaigns.delete', 'Delete Campaigns', 'Delete campaigns', 'action', NULL, NULL, 4),
('reports', 'Reports', 'Analytics and reports', 'menu', 'FileText', '/reports', 4),
('reports.view', 'View Reports', 'View analytics reports', 'action', NULL, NULL, 1),
('reports.export', 'Export Reports', 'Export report data', 'action', NULL, NULL, 2),
('ave_calculator', 'AVE Calculator', 'Advertising value equivalent calculator', 'menu', 'TrendingUp', '/ave-calculator', 5),
('calculation_logs', 'Calculation Logs', 'View calculation history', 'menu', 'History', '/calculation-logs', 6),
('creative_gallery', 'Creative Gallery', 'View and manage creatives', 'feature', 'Image', NULL, 7),
('creative_gallery.view', 'View Creatives', 'View creative assets', 'action', NULL, NULL, 1),
('creative_gallery.upload', 'Upload Creatives', 'Upload new creatives', 'action', NULL, NULL, 2),
('creative_gallery.delete', 'Delete Creatives', 'Delete creative assets', 'action', NULL, NULL, 3),
('financial_performance', 'Financial Performance', 'View financial metrics', 'feature', 'DollarSign', NULL, 8),
('financial_performance.client_view', 'Client Financial View', 'View client-facing financials', 'action', NULL, NULL, 1),
('financial_performance.agency_view', 'Agency Financial View', 'View internal financials with margins', 'action', NULL, NULL, 2),
('data_sources', 'Data Sources', 'Manage data connections', 'feature', 'Database', NULL, 9),
('admin', 'Administration', 'Admin settings', 'menu', 'Settings', NULL, 10),
('admin.brand_campaign_management', 'Brand & Campaign Management', 'Manage platform settings', 'menu', 'Package', '/brand-campaign-management', 1),
('admin.content_management', 'Content Management', 'Manage landing page content', 'menu', 'Layout', '/content-management', 2),
('admin.user_management', 'User Management', 'Manage users and permissions', 'menu', 'Users', '/user-management', 3),
('admin.media_outlets', 'Media Outlets', 'Manage media outlets', 'feature', 'Newspaper', '/media-outlets-management', 4),
('profile', 'Profile', 'User profile settings', 'menu', 'User', '/profile', 11);

-- Set parent_id for nested features
UPDATE public.features SET parent_id = (SELECT id FROM public.features WHERE code = 'brands') WHERE code LIKE 'brands.%';
UPDATE public.features SET parent_id = (SELECT id FROM public.features WHERE code = 'campaigns') WHERE code LIKE 'campaigns.%';
UPDATE public.features SET parent_id = (SELECT id FROM public.features WHERE code = 'reports') WHERE code LIKE 'reports.%';
UPDATE public.features SET parent_id = (SELECT id FROM public.features WHERE code = 'creative_gallery') WHERE code LIKE 'creative_gallery.%';
UPDATE public.features SET parent_id = (SELECT id FROM public.features WHERE code = 'financial_performance') WHERE code LIKE 'financial_performance.%';
UPDATE public.features SET parent_id = (SELECT id FROM public.features WHERE code = 'admin') WHERE code LIKE 'admin.%';

-- =====================================================
-- SEED DATA: DEFAULT PERMISSIONS
-- =====================================================

-- Executive roles: Full access to everything
INSERT INTO public.feature_permissions (job_title_id, feature_id, can_view, can_create, can_edit, can_delete, can_export)
SELECT jt.id, f.id, true, true, true, true, true
FROM public.job_titles jt
CROSS JOIN public.features f
WHERE jt.code IN ('ceo', 'cso', 'cmo');

-- Client Leadership: Full access except admin
INSERT INTO public.feature_permissions (job_title_id, feature_id, can_view, can_create, can_edit, can_delete, can_export)
SELECT jt.id, f.id, true, true, true, true, true
FROM public.job_titles jt
CROSS JOIN public.features f
WHERE jt.code IN ('client_director', 'account_manager')
AND f.code NOT LIKE 'admin.user_management%';

-- Account Executive: View + basic create
INSERT INTO public.feature_permissions (job_title_id, feature_id, can_view, can_create, can_edit, can_delete, can_export)
SELECT jt.id, f.id, true, 
  CASE WHEN f.code IN ('campaigns', 'campaigns.create', 'creative_gallery.upload') THEN true ELSE false END,
  false, false, true
FROM public.job_titles jt
CROSS JOIN public.features f
WHERE jt.code = 'account_executive'
AND f.code NOT LIKE 'admin%';

-- Strategy team: Full campaign/brand access, no admin
INSERT INTO public.feature_permissions (job_title_id, feature_id, can_view, can_create, can_edit, can_delete, can_export)
SELECT jt.id, f.id, true, true, true, false, true
FROM public.job_titles jt
CROSS JOIN public.features f
WHERE jt.code IN ('head_of_strategy', 'media_planning_director', 'media_planner')
AND f.code NOT LIKE 'admin%';

-- Creative team: View brands/campaigns, manage creatives
INSERT INTO public.feature_permissions (job_title_id, feature_id, can_view, can_create, can_edit, can_delete, can_export)
SELECT jt.id, f.id, 
  true,
  CASE WHEN f.code LIKE 'creative%' THEN true ELSE false END,
  CASE WHEN f.code LIKE 'creative%' THEN true ELSE false END,
  CASE WHEN f.code = 'creative_gallery.delete' THEN true ELSE false END,
  true
FROM public.job_titles jt
CROSS JOIN public.features f
WHERE jt.code IN ('creative_director', 'art_director', 'copy_director', 'designer')
AND f.code NOT LIKE 'admin%' AND f.code NOT LIKE 'financial%';

-- Performance team: Full campaign access
INSERT INTO public.feature_permissions (job_title_id, feature_id, can_view, can_create, can_edit, can_delete, can_export)
SELECT jt.id, f.id, true, true, true, false, true
FROM public.job_titles jt
CROSS JOIN public.features f
WHERE jt.code IN ('performance_lead', 'social_ads_specialist', 'sem_specialist', 'programmatic_trader')
AND f.code NOT LIKE 'admin%';

-- Social & Content team
INSERT INTO public.feature_permissions (job_title_id, feature_id, can_view, can_create, can_edit, can_delete, can_export)
SELECT jt.id, f.id, true, true, true, false, true
FROM public.job_titles jt
CROSS JOIN public.features f
WHERE jt.code IN ('head_of_social', 'content_strategist', 'community_manager')
AND f.code NOT LIKE 'admin%' AND f.code NOT LIKE 'financial_performance.agency%';

-- Data & Analytics team: Full view + export, no delete
INSERT INTO public.feature_permissions (job_title_id, feature_id, can_view, can_create, can_edit, can_delete, can_export)
SELECT jt.id, f.id, true, false, false, false, true
FROM public.job_titles jt
CROSS JOIN public.features f
WHERE jt.code IN ('data_analyst', 'bi_lead', 'martech_specialist')
AND f.code NOT LIKE 'admin.user%';

-- Campaign Manager: Full operational access
INSERT INTO public.feature_permissions (job_title_id, feature_id, can_view, can_create, can_edit, can_delete, can_export)
SELECT jt.id, f.id, true, true, true, false, true
FROM public.job_titles jt
CROSS JOIN public.features f
WHERE jt.code = 'campaign_manager'
AND f.code NOT LIKE 'admin%';

-- Support functions: Limited view access
INSERT INTO public.feature_permissions (job_title_id, feature_id, can_view, can_create, can_edit, can_delete, can_export)
SELECT jt.id, f.id, 
  CASE WHEN f.code IN ('dashboard', 'brands', 'brands.view', 'reports', 'reports.view', 'profile') THEN true ELSE false END,
  false, false, false, 
  CASE WHEN f.code LIKE 'reports%' THEN true ELSE false END
FROM public.job_titles jt
CROSS JOIN public.features f
WHERE jt.code IN ('finance_manager', 'project_manager', 'hr_manager', 'qa_specialist');

-- =====================================================
-- TRIGGERS FOR UPDATED_AT
-- =====================================================

CREATE TRIGGER update_departments_updated_at BEFORE UPDATE ON public.departments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_job_titles_updated_at BEFORE UPDATE ON public.job_titles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_features_updated_at BEFORE UPDATE ON public.features FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_feature_permissions_updated_at BEFORE UPDATE ON public.feature_permissions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_user_job_assignments_updated_at BEFORE UPDATE ON public.user_job_assignments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_brand_access_grants_updated_at BEFORE UPDATE ON public.brand_access_grants FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
