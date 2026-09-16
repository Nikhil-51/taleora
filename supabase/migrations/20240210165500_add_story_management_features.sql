-- Migration to add Story Management Features
-- Created manually to support SQL Editor execution

-- 1. Add new columns to stories table if they don't exist
do $$
begin
  if not exists (select 1 from information_schema.columns where table_name = 'stories' and column_name = 'cover_url') then
    alter table public.stories add column cover_url text;
  end if;

  if not exists (select 1 from information_schema.columns where table_name = 'stories' and column_name = 'type') then
    alter table public.stories add column type text check (type in ('story', 'novel', 'chapter')) default 'story';
  end if;

  if not exists (select 1 from information_schema.columns where table_name = 'stories' and column_name = 'parent_id') then
    alter table public.stories add column parent_id uuid references public.stories(id);
  end if;
end $$;

-- 2. Update RLS Policies for Stories

-- Drop existing policies to ensure idempotency (avoid "policy already exists" errors)
drop policy if exists "Stories are viewable by everyone." on public.stories;
drop policy if exists "Users can create stories." on public.stories;
drop policy if exists "Users can update own stories." on public.stories;
drop policy if exists "Users can delete own stories." on public.stories;

-- Re-create policies
create policy "Stories are viewable by everyone."
  on public.stories for select
  using ( true );

create policy "Users can create stories."
  on public.stories for insert
  with check ( auth.uid() = author_id );

create policy "Users can update own stories."
  on public.stories for update
  using ( auth.uid() = author_id );

create policy "Users can delete own stories."
  on public.stories for delete
  using ( auth.uid() = author_id );

-- 3. Update RLS Policies for Profiles (ensure delete exists)

drop policy if exists "Users can delete own profile." on public.profiles;

create policy "Users can delete own profile."
  on public.profiles for delete
  using ( auth.uid() = id );
