-- Migrazione per sistema di completamento profilo intelligente
-- Aggiunge colonna completion_score e logica di calcolo automatica via trigger

-- 1. Aggiunta colonna completion_score alla tabella profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS completion_score INTEGER DEFAULT 0;

-- 2. Funzione per il calcolo del punteggio
CREATE OR REPLACE FUNCTION public.fn_calculate_completion_score(p_profile_id UUID)
RETURNS INTEGER AS $$
DECLARE
    v_profile RECORD;
    v_disabile RECORD;
    v_badante RECORD;
    v_score INTEGER := 0;
    v_role user_role;
BEGIN
    -- Recupero dati base profilo
    SELECT * INTO v_profile FROM public.profiles WHERE id = p_profile_id;
    IF NOT FOUND THEN RETURN 0; END IF;

    -- Recupero ruolo utente dalla tabella users
    SELECT role INTO v_role FROM public.users WHERE id = v_profile.user_id;

    -- SEZIONE 1: DATI BASE (40%)
    -- nome (10%), citta (10%), telefono (10%), descrizione (10%)
    IF v_profile.nome IS NOT NULL AND v_profile.nome <> '' THEN v_score := v_score + 10; END IF;
    IF v_profile.citta IS NOT NULL AND v_profile.citta <> '' THEN v_score := v_score + 10; END IF;
    IF v_profile.telefono IS NOT NULL AND v_profile.telefono <> '' THEN v_score := v_score + 10; END IF;
    IF v_profile.descrizione IS NOT NULL AND v_profile.descrizione <> '' THEN v_score := v_score + 10; END IF;

    -- SEZIONE 2: DATI SPECIFICI (40%)
    IF v_role = 'disabile' THEN
        SELECT * INTO v_disabile FROM public.disabili WHERE profile_id = p_profile_id;
        IF v_disabile IS NOT NULL THEN
            -- tipo_disabilita (13%), livello_autonomia (13%), necessita_assistenza (14%)
            IF v_disabile.tipo_disabilita IS NOT NULL AND v_disabile.tipo_disabilita <> '' THEN v_score := v_score + 13; END IF;
            IF v_disabile.livello_autonomia IS NOT NULL THEN v_score := v_score + 13; END IF;
            IF v_disabile.necessita_assistenza IS NOT NULL AND v_disabile.necessita_assistenza <> '' THEN v_score := v_score + 14; END IF;
        END IF;
    ELSIF v_role = 'badante' THEN
        SELECT * INTO v_badante FROM public.badanti WHERE profile_id = p_profile_id;
        IF v_badante IS NOT NULL THEN
            -- anni_esperienza (13%), competenze (13%), disponibilita_oraria (14%)
            IF v_badante.anni_esperienza IS NOT NULL THEN v_score := v_score + 13; END IF;
            IF v_badante.competenze IS NOT NULL AND array_length(v_badante.competenze, 1) > 0 THEN v_score := v_score + 13; END IF;
            IF v_badante.disponibilita_oraria IS NOT NULL AND v_badante.disponibilita_oraria <> '{}'::jsonb THEN v_score := v_score + 14; END IF;
        END IF;
    END IF;

    -- SEZIONE 3: FOTO PROFILO (10%)
    IF v_profile.foto_url IS NOT NULL AND v_profile.foto_url <> '' THEN v_score := v_score + 10; END IF;

    -- SEZIONE 4: ALTRI DETTAGLI (10%)
    -- cognome (5%), provincia (5%)
    IF v_profile.cognome IS NOT NULL AND v_profile.cognome <> '' THEN v_score := v_score + 5; END IF;
    IF v_profile.provincia IS NOT NULL AND v_profile.provincia <> '' THEN v_score := v_score + 5; END IF;

    RETURN LEAST(v_score, 100);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Funzione per il trigger di aggiornamento
CREATE OR REPLACE FUNCTION public.tr_fn_update_profile_score()
RETURNS TRIGGER AS $$
DECLARE
    v_profile_id UUID;
BEGIN
    IF TG_TABLE_NAME = 'profiles' THEN
        v_profile_id := NEW.id;
    ELSIF TG_TABLE_NAME = 'disabili' OR TG_TABLE_NAME = 'badanti' THEN
        v_profile_id := NEW.profile_id;
    END IF;

    UPDATE public.profiles
    SET completion_score = public.fn_calculate_completion_score(v_profile_id)
    WHERE id = v_profile_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Creazione Trigger
DROP TRIGGER IF EXISTS on_profile_update_score ON public.profiles;
CREATE TRIGGER on_profile_update_score
AFTER INSERT OR UPDATE OF nome, cognome, telefono, citta, provincia, foto_url, descrizione
ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.tr_fn_update_profile_score();

DROP TRIGGER IF EXISTS on_disabile_update_score ON public.disabili;
CREATE TRIGGER on_disabile_update_score
AFTER INSERT OR UPDATE OF tipo_disabilita, livello_autonomia, necessita_assistenza
ON public.disabili
FOR EACH ROW EXECUTE FUNCTION public.tr_fn_update_profile_score();

DROP TRIGGER IF EXISTS on_badante_update_score ON public.badanti;
CREATE TRIGGER on_badante_update_score
AFTER INSERT OR UPDATE OF anni_esperienza, competenze, disponibilita_oraria
ON public.badanti
FOR EACH ROW EXECUTE FUNCTION public.tr_fn_update_profile_score();
