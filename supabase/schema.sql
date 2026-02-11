-- Estensione pgvector per embeddings
create extension if not exists "vector";

-- Tabella profili base (un record per utente Supabase)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text check (role in ('disabled', 'caregiver', 'supervisor')) not null,
  full_name text,
  region text,
  province text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Tabella profilo persona disabile
create table if not exists public.disabled_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  raw_contexto_vita jsonb,
  raw_bisogni_assistenziali jsonb,
  raw_stile_relazionale jsonb,
  raw_ritmo_quotidiano jsonb,
  raw_sensibilita_emotive jsonb,
  raw_valori_convivenza jsonb,
  ai_stile_comunicativo text,
  ai_bisogno_struttura text,
  ai_tolleranza_conflitto text,
  ai_ritmo_vita text,
  ai_livello_empatia_richiesta text,
  ai_profile_summary text,
  embedding vector(1536),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists disabled_profiles_user_id_idx
  on public.disabled_profiles (user_id);

create index if not exists disabled_profiles_embedding_idx
  on public.disabled_profiles
  using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

-- Tabella profilo badante / caregiver
create table if not exists public.caregiver_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  raw_competenze_esperienze jsonb,
  raw_approccio_cura jsonb,
  raw_stile_relazionale jsonb,
  raw_gestione_stress jsonb,
  raw_aspettative jsonb,
  raw_disponibilita jsonb,
  raw_valori_personali jsonb,
  ai_stile_comunicativo text,
  ai_bisogno_struttura text,
  ai_tolleranza_conflitto text,
  ai_ritmo_vita text,
  ai_livello_empatia_offerta text,
  ai_profile_summary text,
  embedding vector(1536),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists caregiver_profiles_user_id_idx
  on public.caregiver_profiles (user_id);

create index if not exists caregiver_profiles_embedding_idx
  on public.caregiver_profiles
  using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

-- Tabella match
create table if not exists public.matches (
  id uuid primary key default gen_random_uuid(),
  disabled_profile_id uuid not null references public.disabled_profiles(id) on delete cascade,
  caregiver_profile_id uuid not null references public.caregiver_profiles(id) on delete cascade,
  status text check (status in ('suggested', 'in_review', 'approved', 'rejected', 'archived')) default 'suggested',
  compatibility_score numeric,
  risk_level text check (risk_level in ('low', 'medium', 'high')),
  rules_violated jsonb,
  rules_matched jsonb,
  ai_explanation text,
  ai_strengths jsonb,
  ai_weaknesses jsonb,
  ai_practical_tips jsonb,
  created_by_ai boolean default true,
  last_reviewed_by uuid references public.profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists matches_disabled_profile_id_idx
  on public.matches (disabled_profile_id);

create index if not exists matches_caregiver_profile_id_idx
  on public.matches (caregiver_profile_id);

-- Tabella feedback post-match
create table if not exists public.match_feedbacks (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches(id) on delete cascade,
  given_by_user_id uuid not null references public.profiles(id) on delete cascade,
  role text check (role in ('disabled', 'caregiver')) not null,
  satisfaction integer check (satisfaction between 1 and 5),
  emotional_fatigue integer check (emotional_fatigue between 1 and 5),
  role_clarity integer check (role_clarity between 1 and 5),
  wish_to_continue boolean,
  free_text text,
  ai_summary text,
  created_at timestamptz default now()
);

create index if not exists match_feedbacks_match_id_idx
  on public.match_feedbacks (match_id);

-- Row Level Security (RLS) di base
alter table public.profiles enable row level security;
alter table public.disabled_profiles enable row level security;
alter table public.caregiver_profiles enable row level security;
alter table public.matches enable row level security;
alter table public.match_feedbacks enable row level security;

-- Politiche molto semplici per iniziare.
-- ATTENZIONE: da rivedere e raffinare prima della produzione.

-- Ogni utente vede e aggiorna solo il proprio profilo
create policy "Users can view own profile"
  on public.profiles
  for select
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles
  for insert
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles
  for update
  using (auth.uid() = id);

-- Profili persona disabile: proprietario + supervisori (da gestire via ruolo nel codice)
create policy "Disabled owner can manage own profile"
  on public.disabled_profiles
  for all
  using (auth.uid() = user_id);

-- Profili caregiver: proprietario + supervisori
create policy "Caregiver owner can manage own profile"
  on public.caregiver_profiles
  for all
  using (auth.uid() = user_id);

-- Match: ogni utente vede solo i match che lo riguardano
create policy "Users can view related matches"
  on public.matches
  for select
  using (
    auth.uid() in (
      select p.id
      from public.profiles p
      where
        p.id = (select dp.user_id from public.disabled_profiles dp where dp.id = disabled_profile_id)
        or
        p.id = (select cp.user_id from public.caregiver_profiles cp where cp.id = caregiver_profile_id)
    )
  );

-- Feedback: ogni utente vede solo i propri feedback
create policy "Users can manage own feedbacks"
  on public.match_feedbacks
  for all
  using (auth.uid() = given_by_user_id);

