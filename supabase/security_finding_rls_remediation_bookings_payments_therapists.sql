-- =============================================================================
-- RELICUS: REMEDIATION FOR UNUSED BOOKING & PAYMENT TABLES
-- =============================================================================
-- Since 1-on-1 sessions and bookings are handled via the official web portal
-- (https://www.relicus.in/) rendered in the app's Sessions WebView, these 5
-- database tables are unused legacy artifacts.
--
-- RECOMMENDED ACTION: Run Part 1 below in Supabase SQL Editor to DROP these tables.
-- This permanently clears all 5 Security Advisor errors.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- PART 1: PERMANENT PURGE (RECOMMENDED — TABLES ARE NOT USED BY APP)
-- -----------------------------------------------------------------------------

DROP TABLE IF EXISTS public.email_audit CASCADE;
DROP TABLE IF EXISTS public.webhook_events CASCADE;
DROP TABLE IF EXISTS public.payments CASCADE;
DROP TABLE IF EXISTS public.bookings CASCADE;
DROP TABLE IF EXISTS public.therapists CASCADE;

-- Verification: should return 0 rows
SELECT tablename
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('therapists', 'bookings', 'payments', 'email_audit', 'webhook_events');


-- =============================================================================
-- PART 2: ALTERNATIVE (ONLY IF YOU PREFER TO KEEP EMPTY TABLES WITH RLS)
-- =============================================================================
/*
ALTER TABLE public.therapists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_audit ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to therapists"
  ON public.therapists FOR SELECT TO anon, authenticated, service_role USING (true);

CREATE POLICY "Admins can manage therapists"
  ON public.therapists FOR ALL TO authenticated, service_role
  USING (public.is_admin() OR auth.role() = 'service_role')
  WITH CHECK (public.is_admin() OR auth.role() = 'service_role');

CREATE POLICY "Bookings owner and admin only"
  ON public.bookings FOR ALL TO authenticated, service_role
  USING (auth.uid() = user_id OR auth.uid() = therapist_id OR public.is_admin() OR auth.role() = 'service_role')
  WITH CHECK ((auth.uid() = user_id AND user_id IS NOT NULL) OR public.is_admin() OR auth.role() = 'service_role');

CREATE POLICY "Payments owner and admin read"
  ON public.payments FOR SELECT TO authenticated, service_role
  USING (auth.uid() = user_id OR public.is_admin() OR auth.role() = 'service_role');

CREATE POLICY "Payments admin manage"
  ON public.payments FOR ALL TO authenticated, service_role
  USING (public.is_admin() OR auth.role() = 'service_role')
  WITH CHECK (public.is_admin() OR auth.role() = 'service_role');

CREATE POLICY "Email audit admin only"
  ON public.email_audit FOR ALL TO authenticated, service_role
  USING (public.is_admin() OR auth.role() = 'service_role')
  WITH CHECK (public.is_admin() OR auth.role() = 'service_role');

CREATE POLICY "Webhook events admin only"
  ON public.webhook_events FOR ALL TO authenticated, service_role
  USING (public.is_admin() OR auth.role() = 'service_role')
  WITH CHECK (public.is_admin() OR auth.role() = 'service_role');
*/
