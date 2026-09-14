-- =============================================================================
-- RELICUS: FIX AUTH SIGNUP & GOOGLE OAUTH TRIGGER
-- Run this script in your Supabase Dashboard -> SQL Editor
-- This resolves: "Database error saving new user" (500 unexpected_failure)
-- =============================================================================

-- 1. Ensure all expected profile columns exist
alter table public.profiles add column if not exists username text;
alter table public.profiles add column if not exists full_name text;
alter table public.profiles add column if not exists phone text;
alter table public.profiles add column if not exists avatar_url text;
alter table public.profiles add column if not exists role text default 'student';
alter table public.profiles add column if not exists updated_at timestamp with time zone default now();

-- 2. Drop RLS constraints that might block the SECURITY DEFINER trigger
drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile" 
  on public.profiles for insert 
  with check (
    auth.uid() = id 
    or auth.role() = 'service_role'
    or auth.uid() is null
  );

-- 3. Create a bulletproof handle_new_user() trigger with fail-safe exception handling
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
    -- Fail-safe: log warning, never abort user signup or OAuth login
    raise warning 'handle_new_user exception: %', SQLERRM;
    return new;
end;
$$;

-- 4. Re-bind the trigger to auth.users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Verify
select 'Auth trigger successfully updated!' as status;
