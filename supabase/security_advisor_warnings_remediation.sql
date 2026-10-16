-- =============================================================================
-- RELICUS SECURITY ADVISOR: WARNINGS REMEDIATION SCRIPT
-- =============================================================================
-- This script resolves the warnings reported by Supabase Security Advisor:
--
-- 1. [rls_policy_always_true]
--    Drops all 16 overly permissive "Allow public all" and "WITH CHECK (true)"
--    policies that allow unauthenticated INSERT / UPDATE / DELETE operations.
--    Replaces them with strict, least-privilege, owner- and admin-scoped policies.
--
-- 2. [public_bucket_allows_listing]
--    Drops the overly broad SELECT policy on storage.objects for the
--    'coaching-assets' bucket (preventing unauthenticated directory listing
--    while preserving direct public file access).
--
-- 3. [anon_security_definer_function_executable]
--    Revokes public/anon EXECUTE privileges from internal SECURITY DEFINER
--    functions (delete_own_user, handle_new_user, is_admin, register_device_session).
--
-- 4. [authenticated_security_definer_function_executable]
--    Revokes RPC EXECUTE privileges from trigger functions (handle_new_user)
--    so they cannot be called directly via PostgREST.
-- =============================================================================

-- Ensure helper function public.is_admin() exists
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


-- =============================================================================
-- PART 1: REMEDIATE RLS POLICIES (rls_policy_always_true)
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. coaching_announcements
-- -----------------------------------------------------------------------------
ALTER TABLE public.coaching_announcements ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public all on coaching_announcements" ON public.coaching_announcements;
DROP POLICY IF EXISTS "Announcements read viewable by all" ON public.coaching_announcements;
DROP POLICY IF EXISTS "Announcements insert by admin only" ON public.coaching_announcements;
DROP POLICY IF EXISTS "Announcements update by admin only" ON public.coaching_announcements;
DROP POLICY IF EXISTS "Announcements delete by admin only" ON public.coaching_announcements;

CREATE POLICY "Announcements read viewable by all"
  ON public.coaching_announcements FOR SELECT
  USING (true);

CREATE POLICY "Announcements insert by admin only"
  ON public.coaching_announcements FOR INSERT
  TO authenticated, service_role
  WITH CHECK (public.is_admin() OR auth.role() = 'service_role');

CREATE POLICY "Announcements update by admin only"
  ON public.coaching_announcements FOR UPDATE
  TO authenticated, service_role
  USING (public.is_admin() OR auth.role() = 'service_role')
  WITH CHECK (public.is_admin() OR auth.role() = 'service_role');

CREATE POLICY "Announcements delete by admin only"
  ON public.coaching_announcements FOR DELETE
  TO authenticated, service_role
  USING (public.is_admin() OR auth.role() = 'service_role');


-- -----------------------------------------------------------------------------
-- 2. coaching_doubts
-- -----------------------------------------------------------------------------
ALTER TABLE public.coaching_doubts ADD COLUMN IF NOT EXISTS user_id uuid;
ALTER TABLE public.coaching_doubts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public all on coaching_doubts" ON public.coaching_doubts;
DROP POLICY IF EXISTS "Users read own coaching doubts" ON public.coaching_doubts;
DROP POLICY IF EXISTS "Users insert own coaching doubts" ON public.coaching_doubts;
DROP POLICY IF EXISTS "Users update own coaching doubts" ON public.coaching_doubts;
DROP POLICY IF EXISTS "Users delete own coaching doubts" ON public.coaching_doubts;
DROP POLICY IF EXISTS "Admins manage all coaching doubts" ON public.coaching_doubts;

CREATE POLICY "Users read own coaching doubts"
  ON public.coaching_doubts FOR SELECT
  TO authenticated, service_role
  USING (auth.uid() = user_id OR public.is_admin() OR auth.role() = 'service_role');

CREATE POLICY "Users insert own coaching doubts"
  ON public.coaching_doubts FOR INSERT
  TO authenticated, service_role
  WITH CHECK ((auth.uid() = user_id AND user_id IS NOT NULL) OR public.is_admin() OR auth.role() = 'service_role');

CREATE POLICY "Users update own coaching doubts"
  ON public.coaching_doubts FOR UPDATE
  TO authenticated, service_role
  USING (auth.uid() = user_id OR public.is_admin() OR auth.role() = 'service_role')
  WITH CHECK (auth.uid() = user_id OR public.is_admin() OR auth.role() = 'service_role');

CREATE POLICY "Users delete own coaching doubts"
  ON public.coaching_doubts FOR DELETE
  TO authenticated, service_role
  USING (auth.uid() = user_id OR public.is_admin() OR auth.role() = 'service_role');


-- -----------------------------------------------------------------------------
-- 3. coaching_exam_categories
-- -----------------------------------------------------------------------------
ALTER TABLE public.coaching_exam_categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public all on coaching_exam_categories" ON public.coaching_exam_categories;
DROP POLICY IF EXISTS "Categories read viewable by all" ON public.coaching_exam_categories;
DROP POLICY IF EXISTS "Categories insert by admin only" ON public.coaching_exam_categories;
DROP POLICY IF EXISTS "Categories update by admin only" ON public.coaching_exam_categories;
DROP POLICY IF EXISTS "Categories delete by admin only" ON public.coaching_exam_categories;

CREATE POLICY "Categories read viewable by all"
  ON public.coaching_exam_categories FOR SELECT
  USING (true);

CREATE POLICY "Categories insert by admin only"
  ON public.coaching_exam_categories FOR INSERT
  TO authenticated, service_role
  WITH CHECK (public.is_admin() OR auth.role() = 'service_role');

CREATE POLICY "Categories update by admin only"
  ON public.coaching_exam_categories FOR UPDATE
  TO authenticated, service_role
  USING (public.is_admin() OR auth.role() = 'service_role')
  WITH CHECK (public.is_admin() OR auth.role() = 'service_role');

CREATE POLICY "Categories delete by admin only"
  ON public.coaching_exam_categories FOR DELETE
  TO authenticated, service_role
  USING (public.is_admin() OR auth.role() = 'service_role');


-- -----------------------------------------------------------------------------
-- 4 & 5. coaching_exam_feedback & coaching_exam_feedbacks
-- -----------------------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'coaching_exam_feedback') THEN
    ALTER TABLE public.coaching_exam_feedback ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Feedback insert by anyone" ON public.coaching_exam_feedback;
    DROP POLICY IF EXISTS "Feedback read viewable by all" ON public.coaching_exam_feedback;
    DROP POLICY IF EXISTS "Feedback delete by admin only" ON public.coaching_exam_feedback;

    CREATE POLICY "Feedback read viewable by all"
      ON public.coaching_exam_feedback FOR SELECT
      USING (true);

    CREATE POLICY "Feedback insert authenticated"
      ON public.coaching_exam_feedback FOR INSERT
      TO authenticated, service_role
      WITH CHECK (auth.uid() IS NOT NULL OR auth.role() = 'service_role');

    CREATE POLICY "Feedback manage by admin"
      ON public.coaching_exam_feedback FOR ALL
      TO authenticated, service_role
      USING (public.is_admin() OR auth.role() = 'service_role')
      WITH CHECK (public.is_admin() OR auth.role() = 'service_role');
  END IF;

  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'coaching_exam_feedbacks') THEN
    ALTER TABLE public.coaching_exam_feedbacks ADD COLUMN IF NOT EXISTS user_id uuid;
    ALTER TABLE public.coaching_exam_feedbacks ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Allow public all on coaching_exam_feedbacks" ON public.coaching_exam_feedbacks;
    DROP POLICY IF EXISTS "Feedbacks read viewable by all" ON public.coaching_exam_feedbacks;
    DROP POLICY IF EXISTS "Users insert own feedback" ON public.coaching_exam_feedbacks;
    DROP POLICY IF EXISTS "Admins manage all feedback" ON public.coaching_exam_feedbacks;

    CREATE POLICY "Feedbacks read viewable by all"
      ON public.coaching_exam_feedbacks FOR SELECT
      USING (true);

    CREATE POLICY "Users insert own feedback"
      ON public.coaching_exam_feedbacks FOR INSERT
      TO authenticated, service_role
      WITH CHECK ((auth.uid() = user_id AND user_id IS NOT NULL) OR public.is_admin() OR auth.role() = 'service_role');

    CREATE POLICY "Admins manage all feedback"
      ON public.coaching_exam_feedbacks FOR ALL
      TO authenticated, service_role
      USING (public.is_admin() OR auth.role() = 'service_role')
      WITH CHECK (public.is_admin() OR auth.role() = 'service_role');
  END IF;
END $$;


-- -----------------------------------------------------------------------------
-- 6. coaching_profiles
-- -----------------------------------------------------------------------------
ALTER TABLE public.coaching_profiles ADD COLUMN IF NOT EXISTS user_id uuid;
ALTER TABLE public.coaching_profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public all on coaching_profiles" ON public.coaching_profiles;
DROP POLICY IF EXISTS "User manage own coaching profile" ON public.coaching_profiles;

CREATE POLICY "User manage own coaching profile"
  ON public.coaching_profiles FOR ALL
  TO authenticated, service_role
  USING (auth.uid() = user_id OR public.is_admin() OR auth.role() = 'service_role')
  WITH CHECK (auth.uid() = user_id OR public.is_admin() OR auth.role() = 'service_role');


-- -----------------------------------------------------------------------------
-- 7. knownext_profiles
-- -----------------------------------------------------------------------------
ALTER TABLE public.knownext_profiles ADD COLUMN IF NOT EXISTS user_id uuid;
ALTER TABLE public.knownext_profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public all on knownext_profiles" ON public.knownext_profiles;
DROP POLICY IF EXISTS "User manage own knownext profile" ON public.knownext_profiles;
DROP POLICY IF EXISTS "Knownext profiles manage" ON public.knownext_profiles;
DROP POLICY IF EXISTS "Knownext profiles admin manage" ON public.knownext_profiles;

CREATE POLICY "User manage own knownext profile"
  ON public.knownext_profiles FOR ALL
  TO authenticated, service_role
  USING (auth.uid() = user_id OR public.is_admin() OR auth.role() = 'service_role')
  WITH CHECK (auth.uid() = user_id OR public.is_admin() OR auth.role() = 'service_role');


-- -----------------------------------------------------------------------------
-- 8. knownext_roadmap_progress
-- -----------------------------------------------------------------------------
ALTER TABLE public.knownext_roadmap_progress ADD COLUMN IF NOT EXISTS user_id uuid;
ALTER TABLE public.knownext_roadmap_progress ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public all on knownext_roadmap_progress" ON public.knownext_roadmap_progress;
DROP POLICY IF EXISTS "User manage own roadmap progress" ON public.knownext_roadmap_progress;

CREATE POLICY "User manage own roadmap progress"
  ON public.knownext_roadmap_progress FOR ALL
  TO authenticated, service_role
  USING (auth.uid() = user_id OR public.is_admin() OR auth.role() = 'service_role')
  WITH CHECK (auth.uid() = user_id OR public.is_admin() OR auth.role() = 'service_role');


-- -----------------------------------------------------------------------------
-- 9. knownext_saved_items
-- -----------------------------------------------------------------------------
ALTER TABLE public.knownext_saved_items ADD COLUMN IF NOT EXISTS user_id uuid;
ALTER TABLE public.knownext_saved_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public all on knownext_saved_items" ON public.knownext_saved_items;
DROP POLICY IF EXISTS "User manage own saved items" ON public.knownext_saved_items;

CREATE POLICY "User manage own saved items"
  ON public.knownext_saved_items FOR ALL
  TO authenticated, service_role
  USING (auth.uid() = user_id OR public.is_admin() OR auth.role() = 'service_role')
  WITH CHECK (auth.uid() = user_id OR public.is_admin() OR auth.role() = 'service_role');


-- -----------------------------------------------------------------------------
-- 10. mindfulness_journals
-- -----------------------------------------------------------------------------
ALTER TABLE public.mindfulness_journals ADD COLUMN IF NOT EXISTS user_id uuid;
ALTER TABLE public.mindfulness_journals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public all on mindfulness_journals" ON public.mindfulness_journals;
DROP POLICY IF EXISTS "User manage own journals" ON public.mindfulness_journals;
DROP POLICY IF EXISTS "Mindfulness journals manage" ON public.mindfulness_journals;
DROP POLICY IF EXISTS "Mindfulness journals admin manage" ON public.mindfulness_journals;

CREATE POLICY "User manage own journals"
  ON public.mindfulness_journals FOR ALL
  TO authenticated, service_role
  USING (auth.uid() = user_id OR public.is_admin() OR auth.role() = 'service_role')
  WITH CHECK (auth.uid() = user_id OR public.is_admin() OR auth.role() = 'service_role');


-- -----------------------------------------------------------------------------
-- 11. mindfulness_user_activities
-- -----------------------------------------------------------------------------
ALTER TABLE public.mindfulness_user_activities ADD COLUMN IF NOT EXISTS user_id uuid;
ALTER TABLE public.mindfulness_user_activities ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public all on mindfulness_user_activities" ON public.mindfulness_user_activities;
DROP POLICY IF EXISTS "User manage own user activities" ON public.mindfulness_user_activities;

CREATE POLICY "User manage own user activities"
  ON public.mindfulness_user_activities FOR ALL
  TO authenticated, service_role
  USING (auth.uid() = user_id OR public.is_admin() OR auth.role() = 'service_role')
  WITH CHECK (auth.uid() = user_id OR public.is_admin() OR auth.role() = 'service_role');


-- -----------------------------------------------------------------------------
-- 12. skills_doubts
-- -----------------------------------------------------------------------------
ALTER TABLE public.skills_doubts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Skills doubts insert viewable by all" ON public.skills_doubts;
DROP POLICY IF EXISTS "Anyone can insert doubts" ON public.skills_doubts;
DROP POLICY IF EXISTS "Doubts are viewable by everyone" ON public.skills_doubts;
DROP POLICY IF EXISTS "Admin can update doubts" ON public.skills_doubts;
DROP POLICY IF EXISTS "Authenticated users can insert doubts" ON public.skills_doubts;
DROP POLICY IF EXISTS "Users and admins can update doubts" ON public.skills_doubts;
DROP POLICY IF EXISTS "Users and admins can delete doubts" ON public.skills_doubts;
DROP POLICY IF EXISTS "Admins can update doubts" ON public.skills_doubts;
DROP POLICY IF EXISTS "Admins can delete doubts" ON public.skills_doubts;

CREATE POLICY "Doubts are viewable by everyone"
  ON public.skills_doubts FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert doubts"
  ON public.skills_doubts FOR INSERT
  TO authenticated, service_role
  WITH CHECK (auth.uid() IS NOT NULL OR auth.role() = 'service_role');

CREATE POLICY "Admins can update doubts"
  ON public.skills_doubts FOR UPDATE
  TO authenticated, service_role
  USING (public.is_admin() OR auth.role() = 'service_role')
  WITH CHECK (public.is_admin() OR auth.role() = 'service_role');

CREATE POLICY "Admins can delete doubts"
  ON public.skills_doubts FOR DELETE
  TO authenticated, service_role
  USING (public.is_admin() OR auth.role() = 'service_role');


-- -----------------------------------------------------------------------------
-- 13. tuition_completed_assignments
-- -----------------------------------------------------------------------------
ALTER TABLE public.tuition_completed_assignments ADD COLUMN IF NOT EXISTS user_id uuid;
ALTER TABLE public.tuition_completed_assignments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public all on tuition_completed_assignments" ON public.tuition_completed_assignments;
DROP POLICY IF EXISTS "User manage own assignments" ON public.tuition_completed_assignments;
DROP POLICY IF EXISTS "Tuition completed assignments manage" ON public.tuition_completed_assignments;
DROP POLICY IF EXISTS "Tuition completed assignments admin manage" ON public.tuition_completed_assignments;

CREATE POLICY "User manage own assignments"
  ON public.tuition_completed_assignments FOR ALL
  TO authenticated, service_role
  USING (auth.uid() = user_id OR public.is_admin() OR auth.role() = 'service_role')
  WITH CHECK (auth.uid() = user_id OR public.is_admin() OR auth.role() = 'service_role');


-- -----------------------------------------------------------------------------
-- 14. tuition_parents
-- -----------------------------------------------------------------------------
ALTER TABLE public.tuition_parents ADD COLUMN IF NOT EXISTS user_id uuid;
ALTER TABLE public.tuition_parents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public all on tuition_parents" ON public.tuition_parents;
DROP POLICY IF EXISTS "User manage own tuition parents" ON public.tuition_parents;
DROP POLICY IF EXISTS "Tuition parents manage" ON public.tuition_parents;
DROP POLICY IF EXISTS "Tuition parents admin manage" ON public.tuition_parents;

CREATE POLICY "User manage own tuition parents"
  ON public.tuition_parents FOR ALL
  TO authenticated, service_role
  USING (auth.uid() = user_id OR public.is_admin() OR auth.role() = 'service_role')
  WITH CHECK (auth.uid() = user_id OR public.is_admin() OR auth.role() = 'service_role');


-- -----------------------------------------------------------------------------
-- 15. tuition_students
-- -----------------------------------------------------------------------------
ALTER TABLE public.tuition_students ADD COLUMN IF NOT EXISTS user_id uuid;
ALTER TABLE public.tuition_students ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public all on tuition_students" ON public.tuition_students;
DROP POLICY IF EXISTS "User manage own tuition profile" ON public.tuition_students;
DROP POLICY IF EXISTS "Tuition students manage" ON public.tuition_students;
DROP POLICY IF EXISTS "Tuition students admin manage" ON public.tuition_students;

CREATE POLICY "User manage own tuition profile"
  ON public.tuition_students FOR ALL
  TO authenticated, service_role
  USING (auth.uid() = user_id OR public.is_admin() OR auth.role() = 'service_role')
  WITH CHECK (auth.uid() = user_id OR public.is_admin() OR auth.role() = 'service_role');


-- -----------------------------------------------------------------------------
-- 16. users
-- -----------------------------------------------------------------------------
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public inserts" ON public.users;
DROP POLICY IF EXISTS "Users read own" ON public.users;
DROP POLICY IF EXISTS "Users insert own" ON public.users;
DROP POLICY IF EXISTS "Users update own" ON public.users;
DROP POLICY IF EXISTS "Users delete own" ON public.users;
DROP POLICY IF EXISTS "Admins manage all users" ON public.users;

CREATE POLICY "Users read own"
  ON public.users FOR SELECT
  TO authenticated, service_role
  USING (auth.uid() = id OR public.is_admin() OR auth.role() = 'service_role');

CREATE POLICY "Users insert own"
  ON public.users FOR INSERT
  TO authenticated, service_role
  WITH CHECK (auth.uid() = id OR public.is_admin() OR auth.role() = 'service_role');

CREATE POLICY "Users update own"
  ON public.users FOR UPDATE
  TO authenticated, service_role
  USING (auth.uid() = id OR public.is_admin() OR auth.role() = 'service_role')
  WITH CHECK (auth.uid() = id OR public.is_admin() OR auth.role() = 'service_role');

CREATE POLICY "Users delete own"
  ON public.users FOR DELETE
  TO authenticated, service_role
  USING (auth.uid() = id OR public.is_admin() OR auth.role() = 'service_role');


-- =============================================================================
-- PART 2: STORAGE BUCKET LISTING PROTECTION (public_bucket_allows_listing)
-- =============================================================================
-- Public buckets already permit direct URL object downloads (/object/public/...)
-- without needing a blanket SELECT on storage.objects.
-- Dropping this policy prevents unauthorized directory listing.

DROP POLICY IF EXISTS "Public can view coaching assets" ON storage.objects;
DROP POLICY IF EXISTS "Admins manage coaching assets" ON storage.objects;

CREATE POLICY "Admins manage coaching assets"
  ON storage.objects FOR ALL
  TO authenticated, service_role
  USING (
    bucket_id = 'coaching-assets'
    AND (public.is_admin() OR auth.role() = 'service_role')
  )
  WITH CHECK (
    bucket_id = 'coaching-assets'
    AND (public.is_admin() OR auth.role() = 'service_role')
  );


-- =============================================================================
-- PART 3: REVOKE PUBLIC/ANON FROM SECURITY DEFINER FUNCTIONS
-- (anon_security_definer_function_executable & authenticated_security_definer_function_executable)
-- =============================================================================

-- 1. handle_new_user: Trigger function only. Should NEVER be executable via RPC.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'handle_new_user') THEN
    REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
  END IF;
END $$;

-- 2. delete_own_user: Account deletion RPC. Must be callable ONLY by authenticated users.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'delete_own_user') THEN
    REVOKE EXECUTE ON FUNCTION public.delete_own_user() FROM PUBLIC, anon;
    GRANT EXECUTE ON FUNCTION public.delete_own_user() TO authenticated;
  END IF;
END $$;

-- 3. register_device_session: Device limit session RPC. Callable ONLY by authenticated users.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'register_device_session') THEN
    REVOKE EXECUTE ON FUNCTION public.register_device_session(text, text, text, integer) FROM PUBLIC, anon;
    GRANT EXECUTE ON FUNCTION public.register_device_session(text, text, text, integer) TO authenticated;
  END IF;
END $$;

-- 4. is_admin: Internal RLS check function. Callable by authenticated users only.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'is_admin') THEN
    REVOKE EXECUTE ON FUNCTION public.is_admin() FROM PUBLIC, anon;
    GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
  END IF;
END $$;


-- =============================================================================
-- VERIFICATION CONFIRMATION
-- =============================================================================
SELECT 'Security Advisor Warnings Remediation Applied Successfully!' AS status;
