-- Creazione dei bucket di storage se non esistono
insert into storage.buckets (id, name, public)
values ('videos', 'videos', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('profiles', 'profiles', true)
on conflict (id) do nothing;

-- Policy per il bucket 'videos'
create policy "Anyone can view videos"
  on storage.objects for select
  using ( bucket_id = 'videos' );

create policy "Authenticated users can upload videos"
  on storage.objects for insert
  with check ( bucket_id = 'videos' and auth.role() = 'authenticated' );

-- Policy per il bucket 'profiles'
create policy "Anyone can view profiles"
  on storage.objects for select
  using ( bucket_id = 'profiles' );

create policy "Authenticated users can upload profiles"
  on storage.objects for insert
  with check ( bucket_id = 'profiles' and auth.role() = 'authenticated' );
