-- code by Nikhil-51
-- Create profiles table
create table public.profiles (
  id uuid references auth.users not null primary key,
  username text unique,
  display_name text,
  avatar_url text,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, display_name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data->>'username',
    new.raw_user_meta_data->>'display_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to call handle_new_user on signup
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Enable RLS
alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

-- Create stories table
create table public.stories (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text not null,
  summary text,
  content text,
  cover_url text,
  author_id uuid references auth.users not null,
  type text check (type in ('story', 'novel', 'chapter')) default 'story',
  parent_id uuid references stories(id)
);

-- Enable RLS
alter table public.stories enable row level security;

create policy "Stories are viewable by everyone."
  on stories for select
  using ( true );

create policy "Users can create stories."
  on stories for insert
  with check ( auth.uid() = author_id );

create policy "Users can update own stories."
  on stories for update
  using ( auth.uid() = author_id );

create policy "Users can delete own stories."
  on stories for delete
  using ( auth.uid() = author_id );

create policy "Users can delete own profile."
  on profiles for delete
  using ( auth.uid() = id );
