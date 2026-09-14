-- =============================================================================
-- FIX: COACHING DOUBTS FOREIGN KEY & USER SYNC
-- Run this in your Supabase Dashboard -> SQL Editor
-- =============================================================================

-- 1. FIX coaching_doubts TABLE AND FOREIGN KEY (CRITICAL FIX)
create table if not exists public.coaching_doubts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  exam_type text,
  title text,
  description text,
  question text,
  user_email text,
  user_name text,
  subject_id text,
  status text default 'Open',
  responses jsonb default '[]'::jsonb,
  response text,
  created_at timestamptz default timezone('utc'::text, now())
);

-- Ensure all columns exist
alter table public.coaching_doubts add column if not exists user_id uuid;
alter table public.coaching_doubts add column if not exists exam_type text;
alter table public.coaching_doubts add column if not exists title text;
alter table public.coaching_doubts add column if not exists description text;
alter table public.coaching_doubts add column if not exists question text;
alter table public.coaching_doubts add column if not exists user_email text;
alter table public.coaching_doubts add column if not exists user_name text;
alter table public.coaching_doubts add column if not exists subject_id text;
alter table public.coaching_doubts add column if not exists status text default 'Open';
alter table public.coaching_doubts add column if not exists responses jsonb default '[]'::jsonb;
alter table public.coaching_doubts add column if not exists response text;
alter table public.coaching_doubts add column if not exists created_at timestamptz default timezone('utc'::text, now());

-- Ensure nullable for question and title
alter table public.coaching_doubts alter column question drop not null;
alter table public.coaching_doubts alter column title drop not null;

-- Drop the broken constraint pointing to public.users
alter table public.coaching_doubts drop constraint if exists coaching_doubts_user_id_fkey;

-- Re-create the foreign key referencing auth.users(id) directly
alter table public.coaching_doubts
  add constraint coaching_doubts_user_id_fkey
  foreign key (user_id)
  references auth.users(id)
  on delete cascade;

-- Enable RLS and setup clean policies for coaching_doubts
alter table public.coaching_doubts enable row level security;

drop policy if exists "Coaching doubts read viewable" on public.coaching_doubts;
drop policy if exists "Coaching doubts write manage" on public.coaching_doubts;
drop policy if exists "User manage own coaching doubts" on public.coaching_doubts;
drop policy if exists "Users insert own coaching doubts" on public.coaching_doubts;
drop policy if exists "Users read own coaching doubts" on public.coaching_doubts;
drop policy if exists "Users update own coaching doubts" on public.coaching_doubts;
drop policy if exists "Users delete own coaching doubts" on public.coaching_doubts;
drop policy if exists "Admins manage all coaching doubts" on public.coaching_doubts;

create policy "Users read own coaching doubts"
  on public.coaching_doubts for select
  using (auth.uid() = user_id or auth.uid() is null);

create policy "Users insert own coaching doubts"
  on public.coaching_doubts for insert
  with check (auth.uid() = user_id or user_id is null);

create policy "Users update own coaching doubts"
  on public.coaching_doubts for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users delete own coaching doubts"
  on public.coaching_doubts for delete
  using (auth.uid() = user_id);

create policy "Admins manage all coaching doubts"
  on public.coaching_doubts for all
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

-- 2. RELAX CONSTRAINTS ON LEGACY public.users TABLE (DROP NOT NULL AND UNIQUE ON PHONE)
do $$
begin
  if exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = 'users') then
    -- Drop not null on phone
    alter table public.users alter column phone drop not null;
    -- Drop unique constraint on phone if present
    alter table public.users drop constraint if exists users_phone_key cascade;
    drop index if exists public.users_phone_key;
    
    -- Allow authenticated users to manage their row
    alter table public.users enable row level security;
    drop policy if exists "Users can manage own legacy user record" on public.users;
    create policy "Users can manage own legacy user record"
      on public.users for all
      using (auth.uid() = id)
      with check (auth.uid() = id);

    -- Backfill safely
    insert into public.users (id, email, username, phone)
    select 
      p.id,
      p.email,
      coalesce(p.username, split_part(coalesce(p.email, 'user'), '@', 1), 'User'),
      p.phone
    from public.profiles p
    on conflict (id) do update set
      email = coalesce(excluded.email, public.users.email),
      username = coalesce(excluded.username, public.users.username);
  end if;
end $$;

select 'coaching_doubts foreign key and schema successfully fixed!' as status;
