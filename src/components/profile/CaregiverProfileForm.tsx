"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowserClient } from "@/lib/supabaseClient";
import { WizardStep } from "@/components/ui/WizardStep";
import { GuidedSelection } from "@/components/ui/GuidedSelection";
import { Toggle } from "@/components/ui/Toggle";
import { MultiSelect } from "@/components/ui/MultiSelect";
import { TextArea } from "@/components/ui/FormFields";

type FormData = {
    step1: {
        nome_completo: string;
        lingue: string[];
        regione: string;
        provincia: string;
        disponibilita: string[];
    };
    step2: {
        anni_esperienza: string;
        tipologie_assistenza: string[];
        competenze_specifiche: string[];
        certificazioni: string[];
    };
    step3: {
        preferenze_relazionali: string;
        modalita_comunicativa: string;
        attivita_preferite: string[];
    };
    step3_psychological: {
        stile_comunicativo: string;
        livello_iniziativa: string;
        approccio_emotivo: string;
        energia_personale: string;
        routine_flessibilita: number;
        scenario_rifiuto: string;
        contesto_lavorativo: string;
        presenza_famiglia: string;
        motivazione: string[];
        scenario_pazienza: string;
        scenario_conflitti: string;
        scenario_autonomia: string;
    };
    step4: {
        orari_preferiti: string[];
        spostamenti: boolean;
        patente: boolean;
        automunito: boolean;
        disponibilita_immediata: string;
    };
    step5: {
        descrizione: string;
        video_url?: string;
    };
};

const INITIAL_DATA: FormData = {
    step1: { nome_completo: "", lingue: ["italiano"], regione: "", provincia: "", disponibilita: [] },
    step2: { anni_esperienza: "", tipologie_assistenza: [], competenze_specifiche: [], certificazioni: [] },
    step3: { preferenze_relazionali: "", modalita_comunicativa: "", attivita_preferite: [] },
    step3_psychological: {
        stile_comunicativo: "",
        livello_iniziativa: "",
        approccio_emotivo: "",
        energia_personale: "",
        routine_flessibilita: 5,
        scenario_rifiuto: "",
        contesto_lavorativo: "",
        presenza_famiglia: "",
        motivazione: [],
        scenario_pazienza: "",
        scenario_conflitti: "",
        scenario_autonomia: "",
    },
    step4: { orari_preferiti: [], spostamenti: false, patente: false, automunito: false, disponibilita_immediata: "" },
    step5: { descrizione: "", video_url: "" },
};

export function CaregiverProfileForm() {
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
                .from("caregiver_profiles")
                .select("*")
                .eq("user_id", user.id)
                .maybeSingle();

            if (data) {
                setFormData({
                    step1: (data.raw_competenze_esperienze as any) || INITIAL_DATA.step1,
                    step2: (data.raw_approccio_cura as any) || INITIAL_DATA.step2,
                    step3: (data.raw_stile_relazionale as any) || INITIAL_DATA.step3,
                    step3_psychological: (data.psychological_profile as any) || INITIAL_DATA.step3_psychological,
                    step4: (data.raw_disponibilita as any) || INITIAL_DATA.step4,
                    step5: (data.raw_valori_personali as any) || INITIAL_DATA.step5,
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
                raw_competenze_esperienze: formData.step1,
                raw_approccio_cura: formData.step2,
                raw_stile_relazionale: formData.step3,
                psychological_profile: formData.step3_psychological,
                raw_disponibilita: formData.step4,
                raw_valori_personali: formData.step5,
                updated_at: new Date().toISOString(),
            };

            const { data: existing } = await supabase
                .from("caregiver_profiles")
                .select("id")
                .eq("user_id", user.id)
                .maybeSingle();

            let profileId = existing?.id;

            if (existing) {
                await supabase.from("caregiver_profiles").update(payload).eq("id", existing.id);
            } else {
                const { data: newProfile } = await supabase.from("caregiver_profiles").insert(payload).select("id").single();
                profileId = newProfile?.id;
            }

            if (!isDraft) {
                await fetch("/api/analyze-profile", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ role: "caregiver", profile_id: profileId }),
                });
                router.push("/dashboard?success=profile_saved");
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
            title: "Informazioni personali",
            description: "Iniziamo con le basi: chi sei e dove operi. Questo aiuta le famiglie a trovarti.",
            content: (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="space-y-4">
                        <label className="text-[10px] font-bold uppercase text-neutral-400 tracking-[0.2em] mb-2 block">Nome completo</label>
                        <input
                            type="text"
                            value={formData.step1.nome_completo}
                            onChange={(e) => updateStepData("step1", { nome_completo: e.target.value })}
                            placeholder="Mario Rossi"
                            className="w-full px-4 py-3 text-sm text-neutral-900 bg-white border border-neutral-200 rounded-xl focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
                        />
                    </div>
                    <div className="space-y-4">
                        <label className="text-[10px] font-bold uppercase text-neutral-400 tracking-[0.2em] mb-2 block">Lingue parlate</label>
                        <MultiSelect
                            options={[
                                { id: "italiano", label: "Italiano" },
                                { id: "inglese", label: "Inglese" },
                                { id: "francese", label: "Francese" },
                                { id: "spagnolo", label: "Spagnolo" },
                                { id: "rumeno", label: "Rumeno" },
                                { id: "ucraino", label: "Ucraino" },
                                { id: "altro", label: "Altro" },
                            ]}
                            selected={formData.step1.lingue}
                            onChange={(s) => updateStepData("step1", { lingue: s })}
                        />
                        <p className="text-[10px] text-neutral-400 italic">Le lingue facilitano la comunicazione con famiglie internazionali.</p>
                    </div>
                    <div className="space-y-4">
                        <label className="text-[10px] font-bold uppercase text-neutral-400 tracking-[0.2em] mb-2 block">Disponibilità lavorativa</label>
                        <MultiSelect
                            options={[
                                { id: "full-time", label: "Full-time diurno" },
                                { id: "part-time", label: "Part-time" },
                                { id: "convivenza", label: "Convivenza H24" },
                                { id: "notti", label: "Turni notturni" },
                                { id: "weekend", label: "Weekend" },
                            ]}
                            selected={formData.step1.disponibilita}
                            onChange={(s) => updateStepData("step1", { disponibilita: s })}
                        />
                    </div>
                </div>
            ),
        },
        {
            title: "Esperienza e competenze",
            description: "Il tuo background professionale è il tuo punto di forza. Mostraci cosa sai fare.",
            content: (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="space-y-4">
                        <label className="text-[10px] font-bold uppercase text-neutral-400 tracking-[0.2em] mb-2 block">Anni di esperienza nell'assistenza</label>
                        <GuidedSelection
                            options={[
                                { id: "primo", title: "Primo impiego", description: "Motivazione e voglia di imparare." },
                                { id: "1-3", title: "1-3 anni", description: "Esperienza iniziale consolidata." },
                                { id: "3-5", title: "3-5 anni", description: "Competenza e autonomia." },
                                { id: "5-10", title: "5-10 anni", description: "Esperienza solida e affidabile." },
                                { id: "10+", title: "Oltre 10 anni", description: "Professionista esperto." },
                            ]}
                            value={formData.step2.anni_esperienza}
                            onChange={(v) => updateStepData("step2", { anni_esperienza: v })}
                        />
                    </div>
                    <div className="space-y-4">
                        <label className="text-[10px] font-bold uppercase text-neutral-400 tracking-[0.2em] mb-2 block">Tipologie di assistenza svolte</label>
                        <MultiSelect
                            options={[
                                { id: "anziani", label: "Anziani autosufficienti" },
                                { id: "motoria", label: "Disabilità motoria" },
                                { id: "cognitiva", label: "Disabilità cognitiva" },
                                { id: "post-op", label: "Post-operatorio" },
                                { id: "palliative", label: "Cure palliative" },
                            ]}
                            selected={formData.step2.tipologie_assistenza}
                            onChange={(s) => updateStepData("step2", { tipologie_assistenza: s })}
                        />
                    </div>
                    <div className="space-y-4">
                        <label className="text-[10px] font-bold uppercase text-neutral-400 tracking-[0.2em] mb-2 block">Competenze specifiche</label>
                        <MultiSelect
                            options={[
                                { id: "sollevamento", label: "Sollevamento" },
                                { id: "farmaci", label: "Gestione farmaci" },
                                { id: "alimentazione", label: "Alimentazione assistita" },
                                { id: "igiene", label: "Igiene personale" },
                                { id: "mobilizzazione", label: "Mobilizzazione" },
                                { id: "primo_soccorso", label: "Primo soccorso" },
                            ]}
                            selected={formData.step2.competenze_specifiche}
                            onChange={(s) => updateStepData("step2", { competenze_specifiche: s })}
                        />
                    </div>
                    <div className="space-y-4">
                        <label className="text-[10px] font-bold uppercase text-neutral-400 tracking-[0.2em] mb-2 block">Certificazioni e titoli</label>
                        <MultiSelect
                            options={[
                                { id: "oss", label: "OSS" },
                                { id: "osa", label: "OSA" },
                                { id: "infermiere", label: "Infermiere" },
                                { id: "primo_soccorso_cert", label: "Primo soccorso certificato" },
                                { id: "nessuna", label: "Nessuna certificazione formale" },
                            ]}
                            selected={formData.step2.certificazioni}
                            onChange={(s) => updateStepData("step2", { certificazioni: s })}
                        />
                    </div>
                </div>
            ),
        },
        {
            title: "Stile di assistenza",
            description: "La tua personalità è ciò che fa la differenza. Come ti relazioni con chi assisti?",
            content: (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="space-y-4">
                        <label className="text-[10px] font-bold uppercase text-neutral-400 tracking-[0.2em] mb-2 block">Preferenze relazionali</label>
                        <GuidedSelection
                            options={[
                                { id: "formale", title: "Formale e discreto", description: "Rispetto della privacy e professionalità." },
                                { id: "familiare", title: "Caldo e familiare", description: "Empatia e vicinanza emotiva." },
                                { id: "professionale", title: "Professionale ma empatico", description: "Equilibrio tra competenza e umanità." },
                            ]}
                            value={formData.step3.preferenze_relazionali}
                            onChange={(v) => updateStepData("step3", { preferenze_relazionali: v })}
                        />
                    </div>
                    <div className="space-y-4">
                        <label className="text-[10px] font-bold uppercase text-neutral-400 tracking-[0.2em] mb-2 block">Modalità comunicativa</label>
                        <GuidedSelection
                            options={[
                                { id: "ascolto", title: "Ascolto attivo", description: "Dare spazio all'altro." },
                                { id: "propositivo", title: "Propositivo", description: "Suggerire attività e soluzioni." },
                                { id: "paziente", title: "Paziente e rassicurante", description: "Calma e supporto costante." },
                            ]}
                            value={formData.step3.modalita_comunicativa}
                            onChange={(v) => updateStepData("step3", { modalita_comunicativa: v })}
                        />
                    </div>
                    <div className="space-y-4">
                        <label className="text-[10px] font-bold uppercase text-neutral-400 tracking-[0.2em] mb-2 block">Attività che ami svolgere con l'assistito</label>
                        <MultiSelect
                            options={[
                                { id: "passeggiate", label: "Passeggiate" },
                                { id: "conversazione", label: "Conversazione" },
                                { id: "giochi", label: "Giochi/attività ricreative" },
                                { id: "lettura", label: "Lettura" },
                                { id: "cucina", label: "Cucina insieme" },
                                { id: "giardinaggio", label: "Giardinaggio" },
                            ]}
                            selected={formData.step3.attivita_preferite}
                            onChange={(s) => updateStepData("step3", { attivita_preferite: s })}
                        />
                    </div>
                </div>
            ),
        },
        {
            title: "Il tuo stile umano",
            description: "Aiutaci a capire come lavori e ti relazioni. Non ci sono risposte giuste o sbagliate, solo il tuo modo unico di essere.",
            content: (
                <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* Dimensione Relazionale */}
                    <div className="space-y-6">
                        <h3 className="text-sm font-bold text-neutral-900 border-b border-neutral-100 pb-2">Come comunichi</h3>

                        <div className="space-y-4">
                            <label className="text-[10px] font-bold uppercase text-neutral-400 tracking-[0.2em] mb-2 block">Il tuo stile comunicativo naturale</label>
                            <GuidedSelection
                                options={[
                                    { id: "osservatore", title: "Ascolto e osservo prima di parlare", description: "Preferisco capire bene prima di intervenire." },
                                    { id: "diretto", title: "Parlo apertamente e direttamente", description: "Dico le cose come stanno, con chiarezza." },
                                    { id: "motivante", title: "Motivo e incoraggio costantemente", description: "Mi piace dare energia positiva." },
                                    { id: "pragmatico", title: "Comunico quando necessario, preferisco i fatti", description: "Vado al sodo, senza troppi fronzoli." },
                                ]}
                                value={formData.step3_psychological.stile_comunicativo}
                                onChange={(v) => updateStepData("step3_psychological", { stile_comunicativo: v })}
                            />
                        </div>

                        <div className="space-y-4">
                            <label className="text-[10px] font-bold uppercase text-neutral-400 tracking-[0.2em] mb-2 block">Quanto prendi iniziativa</label>
                            <GuidedSelection
                                options={[
                                    { id: "ricettivo", title: "Aspetto che mi venga detto cosa fare", description: "Preferisco seguire indicazioni chiare." },
                                    { id: "collaborativo", title: "Propongo attività ma chiedo conferma", description: "Suggerisco idee ma decidiamo insieme." },
                                    { id: "autonomo", title: "Organizzo la giornata in autonomia", description: "Mi piace gestire tutto da solo/a." },
                                ]}
                                value={formData.step3_psychological.livello_iniziativa}
                                onChange={(v) => updateStepData("step3_psychological", { livello_iniziativa: v })}
                            />
                        </div>

                        <div className="space-y-4">
                            <label className="text-[10px] font-bold uppercase text-neutral-400 tracking-[0.2em] mb-2 block">Il tuo approccio emotivo</label>
                            <GuidedSelection
                                options={[
                                    { id: "protettivo", title: "Protettivo, come un familiare", description: "Mi prendo cura con affetto profondo." },
                                    { id: "professionale", title: "Professionale ma distaccato", description: "Mantengo confini chiari nel lavoro." },
                                    { id: "empatico", title: "Empatico e coinvolto emotivamente", description: "Sento le emozioni dell'altro." },
                                ]}
                                value={formData.step3_psychological.approccio_emotivo}
                                onChange={(v) => updateStepData("step3_psychological", { approccio_emotivo: v })}
                            />
                        </div>
                    </div>

                    {/* Ritmo e Stile */}
                    <div className="space-y-6">
                        <h3 className="text-sm font-bold text-neutral-900 border-b border-neutral-100 pb-2">Il tuo ritmo di lavoro</h3>

                        <div className="space-y-4">
                            <label className="text-[10px] font-bold uppercase text-neutral-400 tracking-[0.2em] mb-2 block">La tua energia personale</label>
                            <GuidedSelection
                                options={[
                                    { id: "calmo", title: "Calmo e riflessivo", description: "Preferisco ritmi tranquilli e pensati." },
                                    { id: "dinamico", title: "Dinamico e attivo", description: "Mi piace muovermi e fare tante cose." },
                                    { id: "equilibrato", title: "Equilibrato, adatto al contesto", description: "Mi adatto all'energia del momento." },
                                ]}
                                value={formData.step3_psychological.energia_personale}
                                onChange={(v) => updateStepData("step3_psychological", { energia_personale: v })}
                            />
                        </div>

                        <div className="space-y-4">
                            <label className="text-[10px] font-bold uppercase text-neutral-400 tracking-[0.2em] mb-2 block">Routine fisse o flessibilità?</label>
                            <div className="px-4 py-6 bg-neutral-50 rounded-2xl border border-neutral-100">
                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-xs text-neutral-500">Routine fisse</span>
                                    <span className="text-xs text-neutral-500">Massima flessibilità</span>
                                </div>
                                <input
                                    type="range"
                                    min="1"
                                    max="10"
                                    value={formData.step3_psychological.routine_flessibilita}
                                    onChange={(e) => updateStepData("step3_psychological", { routine_flessibilita: parseInt(e.target.value) })}
                                    className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-black"
                                />
                                <p className="text-center text-xs text-neutral-600 mt-2 font-semibold">{formData.step3_psychological.routine_flessibilita}/10</p>
                            </div>
                        </div>
                    </div>

                    {/* Scenari Pratici */}
                    <div className="space-y-6">
                        <h3 className="text-sm font-bold text-neutral-900 border-b border-neutral-100 pb-2">Come reagisci nelle situazioni reali</h3>

                        <div className="space-y-4">
                            <label className="text-[10px] font-bold uppercase text-neutral-400 tracking-[0.2em] mb-2 block">Scenario: L'assistito rifiuta improvvisamente un'attività programmata</label>
                            <GuidedSelection
                                options={[
                                    { id: "insisto", title: "Insisto gentilmente spiegando l'importanza", description: "È importante mantenere la routine." },
                                    { id: "alternativa", title: "Propongo un'alternativa", description: "Cerco una soluzione diversa." },
                                    { id: "accetto", title: "Accetto e riprovo più tardi", description: "Rispetto il suo momento." },
                                    { id: "chiedo", title: "Chiedo alla famiglia come procedere", description: "Preferisco confrontarmi prima." },
                                ]}
                                value={formData.step3_psychological.scenario_rifiuto}
                                onChange={(v) => updateStepData("step3_psychological", { scenario_rifiuto: v })}
                            />
                        </div>

                        <div className="space-y-4">
                            <label className="text-[10px] font-bold uppercase text-neutral-400 tracking-[0.2em] mb-2 block">Scenario: L'assistito impiega 20 minuti per vestirsi da solo</label>
                            <GuidedSelection
                                options={[
                                    { id: "aiuto_subito", title: "Lo aiuto subito per risparmiare tempo", description: "L'efficienza è importante." },
                                    { id: "pazienza", title: "Aspetto pazientemente, è importante per la sua autonomia", description: "L'autonomia vale l'attesa." },
                                    { id: "aiuto_frustrazione", title: "Aiuto solo se vedo frustrazione", description: "Valuto la situazione emotiva." },
                                ]}
                                value={formData.step3_psychological.scenario_pazienza}
                                onChange={(v) => updateStepData("step3_psychological", { scenario_pazienza: v })}
                            />
                        </div>

                        <div className="space-y-4">
                            <label className="text-[10px] font-bold uppercase text-neutral-400 tracking-[0.2em] mb-2 block">Scenario: La famiglia critica il tuo modo di lavorare</label>
                            <GuidedSelection
                                options={[
                                    { id: "difendo", title: "Mi difendo spiegando le mie ragioni", description: "È importante far capire il mio punto di vista." },
                                    { id: "ascolto", title: "Ascolto e cerco un compromesso", description: "Preferisco trovare un equilibrio." },
                                    { id: "adatto", title: "Chiedo chiarimenti e mi adatto", description: "Sono flessibile alle loro esigenze." },
                                    { id: "disagio", title: "Mi sento a disagio e preferisco evitare", description: "I conflitti mi mettono in difficoltà." },
                                ]}
                                value={formData.step3_psychological.scenario_conflitti}
                                onChange={(v) => updateStepData("step3_psychological", { scenario_conflitti: v })}
                            />
                        </div>

                        <div className="space-y-4">
                            <label className="text-[10px] font-bold uppercase text-neutral-400 tracking-[0.2em] mb-2 block">Scenario: L'assistito ha un piccolo malessere ma la famiglia non è raggiungibile</label>
                            <GuidedSelection
                                options={[
                                    { id: "aspetto", title: "Aspetto che tornino per decidere", description: "Preferisco non prendere decisioni da solo/a." },
                                    { id: "valuto", title: "Valuto la situazione e agisco se necessario", description: "So quando è il momento di intervenire." },
                                    { id: "medico", title: "Chiamo subito un medico per sicurezza", description: "Meglio prevenire che curare." },
                                ]}
                                value={formData.step3_psychological.scenario_autonomia}
                                onChange={(v) => updateStepData("step3_psychological", { scenario_autonomia: v })}
                            />
                        </div>
                    </div>

                    {/* Preferenze Ambientali e Motivazione */}
                    <div className="space-y-6">
                        <h3 className="text-sm font-bold text-neutral-900 border-b border-neutral-100 pb-2">Ambiente e motivazione</h3>

                        <div className="space-y-4">
                            <label className="text-[10px] font-bold uppercase text-neutral-400 tracking-[0.2em] mb-2 block">In che tipo di ambiente lavori meglio?</label>
                            <GuidedSelection
                                options={[
                                    { id: "tranquillo", title: "Ambienti tranquilli e silenziosi", description: "La calma mi aiuta a concentrarmi." },
                                    { id: "vivace", title: "Case vivaci e attive", description: "L'energia mi stimola." },
                                    { id: "indifferente", title: "Indifferente, mi adatto", description: "Sto bene ovunque." },
                                ]}
                                value={formData.step3_psychological.contesto_lavorativo}
                                onChange={(v) => updateStepData("step3_psychological", { contesto_lavorativo: v })}
                            />
                        </div>

                        <div className="space-y-4">
                            <label className="text-[10px] font-bold uppercase text-neutral-400 tracking-[0.2em] mb-2 block">Preferenza sulla presenza della famiglia</label>
                            <GuidedSelection
                                options={[
                                    { id: "con_famiglia", title: "Preferisco lavorare con la famiglia presente", description: "Mi piace collaborare e confrontarmi." },
                                    { id: "autonomia", title: "Lavoro meglio in autonomia completa", description: "Preferisco gestire tutto da solo/a." },
                                    { id: "equilibrio", title: "Equilibrio: collaborazione ma autonomia", description: "Un mix tra i due." },
                                ]}
                                value={formData.step3_psychological.presenza_famiglia}
                                onChange={(v) => updateStepData("step3_psychological", { presenza_famiglia: v })}
                            />
                        </div>

                        <div className="space-y-4">
                            <label className="text-[10px] font-bold uppercase text-neutral-400 tracking-[0.2em] mb-2 block">Perché fai questo lavoro?</label>
                            <MultiSelect
                                options={[
                                    { id: "vocazione", label: "Vocazione alla cura" },
                                    { id: "esperienza_personale", label: "Esperienza personale con disabilità" },
                                    { id: "realizzazione", label: "Professione che mi realizza" },
                                    { id: "stabilita", label: "Stabilità economica" },
                                ]}
                                selected={formData.step3_psychological.motivazione}
                                onChange={(s) => updateStepData("step3_psychological", { motivazione: s })}
                            />
                            <p className="text-[10px] text-neutral-400 italic">Puoi selezionare più opzioni. Questo ci aiuta a capire cosa ti muove.</p>
                        </div>
                    </div>

                    <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-xl">
                        <p className="text-xs text-neutral-600 italic">
                            💡 Queste informazioni ci aiutano a trovare famiglie con cui lavorerai in armonia. Non ci sono risposte "giuste" o "sbagliate", solo il tuo modo autentico di essere.
                        </p>
                    </div>
                </div>
            ),
        },
        {
            title: "Logistica e disponibilità",
            description: "Definiamo gli aspetti pratici per facilitare il matching con le famiglie.",
            content: (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="space-y-4">
                        <label className="text-[10px] font-bold uppercase text-neutral-400 tracking-[0.2em] mb-2 block">Orari preferiti</label>
                        <MultiSelect
                            options={[
                                { id: "mattina", label: "Mattina (6-12)" },
                                { id: "pomeriggio", label: "Pomeriggio (12-18)" },
                                { id: "sera", label: "Sera (18-22)" },
                                { id: "notte", label: "Notte (22-6)" },
                                { id: "flessibile", label: "Flessibile" },
                            ]}
                            selected={formData.step4.orari_preferiti}
                            onChange={(s) => updateStepData("step4", { orari_preferiti: s })}
                        />
                    </div>
                    <div className="space-y-4">
                        <Toggle
                            label="Disponibilità a spostarsi in altre province"
                            description="Amplia le tue opportunità di matching."
                            checked={formData.step4.spostamenti}
                            onChange={(c) => updateStepData("step4", { spostamenti: c })}
                        />
                        <Toggle
                            label="Patente di guida"
                            description="Utile per accompagnare l'assistito."
                            checked={formData.step4.patente}
                            onChange={(c) => updateStepData("step4", { patente: c })}
                        />
                        {formData.step4.patente && (
                            <Toggle
                                label="Automunito/a"
                                description="Hai un'auto a disposizione."
                                checked={formData.step4.automunito}
                                onChange={(c) => updateStepData("step4", { automunito: c })}
                            />
                        )}
                    </div>
                    <div className="space-y-4">
                        <label className="text-[10px] font-bold uppercase text-neutral-400 tracking-[0.2em] mb-2 block">Quando puoi iniziare?</label>
                        <GuidedSelection
                            options={[
                                { id: "subito", title: "Subito", description: "Disponibile immediatamente." },
                                { id: "1-settimana", title: "Entro 1 settimana", description: "Breve preavviso." },
                                { id: "1-mese", title: "Entro 1 mese", description: "Tempo per organizzarsi." },
                                { id: "concordare", title: "Da concordare", description: "Flessibilità sulle tempistiche." },
                            ]}
                            value={formData.step4.disponibilita_immediata}
                            onChange={(v) => updateStepData("step4", { disponibilita_immediata: v })}
                        />
                    </div>
                </div>
            ),
        },
        {
            title: "Presentazione personale",
            description: "Raccontaci chi sei. Questo è ciò che le famiglie vedranno per prime.",
            content: (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="space-y-4">
                        <label className="text-[10px] font-bold uppercase text-neutral-400 tracking-[0.2em] mb-2 block">La tua storia professionale</label>
                        <TextArea
                            id="descrizione"
                            placeholder="Racconta cosa ti motiva, cosa ami del tuo lavoro, cosa ti rende unico/a come caregiver..."
                            value={formData.step5.descrizione}
                            onChange={(e) => updateStepData("step5", { descrizione: e.target.value })}
                        />
                        <p className="text-[10px] text-neutral-400 italic">Suggerimento: Parla della tua passione, di un'esperienza significativa, o di cosa ti ha portato a questo lavoro.</p>
                    </div>
                    <div className="p-6 bg-neutral-50 border border-neutral-100 rounded-2xl">
                        <h4 className="text-xs font-bold text-neutral-900 mb-4">✨ Anteprima profilo</h4>
                        <div className="space-y-3">
                            <p className="text-xs text-neutral-600"><strong>Nome:</strong> {formData.step1.nome_completo || "Da completare"}</p>
                            <p className="text-xs text-neutral-600"><strong>Esperienza:</strong> {formData.step2.anni_esperienza || "Da completare"}</p>
                            <p className="text-xs text-neutral-600"><strong>Competenze:</strong> {formData.step2.competenze_specifiche.length > 0 ? formData.step2.competenze_specifiche.join(", ") : "Da completare"}</p>
                            <p className="text-xs text-neutral-600 italic">{formData.step5.descrizione || "La tua presentazione apparirà qui..."}</p>
                        </div>
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
                                ? "Completa profilo"
                                : "Continua"}
                    </button>
                </div>

                <p className="text-[9px] text-neutral-300 font-mono text-center uppercase tracking-tighter">
                    Il tuo profilo sarà visibile solo alle famiglie compatibili con le tue preferenze.
                </p>
            </div>
        </WizardStep>
    );
}
