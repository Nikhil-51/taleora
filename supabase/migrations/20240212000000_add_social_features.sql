-- Migration to add Social Features (Comments and Likes)

-- 1. Create Comments Table
create table if not exists public.comments (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  content text not null,
  story_id uuid references public.stories(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null
);

-- 2. Create Likes Table
create table if not exists public.likes (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  story_id uuid references public.stories(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  unique(story_id, user_id)
);

-- 3. Enable RLS
alter table public.comments enable row level security;
alter table public.likes enable row level security;

-- 4. Policies for Comments
-- Everyone can view comments
create policy "Comments are viewable by everyone."
  on public.comments for select
  using ( true );

-- Authenticated users can create comments
create policy "Users can create comments."
  on public.comments for insert
  with check ( auth.uid() = user_id );

-- Users can delete their own comments
create policy "Users can delete own comments."
  on public.comments for delete
  using ( auth.uid() = user_id );

-- 5. Policies for Likes
-- Everyone can view likes
create policy "Likes are viewable by everyone."
  on public.likes for select
  using ( true );

-- Authenticated users can create likes
create policy "Users can create likes."
  on public.likes for insert
  with check ( auth.uid() = user_id );

-- Users can delete their own likes (unlike)
create policy "Users can delete own likes."
  on public.likes for delete
  using ( auth.uid() = user_id );
