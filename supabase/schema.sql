-- =============================================================================
-- Relicus Database Schema SQL
-- =============================================================================

-- Enable uuid-ossp extension
create extension if not exists "uuid-ossp";

-- -----------------------------------------------------------------------------
-- 0. USER PROFILES & ROLES
-- -----------------------------------------------------------------------------
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  role text default 'student' check (role in ('admin', 'student', 'therapist')),
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Row Level Security (RLS) for profiles
alter table profiles enable row level security;

create policy "Profiles are viewable by everyone" 
  on profiles for select using (true);

create policy "Users can update their own profiles" 
  on profiles for update using (auth.uid() = id);

-- -----------------------------------------------------------------------------
-- 1. SKILLS ACADEMY MODULE
-- -----------------------------------------------------------------------------
create table if not exists skills_courses (
  id text primary key,
  title text not null,
  category text not null,
  instructor text not null,
  instructor_title text not null,
  instructor_bio text,
  instructor_avatar text,
  duration text not null,
  level text check (level in ('Beginner', 'Intermediate', 'Advanced')),
  rating numeric default 5.0,
  learners_count integer default 0,
  description text,
  objectives text[],
  skills_learned text[],
  thumbnail text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

create table if not exists skills_modules (
  id text primary key,
  course_id text references skills_courses(id) on delete cascade,
  title text not null,
  description text,
  sequence_number integer default 0
);

create table if not exists skills_lessons (
  id text primary key,
  module_id text references skills_modules(id) on delete cascade,
  title text not null,
  video_url text not null,
  duration text not null,
  sequence_number integer default 0
);

create table if not exists skills_materials (
  id text primary key,
  module_id text references skills_modules(id) on delete cascade,
  title text not null,
  type text check (type in ('ppt', 'pdf', 'cheatsheet')),
  download_url text not null
);

create table if not exists skills_quizzes (
  id text primary key,
  module_id text references skills_modules(id) on delete cascade,
  title text not null,
  type text check (type in ('practice', 'module', 'final'))
);

create table if not exists skills_questions (
  id text primary key,
  quiz_id text references skills_quizzes(id) on delete cascade,
  question text not null,
  options text[] not null,
  correct_answer_index integer not null,
  explanation text
);

create table if not exists skills_assignments (
  id text primary key,
  module_id text references skills_modules(id) on delete cascade,
  title text not null,
  instructions text not null,
  download_url text
);

-- RLS policies for Skills tables
alter table skills_courses enable row level security;
alter table skills_modules enable row level security;
alter table skills_lessons enable row level security;
alter table skills_materials enable row level security;
alter table skills_quizzes enable row level security;
alter table skills_questions enable row level security;
alter table skills_assignments enable row level security;

create policy "Skills courses read viewable by all" on skills_courses for select using (true);
create policy "Skills courses write by admin only" on skills_courses for all using (
  exists (select 1 from profiles where profiles.id = auth.uid() and profiles.role = 'admin')
);

create policy "Skills modules read viewable by all" on skills_modules for select using (true);
create policy "Skills modules write by admin only" on skills_modules for all using (
  exists (select 1 from profiles where profiles.id = auth.uid() and profiles.role = 'admin')
);

create policy "Skills lessons read viewable by all" on skills_lessons for select using (true);
create policy "Skills lessons write by admin only" on skills_lessons for all using (
  exists (select 1 from profiles where profiles.id = auth.uid() and profiles.role = 'admin')
);

create policy "Skills materials read viewable by all" on skills_materials for select using (true);
create policy "Skills materials write by admin only" on skills_materials for all using (
  exists (select 1 from profiles where profiles.id = auth.uid() and profiles.role = 'admin')
);

create policy "Skills quizzes read viewable by all" on skills_quizzes for select using (true);
create policy "Skills quizzes write by admin only" on skills_quizzes for all using (
  exists (select 1 from profiles where profiles.id = auth.uid() and profiles.role = 'admin')
);

create policy "Skills questions read viewable by all" on skills_questions for select using (true);
create policy "Skills questions write by admin only" on skills_questions for all using (
  exists (select 1 from profiles where profiles.id = auth.uid() and profiles.role = 'admin')
);

create policy "Skills assignments read viewable by all" on skills_assignments for select using (true);
create policy "Skills assignments write by admin only" on skills_assignments for all using (
  exists (select 1 from profiles where profiles.id = auth.uid() and profiles.role = 'admin')
);


-- -----------------------------------------------------------------------------
-- 2. ENTRANCE COACHING MODULE
-- -----------------------------------------------------------------------------
create table if not exists coaching_exams (
  id text primary key, -- JEE, NEET, CUET, UGC-NET, GATE, EAMCET, ICET
  full_name text not null,
  tagline text,
  overview text,
  eligibility text[],
  next_exam_date text,
  difficulty_level integer check (difficulty_level >= 1 and difficulty_level <= 5),
  career_opportunities text[],
  created_at timestamp with time zone default timezone('utc'::text, now())
);

create table if not exists coaching_exam_patterns (
  id uuid default gen_random_uuid() primary key,
  exam_id text references coaching_exams(id) on delete cascade,
  section text not null,
  questions integer not null,
  marks integer not null,
  duration text not null
);

create table if not exists coaching_subjects (
  id text primary key,
  exam_id text references coaching_exams(id) on delete cascade,
  name text not null,
  icon text,
  color text,
  chapters_count integer default 0,
  mock_tests_count integer default 0
);

create table if not exists coaching_chapters (
  id text primary key,
  subject_id text references coaching_subjects(id) on delete cascade,
  name text not null,
  progress integer default 0
);

create table if not exists coaching_videos (
  id text primary key,
  chapter_id text references coaching_chapters(id) on delete cascade,
  title text not null,
  duration text not null,
  url text not null,
  is_watched boolean default false
);

create table if not exists coaching_notes (
  id text primary key,
  chapter_id text references coaching_chapters(id) on delete cascade,
  title text not null,
  size text not null,
  pdf_url text not null,
  is_bookmarked boolean default false
);

create table if not exists coaching_assignments (
  id text primary key,
  chapter_id text references coaching_chapters(id) on delete cascade,
  title text not null,
  due_date text not null,
  status text check (status in ('pending', 'submitted', 'evaluated')),
  score text
);

create table if not exists coaching_practice_questions (
  id uuid default gen_random_uuid() primary key,
  chapter_id text references coaching_chapters(id) on delete cascade,
  question text not null,
  options text[] not null,
  correct_answer integer not null, -- 0-3 index
  explanation text
);

create table if not exists coaching_mock_tests (
  id text primary key,
  exam_id text references coaching_exams(id) on delete cascade,
  name text not null,
  type text check (type in ('subject', 'chapter', 'full')),
  subject_id text references coaching_subjects(id) on delete set null,
  duration integer not null, -- in seconds
  questions_count integer not null
);

create table if not exists coaching_mock_questions (
  id uuid default gen_random_uuid() primary key,
  mock_test_id text references coaching_mock_tests(id) on delete cascade,
  question text not null,
  options text[] not null,
  correct_answer integer not null,
  explanation text,
  subject text not null,
  topic text
);

-- RLS policies for Coaching tables
alter table coaching_exams enable row level security;
alter table coaching_exam_patterns enable row level security;
alter table coaching_subjects enable row level security;
alter table coaching_chapters enable row level security;
alter table coaching_videos enable row level security;
alter table coaching_notes enable row level security;
alter table coaching_assignments enable row level security;
alter table coaching_practice_questions enable row level security;
alter table coaching_mock_tests enable row level security;
alter table coaching_mock_questions enable row level security;

create policy "Coaching read viewable by all" on coaching_exams for select using (true);
create policy "Coaching write by admin only" on coaching_exams for all using (
  exists (select 1 from profiles where profiles.id = auth.uid() and profiles.role = 'admin')
);

create policy "Exam patterns read viewable by all" on coaching_exam_patterns for select using (true);
create policy "Exam patterns write by admin only" on coaching_exam_patterns for all using (
  exists (select 1 from profiles where profiles.id = auth.uid() and profiles.role = 'admin')
);

create policy "Coaching subjects read viewable by all" on coaching_subjects for select using (true);
create policy "Coaching subjects write by admin only" on coaching_subjects for all using (
  exists (select 1 from profiles where profiles.id = auth.uid() and profiles.role = 'admin')
);

create policy "Coaching chapters read viewable by all" on coaching_chapters for select using (true);
create policy "Coaching chapters write by admin only" on coaching_chapters for all using (
  exists (select 1 from profiles where profiles.id = auth.uid() and profiles.role = 'admin')
);

create policy "Coaching videos read viewable by all" on coaching_videos for select using (true);
create policy "Coaching videos write by admin only" on coaching_videos for all using (
  exists (select 1 from profiles where profiles.id = auth.uid() and profiles.role = 'admin')
);

create policy "Coaching notes read viewable by all" on coaching_notes for select using (true);
create policy "Coaching notes write by admin only" on coaching_notes for all using (
  exists (select 1 from profiles where profiles.id = auth.uid() and profiles.role = 'admin')
);

create policy "Coaching assignments read viewable by all" on coaching_assignments for select using (true);
create policy "Coaching assignments write by admin only" on coaching_assignments for all using (
  exists (select 1 from profiles where profiles.id = auth.uid() and profiles.role = 'admin')
);

create policy "Coaching practice questions read viewable by all" on coaching_practice_questions for select using (true);
create policy "Coaching practice questions write by admin only" on coaching_practice_questions for all using (
  exists (select 1 from profiles where profiles.id = auth.uid() and profiles.role = 'admin')
);

create policy "Coaching mock tests read viewable by all" on coaching_mock_tests for select using (true);
create policy "Coaching mock tests write by admin only" on coaching_mock_tests for all using (
  exists (select 1 from profiles where profiles.id = auth.uid() and profiles.role = 'admin')
);

create policy "Coaching mock questions read viewable by all" on coaching_mock_questions for select using (true);
create policy "Coaching mock questions write by admin only" on coaching_mock_questions for all using (
  exists (select 1 from profiles where profiles.id = auth.uid() and profiles.role = 'admin')
);


-- -----------------------------------------------------------------------------
-- 3. KNOWNEXT (CAREER GUIDANCE) MODULE
-- -----------------------------------------------------------------------------
create table if not exists knownext_careers (
  id text primary key,
  name text not null,
  category text not null,
  stage text not null check (stage in ('school', 'college', 'professional', 'all')),
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

create table if not exists knownext_roadmaps (
  id text primary key,
  career_id text references knownext_careers(id) on delete cascade,
  title text not null,
  difficulty text,
  time_investment text,
  description text,
  steps jsonb not null, -- Stores steps array: [{id, title, duration, desc, resources: [{name, type, url}]}]
  created_at timestamp with time zone default timezone('utc'::text, now())
);

create table if not exists knownext_colleges (
  id text primary key,
  name text not null,
  location text not null,
  type text check (type in ('Public', 'Private')),
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
  placement_stats jsonb, -- Stores key-value metrics
  campus_facilities text[],
  created_at timestamp with time zone default timezone('utc'::text, now())
);

create table if not exists knownext_scholarships (
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

create table if not exists knownext_industries (
  id text primary key,
  name text not null,
  sectors text[],
  growth_outlook text,
  employment_stats jsonb, -- Stores statistics
  global_trends text[],
  skills_in_demand text[],
  challenges text[],
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- RLS policies for KnowNext tables
alter table knownext_careers enable row level security;
alter table knownext_roadmaps enable row level security;
alter table knownext_colleges enable row level security;
alter table knownext_scholarships enable row level security;
alter table knownext_industries enable row level security;

create policy "KnowNext careers read viewable by all" on knownext_careers for select using (true);
create policy "KnowNext careers write by admin only" on knownext_careers for all using (
  exists (select 1 from profiles where profiles.id = auth.uid() and profiles.role = 'admin')
);

create policy "KnowNext roadmaps read viewable by all" on knownext_roadmaps for select using (true);
create policy "KnowNext roadmaps write by admin only" on knownext_roadmaps for all using (
  exists (select 1 from profiles where profiles.id = auth.uid() and profiles.role = 'admin')
);

create policy "KnowNext colleges read viewable by all" on knownext_colleges for select using (true);
create policy "KnowNext colleges write by admin only" on knownext_colleges for all using (
  exists (select 1 from profiles where profiles.id = auth.uid() and profiles.role = 'admin')
);

create policy "KnowNext scholarships read viewable by all" on knownext_scholarships for select using (true);
create policy "KnowNext scholarships write by admin only" on knownext_scholarships for all using (
  exists (select 1 from profiles where profiles.id = auth.uid() and profiles.role = 'admin')
);

create policy "KnowNext industries read viewable by all" on knownext_industries for select using (true);
create policy "KnowNext industries write by admin only" on knownext_industries for all using (
  exists (select 1 from profiles where profiles.id = auth.uid() and profiles.role = 'admin')
);

-- -----------------------------------------------------------------------------
-- 4. ADDITIONAL COACHING ENHANCEMENTS (DYNAMIC CATEGORIES, ANNOUNCEMENTS, FEEDBACK, LIVE CLASSES)
-- -----------------------------------------------------------------------------

create table if not exists coaching_exam_categories (
  id text primary key,
  title text not null,
  description text,
  icon text,
  sequence_number integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Alter coaching_exams to support dynamic categories and syllabus topics
alter table coaching_exams add column if not exists category_id text references coaching_exam_categories(id) on delete set null;
alter table coaching_exams add column if not exists syllabus_topics text[];

create table if not exists coaching_announcements (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  content text not null,
  exam_id text references coaching_exams(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

create table if not exists coaching_exam_feedback (
  id uuid default gen_random_uuid() primary key,
  exam_id text references coaching_exams(id) on delete cascade,
  user_email text not null,
  rating integer check (rating >= 1 and rating <= 5),
  review_text text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

create table if not exists coaching_live_classes (
  id uuid default gen_random_uuid() primary key,
  exam_id text references coaching_exams(id) on delete cascade,
  subject_id text references coaching_subjects(id) on delete cascade,
  topic text not null,
  scheduled_time timestamp with time zone,
  duration integer, -- in minutes
  url text,
  status text default 'scheduled' check (status in ('scheduled', 'ongoing', 'recorded', 'cancelled')),
  created_at timestamp with time zone default timezone('utc'::text, now())
);

create table if not exists coaching_notifications (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  message text not null,
  category text default 'announcement', -- live, test, announcement, etc.
  exam_id text references coaching_exams(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable RLS for additional coaching tables
alter table coaching_exam_categories enable row level security;
alter table coaching_announcements enable row level security;
alter table coaching_exam_feedback enable row level security;
alter table coaching_live_classes enable row level security;
alter table coaching_notifications enable row level security;

-- Policies for coaching_exam_categories
create policy "Categories read viewable by all" on coaching_exam_categories for select using (true);
create policy "Categories write by admin only" on coaching_exam_categories for all using (
  exists (select 1 from profiles where profiles.id = auth.uid() and profiles.role = 'admin')
);

-- Policies for coaching_announcements
create policy "Announcements read viewable by all" on coaching_announcements for select using (true);
create policy "Announcements write by admin only" on coaching_announcements for all using (
  exists (select 1 from profiles where profiles.id = auth.uid() and profiles.role = 'admin')
);

-- Policies for coaching_exam_feedback
create policy "Feedback read viewable by all" on coaching_exam_feedback for select using (true);
create policy "Feedback insert by anyone" on coaching_exam_feedback for insert with check (true);
create policy "Feedback delete by admin only" on coaching_exam_feedback for delete using (
  exists (select 1 from profiles where profiles.id = auth.uid() and profiles.role = 'admin')
);

-- Policies for coaching_live_classes
create policy "Live classes read viewable by all" on coaching_live_classes for select using (true);
create policy "Live classes write by admin only" on coaching_live_classes for all using (
  exists (select 1 from profiles where profiles.id = auth.uid() and profiles.role = 'admin')
);

-- Policies for coaching_notifications
create policy "Notifications read viewable by all" on coaching_notifications for select using (true);
create policy "Notifications write by admin only" on coaching_notifications for all using (
  exists (select 1 from profiles where profiles.id = auth.uid() and profiles.role = 'admin')
);

-- -----------------------------------------------------------------------------
-- 5. MINDFULNESS MODULE
-- -----------------------------------------------------------------------------
drop table if exists mindfulness_tasks cascade;
drop table if exists mindfulness_affirmations cascade;
drop table if exists mindfulness_activities cascade;
drop table if exists mood_entries cascade;
drop table if exists mindfulness_categories cascade;

create table if not exists mindfulness_categories (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

create table if not exists mindfulness_activities (
  id uuid default gen_random_uuid() primary key,
  category_id uuid references mindfulness_categories(id) on delete cascade,
  title text not null,
  description text,
  duration integer,
  icon_type text default 'Activity',
  gradient text default 'from-[#8FBDD7] to-[#DDEEE3]',
  video_url text,
  audio_url text,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now())
);
create index idx_mindfulness_activities_category_id on mindfulness_activities(category_id);

create table if not exists mindfulness_affirmations (
  id uuid default gen_random_uuid() primary key,
  text text not null,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

create table if not exists mindfulness_tasks (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  frequency text default 'daily',
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

create table if not exists mood_entries (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade,
  mood text not null,
  note text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);
create index idx_mood_entries_user_id on mood_entries(user_id);

alter table mindfulness_categories enable row level security;
alter table mindfulness_activities enable row level security;
alter table mindfulness_affirmations enable row level security;
alter table mindfulness_tasks enable row level security;
alter table mood_entries enable row level security;

-- Categories policies
create policy "Mindfulness categories read viewable by all" on mindfulness_categories for select using (true);
create policy "Mindfulness categories write by admin only" on mindfulness_categories for all using (exists (select 1 from profiles where profiles.id = auth.uid() and profiles.role = 'admin'));

-- Activities policies
create policy "Mindfulness activities read viewable by all" on mindfulness_activities for select using (true);
create policy "Mindfulness activities write by admin only" on mindfulness_activities for all using (exists (select 1 from profiles where profiles.id = auth.uid() and profiles.role = 'admin'));

-- Affirmations policies
create policy "Mindfulness affirmations read viewable by all" on mindfulness_affirmations for select using (true);
create policy "Mindfulness affirmations write by admin only" on mindfulness_affirmations for all using (exists (select 1 from profiles where profiles.id = auth.uid() and profiles.role = 'admin'));

-- Tasks policies
create policy "Mindfulness tasks read viewable by all" on mindfulness_tasks for select using (true);
create policy "Mindfulness tasks write by admin only" on mindfulness_tasks for all using (exists (select 1 from profiles where profiles.id = auth.uid() and profiles.role = 'admin'));

-- Mood entries policies
create policy "Mood entries read by owner" on mood_entries for select using (auth.uid() = user_id);
create policy "Mood entries insert by owner" on mood_entries for insert with check (auth.uid() = user_id);
create policy "Mood entries update by owner" on mood_entries for update using (auth.uid() = user_id);
create policy "Mood entries delete by owner" on mood_entries for delete using (auth.uid() = user_id);


-- -----------------------------------------------------------------------------
-- 6. TUITION / DASHBOARDS MODULE
-- -----------------------------------------------------------------------------
drop table if exists tuition_enrollments cascade;
drop table if exists tuition_assignments cascade;
drop table if exists tuition_classes cascade;
drop table if exists tuition_students cascade;

create table if not exists tuition_classes (
  id uuid default gen_random_uuid() primary key,
  teacher_id uuid references profiles(id) on delete cascade,
  title text not null,
  subject text not null,
  grade text not null,
  description text,
  schedule text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);
create index idx_tuition_classes_teacher_id on tuition_classes(teacher_id);

create table if not exists tuition_assignments (
  id uuid default gen_random_uuid() primary key,
  class_id uuid references tuition_classes(id) on delete cascade,
  title text not null,
  description text,
  due_date timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now())
);
create index idx_tuition_assignments_class_id on tuition_assignments(class_id);

create table if not exists tuition_enrollments (
  id uuid default gen_random_uuid() primary key,
  class_id uuid references tuition_classes(id) on delete cascade,
  student_id uuid references profiles(id) on delete cascade,
  attendance_percentage integer default 0,
  status text default 'active',
  created_at timestamp with time zone default timezone('utc'::text, now())
);
create index idx_tuition_enrollments_class_id on tuition_enrollments(class_id);
create index idx_tuition_enrollments_student_id on tuition_enrollments(student_id);

alter table tuition_classes enable row level security;
alter table tuition_assignments enable row level security;
alter table tuition_enrollments enable row level security;

-- Classes policies
create policy "Tuition classes read viewable by all" on tuition_classes for select using (true);
create policy "Tuition classes write by admin only" on tuition_classes for all using (exists (select 1 from profiles where profiles.id = auth.uid() and profiles.role = 'admin'));

-- Assignments policies
create policy "Tuition assignments read viewable by all" on tuition_assignments for select using (true);
create policy "Tuition assignments write by admin only" on tuition_assignments for all using (exists (select 1 from profiles where profiles.id = auth.uid() and profiles.role = 'admin'));

-- Enrollments policies
create policy "Tuition enrollments read viewable by all" on tuition_enrollments for select using (true);
create policy "Tuition enrollments write by admin only" on tuition_enrollments for all using (exists (select 1 from profiles where profiles.id = auth.uid() and profiles.role = 'admin'));

-- -----------------------------------------------------------------------------
-- 7. COUNSELLING MODULE
-- -----------------------------------------------------------------------------
create table if not exists therapist_details (
  id text primary key,
  name text not null,
  photo text,
  experience text,
  rating numeric default 5.0,
  reviews integer default 0,
  specialization text[],
  about text,
  languages text[],
  fee text,
  location text,
  education text,
  availability text[],
  created_at timestamp with time zone default timezone('utc'::text, now())
);

alter table therapist_details enable row level security;
create policy "Therapist details read viewable by all" on therapist_details for select using (true);
create policy "Therapist details write by admin only" on therapist_details for all using (
  exists (select 1 from profiles where profiles.id = auth.uid() and profiles.role = 'admin')
);
