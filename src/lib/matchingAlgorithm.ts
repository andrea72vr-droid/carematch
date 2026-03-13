
export interface MatchScore {
    totalScore: number;
    breakdown: {
        technical: number;
        relational: number;
        logistics: number;
        preferences: number;
        trust: number;
    };
    harmonyPoints: string[];
    warnings: string[];
}

// Interfaces mirroring the JSON structure in the DB (based on Form usage)
export interface CaregiverProfile {
    id: string;
    user_id: string;
    // Step 1: Personal Info & Availability
    raw_competenze_esperienze: {
        nome_completo: string;
        lingue: string[];
        regione: string;
        provincia: string;
        disponibilita: string[];
    };
    // Step 2: Experience
    raw_approccio_cura: {
        anni_esperienza: string;
        tipologie_assistenza: string[];
        competenze_specifiche: string[];
        certificazioni: string[];
    };
    // Step 3: Relational
    raw_stile_relazionale: {
        preferenze_relazionali: string;
        modalita_comunicativa: string;
        attivita_preferite: string[];
    };
    // Step 3 (New): Psychological
    psychological_profile: {
        stile_comunicativo: string;
        livello_iniziativa: string;
        approccio_emotivo: string;
        energia_personale: string;
        routine_flessibilita: number; // 1-10
        scenario_rifiuto: string;
        contesto_lavorativo: string;
        presenza_famiglia: string;
        motivazione: string[];
        // ... scenarios
    };
    // Step 4: Logistics
    raw_disponibilita: {
        orari_preferiti: string[];
        spostamenti: boolean;
        patente: boolean;
        automunito: boolean;
        disponibilita_immediata: string;
    };
    // Step 5: Values
    raw_valori_personali: {
        descrizione: string;
    };
    certified?: boolean;
    tipo_certificazione?: string;
}

export interface DisabledProfile {
    id: string;
    user_id: string;
    // Step 1: Context
    raw_contexto_vita: {
        fascia_eta: string;
        condizioni: string[];
        autonomia: string;
        provincia?: string; // Aggiunto per filtro territoriale
    };
    // Step 2: Needs
    raw_bisogni_assistenziali: {
        mobilita: boolean;
        igiene: boolean;
        farmaci: boolean;
        compagnia: boolean;
        casa: boolean;
    };
    // Step 3: Relational
    raw_stile_relazionale: {
        lingua: string;
        personalita: string;
        comunicazione: string;
    };
    // Step 3 (New): Psychological
    psychological_profile: {
        stile_comunicativo_preferito: string;
        livello_autonomia_desiderato: string; // matches "livello_iniziativa"
        approccio_emotivo_desiderato: string;
        ambiente_domestico: string; // matches "contesto_lavorativo"
        gestione_imprevisti: string; // matches "scenario_rifiuto"?
    };
    // Step 4: Rhythm/Logistics
    raw_ritmo_quotidiano: {
        tipo_impegno: string;
        notte: boolean;
        convivenza: boolean;
    };
    // Step 5: Values/Expectations
    raw_valori_convivenza: {
        esperienza_caregiver: string;
        competenze: string[];
    };
}

export interface Organizzazione {
    id: string;
    profile_id: string;
    tipo_ente: 'FISH' | 'Consulta' | 'Associazione Categoria' | 'ETS';
    denominazione: string;
    territorio_competenza: string;
    sito_web?: string;
    validato_da?: string;
}

export interface BisognoEspresso {
    id: string;
    utente_id: string;
    titolo: string;
    descrizione_semantica?: string;
    categoria: 'assistenza' | 'trasporto' | 'scuola' | 'burocrazia' | 'altro';
    stato_validazione: 'in_attesa' | 'validato' | 'preso_in_carico';
    validato_da_id?: string;
    is_pubblico: boolean;
    metadata: any;
    created_at: string;
}

export function calculateMatch(
    caregiver: CaregiverProfile,
    disabled: DisabledProfile
): MatchScore {
    let technicalScore = 0;
    let relationalScore = 0;
    let logisticsScore = 0;
    let preferencesScore = 0;
    let trustScore = 0;

    const harmonyPoints: string[] = [];
    const warnings: string[] = [];

    // --- 1. Technical Match (40%) ---
    // Competences vs Needs
    const needs = disabled.raw_bisogni_assistenziali || {};
    const skills = caregiver.raw_approccio_cura?.competenze_specifiche || [];

    // Checks
    if (needs.mobilita && (skills.includes("sollevamento") || skills.includes("mobilizzazione"))) technicalScore += 20;
    else if (needs.mobilita) technicalScore += 5; // Partial credit
    else technicalScore += 20; // Not needed, so full points (no mismatch)

    if (needs.igiene && skills.includes("igiene")) technicalScore += 20;
    else if (needs.igiene) technicalScore += 5;
    else technicalScore += 20;

    if (needs.farmaci && skills.includes("farmaci")) technicalScore += 20;
    else if (needs.farmaci) technicalScore += 5;
    else technicalScore += 20;

    // Experience
    const expReq = disabled.raw_valori_convivenza?.esperienza_caregiver;
    const expHas = caregiver.raw_approccio_cura?.anni_esperienza;

    // Simple heuristic for experience matching
    if (expReq === "esperto" || expReq === "specializzato") {
        if (expHas === "5-10" || expHas === "10+") technicalScore += 20;
        else if (expHas === "3-5") technicalScore += 10;
        // else 0
    } else {
        technicalScore += 20; // Any experience is fine
    }

    // Certification check (bonus)
    const certs = caregiver.raw_approccio_cura?.certificazioni || [];
    if (disabled.raw_valori_convivenza?.competenze?.includes("infermieristica")) {
        if (certs.includes("infermiere")) technicalScore += 20;
        else warnings.push("Richiesta competenza infermieristica non esplicitata.");
    } else {
        technicalScore += 20;
    }

    // Cap Technical
    technicalScore = Math.min(100, technicalScore);


    // --- 2. Relational Match (30%) ---
    const cgPsych = caregiver.psychological_profile || {};
    const dpPsych = disabled.psychological_profile || {};

    // Communication Style
    // Caregiver: 'osservatore' | 'diretto' | 'motivante' | 'pragmatico'
    // Disabled Pref: 'diretto' | 'empatico' | 'silenzioso' | 'motivante'

    // Mapping logic
    if (
        (cgPsych.stile_comunicativo === "diretto" && dpPsych.stile_comunicativo_preferito === "diretto") ||
        (cgPsych.stile_comunicativo === "motivante" && dpPsych.stile_comunicativo_preferito === "motivante")
    ) {
        relationalScore += 25;
        harmonyPoints.push("Stile comunicativo perfettamente allineato");
    } else if (
        (cgPsych.stile_comunicativo === "osservatore" && dpPsych.stile_comunicativo_preferito === "silenzioso")
    ) {
        relationalScore += 25;
        harmonyPoints.push("Entrambi apprezzano la discrezione");
    } else if (
        (cgPsych.stile_comunicativo === "diretto" && dpPsych.stile_comunicativo_preferito === "empatico") ||
        (cgPsych.stile_comunicativo === "pragmatico" && dpPsych.stile_comunicativo_preferito === "empatico")
    ) {
        // Potential mismatch
        relationalScore += 5;
        warnings.push("Lo stile comunicativo potrebbe essere troppo diretto per le preferenze dell'assistito.");
    } else {
        relationalScore += 15; // Neutral match
    }

    // Initiative vs Autonomy
    // Caregiver: 'ricettivo' | 'collaborativo' | 'autonomo'
    // Disabled: 'decisione_mia' | 'collaborazione' | 'autonomia_totale'
    if (
        (cgPsych.livello_iniziativa === "ricettivo" && dpPsych.livello_autonomia_desiderato === "decisione_mia") ||
        (cgPsych.livello_iniziativa === "collaborativo" && dpPsych.livello_autonomia_desiderato === "collaborazione") ||
        (cgPsych.livello_iniziativa === "autonomo" && dpPsych.livello_autonomia_desiderato === "autonomia_totale")
    ) {
        relationalScore += 25;
        harmonyPoints.push("Perfetta intesa sul livello di autonomia operativo");
    } else if (
        (cgPsych.livello_iniziativa === "autonomo" && dpPsych.livello_autonomia_desiderato === "decisione_mia")
    ) {
        relationalScore += 0;
        warnings.push("Rischio conflitto: il caregiver è molto autonomo, ma l'assistito vuole decidere tutto.");
    } else {
        relationalScore += 15;
    }

    // Emotional Approach
    // Cg: 'protettivo' | 'professionale' | 'empatico'
    // Dp: 'familiare' | 'professionale' | 'empatica'
    if (
        (cgPsych.approccio_emotivo === "professionale" && dpPsych.approccio_emotivo_desiderato === "professionale") ||
        (cgPsych.approccio_emotivo === "empatico" && dpPsych.approccio_emotivo_desiderato === "empatica") ||
        (cgPsych.approccio_emotivo === "protettivo" && dpPsych.approccio_emotivo_desiderato === "familiare")
    ) {
        relationalScore += 25;
        harmonyPoints.push("Visione comune del tipo di relazione affettiva/professionale");
    } else if (
        (cgPsych.approccio_emotivo === "professionale" && dpPsych.approccio_emotivo_desiderato === "familiare")
    ) {
        relationalScore += 5;
        warnings.push("L'assistito cerca calore familiare, il caregiver ha un approccio più distaccato.");
    } else {
        relationalScore += 15;
    }

    // Flexibility check
    // If user wants strict routine (low score on disabled side? not captured explicitly as slider, but implicitly in 'gestione_imprevisti')
    // Let's assume 'insistere' implies rigidness compared to 'alternativa'.

    // Just add generic bonus for now
    relationalScore += 25;

    relationalScore = Math.min(100, relationalScore);


    // --- 3. Logistics Match (20%) ---
    const cgLog = caregiver.raw_disponibilita || {};
    const dpLog = disabled.raw_ritmo_quotidiano || {};

    // Time/Type Match
    // Cg: 'full-time', 'part-time', 'convivenza', 'notti', 'weekend'
    // Dp: 'part-time', 'full-time-diurno', 'convivenza'
    // Plus booleans: notte, convivenza

    let timeMatch = false;
    // In CaregiverProfile, 'step1.disponibilita' was the array. 
    // Wait, the interface above defined 'step1.disponibilita' AND 'step4.orari_preferiti'.
    // Let's check available types from step1 (mapped to raw_competenze_esperienze.disponibilita)
    const cgTypes = caregiver.raw_competenze_esperienze?.disponibilita || [];

    if (dpLog.tipo_impegno === "convivenza") {
        if (cgTypes.includes("convivenza") || dpLog.convivenza) {
            timeMatch = true;
            logisticsScore += 40;
        }
    } else if (dpLog.tipo_impegno === "full-time-diurno") {
        if (cgTypes.includes("full-time")) {
            timeMatch = true;
            logisticsScore += 40;
        }
    } else {
        // Part time / flexible
        if (cgTypes.includes("part-time")) {
            timeMatch = true;
            logisticsScore += 40;
        }
    }

    if (!timeMatch) {
        warnings.push("La disponibilità oraria potrebbe non coincidere esattamente.");
    }

    // Night shift
    if (dpLog.notte) {
        if (cgTypes.includes("notti") || (cgLog.orari_preferiti && cgLog.orari_preferiti.includes("notte"))) {
            logisticsScore += 30;
        } else {
            warnings.push("Richiesta presenza notturna, ma non esplicitamente indicata dal caregiver.");
        }
    } else {
        logisticsScore += 30; // N/A
    }

    // Geography
    // Dp location not in interface above yet? 
    // Assuming matching province filtering happens BEFORE calling this (in the API).
    logisticsScore += 30;

    logisticsScore = Math.min(100, logisticsScore);


    // --- 4. Preferences Match (10%) ---
    // Environment
    if (cgPsych.contesto_lavorativo === dpPsych.ambiente_domestico) {
        preferencesScore += 50;
        harmonyPoints.push("Ambiente ideale per entrambi (es. vivace/tranquillo)");
    } else if (cgPsych.contesto_lavorativo === "indifferente") {
        preferencesScore += 40;
    } else {
        preferencesScore += 10;
    }

    // Other generic preferences...
    preferencesScore += 50;

    preferencesScore = Math.min(100, preferencesScore);

    // --- 5. Trust Match (Ecosystem Certification) ---
    if (caregiver.certified) {
        trustScore = 100;
        harmonyPoints.push("Professionista certificato dall'ecosistema territoriale");
    } else {
        trustScore = 0;
        warnings.push("Profilo non ancora certificato dalle associazioni locali");
    }


    // --- TOTAL CALCULATION ---
    // Weights: 35% Tech, 20% Rel, 15% Log, 10% Pref, 20% Trust
    const totalScore = Math.round(
        (technicalScore * 0.35) +
        (relationalScore * 0.20) +
        (logisticsScore * 0.15) +
        (preferencesScore * 0.10) +
        (trustScore * 0.20)
    );

    return {
        totalScore,
        breakdown: {
            technical: technicalScore,
            relational: relationalScore,
            logistics: logisticsScore,
            preferences: preferencesScore,
            trust: trustScore
        },
        harmonyPoints: harmonyPoints.slice(0, 3), // Top 3
        warnings: warnings.slice(0, 3) // Top 3
    };
}
