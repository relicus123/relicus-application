-- =============================================================================
-- RELICUS COACHING MODULE: PRODUCTION SECURITY & RLS PATCH (IDEMPOTENT)
-- Run this script in Supabase Dashboard -> SQL Editor
-- Resolves:
--   1. ERROR 42710 (policy already exists) -> Drops existing policies first
--   2. ERROR 42703 (column "user_id" does not exist) -> Adds user_id if missing
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. COACHING TEST ATTEMPTS
-- -----------------------------------------------------------------------------
create table if not exists public.coaching_test_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  test_id text,
  test_name text,
  exam_type text,
  score numeric default 0,
  max_score numeric default 100,
  accuracy numeric default 0,
  rank integer default 1,
  percentile numeric default 100,
  time_taken integer default 0,
  correct_count integer default 0,
  incorrect_count integer default 0,
  unattempted_count integer default 0,
  answers jsonb default '[]'::jsonb,
  topic_analysis jsonb default '[]'::jsonb,
  section_analysis jsonb default '[]'::jsonb,
  created_at timestamptz default timezone('utc'::text, now())
);

-- Ensure user_id column exists (prevents Error 42703)
alter table public.coaching_test_attempts add column if not exists user_id uuid;

-- Enable RLS
alter table public.coaching_test_attempts enable row level security;

-- Drop all existing policy variants first (prevents Error 42710)
drop policy if exists "Users read own test attempts" on public.coaching_test_attempts;
drop policy if exists "Users insert own test attempts" on public.coaching_test_attempts;
drop policy if exists "Users update own test attempts" on public.coaching_test_attempts;
drop policy if exists "Users delete own test attempts" on public.coaching_test_attempts;
drop policy if exists "Users manage own test attempts" on public.coaching_test_attempts;
drop policy if exists "Coaching test attempts read viewable" on public.coaching_test_attempts;
drop policy if exists "Coaching test attempts write manage" on public.coaching_test_attempts;
drop policy if exists "Coaching test attempts admin manage" on public.coaching_test_attempts;
drop policy if exists "User manage own test attempts" on public.coaching_test_attempts;

-- Create strict, secure policies
create policy "Users read own test attempts" 
  on public.coaching_test_attempts for select 
  using (auth.uid() = user_id);

create policy "Users insert own test attempts" 
  on public.coaching_test_attempts for insert 
  with check (auth.uid() = user_id);

create policy "Users update own test attempts" 
  on public.coaching_test_attempts for update 
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users delete own test attempts" 
  on public.coaching_test_attempts for delete 
  using (auth.uid() = user_id);

-- Admins can view all attempts
create policy "Admins view all test attempts"
  on public.coaching_test_attempts for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );


-- -----------------------------------------------------------------------------
-- 2. COACHING DOUBTS
-- -----------------------------------------------------------------------------
create table if not exists public.coaching_doubts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  exam_type text,
  title text,
  description text,
  question text,
  user_email text,
  user_name text,
  subject_id text,
  status text default 'open',
  responses jsonb default '[]'::jsonb,
  response text,
  created_at timestamptz default timezone('utc'::text, now())
);

-- Ensure user_id column exists (prevents Error 42703)
alter table public.coaching_doubts add column if not exists user_id uuid;

-- Enable RLS
alter table public.coaching_doubts enable row level security;

-- Drop all existing policy variants first (prevents Error 42710)
drop policy if exists "Users read own coaching doubts" on public.coaching_doubts;
drop policy if exists "Users insert own coaching doubts" on public.coaching_doubts;
drop policy if exists "Users update own coaching doubts" on public.coaching_doubts;
drop policy if exists "Users delete own coaching doubts" on public.coaching_doubts;
drop policy if exists "Coaching doubts read viewable" on public.coaching_doubts;
drop policy if exists "Coaching doubts write manage" on public.coaching_doubts;
drop policy if exists "User manage own coaching doubts" on public.coaching_doubts;
drop policy if exists "Admins manage all coaching doubts" on public.coaching_doubts;

-- Create strict, secure policies
create policy "Users read own coaching doubts"
  on public.coaching_doubts for select
  using (auth.uid() = user_id);

create policy "Users insert own coaching doubts"
  on public.coaching_doubts for insert
  with check (auth.uid() = user_id);

create policy "Users update own coaching doubts"
  on public.coaching_doubts for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users delete own coaching doubts"
  on public.coaching_doubts for delete
  using (auth.uid() = user_id);

-- Admins can view and respond to all student doubts
create policy "Admins manage all coaching doubts"
  on public.coaching_doubts for all
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );


-- -----------------------------------------------------------------------------
-- 3. COACHING EXAM FEEDBACKS (REVIEWS)
-- -----------------------------------------------------------------------------
create table if not exists public.coaching_exam_feedbacks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  exam_id text not null,
  user_name text,
  rating numeric default 5,
  comment text,
  created_at timestamptz default timezone('utc'::text, now())
);

-- Crucial: Ensure user_id column exists (this resolved Error 42703!)
alter table public.coaching_exam_feedbacks add column if not exists user_id uuid;

-- Enable RLS
alter table public.coaching_exam_feedbacks enable row level security;

-- Drop all existing policies first (prevents Error 42710)
drop policy if exists "Feedbacks read viewable by all" on public.coaching_exam_feedbacks;
drop policy if exists "Users insert own feedback" on public.coaching_exam_feedbacks;
drop policy if exists "Users update own feedback" on public.coaching_exam_feedbacks;
drop policy if exists "Users delete own feedback" on public.coaching_exam_feedbacks;
drop policy if exists "Admins manage all feedback" on public.coaching_exam_feedbacks;

-- Public read for reviews (so all students can see ratings)
create policy "Feedbacks read viewable by all"
  on public.coaching_exam_feedbacks for select
  using (true);

-- Authenticated users can insert their own feedback
create policy "Users insert own feedback"
  on public.coaching_exam_feedbacks for insert
  with check (auth.uid() is not null and (user_id is null or user_id = auth.uid()));

-- Users can delete only their own feedback
create policy "Users delete own feedback"
  on public.coaching_exam_feedbacks for delete
  using (auth.uid() = user_id);


-- -----------------------------------------------------------------------------
-- 4. COACHING PROFILES
-- -----------------------------------------------------------------------------
create table if not exists public.coaching_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique not null,
  selected_exam text,
  selected_exam_id text,
  target_exam text,
  learning_streak integer default 1,
  study_streak integer default 1,
  streak_count integer default 1,
  target_year integer default 2026,
  updated_at timestamptz default timezone('utc'::text, now())
);

alter table public.coaching_profiles add column if not exists user_id uuid;
alter table public.coaching_profiles enable row level security;

drop policy if exists "User manage own coaching profile" on public.coaching_profiles;
drop policy if exists "Coaching profiles read viewable" on public.coaching_profiles;
drop policy if exists "Coaching profiles write manage" on public.coaching_profiles;

create policy "User manage own coaching profile"
  on public.coaching_profiles for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);


-- -----------------------------------------------------------------------------
-- 5. VERIFICATION NOTICE
-- -----------------------------------------------------------------------------
select 'Relicus Coaching RLS security patch applied successfully with zero errors!' as result;
