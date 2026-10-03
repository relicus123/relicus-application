-- =============================================================================
-- RELICUS PRODUCTION PERFORMANCE OPTIMIZATION: FOREIGN KEY INDEXES
-- Non-destructive, idempotent migration to eliminate sequential scans
-- and prevent PostgreSQL connection pool saturation / query timeouts.
--
-- AUDIT NOTE:
-- Existing indexes were verified:
-- - `coaching_category_access(user_id)` -> already exists (idx_coaching_cat_access_user)
-- - `coaching_enrollments(user_id)`     -> already exists (idx_coaching_enrollments_user)
-- - `coaching_videos(is_free_preview)`  -> already exists (idx_coaching_videos_free_preview)
--
-- The following 11 indexes are strictly MISSING foreign-key indexes that
-- directly match high-frequency queries in the production mobile app and admin.
-- =============================================================================

-- 1. Coaching Subjects by Exam (Used in fetchExamDashboard & Admin Coaching Manager)
CREATE INDEX IF NOT EXISTS idx_coaching_subjects_exam_id 
ON public.coaching_subjects(exam_id);

-- 2. Coaching Chapters by Subject (Used in fetchChapters & Admin Coaching Manager)
CREATE INDEX IF NOT EXISTS idx_coaching_chapters_subject_id 
ON public.coaching_chapters(subject_id);

-- 3. Coaching Videos by Chapter (Used in chapter resource expansion & Admin)
CREATE INDEX IF NOT EXISTS idx_coaching_videos_chapter_id 
ON public.coaching_videos(chapter_id);

-- 4. Coaching Notes by Chapter (Used in chapter PDF notes list & Admin)
CREATE INDEX IF NOT EXISTS idx_coaching_notes_chapter_id 
ON public.coaching_notes(chapter_id);

-- 5. Coaching Practice Questions by Chapter (Used in chapter practice arena)
CREATE INDEX IF NOT EXISTS idx_coaching_practice_questions_chapter_id 
ON public.coaching_practice_questions(chapter_id);

-- 6. Coaching Mock Tests by Exam (Used in mock tests tab & Admin)
CREATE INDEX IF NOT EXISTS idx_coaching_mock_tests_exam_id 
ON public.coaching_mock_tests(exam_id);

-- 7. Coaching Mock Questions by Test ID (Used in test arena when taking exam)
CREATE INDEX IF NOT EXISTS idx_coaching_mock_questions_mock_test_id 
ON public.coaching_mock_questions(mock_test_id);

-- 8. Coaching Live Classes by Exam (Used in live classes tab)
CREATE INDEX IF NOT EXISTS idx_coaching_live_classes_exam_id 
ON public.coaching_live_classes(exam_id);

-- 9. Coaching Announcements by Exam (Used in exam notice board)
CREATE INDEX IF NOT EXISTS idx_coaching_announcements_exam_id 
ON public.coaching_announcements(exam_id);

-- 10. Coaching Doubts by User ID (Used in doubt desk & user doubt history)
CREATE INDEX IF NOT EXISTS idx_coaching_doubts_user_id 
ON public.coaching_doubts(user_id);

-- 11. Coaching Test Attempts by User ID (Used in test history & analytics)
CREATE INDEX IF NOT EXISTS idx_coaching_test_attempts_user_id 
ON public.coaching_test_attempts(user_id);
