-- 1. Lock down SECURITY DEFINER functions from direct API execution
REVOKE ALL ON FUNCTION public.get_user_type(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.can_access_brand(uuid, uuid, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.has_feature_permission(uuid, text, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.get_user_accessible_features(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
-- has_role is referenced by RLS policies, so authenticated must retain EXECUTE,
-- but anonymous callers should not be able to probe it.
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;

-- 2. Self-scoped SECURITY INVOKER replacements for client use
CREATE OR REPLACE FUNCTION public.my_accessible_features()
RETURNS TABLE(feature_id uuid, feature_code text, feature_name text, can_view boolean, can_create boolean, can_edit boolean, can_delete boolean, can_export boolean)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path TO 'public'
AS $$
  SELECT f.id, f.code, f.name, fp.can_view, fp.can_create, fp.can_edit, fp.can_delete, fp.can_export
  FROM public.user_job_assignments uja
  JOIN public.feature_permissions fp ON fp.job_title_id = uja.job_title_id
  JOIN public.features f ON f.id = fp.feature_id
  WHERE uja.user_id = auth.uid()
    AND f.is_active = true
    AND fp.can_view = true
$$;

REVOKE ALL ON FUNCTION public.my_accessible_features() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.my_accessible_features() TO authenticated;

CREATE OR REPLACE FUNCTION public.can_i_access_brand(_brand_id uuid, _access_level text DEFAULT 'view')
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path TO 'public'
AS $$
  SELECT
    EXISTS (
      SELECT 1 FROM public.user_job_assignments uja
      WHERE uja.user_id = auth.uid() AND uja.user_type = 'agency'::user_type_enum
    )
    OR public.has_role(auth.uid(), 'MasterAdmin')
    OR public.has_role(auth.uid(), 'Director')
    OR public.has_role(auth.uid(), 'Account')
    OR EXISTS (
      SELECT 1 FROM public.brand_access_grants bag
      WHERE bag.user_id = auth.uid()
        AND bag.brand_id = _brand_id
        AND bag.is_active = true
        AND (bag.expires_at IS NULL OR bag.expires_at > now())
        AND (
          (_access_level = 'view') OR
          (_access_level = 'edit' AND bag.access_level IN ('edit','admin')) OR
          (_access_level = 'admin' AND bag.access_level = 'admin')
        )
    )
$$;

REVOKE ALL ON FUNCTION public.can_i_access_brand(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.can_i_access_brand(uuid, text) TO authenticated;

-- 3. Scope company reads (contact_email) instead of all authenticated users
DROP POLICY IF EXISTS "Authenticated users can view companies" ON public.companies;

CREATE POLICY "Related users can view companies"
ON public.companies
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'MasterAdmin')
  OR public.has_role(auth.uid(), 'Director')
  OR public.has_role(auth.uid(), 'Account')
  OR EXISTS (
    SELECT 1 FROM public.user_job_assignments uja
    WHERE uja.user_id = auth.uid() AND uja.user_type = 'agency'::user_type_enum
  )
  OR EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.company_id = companies.id
  )
  OR EXISTS (
    SELECT 1
    FROM public.brand_access_grants bag
    JOIN public.brands b ON b.id = bag.brand_id
    WHERE bag.user_id = auth.uid()
      AND bag.is_active = true
      AND (bag.expires_at IS NULL OR bag.expires_at > now())
      AND b.company_id = companies.id
  )
);