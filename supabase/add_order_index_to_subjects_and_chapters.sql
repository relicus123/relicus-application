-- =============================================================================
-- RELICUS: ADD ORDER_INDEX TO COACHING SUBJECTS & CHAPTERS
-- Allows Admin to reorder subjects and chapters via the admin panel,
-- persisting the custom order across the admin panel and mobile application.
-- =============================================================================

-- 1. Add order_index column to coaching_subjects
ALTER TABLE public.coaching_subjects
  ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 0;

-- 2. Add order_index column to coaching_chapters
ALTER TABLE public.coaching_chapters
  ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 0;

-- 3. Populate existing rows with sequential default order based on creation / id
WITH ranked_subjects AS (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY exam_id ORDER BY id ASC) - 1 AS new_order
  FROM public.coaching_subjects
)
UPDATE public.coaching_subjects s
SET order_index = r.new_order
FROM ranked_subjects r
WHERE s.id = r.id AND (s.order_index IS NULL OR s.order_index = 0);

WITH ranked_chapters AS (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY subject_id ORDER BY id ASC) - 1 AS new_order
  FROM public.coaching_chapters
)
UPDATE public.coaching_chapters c
SET order_index = r.new_order
FROM ranked_chapters r
WHERE c.id = r.id AND (c.order_index IS NULL OR c.order_index = 0);
