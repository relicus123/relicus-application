-- =============================================================================
-- RELICUS SECURITY MIGRATION: REMOVE 'OR TRUE' RLS FALLBACKS (FINDING #3)
-- Run this script in your Supabase Dashboard -> SQL Editor
--
-- Description:
--   Removes insecure 'OR true' and blanket access fallbacks from:
--   1. public.coaching_category_access
--   2. public.coaching_enrollments
--   3. public.coaching_test_exceptions
--
-- Authorization Rules:
--   - Students can only view their own records (auth.uid() = user_id).
--   - Admins (public.is_admin()) and service_role can view and manage all records.
--   - Anonymous / unauthenticated access is strictly DENIED.
-- =============================================================================

-- Ensure public.is_admin() helper exists and avoids circular RLS recursion
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, anon;

-- -----------------------------------------------------------------------------
-- 1. public.coaching_category_access
-- -----------------------------------------------------------------------------
ALTER TABLE public.coaching_category_access ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own category access" ON public.coaching_category_access;
DROP POLICY IF EXISTS "Admins can manage category access" ON public.coaching_category_access;

-- Students can read only their own active/granted category access
CREATE POLICY "Users can read own category access" 
  ON public.coaching_category_access
  FOR SELECT 
  TO authenticated
  USING (auth.uid() = user_id);

-- Admins and service_role have full management permissions (NO 'OR true' fallback)
CREATE POLICY "Admins can manage category access" 
  ON public.coaching_category_access
  FOR ALL 
  TO authenticated, service_role
  USING (
    public.is_admin() OR auth.role() = 'service_role'
  )
  WITH CHECK (
    public.is_admin() OR auth.role() = 'service_role'
  );


-- -----------------------------------------------------------------------------
-- 2. public.coaching_enrollments
-- -----------------------------------------------------------------------------
ALTER TABLE public.coaching_enrollments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own enrollments" ON public.coaching_enrollments;
DROP POLICY IF EXISTS "Admins can manage all enrollments" ON public.coaching_enrollments;

-- Students can read only their own enrollments; Admins and service_role can read all
CREATE POLICY "Users can read own enrollments" 
  ON public.coaching_enrollments
  FOR SELECT 
  TO authenticated, service_role
  USING (
    auth.uid() = user_id 
    OR public.is_admin() 
    OR auth.role() = 'service_role'
  );

-- Admins and service_role have full management permissions (NO 'OR true' fallback)
CREATE POLICY "Admins can manage all enrollments" 
  ON public.coaching_enrollments
  FOR ALL 
  TO authenticated, service_role
  USING (
    public.is_admin() OR auth.role() = 'service_role'
  )
  WITH CHECK (
    public.is_admin() OR auth.role() = 'service_role'
  );

-- Note: "Users can request enrollment" (INSERT WITH CHECK (auth.uid() = user_id AND status = 'pending'))
-- is preserved untouched.


-- -----------------------------------------------------------------------------
-- 3. public.coaching_test_exceptions
-- -----------------------------------------------------------------------------
ALTER TABLE public.coaching_test_exceptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Students can read own test exceptions" ON public.coaching_test_exceptions;
DROP POLICY IF EXISTS "Admins can manage test exceptions" ON public.coaching_test_exceptions;

-- Students can read only their own exceptions; Admins and service_role can read all
CREATE POLICY "Students can read own test exceptions" 
  ON public.coaching_test_exceptions
  FOR SELECT 
  TO authenticated, service_role
  USING (
    auth.uid() = user_id 
    OR public.is_admin() 
    OR auth.role() = 'service_role'
  );

-- Admins and service_role have full management permissions (NO 'OR true' fallback)
CREATE POLICY "Admins can manage test exceptions" 
  ON public.coaching_test_exceptions
  FOR ALL 
  TO authenticated, service_role
  USING (
    public.is_admin() OR auth.role() = 'service_role'
  )
  WITH CHECK (
    public.is_admin() OR auth.role() = 'service_role'
  );

-- Verification confirmation
SELECT 'Finding #3 security patch applied: OR true fallbacks removed successfully.' AS status;
