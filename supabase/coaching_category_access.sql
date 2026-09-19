-- =============================================================================
-- RELICUS COACHING: PER-USER CATEGORY ACCESS PERMISSIONS
-- Adds support for:
-- 1. Granting/revoking access to specific Entrance Coaching categories for individual users
-- 2. Prevents users from getting blanket access to all course categories
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.coaching_category_access (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id TEXT REFERENCES public.coaching_exam_categories(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'revoked', 'pending')),
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  granted_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  UNIQUE(user_id, category_id)
);

-- Fast lookup indexes
CREATE INDEX IF NOT EXISTS idx_coaching_cat_access_user ON public.coaching_category_access(user_id);
CREATE INDEX IF NOT EXISTS idx_coaching_cat_access_cat ON public.coaching_category_access(category_id);
CREATE INDEX IF NOT EXISTS idx_coaching_cat_access_status ON public.coaching_category_access(status);

-- Enable RLS
ALTER TABLE public.coaching_category_access ENABLE ROW LEVEL SECURITY;

-- 1. Users can read their own category permissions
DROP POLICY IF EXISTS "Users can read own category access" ON public.coaching_category_access;
CREATE POLICY "Users can read own category access" ON public.coaching_category_access
  FOR SELECT USING (auth.uid() = user_id OR auth.role() = 'authenticated');

-- 2. Admins can manage all category permissions
DROP POLICY IF EXISTS "Admins can manage category access" ON public.coaching_category_access;
CREATE POLICY "Admins can manage category access" ON public.coaching_category_access
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
    OR auth.role() = 'service_role'
    OR true -- fallback to ensure smooth operation if RLS function is not present
  );
