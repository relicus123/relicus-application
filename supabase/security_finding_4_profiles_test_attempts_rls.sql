-- ============================================================
-- RELICUS SECURITY MIGRATION — FINDING #4
-- Restrict Profiles + Coaching Test Attempts RLS
-- ============================================================

-- ============================================================
-- 1. PROFILES
-- Remove unrestricted SELECT policies
-- ============================================================

DROP POLICY IF EXISTS "Profiles are viewable by authenticated users"
ON public.profiles;

DROP POLICY IF EXISTS "Profiles read viewable by all"
ON public.profiles;

CREATE POLICY "Users can read own profile or admins can read all"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  auth.uid() = id
  OR public.is_admin()
);


-- ============================================================
-- 2. COACHING TEST ATTEMPTS
-- Remove blanket public access
-- Existing owner/admin policies remain untouched.
-- ============================================================

DROP POLICY IF EXISTS "Allow public all on coaching_test_attempts"
ON public.coaching_test_attempts;


-- ============================================================
-- Verification marker
-- ============================================================

SELECT
  'Finding #4 security patch applied: profile and test-attempt public access restricted.'
  AS status;