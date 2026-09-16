-- Migration to Create Storage Buckets and Policies

-- 1. Create Buckets ('avatars' and 'story-covers')
insert into storage.buckets (id, name, public)
values 
  ('avatars', 'avatars', true),
  ('story-covers', 'story-covers', true)
on conflict (id) do nothing;

-- 2. Configure RLS Policies for 'avatars'

-- Public Read
drop policy if exists "Avatar Public Read" on storage.objects;
create policy "Avatar Public Read"
  on storage.objects for select
  using ( bucket_id = 'avatars' );

-- Authenticated Upload (enforces folder structure: uid/filename)
drop policy if exists "Avatar Auth Upload" on storage.objects;
create policy "Avatar Auth Upload"
  on storage.objects for insert
  with check ( 
    bucket_id = 'avatars' 
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text 
  );

-- Authenticated Update (enforces folder structure)
drop policy if exists "Avatar Auth Update" on storage.objects;
create policy "Avatar Auth Update"
  on storage.objects for update
  using ( 
    bucket_id = 'avatars' 
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text 
  );

-- Authenticated Delete (enforces folder structure)
drop policy if exists "Avatar Auth Delete" on storage.objects;
create policy "Avatar Auth Delete"
  on storage.objects for delete
  using ( 
    bucket_id = 'avatars' 
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text 
  );

-- 3. Configure RLS Policies for 'story-covers'

-- Public Read
drop policy if exists "Story Cover Public Read" on storage.objects;
create policy "Story Cover Public Read"
  on storage.objects for select
  using ( bucket_id = 'story-covers' );

-- Authenticated Upload
drop policy if exists "Story Cover Auth Upload" on storage.objects;
create policy "Story Cover Auth Upload"
  on storage.objects for insert
  with check ( 
    bucket_id = 'story-covers' 
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text 
  );

-- Authenticated Update
drop policy if exists "Story Cover Auth Update" on storage.objects;
create policy "Story Cover Auth Update"
  on storage.objects for update
  using ( 
    bucket_id = 'story-covers' 
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text 
  );

-- Authenticated Delete
drop policy if exists "Story Cover Auth Delete" on storage.objects;
create policy "Story Cover Auth Delete"
  on storage.objects for delete
  using ( 
    bucket_id = 'story-covers' 
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text 
  );
