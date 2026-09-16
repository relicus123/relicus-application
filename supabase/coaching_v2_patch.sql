-- =============================================================================
-- RELICUS COACHING MODULE: V2 SCHEMA PATCH
-- Adds support for:
-- 1. Video Lesson Thumbnail Images
-- 2. Mock & Regular Tests with Custom Duration, Proctoring & Attempt Policies
-- 3. Question Images for Tests & Practice Questions
-- =============================================================================

-- 1. Video Thumbnails
ALTER TABLE IF EXISTS public.coaching_videos 
  ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;

-- 2. Test Enhancements (Attempt Policy, Proctoring, Duration, Category)
ALTER TABLE IF EXISTS public.coaching_mock_tests 
  ADD COLUMN IF NOT EXISTS attempt_type TEXT DEFAULT 'multiple', -- 'multiple' or 'once'
  ADD COLUMN IF NOT EXISTS is_proctored BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS test_category TEXT DEFAULT 'mock'; -- 'mock' or 'final'

-- 3. Question Images (for Mock Tests and Practice Questions)
ALTER TABLE IF EXISTS public.coaching_mock_questions 
  ADD COLUMN IF NOT EXISTS image_url TEXT;

ALTER TABLE IF EXISTS public.coaching_practice_questions 
  ADD COLUMN IF NOT EXISTS image_url TEXT;

-- 4. Create storage bucket for coaching assets if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('coaching-assets', 'coaching-assets', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Ensure storage policies for coaching-assets
DROP POLICY IF EXISTS "Public can view coaching assets" ON storage.objects;
CREATE POLICY "Public can view coaching assets"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'coaching-assets');

DROP POLICY IF EXISTS "Anyone can upload coaching assets" ON storage.objects;
CREATE POLICY "Anyone can upload coaching assets"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'coaching-assets');

DROP POLICY IF EXISTS "Anyone can update coaching assets" ON storage.objects;
CREATE POLICY "Anyone can update coaching assets"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'coaching-assets');

-- Output success message
SELECT 'Relicus Coaching V2 Schema Patch applied successfully' AS status;
