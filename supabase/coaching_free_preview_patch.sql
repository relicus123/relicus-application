-- =============================================================================
-- RELICUS COACHING: FREE PREVIEW LECTURE PATCH
-- Adds support for:
-- 1. Marking a specific video lecture as a Free Preview / Demo Lecture (is_free_preview)
-- 2. Allows unenrolled students to sample 1 video lecture before requesting full course access
-- =============================================================================

-- 1. Add is_free_preview column to coaching_videos
ALTER TABLE IF EXISTS public.coaching_videos 
  ADD COLUMN IF NOT EXISTS is_free_preview BOOLEAN DEFAULT false;

-- 2. Create index for fast retrieval of free preview lectures
CREATE INDEX IF NOT EXISTS idx_coaching_videos_free_preview 
  ON public.coaching_videos(chapter_id, is_free_preview);

-- 3. Ensure existing RLS policy allows public/students to read video records
-- (coaching_videos is already public read via existing policy: "Coaching videos read viewable by all")
