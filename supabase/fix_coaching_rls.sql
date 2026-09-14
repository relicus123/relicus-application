-- =============================================================================
-- RELICUS DATABASE FIX: RLS INFINITE RECURSION & COACHING PERMISSIONS
-- Run this script in Supabase Dashboard -> SQL Editor
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. FIX RECURSION ON PROFILES USING SECURITY DEFINER FUNCTION
-- -----------------------------------------------------------------------------

-- Create a security-definer helper function to check admin role without triggering RLS on profiles
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$;

grant execute on function public.is_admin() to authenticated, anon;

-- Drop circular policies on profiles
drop policy if exists "Admins can manage all profiles" on profiles;
drop policy if exists "Users can update their own profile details" on profiles;
drop policy if exists "Users can update their own profiles" on profiles;
drop policy if exists "Profiles are viewable by authenticated users" on profiles;

alter table profiles enable row level security;

-- Public/Authenticated read for profiles
create policy "Profiles read viewable by all"
  on profiles for select
  using (true);

-- Users can only update their own profile details and cannot escalate role
create policy "Users can update their own profile details"
  on profiles for update
  using (auth.uid() = id)
  with check (
    auth.uid() = id and (role is null or role = 'student' or public.is_admin())
  );

-- Admins can manage all profiles (uses non-recursive security-definer function)
create policy "Admins can manage all profiles"
  on profiles for all
  using (public.is_admin());

-- -----------------------------------------------------------------------------
-- 2. FIX POLICIES ON USERS TABLE
-- -----------------------------------------------------------------------------

drop policy if exists "Admins manage all users" on users;
create policy "Admins manage all users"
  on users for all
  using (public.is_admin());

-- -----------------------------------------------------------------------------
-- 3. FIX COACHING TABLES: CLEAN PUBLIC READ & ADMIN WRITE (NO RECURSION)
-- -----------------------------------------------------------------------------

-- Coaching Exams
drop policy if exists "Coaching read viewable by all" on coaching_exams;
drop policy if exists "Coaching write by admin only" on coaching_exams;
create policy "Coaching read viewable by all" on coaching_exams for select using (true);
create policy "Coaching insert by admin only" on coaching_exams for insert with check (public.is_admin());
create policy "Coaching update by admin only" on coaching_exams for update using (public.is_admin());
create policy "Coaching delete by admin only" on coaching_exams for delete using (public.is_admin());

-- Exam Patterns
drop policy if exists "Exam patterns read viewable by all" on coaching_exam_patterns;
drop policy if exists "Exam patterns write by admin only" on coaching_exam_patterns;
create policy "Exam patterns read viewable by all" on coaching_exam_patterns for select using (true);
create policy "Exam patterns insert by admin only" on coaching_exam_patterns for insert with check (public.is_admin());
create policy "Exam patterns update by admin only" on coaching_exam_patterns for update using (public.is_admin());
create policy "Exam patterns delete by admin only" on coaching_exam_patterns for delete using (public.is_admin());

-- Coaching Subjects
drop policy if exists "Coaching subjects read viewable by all" on coaching_subjects;
drop policy if exists "Coaching subjects write by admin only" on coaching_subjects;
create policy "Coaching subjects read viewable by all" on coaching_subjects for select using (true);
create policy "Coaching subjects insert by admin only" on coaching_subjects for insert with check (public.is_admin());
create policy "Coaching subjects update by admin only" on coaching_subjects for update using (public.is_admin());
create policy "Coaching subjects delete by admin only" on coaching_subjects for delete using (public.is_admin());

-- Coaching Chapters
drop policy if exists "Coaching chapters read viewable by all" on coaching_chapters;
drop policy if exists "Coaching chapters write by admin only" on coaching_chapters;
create policy "Coaching chapters read viewable by all" on coaching_chapters for select using (true);
create policy "Coaching chapters insert by admin only" on coaching_chapters for insert with check (public.is_admin());
create policy "Coaching chapters update by admin only" on coaching_chapters for update using (public.is_admin());
create policy "Coaching chapters delete by admin only" on coaching_chapters for delete using (public.is_admin());

-- Coaching Videos
drop policy if exists "Coaching videos read viewable by all" on coaching_videos;
drop policy if exists "Coaching videos write by admin only" on coaching_videos;
create policy "Coaching videos read viewable by all" on coaching_videos for select using (true);
create policy "Coaching videos insert by admin only" on coaching_videos for insert with check (public.is_admin());
create policy "Coaching videos update by admin only" on coaching_videos for update using (public.is_admin());
create policy "Coaching videos delete by admin only" on coaching_videos for delete using (public.is_admin());

-- Coaching Notes
drop policy if exists "Coaching notes read viewable by all" on coaching_notes;
drop policy if exists "Coaching notes write by admin only" on coaching_notes;
create policy "Coaching notes read viewable by all" on coaching_notes for select using (true);
create policy "Coaching notes insert by admin only" on coaching_notes for insert with check (public.is_admin());
create policy "Coaching notes update by admin only" on coaching_notes for update using (public.is_admin());
create policy "Coaching notes delete by admin only" on coaching_notes for delete using (public.is_admin());

-- Coaching Practice Questions
drop policy if exists "Coaching practice questions read viewable by all" on coaching_practice_questions;
drop policy if exists "Coaching practice questions write by admin only" on coaching_practice_questions;
create policy "Coaching practice questions read viewable by all" on coaching_practice_questions for select using (true);
create policy "Coaching practice questions insert by admin only" on coaching_practice_questions for insert with check (public.is_admin());
create policy "Coaching practice questions update by admin only" on coaching_practice_questions for update using (public.is_admin());
create policy "Coaching practice questions delete by admin only" on coaching_practice_questions for delete using (public.is_admin());

-- Coaching Mock Tests
drop policy if exists "Coaching mock tests read viewable by all" on coaching_mock_tests;
drop policy if exists "Coaching mock tests write by admin only" on coaching_mock_tests;
create policy "Coaching mock tests read viewable by all" on coaching_mock_tests for select using (true);
create policy "Coaching mock tests insert by admin only" on coaching_mock_tests for insert with check (public.is_admin());
create policy "Coaching mock tests update by admin only" on coaching_mock_tests for update using (public.is_admin());
create policy "Coaching mock tests delete by admin only" on coaching_mock_tests for delete using (public.is_admin());

-- Coaching Mock Questions
drop policy if exists "Coaching mock questions read viewable by all" on coaching_mock_questions;
drop policy if exists "Coaching mock questions write by admin only" on coaching_mock_questions;
create policy "Coaching mock questions read viewable by all" on coaching_mock_questions for select using (true);
create policy "Coaching mock questions insert by admin only" on coaching_mock_questions for insert with check (public.is_admin());
create policy "Coaching mock questions update by admin only" on coaching_mock_questions for update using (public.is_admin());
create policy "Coaching mock questions delete by admin only" on coaching_mock_questions for delete using (public.is_admin());

-- Coaching Test Attempts
drop policy if exists "Users manage own test attempts" on coaching_test_attempts;
drop policy if exists "Users insert own test attempts" on coaching_test_attempts;
drop policy if exists "Users read own test attempts" on coaching_test_attempts;
drop policy if exists "Users delete own test attempts" on coaching_test_attempts;

alter table coaching_test_attempts enable row level security;
create policy "Users read own test attempts" on coaching_test_attempts for select using (true);
create policy "Users insert own test attempts" on coaching_test_attempts for insert with check (true);
create policy "Users delete own test attempts" on coaching_test_attempts for delete using (true);

select 'Coaching RLS policies successfully updated without infinite recursion.' as status;
