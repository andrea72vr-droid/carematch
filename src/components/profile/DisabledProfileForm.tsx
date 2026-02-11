"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowserClient } from "@/lib/supabaseClient";
import { WizardStep } from "@/components/ui/WizardStep";
import { GuidedSelection } from "@/components/ui/GuidedSelection";
import { Toggle } from "@/components/ui/Toggle";
import { MultiSelect } from "@/components/ui/MultiSelect";
import { SpotlightCard } from "@/components/ui/SpotlightCard";

type FormData = {
    step1: {
        fascia_eta: string;
        condizioni: string[];
        autonomia: string;
    };
    step2: {
        mobilita: boolean;
        igiene: boolean;
        farmaci: boolean;
        compagnia: boolean;
        casa: boolean;
    };
    step3: {
        lingua: string;
        personalita: string;
        comunicazione: string;
    };
    step3_psychological: {
        stile_comunicativo_preferito: string;
        livello_autonomia_desiderato: string;
        approccio_emotivo_desiderato: string;
        ambiente_domestico: string;
        gestione_imprevisti: string;
    };
    step4: {
        tipo_impegno: string;
        notte: boolean;
        convivenza: boolean;
    };
    step5: {
        esperienza_caregiver: string;
        competenze: string[];
    };
};

const INITIAL_DATA: FormData = {
    step1: { fascia_eta: "", condizioni: [], autonomia: "" },
    step2: { mobilita: false, igiene: false, farmaci: false, compagnia: false, casa: false },
    step3: { lingua: "italiano", personalita: "", comunicazione: "" },
    step3_psychological: {
        stile_comunicativo_preferito: "",
        livello_autonomia_desiderato: "",
        approccio_emotivo_desiderato: "",
        ambiente_domestico: "",
        gestione_imprevisti: "",
    },
    step4: { tipo_impegno: "", notte: false, convivenza: false },
    step5: { esperienza_caregiver: "", competenze: [] },
};

export function DisabledProfileForm() {
    const router = useRouter();
    const [step, setStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [savingDraft, setSavingDraft] = useState(false);
    const [formData, setFormData] = useState<FormData>(INITIAL_DATA);

    useEffect(() => {
        async function loadData() {
            const isDemo = document.cookie.includes("demo_mode=true");
            if (isDemo) return;

            const supabase = supabaseBrowserClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data } = await supabase
                .from("disabled_profiles")
                .select("*")
                .eq("user_id", user.id)
                .maybeSingle();

            if (data) {
                // Map the DB JSONB back to our structured state
                setFormData({
                    step1: (data.raw_contexto_vita as any) || INITIAL_DATA.step1,
                    step2: (data.raw_bisogni_assistenziali as any) || INITIAL_DATA.step2,
                    step3: (data.raw_stile_relazionale as any) || INITIAL_DATA.step3,
                    step3_psychological: (data.psychological_profile as any) || INITIAL_DATA.step3_psychological,
                    step4: (data.raw_ritmo_quotidiano as any) || INITIAL_DATA.step4,
                    step5: (data.raw_valori_convivenza as any) || INITIAL_DATA.step5,
                });
            }
        }
        loadData();
    }, []);

    const updateStepData = <T extends keyof FormData>(stepKey: T, data: Partial<FormData[T]>) => {
        setFormData(prev => ({
            ...prev,
            [stepKey]: { ...prev[stepKey], ...data }
        }));
    };

    const handleSaveDraft = async () => {
        setSavingDraft(true);
        try {
            await handleSubmit(true);
            alert("Progresso salvato. Potrai continuare quando vuoi!");
        } finally {
            setSavingDraft(false);
        }
    };

    const handleSubmit = async (isDraft = false) => {
        if (!isDraft) setLoading(true);
        try {
            const isDemo = document.cookie.includes("demo_mode=true");
            if (isDemo) {
                if (!isDraft) router.push("/dashboard?success=profile_saved");
                return;
            }

            const supabase = supabaseBrowserClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Non autenticato");

            const payload = {
                user_id: user.id,
                raw_contexto_vita: formData.step1,
                raw_bisogni_assistenziali: formData.step2,
                raw_stile_relazionale: formData.step3,
                psychological_profile: formData.step3_psychological,
                raw_ritmo_quotidiano: formData.step4,
                raw_valori_convivenza: formData.step5,
                updated_at: new Date().toISOString(),
            };

            const { data: existing } = await supabase
                .from("disabled_profiles")
                .select("id")
                .eq("user_id", user.id)
                .maybeSingle();

            let profileId = existing?.id;

            if (existing) {
                await supabase.from("disabled_profiles").update(payload).eq("id", existing.id);
            } else {
                const { data: newProfile } = await supabase.from("disabled_profiles").insert(payload).select("id").single();
                profileId = newProfile?.id;
            }

            if (!isDraft) {
                // Trigger AI Analysis
                await fetch("/api/analyze-profile", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ role: "disabled", profile_id: profileId }),
                });
                router.push("/dashboard/matches?first_attempt=true");
            }
        } catch (error) {
            console.error(error);
            if (!isDraft) alert("Errore nel salvataggio.");
        } finally {
            setLoading(false);
        }
    };

    const STEPS = [
        {
            title: "La persona assistita",
            description: "Iniziamo conoscendo meglio chi riceverà l'assistenza. Questo ci aiuta a definire il profilo ideale.",
            content: (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="space-y-4">
                        <label className="text-[10px] font-bold uppercase text-neutral-400 tracking-[0.2em] mb-2 block">Fascia d'età</label>
                        <GuidedSelection
                            options={[
                                { id: "giovane", title: "Giovane Adulto", description: "18-35 anni. Focus su autonomia e studio/lavoro." },
                                { id: "adulto", title: "Adulto", description: "36-65 anni. Gestione vita quotidiana e sociale." },
                                { id: "anziano", title: "Senior", description: "Oltre 65 anni. Supporto e compagnia costante." },
                            ]}
                            value={formData.step1.fascia_eta}
                            onChange={(v) => updateStepData("step1", { fascia_eta: v })}
                        />
                    </div>
                    <div className="space-y-4">
                        <label className="text-[10px] font-bold uppercase text-neutral-400 tracking-[0.2em] mb-2 block">Condizioni o necessità speciali</label>
                        <MultiSelect
                            options={[
                                { id: "motoria", label: "Difficoltà motorie" },
                                { id: "sensoriale", label: "Difficoltà sensoriali" },
                                { id: "cognitiva", label: "Difficoltà cognitive" },
                                { id: "psicologica", label: "Supporto psicologico" },
                                { id: "altro", label: "Altro" },
                            ]}
                            selected={formData.step1.condizioni}
                            onChange={(s) => updateStepData("step1", { condizioni: s })}
                        />
                        <p className="text-[10px] text-neutral-400 italic">Puoi selezionare più opzioni per darci un quadro completo.</p>
                    </div>
                </div>
            ),
        },
        {
            title: "Bisogni quotidiani",
            description: "Quali sono i gesti quotidiani in cui serve un aiuto? Ogni dettaglio conta per trovare le giuste competenze.",
            content: (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <Toggle
                        label="Supporto alla mobilità"
                        description="Aiuto negli spostamenti in casa o all'esterno."
                        checked={formData.step2.mobilita}
                        onChange={(c) => updateStepData("step2", { mobilita: c })}
                    />
                    <Toggle
                        label="Igiene personale"
                        description="Aiuto per il bagno, la vestizione e la cura del sé."
                        checked={formData.step2.igiene}
                        onChange={(c) => updateStepData("step2", { igiene: c })}
                    />
                    <Toggle
                        label="Gestione farmaci"
                        description="Monitoraggio e somministrazione di terapie."
                        checked={formData.step2.farmaci}
                        onChange={(c) => updateStepData("step2", { farmaci: c })}
                    />
                    <Toggle
                        label="Compagnia e socialità"
                        description="Attività ricreative, passeggiate, conversazione."
                        checked={formData.step2.compagnia}
                        onChange={(c) => updateStepData("step2", { compagnia: c })}
                    />
                    <Toggle
                        label="Gestione della casa"
                        description="Cucinare, pulizie leggere e commissioni."
                        checked={formData.step2.casa}
                        onChange={(c) => updateStepData("step2", { casa: c })}
                    />
                </div>
            ),
        },
        {
            title: "Aspetti relazionali",
            description: "La personalità è ciò che crea il legame. Cerchiamo qualcuno che entri in sintonia con il tuo mondo.",
            content: (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="space-y-4">
                        <label className="text-[10px] font-bold uppercase text-neutral-400 tracking-[0.2em] mb-2 block">Personalità dell'assistito</label>
                        <GuidedSelection
                            options={[
                                { id: "introverso", title: "Riservato ed equilibrato", description: "Ama la calma e il silenzio." },
                                { id: "estroverso", title: "Socievole e chiacchierone", description: "Cerca interazione e stimoli." },
                                { id: "energico", title: "Attivo e propositivo", description: "Ama fare attività e uscire." },
                            ]}
                            value={formData.step3.personalita}
                            onChange={(v) => updateStepData("step3", { personalita: v })}
                        />
                    </div>
                    <div className="space-y-4">
                        <label className="text-[10px] font-bold uppercase text-neutral-400 tracking-[0.2em] mb-2 block">Stile di comunicazione</label>
                        <GuidedSelection
                            options={[
                                { id: "diretto", title: "Chiaro e diretto", description: "Comunicazione essenziale." },
                                { id: "empatico", title: "Caldo ed empatico", description: "Focus sulle emozioni." },
                                { id: "formale", title: "Discreto e formale", description: "Rispetto della privacy." },
                            ]}
                            value={formData.step3.comunicazione}
                            onChange={(v) => updateStepData("step3", { comunicazione: v })}
                        />
                    </div>
                </div>
            ),
        },
        {
            title: "Personalità e preferenze relazionali",
            description: "Approfondiamo le dinamiche umane. Questo ci aiuta a trovare un caregiver non solo competente, ma 'compatibile'.",
            content: (
                <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">

                    {/* Stile Comunicativo Desiderato */}
                    <div className="space-y-6">
                        <h3 className="text-sm font-bold text-neutral-900 border-b border-neutral-100 pb-2">Come comunichi</h3>
                        <div className="space-y-4">
                            <label className="text-[10px] font-bold uppercase text-neutral-400 tracking-[0.2em] mb-2 block">Come preferisci che il caregiver comunichi?</label>
                            <GuidedSelection
                                options={[
                                    { id: "diretto", title: "Diretto e chiaro", description: "Senza troppi giri di parole." },
                                    { id: "empatico", title: "Empatico e rassicurante", description: "Attento alle emozioni." },
                                    { id: "silenzioso", title: "Silenzioso", description: "Parla solo quando necessario." },
                                    { id: "motivante", title: "Motivante e propositivo", description: "Pieno di energia." },
                                ]}
                                value={formData.step3_psychological.stile_comunicativo_preferito}
                                onChange={(v) => updateStepData("step3_psychological", { stile_comunicativo_preferito: v })}
                            />
                        </div>
                    </div>

                    {/* Autonomia e Iniziativa */}
                    <div className="space-y-6">
                        <h3 className="text-sm font-bold text-neutral-900 border-b border-neutral-100 pb-2">Autonomia e Iniziativa</h3>
                        <div className="space-y-4">
                            <label className="text-[10px] font-bold uppercase text-neutral-400 tracking-[0.2em] mb-2 block">Quanto vuoi che il caregiver prenda iniziativa?</label>
                            <GuidedSelection
                                options={[
                                    { id: "decisione_mia", title: "Voglio decidere tutto io/noi", description: "Il caregiver esegue le richieste." },
                                    { id: "collaborazione", title: "Può proporre ma chiediamo conferma", description: "Collaborazione nelle decisioni." },
                                    { id: "autonomia_totale", title: "Può organizzare autonomamente", description: "Massima fiducia nell'organizzazione." },
                                ]}
                                value={formData.step3_psychological.livello_autonomia_desiderato}
                                onChange={(v) => updateStepData("step3_psychological", { livello_autonomia_desiderato: v })}
                            />
                        </div>

                        <div className="space-y-4">
                            <label className="text-[10px] font-bold uppercase text-neutral-400 tracking-[0.2em] mb-2 block">Che tipo di relazione cerchi?</label>
                            <GuidedSelection
                                options={[
                                    { id: "professionale", title: "Professionale e distaccata", description: "Focus sul servizio tecnico." },
                                    { id: "familiare", title: "Calda e familiare", description: "Parte della famiglia." },
                                    { id: "empatica", title: "Empatica ma con confini", description: "Vicinanza emotiva ma rispetto dei ruoli." },
                                ]}
                                value={formData.step3_psychological.approccio_emotivo_desiderato}
                                onChange={(v) => updateStepData("step3_psychological", { approccio_emotivo_desiderato: v })}
                            />
                        </div>
                    </div>

                    {/* Ambiente e Imprevisti */}
                    <div className="space-y-6">
                        <h3 className="text-sm font-bold text-neutral-900 border-b border-neutral-100 pb-2">Ambiente e Situazioni</h3>
                        <div className="space-y-4">
                            <label className="text-[10px] font-bold uppercase text-neutral-400 tracking-[0.2em] mb-2 block">Com'è l'ambiente domestico?</label>
                            <GuidedSelection
                                options={[
                                    { id: "tranquillo", title: "Tranquillo e silenzioso", description: "Pace e relax prevalgono." },
                                    { id: "vivace", title: "Vivace, con famiglia presente", description: "C'è spesso movimento e gente." },
                                    { id: "variabile", title: "Variabile", description: "Dipende dai momenti." },
                                ]}
                                value={formData.step3_psychological.ambiente_domestico}
                                onChange={(v) => updateStepData("step3_psychological", { ambiente_domestico: v })}
                            />
                        </div>

                        <div className="space-y-4">
                            <label className="text-[10px] font-bold uppercase text-neutral-400 tracking-[0.2em] mb-2 block">Se l'assistito rifiuta un'attività, il caregiver dovrebbe:</label>
                            <GuidedSelection
                                options={[
                                    { id: "insistere", title: "Insistere gentilmente", description: "Per il suo bene." },
                                    { id: "alternativa", title: "Proporre alternative", description: "Essere flessibile." },
                                    { id: "accettare", title: "Accettare e riprovare dopo", description: "Rispettare il rifiuto." },
                                    { id: "chiedere", title: "Chiedere sempre a noi", description: "Consultare la famiglia." },
                                ]}
                                value={formData.step3_psychological.gestione_imprevisti}
                                onChange={(v) => updateStepData("step3_psychological", { gestione_imprevisti: v })}
                            />
                        </div>
                    </div>

                    <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-xl">
                        <p className="text-xs text-neutral-600 italic">
                            💡 Queste risposte ci aiuteranno a trovare un caregiver che si integri perfettamente nel vostro contesto, riducendo le incomprensioni.
                        </p>
                    </div>
                </div>
            )
        },
        {
            title: "Logistica e disponibilità",
            description: "L'organizzazione pratica è alla base della serenità. Definiamo i ritmi della convivenza.",
            content: (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="space-y-4">
                        <label className="text-[10px] font-bold uppercase text-neutral-400 tracking-[0.2em] mb-2 block">Ore di supporto necessarie</label>
                        <GuidedSelection
                            options={[
                                { id: "part-time", title: "Poche ore al giorno", description: "Interventi specifici." },
                                { id: "full-time-diurno", title: "Full-time diurno", description: "Presenza costante durante il giorno." },
                                { id: "convivenza", title: "Convivenza (H24)", description: "Assistenza con vitto e alloggio." },
                            ]}
                            value={formData.step4.tipo_impegno}
                            onChange={(v) => updateStepData("step4", { tipo_impegno: v })}
                        />
                    </div>
                    <div className="space-y-4">
                        <Toggle
                            label="Presenza notturna"
                            description="Serve assistenza o presenza durante la notte?"
                            checked={formData.step4.notte}
                            onChange={(c) => updateStepData("step4", { notte: c })}
                        />
                        <Toggle
                            label="Flessibilità festivi"
                            description="Possibilità di concordare turni nei weekend."
                            checked={formData.step4.convivenza}
                            onChange={(c) => updateStepData("step4", { convivenza: c })}
                        />
                    </div>
                </div>
            ),
        },
        {
            title: "Il caregiver ideale",
            description: "Cosa cerchi in chi ti accompagnerà in questo viaggio? Definisci le tue aspettative.",
            content: (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="space-y-4">
                        <label className="text-[10px] font-bold uppercase text-neutral-400 tracking-[0.2em] mb-2 block">Livello di esperienza cercato</label>
                        <GuidedSelection
                            options={[
                                { id: "primo-impiego", title: "Anche prima esperienza", description: "Conta più l'attitudine umana." },
                                { id: "esperto", title: "Almeno 2 anni di esperienza", description: "Sicurezza e padronanza." },
                                { id: "specializzato", title: "Certificazioni specifiche (OSS)", description: "Alta competenza tecnica." },
                            ]}
                            value={formData.step5.esperienza_caregiver}
                            onChange={(v) => updateStepData("step5", { esperienza_caregiver: v })}
                        />
                    </div>
                    <div className="space-y-4">
                        <label className="text-[10px] font-bold uppercase text-neutral-400 tracking-[0.2em] mb-2 block">Competenze desiderate</label>
                        <MultiSelect
                            options={[
                                { id: "auto", label: "Patente di guida" },
                                { id: "cucina", label: "Ottime doti culinarie" },
                                { id: "lingue", label: "Conoscenza altre lingue" },
                                { id: "infermieristica", label: "Nozioni infermieristiche" },
                                { id: "pronto_soccorso", label: "Primo soccorso" },
                            ]}
                            selected={formData.step5.competenze}
                            onChange={(s) => updateStepData("step5", { competenze: s })}
                        />
                    </div>
                </div>
            )
        }
    ];

    const currentStepData = STEPS[step];

    return (
        <WizardStep
            currentStep={step}
            totalSteps={STEPS.length}
            title={currentStepData.title}
            description={currentStepData.description}
            onBack={step > 0 ? () => setStep(s => s - 1) : undefined}
        >
            <div className="space-y-10">
                {currentStepData.content}

                <div className="flex items-center justify-between pt-10 border-t border-neutral-100">
                    <button
                        type="button"
                        onClick={handleSaveDraft}
                        disabled={savingDraft || loading}
                        className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 hover:text-black transition-colors disabled:opacity-50"
                    >
                        {savingDraft ? "Salvataggio..." : "Salva e continua dopo"}
                    </button>

                    <button
                        onClick={() => {
                            if (step < STEPS.length - 1) setStep(s => s + 1);
                            else handleSubmit();
                        }}
                        disabled={loading}
                        className="shiny-button px-10 py-3.5 text-xs font-black text-black rounded-full uppercase tracking-widest"
                    >
                        {loading
                            ? "Creazione profilo..."
                            : step === STEPS.length - 1
                                ? "Trova il mio match"
                                : "Continua"}
                    </button>
                </div>

                <p className="text-[9px] text-neutral-300 font-mono text-center uppercase tracking-tighter">
                    I tuoi dati sono trattati con protocolli di massima sicurezza e riservatezza.
                </p>
            </div>
        </WizardStep>
    );
}
