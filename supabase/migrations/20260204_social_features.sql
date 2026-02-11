create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  content text not null,
  likes integer default 0, -- Added for interaction
  created_at timestamptz default now()
);

-- Tabella per i video di profilo
create table if not exists public.profile_videos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  video_url text not null,
  duration numeric check (duration <= 90),
  question_id text,
  created_at timestamptz default now(),
  unique(user_id, question_id)
);

-- Enable RLS
alter table public.posts enable row level security;
alter table public.profile_videos enable row level security;

-- Policies per i Post
create policy "Anyone can view posts"
  on public.posts for select
  using (true);

create policy "Users can manage own posts"
  on public.posts for all
  using (auth.uid() = user_id);

-- Policies per i Video
create policy "Anyone can view profile videos"
  on public.profile_videos for select
  using (true);

create policy "Users can manage own videos"
  on public.profile_videos for all
  using (auth.uid() = user_id);
