-- Migrazione per la trasformazione in Ecosistema CareMatch
-- Data: 2026-02-16

-- 1. Estensione Ruoli Utente
-- Nota: In Postgres non è possibile usare IF NOT EXISTS direttamente con ADD VALUE in certi contesti,
-- ma Supabase supporta la sintassi standard.
ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'associazione';

-- 2. Tabella Organizzazioni (Enti, FISH, Consulte)
CREATE TABLE IF NOT EXISTS public.organizzazioni (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    tipo_ente text, -- 'FISH', 'Consulta', 'Associazione Categoria', 'ETS'
    denominazione text,
    territorio_competenza text, -- Comune, Provincia o Regione
    sito_web text,
    validato_da uuid, -- ID di un amministratore o ente superiore
    created_at timestamptz DEFAULT now(),
    UNIQUE(profile_id)
);

-- 3. Tabella Bisogni Espressi (Rappresentanza del bisogno territoriale)
CREATE TABLE IF NOT EXISTS public.bisogni_espressi (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    utente_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    titolo text NOT NULL,
    descrizione_semantica text, -- Testo analizzato dall'IA
    categoria text, -- 'assistenza', 'trasporto', 'scuola', 'burocrazia', 'altro'
    stato_validazione text DEFAULT 'in_attesa', -- 'in_attesa', 'validato', 'preso_in_carico'
    validato_da_id uuid REFERENCES public.organizzazioni(id) ON DELETE SET NULL,
    is_pubblico boolean DEFAULT false, -- Se aggregabile in dashboard pubblica
    metadata jsonb DEFAULT '{}'::jsonb, -- Dati aggiuntivi (es. impatto lavorativo, urgenza)
    created_at timestamptz DEFAULT now()
);

-- 4. Aggiornamento Funzione Trigger per Onboarding
-- Aggiorniamo la funzione esistente per gestire il nuovo ruolo associazione
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  default_role user_role;
  user_id_v uuid;
  profile_id_v uuid;
BEGIN
  -- Estrazione ruolo dai metadati o default
  default_role := COALESCE((new.raw_user_meta_data->>'role')::user_role, 'disabile'::user_role);

  -- 1. Crea record in public.users
  INSERT INTO public.users (id, email, role, status)
  VALUES (new.id, new.email, default_role, 'active')
  RETURNING id INTO user_id_v;

  -- 2. Crea record in public.profiles
  INSERT INTO public.profiles (user_id, nome, cognome)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'first_name', 
    new.raw_user_meta_data->>'last_name'
  )
  RETURNING id INTO profile_id_v;

  -- 3. Se il ruolo è associazione, crea record in public.organizzazioni
  IF default_role = 'associazione' THEN
    INSERT INTO public.organizzazioni (profile_id, denominazione)
    VALUES (profile_id_v, new.raw_user_meta_data->>'organization_name');
  END IF;

  RETURN new;
END;
$$;

-- 5. Row Level Security (RLS)
ALTER TABLE public.organizzazioni ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bisogni_espressi ENABLE ROW LEVEL SECURITY;

-- Policy per Organizzazioni
CREATE POLICY "Organizzazioni visibili a tutti" ON public.organizzazioni 
    FOR SELECT USING (true);

CREATE POLICY "Gestione propria organizzazione" ON public.organizzazioni 
    FOR ALL USING (profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- Policy per Bisogni Espressi
CREATE POLICY "Utenti vedono propri bisogni" ON public.bisogni_espressi 
    FOR SELECT USING (auth.uid() = utente_id);

CREATE POLICY "Utenti gestiscono propri bisogni" ON public.bisogni_espressi 
    FOR ALL USING (auth.uid() = utente_id);

CREATE POLICY "Associazioni vedono bisogni pubblici" ON public.bisogni_espressi 
    FOR SELECT USING (
        is_pubblico = true OR 
        EXISTS (SELECT 1 FROM public.organizzazioni o WHERE o.profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()))
    );

COMMENT ON TABLE public.bisogni_espressi IS 'Tabella per la rappresentanza dei bisogni di cura espressi dalla comunità.';
COMMENT ON TABLE public.organizzazioni IS 'Tabella per associazioni di categoria, Consulte e FISH che validano i bisogni.';
