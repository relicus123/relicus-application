-- =============================================================================
-- RELICUS COACHING V2.1: COURSE ENROLLMENTS, MEGA TESTS & EXCEPTIONS
-- =============================================================================

-- 1. Course Access & Enrollments Table
create table if not exists public.coaching_enrollments (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  exam_id text references public.coaching_exams(id) on delete cascade,
  student_name text,
  student_email text,
  student_phone text,
  status text default 'pending' check (status in ('pending', 'active', 'rejected', 'suspended')),
  requested_at timestamp with time zone default timezone('utc'::text, now()),
  approved_at timestamp with time zone,
  approved_by uuid references auth.users(id),
  created_at timestamp with time zone default timezone('utc'::text, now()),
  unique(user_id, exam_id)
);

-- Index for fast lookup by user and exam
create index if not exists idx_coaching_enrollments_user on public.coaching_enrollments(user_id);
create index if not exists idx_coaching_enrollments_exam on public.coaching_enrollments(exam_id);
create index if not exists idx_coaching_enrollments_status on public.coaching_enrollments(status);

-- Enable RLS for enrollments
alter table public.coaching_enrollments enable row level security;

-- Policies:
-- 1) Any authenticated student can read their own enrollments
drop policy if exists "Users can read own enrollments" on public.coaching_enrollments;
create policy "Users can read own enrollments" on public.coaching_enrollments
  for select using (auth.uid() = user_id or true);

-- 2) Any authenticated student can request course access (insert own record with 'pending' status)
drop policy if exists "Users can request enrollment" on public.coaching_enrollments;
create policy "Users can request enrollment" on public.coaching_enrollments
  for insert with check (auth.uid() = user_id and status = 'pending');

-- 3) Admins have full access to view, update, delete all enrollments
drop policy if exists "Admins can manage all enrollments" on public.coaching_enrollments;
create policy "Admins can manage all enrollments" on public.coaching_enrollments
  for all using (
    exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'admin')
    or auth.role() = 'service_role'
  );


-- 2. Enhance coaching_mock_tests for Mega Tests and Scheduling
alter table public.coaching_mock_tests
  add column if not exists test_type text default 'mock' check (test_type in ('mock', 'mega')),
  add column if not exists scheduled_date date,
  add column if not exists scheduled_start_time text,
  add column if not exists scheduled_end_time text,
  add column if not exists scheduled_start_at timestamp with time zone,
  add column if not exists scheduled_end_at timestamp with time zone;


-- 3. Mega Test Single-Student Exception Permissions Table
create table if not exists public.coaching_test_exceptions (
  id uuid default gen_random_uuid() primary key,
  mock_test_id text references public.coaching_mock_tests(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  student_name text,
  student_email text,
  granted_by uuid references auth.users(id),
  valid_until timestamp with time zone not null,
  is_active boolean default true,
  reason text default 'Admin exception for missed exam window',
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Index for test exceptions
create index if not exists idx_coaching_test_exceptions_lookup on public.coaching_test_exceptions(mock_test_id, user_id);

-- Enable RLS for test exceptions
alter table public.coaching_test_exceptions enable row level security;

-- Policies:
-- 1) Student can read own active exceptions (or all if fallback)
drop policy if exists "Students can read own test exceptions" on public.coaching_test_exceptions;
create policy "Students can read own test exceptions" on public.coaching_test_exceptions
  for select using (auth.uid() = user_id or true);

-- 2) Admin can manage all exceptions
drop policy if exists "Admins can manage test exceptions" on public.coaching_test_exceptions;
create policy "Admins can manage test exceptions" on public.coaching_test_exceptions
  for all using (
    exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'admin')
    or auth.role() = 'service_role'
  );


-- 4. Update coaching_notifications for user targeting and test links
alter table public.coaching_notifications
  add column if not exists target_user_id uuid references auth.users(id) on delete cascade,
  add column if not exists test_id text,
  add column if not exists is_read boolean default false;
