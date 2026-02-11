-- Funzione per gestire la creazione automatica del profilo
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role, region, province)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    'disabled', -- Ruolo predefinito
    new.raw_user_meta_data->>'region',
    new.raw_user_meta_data->>'province'
  );
  return new;
end;
$$;

-- Trigger che si attiva dopo ogni inserimento in auth.users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
