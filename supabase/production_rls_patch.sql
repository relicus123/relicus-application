-- =============================================================================
-- RELICUS PRODUCTION RLS SECURITY & PRIVACY PATCH
-- Run this script in your Supabase Dashboard -> SQL Editor
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. SECURE USER PROFILES & ROLES (PREVENT ADMIN PRIVILEGE ESCALATION)
-- -----------------------------------------------------------------------------

-- Drop insecure legacy policies on profiles
drop policy if exists "Profiles are viewable by everyone" on profiles;
drop policy if exists "Users can update their own profiles" on profiles;
drop policy if exists "Profiles insert policy" on profiles;
drop policy if exists "Users can insert own profile" on profiles;
drop policy if exists "Users can update their own profile details" on profiles;
drop policy if exists "Admins can manage all profiles" on profiles;
drop policy if exists "Profiles are viewable by authenticated users" on profiles;

alter table profiles enable row level security;

-- Authenticated users can view profiles
create policy "Profiles are viewable by authenticated users" 
  on profiles for select 
  using (auth.role() = 'authenticated');

-- Users can only insert their own profile with role = 'student'
create policy "Users can insert own profile" 
  on profiles for insert 
  with check (
    auth.uid() = id 
    and (role is null or role = 'student')
  );

-- Users can update their own profile BUT CANNOT escalate their role to 'admin'
create policy "Users can update their own profile details" 
  on profiles for update 
  using (auth.uid() = id)
  with check (
    auth.uid() = id 
    and (
      role is null 
      or role = (select p.role from profiles p where p.id = auth.uid())
    )
  );

-- Admins can view and manage all profiles
create policy "Admins can manage all profiles" 
  on profiles for all 
  using (
    exists (
      select 1 from profiles p 
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- Helper trigger: automatically create student profile on Supabase auth signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, username, phone, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'phone', ''),
    'student'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- Drop trigger if exists and recreate
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- -----------------------------------------------------------------------------
-- 2. SECURE USERS TABLE (PREVENT PII HARVESTING & ARBITRARY OVERWRITES)
-- -----------------------------------------------------------------------------

drop policy if exists "Users read viewable" on users;
drop policy if exists "Users insert viewable" on users;
drop policy if exists "Users update viewable" on users;
drop policy if exists "Users read own" on users;
drop policy if exists "Users insert own" on users;
drop policy if exists "Users update own" on users;
drop policy if exists "Users delete own" on users;
drop policy if exists "Admins manage all users" on users;

alter table users enable row level security;

-- Users can only read, insert, and update their own user records
create policy "Users read own" 
  on users for select 
  using (auth.uid() = id);

create policy "Users insert own" 
  on users for insert 
  with check (auth.uid() = id);

create policy "Users update own" 
  on users for update 
  using (auth.uid() = id);

create policy "Users delete own" 
  on users for delete 
  using (auth.uid() = id);

create policy "Admins manage all users" 
  on users for all 
  using (
    exists (
      select 1 from profiles p 
      where p.id = auth.uid() and p.role = 'admin'
    )
  );


-- -----------------------------------------------------------------------------
-- 3. SECURE SKILLS DOUBTS & RESPONSES (PREVENT UNAUTHORIZED EDITS)
-- -----------------------------------------------------------------------------

drop policy if exists "Admin can update doubts" on skills_doubts;
drop policy if exists "Admin can insert responses" on skills_doubt_responses;

-- Doubts: only admins can update doubt status / details
create policy "Admin can update doubts" 
  on skills_doubts for update 
  using (
    exists (
      select 1 from profiles 
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

-- Doubt responses: only verified admins/tutors can insert responses
create policy "Admin can insert responses" 
  on skills_doubt_responses for insert 
  with check (
    exists (
      select 1 from profiles 
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );


-- -----------------------------------------------------------------------------
-- 4. SERVER-SIDE ACCOUNT DELETION RPC (APPLE APP STORE GUIDELINE 5.1.1(v))
-- -----------------------------------------------------------------------------

create or replace function public.delete_own_user()
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  calling_user_id uuid;
begin
  calling_user_id := auth.uid();
  if calling_user_id is null then
    raise exception 'Unauthorized: must be logged in to delete your account';
  end if;

  -- 1. Wipe user data across all relational application tables
  delete from public.mindfulness_journals where user_id = calling_user_id;
  delete from public.mindfulness_user_activities where user_id = calling_user_id;
  delete from public.mood_entries where user_id = calling_user_id;
  delete from public.coaching_test_attempts where user_id = calling_user_id;
  delete from public.coaching_doubts where user_id = calling_user_id;
  delete from public.coaching_profiles where user_id = calling_user_id;
  delete from public.knownext_saved_items where user_id = calling_user_id;
  delete from public.knownext_profiles where user_id = calling_user_id;
  delete from public.knownext_roadmap_progress where user_id = calling_user_id;
  delete from public.skills_certificate_requests where user_id = calling_user_id;
  delete from public.tuition_completed_assignments where user_id = calling_user_id;
  delete from public.tuition_students where user_id = calling_user_id;
  delete from public.tuition_parents where user_id = calling_user_id;
  delete from public.profiles where id = calling_user_id;
  delete from public.users where id = calling_user_id;

  -- 2. Delete the user from auth.users (permanently revokes credentials & sessions)
  delete from auth.users where id = calling_user_id;
end;
$$;

-- Grant execution permission to authenticated users
grant execute on function public.delete_own_user() to authenticated;

-- Confirmation output
select 'Relicus Production RLS & Account Deletion Patch applied successfully.' as status;
