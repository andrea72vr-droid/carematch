-- Migrazione Onboarding V2

-- 1. Creazione Enum Onboarding Status
do $$ 
begin
  if not exists (select 1 from pg_type where typname = 'onboarding_status_enum') then
    create type onboarding_status_enum as enum ('started', 'role_done', 'profile_base_done', 'completed');
  end if;
end $$;

-- 2. Aggiunta colonna a profiles
alter table public.profiles 
add column if not exists onboarding_status onboarding_status_enum default 'started';

-- 3. Aggiornamento Trigger per inizializzazione onboarding
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  v_role user_role;
  v_status onboarding_status_enum := 'started';
begin
  -- Estrazione ruolo dai metadati o default
  v_role := coalesce((new.raw_user_meta_data->>'role')::user_role, 'disabile'::user_role);

  -- Se il ruolo è stato fornito esplicitamente, lo step della scelta ruolo è completato
  if (new.raw_user_meta_data->>'role') is not null then
    v_status := 'role_done';
  end if;

  -- 1. Crea record in public.users
  insert into public.users (id, email, role, status)
  values (new.id, new.email, v_role, 'active');

  -- 2. Crea record in public.profiles
  insert into public.profiles (user_id, nome, cognome, citta, provincia, onboarding_status)
  values (
    new.id, 
    new.raw_user_meta_data->>'first_name', 
    new.raw_user_meta_data->>'last_name',
    new.raw_user_meta_data->>'citta',
    new.raw_user_meta_data->>'provincia',
    v_status
  );

  return new;
end;
$$;
