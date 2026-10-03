-- =============================================================================
-- RELICUS SECURITY FINDING #8: NOTIFICATIONS RLS REMEDIATION
-- =============================================================================
-- Vulnerabilities:
-- 1. "Allow public all on coaching_notifications" granted unconditional ALL
--    access to public.
-- 2. "Notifications read viewable by all" allowed anyone (including anonymous)
--    to read all private targeted notifications.
-- 3. "Notifications update by user or admin" allowed editing broadcasts because
--    target_user_id IS NULL was true for all broadcast notifications, and lacked
--    WITH CHECK to prevent reassigning target_user_id.
--
-- Remediation:
-- - Drop all legacy and conflicting policies idempotently.
-- - Ensure RLS is enabled on coaching_notifications.
-- - SELECT: authenticated users can only view their own notifications
--   (target_user_id = auth.uid()), broadcast notifications (target_user_id IS NULL),
--   or all notifications if admin. Anonymous users cannot read private notifications.
-- - INSERT: authenticated admins only (public.is_admin()).
-- - UPDATE: authenticated admins OR the targeted recipient student.
--   WITH CHECK ensures target_user_id cannot be altered.
-- - DELETE: authenticated admins only (public.is_admin()).
-- =============================================================================

-- Step 1: Drop all existing, legacy, and conflicting policies idempotently
DROP POLICY IF EXISTS "Allow public all on coaching_notifications" ON public.coaching_notifications;
DROP POLICY IF EXISTS "Notifications read viewable by all" ON public.coaching_notifications;
DROP POLICY IF EXISTS "Notifications select policy" ON public.coaching_notifications;
DROP POLICY IF EXISTS "Notifications update by user or admin" ON public.coaching_notifications;
DROP POLICY IF EXISTS "Notifications insert by admin only" ON public.coaching_notifications;
DROP POLICY IF EXISTS "Notifications delete by admin only" ON public.coaching_notifications;
DROP POLICY IF EXISTS "Notifications write by admin only" ON public.coaching_notifications;

-- Step 2: Ensure Row-Level Security is explicitly enabled
ALTER TABLE public.coaching_notifications ENABLE ROW LEVEL SECURITY;

-- Step 3: Strictly scoped SELECT policy
CREATE POLICY "Notifications select policy"
  ON public.coaching_notifications FOR SELECT
  TO authenticated
  USING (
    target_user_id = auth.uid()
    OR target_user_id IS NULL
    OR public.is_admin()
  );

-- Step 4: Admin-only INSERT policy
CREATE POLICY "Notifications insert by admin only"
  ON public.coaching_notifications FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

-- Step 5: Recipient or Admin UPDATE policy with WITH CHECK integrity
CREATE POLICY "Notifications update by user or admin"
  ON public.coaching_notifications FOR UPDATE
  TO authenticated
  USING (
    (auth.uid() = target_user_id AND target_user_id IS NOT NULL)
    OR public.is_admin()
  )
  WITH CHECK (
    public.is_admin()
    OR (
      auth.uid() = target_user_id
      AND target_user_id IS NOT NULL
    )
  );

-- Step 6: Admin-only DELETE policy
CREATE POLICY "Notifications delete by admin only"
  ON public.coaching_notifications FOR DELETE
  TO authenticated
  USING (public.is_admin());
