-- =============================================================================
-- RELICUS PRODUCTION COMPLETE DATABASE SCHEMA & COLUMN AUDIT
-- IDEMPOTENT: If table/column exists -> SKIPS. If missing -> CREATES.
-- Safe to run on live production database without data loss.
-- =============================================================================

-- Enable required extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- =============================================================================
-- 1. USER PROFILES & AUTHENTICATION
-- =============================================================================

create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text,
  username text,
  full_name text,
  phone text,
  role text default 'student',
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Ensure all columns exist on profiles
alter table public.profiles add column if not exists email text;
alter table public.profiles add column if not exists username text;
alter table public.profiles add column if not exists full_name text;
alter table public.profiles add column if not exists phone text;
alter table public.profiles add column if not exists role text default 'student';
alter table public.profiles add column if not exists avatar_url text;
alter table public.profiles add column if not exists created_at timestamp with time zone default timezone('utc'::text, now());
alter table public.profiles add column if not exists updated_at timestamp with time zone default timezone('utc'::text, now());

alter table public.profiles enable row level security;

-- App Users Table (For Phone login / Legacy profile sync)
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  phone text,
  username text,
  email text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

alter table public.users add column if not exists phone text;
alter table public.users add column if not exists username text;
alter table public.users add column if not exists email text;
alter table public.users add column if not exists created_at timestamp with time zone default timezone('utc'::text, now());

alter table public.users enable row level security;

-- =============================================================================
-- 2. ENTRANCE COACHING MODULE
-- =============================================================================

create table if not exists public.coaching_exams (
  id text primary key,
  full_name text not null,
  tagline text,
  overview text,
  eligibility text[],
  next_exam_date text,
  difficulty_level integer default 3,
  career_opportunities text[],
  created_at timestamp with time zone default timezone('utc'::text, now())
);

alter table public.coaching_exams add column if not exists full_name text;
alter table public.coaching_exams add column if not exists tagline text;
alter table public.coaching_exams add column if not exists overview text;
alter table public.coaching_exams add column if not exists eligibility text[];
alter table public.coaching_exams add column if not exists next_exam_date text;
alter table public.coaching_exams add column if not exists difficulty_level integer default 3;
alter table public.coaching_exams add column if not exists career_opportunities text[];

create table if not exists public.coaching_exam_patterns (
  id uuid default gen_random_uuid() primary key,
  exam_id text references public.coaching_exams(id) on delete cascade,
  section text not null,
  questions integer not null,
  marks integer not null,
  duration text not null
);

create table if not exists public.coaching_subjects (
  id text primary key,
  exam_id text references public.coaching_exams(id) on delete cascade,
  name text not null,
  icon text,
  color text,
  chapters_count integer default 0,
  mock_tests_count integer default 0
);

alter table public.coaching_subjects add column if not exists exam_id text;
alter table public.coaching_subjects add column if not exists name text;
alter table public.coaching_subjects add column if not exists icon text;
alter table public.coaching_subjects add column if not exists color text;
alter table public.coaching_subjects add column if not exists chapters_count integer default 0;
alter table public.coaching_subjects add column if not exists mock_tests_count integer default 0;

create table if not exists public.coaching_chapters (
  id text primary key,
  subject_id text references public.coaching_subjects(id) on delete cascade,
  name text not null,
  progress integer default 0
);

alter table public.coaching_chapters add column if not exists subject_id text;
alter table public.coaching_chapters add column if not exists name text;
alter table public.coaching_chapters add column if not exists progress integer default 0;

create table if not exists public.coaching_videos (
  id text primary key,
  chapter_id text references public.coaching_chapters(id) on delete cascade,
  title text not null,
  duration text not null,
  url text not null,
  is_watched boolean default false
);

create table if not exists public.coaching_notes (
  id text primary key,
  chapter_id text references public.coaching_chapters(id) on delete cascade,
  title text not null,
  size text default '2.5 MB',
  pdf_url text not null,
  is_bookmarked boolean default false
);

create table if not exists public.coaching_assignments (
  id text primary key,
  chapter_id text references public.coaching_chapters(id) on delete cascade,
  title text not null,
  due_date text not null,
  status text default 'pending',
  score text
);

create table if not exists public.coaching_practice_questions (
  id uuid default gen_random_uuid() primary key,
  chapter_id text references public.coaching_chapters(id) on delete cascade,
  question text not null,
  options text[] not null,
  correct_answer integer not null,
  explanation text
);

create table if not exists public.coaching_mock_tests (
  id text primary key,
  exam_id text references public.coaching_exams(id) on delete cascade,
  name text not null,
  type text default 'full',
  subject_id text references public.coaching_subjects(id) on delete set null,
  duration integer not null default 3600,
  questions_count integer not null default 30
);

alter table public.coaching_mock_tests add column if not exists exam_id text;
alter table public.coaching_mock_tests add column if not exists name text;
alter table public.coaching_mock_tests add column if not exists type text default 'full';
alter table public.coaching_mock_tests add column if not exists duration integer default 3600;
alter table public.coaching_mock_tests add column if not exists questions_count integer default 30;

create table if not exists public.coaching_mock_questions (
  id uuid default gen_random_uuid() primary key,
  mock_test_id text references public.coaching_mock_tests(id) on delete cascade,
  question text not null,
  options text[] not null,
  correct_answer integer not null,
  explanation text,
  subject text not null,
  topic text
);

create table if not exists public.coaching_live_classes (
  id text primary key,
  exam_id text references public.coaching_exams(id) on delete cascade,
  title text not null,
  mentor text,
  start_time timestamp with time zone,
  meet_link text,
  status text default 'upcoming',
  created_at timestamp with time zone default timezone('utc'::text, now())
);

create table if not exists public.coaching_profiles (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  selected_exam_id text,
  study_streak integer default 0,
  target_year integer default 2026,
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  unique(user_id)
);

alter table public.coaching_profiles add column if not exists selected_exam_id text;
alter table public.coaching_profiles add column if not exists study_streak integer default 0;
alter table public.coaching_profiles add column if not exists target_year integer default 2026;
alter table public.coaching_profiles add column if not exists updated_at timestamp with time zone default timezone('utc'::text, now());

create table if not exists public.coaching_doubts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  user_email text,
  user_name text,
  question text not null,
  subject_id text,
  status text default 'pending',
  response text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

alter table public.coaching_doubts add column if not exists user_id uuid;
alter table public.coaching_doubts add column if not exists user_email text;
alter table public.coaching_doubts add column if not exists user_name text;
alter table public.coaching_doubts add column if not exists question text;
alter table public.coaching_doubts add column if not exists subject_id text;
alter table public.coaching_doubts add column if not exists status text default 'pending';
alter table public.coaching_doubts add column if not exists response text;

create table if not exists public.coaching_test_attempts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  test_id text,
  exam_type text,
  score numeric default 0,
  total_score numeric default 100,
  accuracy numeric default 0,
  time_taken_seconds integer default 0,
  answers jsonb,
  date timestamp with time zone default timezone('utc'::text, now()),
  created_at timestamp with time zone default timezone('utc'::text, now())
);

alter table public.coaching_test_attempts add column if not exists test_id text;
alter table public.coaching_test_attempts add column if not exists exam_type text;
alter table public.coaching_test_attempts add column if not exists score numeric default 0;
alter table public.coaching_test_attempts add column if not exists total_score numeric default 100;
alter table public.coaching_test_attempts add column if not exists accuracy numeric default 0;
alter table public.coaching_test_attempts add column if not exists time_taken_seconds integer default 0;
alter table public.coaching_test_attempts add column if not exists answers jsonb;
alter table public.coaching_test_attempts add column if not exists date timestamp with time zone default timezone('utc'::text, now());

create table if not exists public.coaching_notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid,
  title text not null,
  message text not null,
  read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

create table if not exists public.coaching_announcements (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  body text not null,
  category text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- =============================================================================
-- 3. SKILLS ACADEMY MODULE
-- =============================================================================

create table if not exists public.skills_courses (
  id text primary key,
  title text not null,
  category text not null,
  instructor text not null,
  instructor_title text not null,
  instructor_bio text,
  instructor_avatar text,
  duration text not null,
  level text default 'Beginner',
  rating numeric default 5.0,
  learners_count integer default 0,
  description text,
  objectives text[],
  skills_learned text[],
  thumbnail text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

alter table public.skills_courses add column if not exists objectives text[];
alter table public.skills_courses add column if not exists skills_learned text[];
alter table public.skills_courses add column if not exists thumbnail text;

create table if not exists public.skills_modules (
  id text primary key,
  course_id text references public.skills_courses(id) on delete cascade,
  title text not null,
  description text,
  sequence_number integer default 0
);

create table if not exists public.skills_lessons (
  id text primary key,
  module_id text references public.skills_modules(id) on delete cascade,
  title text not null,
  video_url text not null,
  duration text not null,
  sequence_number integer default 0,
  thumbnail text
);

create table if not exists public.skills_materials (
  id text primary key,
  module_id text references public.skills_modules(id) on delete cascade,
  title text not null,
  type text,
  download_url text not null
);

create table if not exists public.skills_quizzes (
  id text primary key,
  module_id text references public.skills_modules(id) on delete cascade,
  title text not null,
  type text
);

create table if not exists public.skills_questions (
  id text primary key,
  quiz_id text references public.skills_quizzes(id) on delete cascade,
  question text not null,
  options text[] not null,
  correct_answer_index integer not null,
  explanation text
);

create table if not exists public.skills_assignments (
  id text primary key,
  module_id text references public.skills_modules(id) on delete cascade,
  title text not null,
  instructions text not null,
  download_url text
);

create table if not exists public.skills_doubts (
  id uuid default gen_random_uuid() primary key,
  course_id text references public.skills_courses(id) on delete cascade,
  user_email text not null,
  question text not null,
  status text default 'Pending',
  created_at timestamp with time zone default timezone('utc'::text, now())
);

create table if not exists public.skills_doubt_responses (
  id uuid default gen_random_uuid() primary key,
  doubt_id uuid references public.skills_doubts(id) on delete cascade,
  author text not null,
  message text not null,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

create table if not exists public.skills_certificate_requests (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  course_id text references public.skills_courses(id) on delete cascade,
  student_name text not null,
  status text default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- =============================================================================
-- 4. KNOWNEXT (CAREER & COLLEGE GUIDANCE) MODULE
-- =============================================================================

create table if not exists public.knownext_careers (
  id text primary key,
  name text not null,
  category text not null,
  stage text not null default 'all',
  overview text,
  salary_range text,
  growth_rate text,
  job_satisfaction text,
  entry_difficulty text,
  demand_level text,
  description text,
  summary_points text[],
  pros text[],
  cons text[],
  daily_duties text[],
  key_skills text[],
  education_paths text[],
  certifications text[],
  created_at timestamp with time zone default timezone('utc'::text, now())
);

create table if not exists public.knownext_roadmaps (
  id text primary key,
  career_id text references public.knownext_careers(id) on delete cascade,
  title text not null,
  difficulty text,
  time_investment text,
  description text,
  steps jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

create table if not exists public.knownext_colleges (
  id text primary key,
  name text not null,
  location text not null,
  type text,
  rating numeric,
  rank integer,
  fee_range text,
  package_avg text,
  package_highest text,
  admission_process text,
  exams_accepted text[],
  criteria text[],
  website text,
  description text,
  images text[],
  scholarships text[],
  placement_stats jsonb,
  campus_facilities text[],
  created_at timestamp with time zone default timezone('utc'::text, now())
);

create table if not exists public.knownext_scholarships (
  id text primary key,
  name text not null,
  provider text not null,
  amount text,
  deadline text,
  eligibility_criteria text[],
  application_process text[],
  required_documents text[],
  category text,
  description text,
  website text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

create table if not exists public.knownext_industries (
  id text primary key,
  name text not null,
  sectors text[],
  growth_outlook text,
  employment_stats jsonb,
  global_trends text[],
  skills_in_demand text[],
  challenges text[],
  created_at timestamp with time zone default timezone('utc'::text, now())
);

create table if not exists public.knownext_saved_items (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  item_type text not null,
  item_id text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  unique(user_id, item_type, item_id)
);

create table if not exists public.knownext_profiles (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade unique,
  career_goal_id text,
  active_roadmap_id text,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

create table if not exists public.knownext_roadmap_progress (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  roadmap_id text not null,
  step_id text not null,
  completed boolean default false,
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  unique(user_id, roadmap_id, step_id)
);

-- =============================================================================
-- 5. MINDFULNESS & COUNSELING MODULE
-- =============================================================================

create table if not exists public.mindfulness_activities (
  id text primary key,
  title text not null,
  category text,
  duration_minutes integer default 5,
  icon text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

create table if not exists public.mindfulness_affirmations (
  id text primary key,
  quote text not null,
  author text,
  category text
);

create table if not exists public.mindfulness_tasks (
  id text primary key,
  title text not null,
  points integer default 10,
  type text
);

create table if not exists public.mindfulness_user_activities (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  activity_id text,
  completed_at timestamp with time zone default timezone('utc'::text, now()),
  unique(user_id, activity_id)
);

create table if not exists public.mindfulness_journals (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  title text,
  content text not null,
  mood text,
  tags text[],
  created_at timestamp with time zone default timezone('utc'::text, now())
);

create table if not exists public.mood_entries (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  mood text not null,
  score integer default 3,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

create table if not exists public.sessions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  therapist_id text,
  therapist_name text,
  date text,
  time text,
  status text default 'confirmed',
  type text default 'video',
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- =============================================================================
-- 6. TUITION MODULE
-- =============================================================================

create table if not exists public.tuition_students (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  grade text,
  board text,
  subjects text[],
  created_at timestamp with time zone default timezone('utc'::text, now()),
  unique(user_id)
);

create table if not exists public.tuition_parents (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  phone text,
  student_name text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

create table if not exists public.tuition_completed_assignments (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  assignment_id text not null,
  completed_at timestamp with time zone default timezone('utc'::text, now()),
  unique(user_id, assignment_id)
);

-- =============================================================================
-- 7. ENABLE ROW LEVEL SECURITY (RLS) FOR ALL TABLES
-- =============================================================================

alter table public.profiles enable row level security;
alter table public.users enable row level security;
alter table public.coaching_exams enable row level security;
alter table public.coaching_exam_patterns enable row level security;
alter table public.coaching_subjects enable row level security;
alter table public.coaching_chapters enable row level security;
alter table public.coaching_videos enable row level security;
alter table public.coaching_notes enable row level security;
alter table public.coaching_assignments enable row level security;
alter table public.coaching_practice_questions enable row level security;
alter table public.coaching_mock_tests enable row level security;
alter table public.coaching_mock_questions enable row level security;
alter table public.coaching_live_classes enable row level security;
alter table public.coaching_profiles enable row level security;
alter table public.coaching_doubts enable row level security;
alter table public.coaching_test_attempts enable row level security;
alter table public.coaching_notifications enable row level security;
alter table public.coaching_announcements enable row level security;
alter table public.skills_courses enable row level security;
alter table public.skills_modules enable row level security;
alter table public.skills_lessons enable row level security;
alter table public.skills_materials enable row level security;
alter table public.skills_quizzes enable row level security;
alter table public.skills_questions enable row level security;
alter table public.skills_assignments enable row level security;
alter table public.skills_doubts enable row level security;
alter table public.skills_doubt_responses enable row level security;
alter table public.skills_certificate_requests enable row level security;
alter table public.knownext_careers enable row level security;
alter table public.knownext_roadmaps enable row level security;
alter table public.knownext_colleges enable row level security;
alter table public.knownext_scholarships enable row level security;
alter table public.knownext_industries enable row level security;
alter table public.knownext_saved_items enable row level security;
alter table public.knownext_profiles enable row level security;
alter table public.knownext_roadmap_progress enable row level security;
alter table public.mindfulness_activities enable row level security;
alter table public.mindfulness_affirmations enable row level security;
alter table public.mindfulness_tasks enable row level security;
alter table public.mindfulness_user_activities enable row level security;
alter table public.mindfulness_journals enable row level security;
alter table public.mood_entries enable row level security;
alter table public.sessions enable row level security;
alter table public.tuition_students enable row level security;
alter table public.tuition_parents enable row level security;
alter table public.tuition_completed_assignments enable row level security;

-- =============================================================================
-- 8. FAIL-SAFE ROW LEVEL SECURITY POLICIES
-- =============================================================================

-- Profiles Policies
drop policy if exists "Profiles are viewable by authenticated users" on public.profiles;
create policy "Profiles are viewable by authenticated users" 
  on public.profiles for select using (true);

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile" 
  on public.profiles for insert with check (true);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile" 
  on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

-- Public Read Catalog Tables (Available to everyone)
drop policy if exists "Catalog read coaching_exams" on public.coaching_exams;
create policy "Catalog read coaching_exams" on public.coaching_exams for select using (true);

drop policy if exists "Catalog read coaching_subjects" on public.coaching_subjects;
create policy "Catalog read coaching_subjects" on public.coaching_subjects for select using (true);

drop policy if exists "Catalog read coaching_chapters" on public.coaching_chapters;
create policy "Catalog read coaching_chapters" on public.coaching_chapters for select using (true);

drop policy if exists "Catalog read coaching_notes" on public.coaching_notes;
create policy "Catalog read coaching_notes" on public.coaching_notes for select using (true);

drop policy if exists "Catalog read coaching_videos" on public.coaching_videos;
create policy "Catalog read coaching_videos" on public.coaching_videos for select using (true);

drop policy if exists "Catalog read coaching_mock_tests" on public.coaching_mock_tests;
create policy "Catalog read coaching_mock_tests" on public.coaching_mock_tests for select using (true);

drop policy if exists "Catalog read coaching_mock_questions" on public.coaching_mock_questions;
create policy "Catalog read coaching_mock_questions" on public.coaching_mock_questions for select using (true);

drop policy if exists "Catalog read coaching_live_classes" on public.coaching_live_classes;
create policy "Catalog read coaching_live_classes" on public.coaching_live_classes for select using (true);

drop policy if exists "Catalog read skills_courses" on public.skills_courses;
create policy "Catalog read skills_courses" on public.skills_courses for select using (true);

drop policy if exists "Catalog read skills_modules" on public.skills_modules;
create policy "Catalog read skills_modules" on public.skills_modules for select using (true);

drop policy if exists "Catalog read skills_lessons" on public.skills_lessons;
create policy "Catalog read skills_lessons" on public.skills_lessons for select using (true);

drop policy if exists "Catalog read knownext_careers" on public.knownext_careers;
create policy "Catalog read knownext_careers" on public.knownext_careers for select using (true);

drop policy if exists "Catalog read knownext_roadmaps" on public.knownext_roadmaps;
create policy "Catalog read knownext_roadmaps" on public.knownext_roadmaps for select using (true);

drop policy if exists "Catalog read knownext_colleges" on public.knownext_colleges;
create policy "Catalog read knownext_colleges" on public.knownext_colleges for select using (true);

drop policy if exists "Catalog read knownext_scholarships" on public.knownext_scholarships;
create policy "Catalog read knownext_scholarships" on public.knownext_scholarships for select using (true);

drop policy if exists "Catalog read knownext_industries" on public.knownext_industries;
create policy "Catalog read knownext_industries" on public.knownext_industries for select using (true);

drop policy if exists "Catalog read mindfulness_activities" on public.mindfulness_activities;
create policy "Catalog read mindfulness_activities" on public.mindfulness_activities for select using (true);

drop policy if exists "Catalog read mindfulness_affirmations" on public.mindfulness_affirmations;
create policy "Catalog read mindfulness_affirmations" on public.mindfulness_affirmations for select using (true);

drop policy if exists "Catalog read mindfulness_tasks" on public.mindfulness_tasks;
create policy "Catalog read mindfulness_tasks" on public.mindfulness_tasks for select using (true);

-- User-Specific Private Data Policies (Only Owner Can Read / Write)
drop policy if exists "User manage own test attempts" on public.coaching_test_attempts;
create policy "User manage own test attempts" on public.coaching_test_attempts for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "User manage own coaching profile" on public.coaching_profiles;
create policy "User manage own coaching profile" on public.coaching_profiles for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "User manage own coaching doubts" on public.coaching_doubts;
create policy "User manage own coaching doubts" on public.coaching_doubts for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "User manage own saved items" on public.knownext_saved_items;
create policy "User manage own saved items" on public.knownext_saved_items for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "User manage own knownext profile" on public.knownext_profiles;
create policy "User manage own knownext profile" on public.knownext_profiles for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "User manage own roadmap progress" on public.knownext_roadmap_progress;
create policy "User manage own roadmap progress" on public.knownext_roadmap_progress for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "User manage own journals" on public.mindfulness_journals;
create policy "User manage own journals" on public.mindfulness_journals for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "User manage own mood entries" on public.mood_entries;
create policy "User manage own mood entries" on public.mood_entries for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "User manage own user activities" on public.mindfulness_user_activities;
create policy "User manage own user activities" on public.mindfulness_user_activities for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "User manage own sessions" on public.sessions;
create policy "User manage own sessions" on public.sessions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "User manage own tuition profile" on public.tuition_students;
create policy "User manage own tuition profile" on public.tuition_students for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "User manage own tuition parents" on public.tuition_parents;
create policy "User manage own tuition parents" on public.tuition_parents for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "User manage own assignments" on public.tuition_completed_assignments;
create policy "User manage own assignments" on public.tuition_completed_assignments for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- =============================================================================
-- 9. FAIL-SAFE TRIGGER FOR NEW USER SIGNUPS & OAUTH
-- =============================================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  resolved_name text;
  resolved_phone text;
begin
  resolved_name := coalesce(
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'name',
    new.raw_user_meta_data->>'username',
    split_part(coalesce(new.email, 'learner'), '@', 1),
    'Learner'
  );

  resolved_phone := coalesce(new.raw_user_meta_data->>'phone', new.phone, '');

  insert into public.profiles (id, email, username, full_name, phone, role)
  values (
    new.id,
    coalesce(new.email, ''),
    resolved_name,
    resolved_name,
    resolved_phone,
    'student'
  )
  on conflict (id) do update set
    email = coalesce(excluded.email, public.profiles.email),
    username = coalesce(public.profiles.username, excluded.username),
    full_name = coalesce(public.profiles.full_name, excluded.full_name);

  return new;
exception
  when others then
    -- Log warning but NEVER block user creation or OAuth redirect
    raise warning 'handle_new_user exception: %', SQLERRM;
    return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =============================================================================
-- 10. VERIFICATION REPORT: OUTPUT ALL RECOGNISED TABLES & COLUMN COUNTS
-- =============================================================================

select 
  table_name, 
  count(column_name) as total_columns
from information_schema.columns 
where table_schema = 'public' 
  and table_name not like 'pg_%'
group by table_name 
order by table_name;
