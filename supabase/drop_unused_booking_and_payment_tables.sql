-- =============================================================================
-- RELICUS DATABASE PURGE: DROP UNUSED BOOKING, PAYMENT & THERAPIST TABLES
-- =============================================================================
-- Context:
--   Relicus uses the official external web portal (https://www.relicus.in/)
--   rendered directly inside the app's Sessions WebView.
--   Therefore, native in-app booking, payments, therapist directories, email audit,
--   and webhook events tables in Supabase are obsolete and unused.
--
-- Running this script completely removes the 5 tables and instantly resolves
-- all 5 "RLS Disabled In Public" errors flagged in Supabase Security Advisor:
--   1. public.bookings
--   2. public.payments
--   3. public.email_audit
--   4. public.webhook_events
--   5. public.therapists
-- =============================================================================

-- Drop all dependent and unused tables cleanly
DROP TABLE IF EXISTS public.email_audit CASCADE;
DROP TABLE IF EXISTS public.webhook_events CASCADE;
DROP TABLE IF EXISTS public.payments CASCADE;
DROP TABLE IF EXISTS public.bookings CASCADE;
DROP TABLE IF EXISTS public.therapists CASCADE;

-- -----------------------------------------------------------------------------
-- Verification Query
-- This query confirms that none of these 5 tables exist in the public schema.
-- Expected output: 0 rows returned.
-- -----------------------------------------------------------------------------
SELECT
  tablename
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('therapists', 'bookings', 'payments', 'email_audit', 'webhook_events');
