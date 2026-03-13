-- Ristrutturazione completa Database CareMatch V2

-- 1. Tipi ENUM per coerenza dati
do $$ 
begin
  if not exists (select 1 from pg_type where typname = 'user_role') then
    create type user_role as enum ('disabile', 'badante', 'admin');
  end if;
  if not exists (select 1 from pg_type where typname = 'user_status') then
    create type user_status as enum ('pending', 'active', 'suspended');
  end if;
  if not exists (select 1 from pg_type where typname = 'autonomia_level') then
    create type autonomia_level as enum ('basso', 'medio', 'alto');
  end if;
  if not exists (select 1 from pg_type where typname = 'match_status') then
    create type match_status as enum ('proposto', 'accettato', 'rifiutato', 'terminato');
  end if;
end $$;

-- 2. Tabella USERS (Estensione di auth.users)
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  role user_role not null default 'disabile',
  status user_status not null default 'pending',
  created_at timestamptz default now()
);

-- 3. Tabella PROFILES (Dati comuni)
create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  nome text,
  cognome text,
  telefono text,
  citta text,
  provincia text,
  foto_url text,
  descrizione text,
  created_at timestamptz default now(),
  unique(user_id)
);

-- 4. Tabella DISABILI (Specifico)
create table if not exists public.disabili (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  tipo_disabilita text,
  livello_autonomia autonomia_level,
  necessita_assistenza text,
  orari_richiesti jsonb,
  presenza_familiari boolean default false,
  note_mediche text,
  unique(profile_id)
);

-- 5. Tabella BADANTI (Specifico)
create table if not exists public.badanti (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  anni_esperienza integer default 0,
  certificazioni text[],
  competenze text[],
  disponibilita_oraria jsonb,
  automunita boolean default false,
  tariffa_oraria numeric,
  bio text,
  unique(profile_id)
);

-- 6. Tabella MATCHES
create table if not exists public.matches (
  id uuid primary key default gen_random_uuid(),
  disabile_id uuid not null references public.disabili(id) on delete cascade,
  badante_id uuid not null references public.badanti(id) on delete cascade,
  status match_status not null default 'proposto',
  score_matching numeric,
  created_at timestamptz default now()
);

-- 7. Tabella MESSAGES
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches(id) on delete cascade,
  sender_user_id uuid not null references public.users(id) on delete cascade,
  contenuto text not null,
  created_at timestamptz default now(),
  letto boolean default false
);

-- 8. Automatizzazione: Trigger per nuovi utenti registrati
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  default_role user_role;
begin
  -- Estrazione ruolo dai metadati o default
  default_role := coalesce((new.raw_user_meta_data->>'role')::user_role, 'disabile'::user_role);

  -- 1. Crea record in public.users
  insert into public.users (id, email, role, status)
  values (new.id, new.email, default_role, 'active');

  -- 2. Crea record in public.profiles
  insert into public.profiles (user_id, nome, cognome)
  values (
    new.id, 
    new.raw_user_meta_data->>'first_name', 
    new.raw_user_meta_data->>'last_name'
  );

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_v2 on auth.users;
create trigger on_auth_user_created_v2
  after insert on auth.users
  for each row execute procedure public.handle_new_auth_user();

-- 9. Row Level Security (RLS)
alter table public.users enable row level security;
alter table public.profiles enable row level security;
alter table public.disabili enable row level security;
alter table public.badanti enable row level security;
alter table public.matches enable row level security;
alter table public.messages enable row level security;

-- Policy di base (esempio: ogni utente vede se stesso)
create policy "Users can view own account data" on public.users for select using (auth.uid() = id);
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = user_id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = user_id);

-- Policy per specifiche tabelle (da raffinare)
create policy "Disabled can manage own details" on public.disabili for all using (
  profile_id in (select id from public.profiles where user_id = auth.uid())
);
create policy "Caregivers can manage own details" on public.badanti for all using (
  profile_id in (select id from public.profiles where user_id = auth.uid())
);
