-- =============================================================================
-- RELICUS DATABASE FIX: CATEGORIES, ANNOUNCEMENTS, NOTIFICATIONS RLS & CLEANUP
-- Run this in your Supabase Dashboard -> SQL Editor
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. SECURITY DEFINER HELPER (If not already present)
-- -----------------------------------------------------------------------------
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

-- -----------------------------------------------------------------------------
-- 2. FIX COACHING EXAM CATEGORIES RLS
-- -----------------------------------------------------------------------------
drop policy if exists "Categories read viewable by all" on coaching_exam_categories;
drop policy if exists "Categories write by admin only" on coaching_exam_categories;
drop policy if exists "Categories insert by admin only" on coaching_exam_categories;
drop policy if exists "Categories update by admin only" on coaching_exam_categories;
drop policy if exists "Categories delete by admin only" on coaching_exam_categories;

alter table coaching_exam_categories enable row level security;

create policy "Categories read viewable by all"
  on coaching_exam_categories for select
  using (true);

create policy "Categories insert by admin only"
  on coaching_exam_categories for insert
  with check (public.is_admin());

create policy "Categories update by admin only"
  on coaching_exam_categories for update
  using (public.is_admin());

create policy "Categories delete by admin only"
  on coaching_exam_categories for delete
  using (public.is_admin());

-- -----------------------------------------------------------------------------
-- 3. FIX COACHING ANNOUNCEMENTS RLS
-- -----------------------------------------------------------------------------
drop policy if exists "Announcements read viewable by all" on coaching_announcements;
drop policy if exists "Announcements write by admin only" on coaching_announcements;
drop policy if exists "Announcements insert by admin only" on coaching_announcements;
drop policy if exists "Announcements update by admin only" on coaching_announcements;
drop policy if exists "Announcements delete by admin only" on coaching_announcements;

alter table coaching_announcements enable row level security;

create policy "Announcements read viewable by all"
  on coaching_announcements for select
  using (true);

create policy "Announcements insert by admin only"
  on coaching_announcements for insert
  with check (public.is_admin());

create policy "Announcements update by admin only"
  on coaching_announcements for update
  using (public.is_admin());

create policy "Announcements delete by admin only"
  on coaching_announcements for delete
  using (public.is_admin());

-- -----------------------------------------------------------------------------
-- 4. FIX COACHING LIVE CLASSES RLS
-- -----------------------------------------------------------------------------
drop policy if exists "Live classes read viewable by all" on coaching_live_classes;
drop policy if exists "Live classes write by admin only" on coaching_live_classes;
drop policy if exists "Live classes insert by admin only" on coaching_live_classes;
drop policy if exists "Live classes update by admin only" on coaching_live_classes;
drop policy if exists "Live classes delete by admin only" on coaching_live_classes;

alter table coaching_live_classes enable row level security;

create policy "Live classes read viewable by all"
  on coaching_live_classes for select
  using (true);

create policy "Live classes insert by admin only"
  on coaching_live_classes for insert
  with check (public.is_admin());

create policy "Live classes update by admin only"
  on coaching_live_classes for update
  using (public.is_admin());

create policy "Live classes delete by admin only"
  on coaching_live_classes for delete
  using (public.is_admin());

-- -----------------------------------------------------------------------------
-- 5. FIX COACHING NOTIFICATIONS RLS
-- -----------------------------------------------------------------------------
drop policy if exists "Notifications read viewable by all" on coaching_notifications;
drop policy if exists "Notifications write by admin only" on coaching_notifications;
drop policy if exists "Notifications insert by admin only" on coaching_notifications;
drop policy if exists "Notifications update by user or admin" on coaching_notifications;
drop policy if exists "Notifications delete by admin only" on coaching_notifications;

alter table coaching_notifications enable row level security;

create policy "Notifications read viewable by all"
  on coaching_notifications for select
  using (true);

create policy "Notifications insert by admin only"
  on coaching_notifications for insert
  with check (public.is_admin());

create policy "Notifications update by user or admin"
  on coaching_notifications for update
  using (
    auth.uid() = target_user_id 
    or target_user_id is null 
    or public.is_admin()
  );

create policy "Notifications delete by admin only"
  on coaching_notifications for delete
  using (public.is_admin());

-- -----------------------------------------------------------------------------
-- 6. ENSURE FOREIGN KEY CASCADE ON COACHING CATEGORY ACCESS
-- -----------------------------------------------------------------------------
alter table if exists public.coaching_category_access
  drop constraint if exists coaching_category_access_category_id_fkey;

alter table if exists public.coaching_category_access
  add constraint coaching_category_access_category_id_fkey
  foreign key (category_id)
  references public.coaching_exam_categories(id)
  on delete cascade;

-- -----------------------------------------------------------------------------
-- 7. CLEANUP ORPHANED DUMMY CATEGORIES
-- -----------------------------------------------------------------------------
delete from public.coaching_category_access where category_id in ('dfssdf', 'sdfa');
delete from public.coaching_exam_categories where id in ('dfssdf', 'sdfa');

select 'Categories, announcements, notifications RLS and cleanup successfully executed.' as status;
