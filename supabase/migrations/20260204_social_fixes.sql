-- Add profile_url to profiles
alter table public.profiles add column if not exists profile_url text;

-- Update RLS for profiles to allow public viewing of names and photos
drop policy if exists "Anyone can view limited profile info" on public.profiles;
create policy "Anyone can view limited profile info"
  on public.profiles for select
  using (true);

-- Ensure posts RLS allows authenticated users to insert
drop policy if exists "Users can manage own posts" on public.posts;
create policy "Users can insert own posts"
  on public.posts for insert
  with check (auth.uid() = user_id);

create policy "Users can update/delete own posts"
  on public.posts for all
  using (auth.uid() = user_id);
