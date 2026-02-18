"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowserClient } from "@/lib/supabaseClient";
import { SpotlightCard } from "@/components/ui/SpotlightCard";

type OnboardingStatus = "started" | "role_done" | "profile_base_done" | "completed";
type Role = "disabile" | "badante" | "associazione" | null;

export default function OnboardingPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState<OnboardingStatus>("started");
    const [role, setRole] = useState<Role>(null);
    const [userId, setUserId] = useState<string | null>(null);

    // Form states
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [city, setCity] = useState("");
    const [phone, setPhone] = useState("");
    const [description, setDescription] = useState("");

    // Role specific states - Disabile
    const [disabilityType, setDisabilityType] = useState("");
    const [autonomyLevel, setAutonomyLevel] = useState<"basso" | "medio" | "alto">("medio");
    const [assistanceNeeds, setAssistanceNeeds] = useState("");

    // Role specific states - Badante
    const [experienceYears, setExperienceYears] = useState(0);
    const [skills, setSkills] = useState("");
    const [availability, setAvailability] = useState("");

    // Role specific states - Associazione (V2)
    const [entityName, setEntityName] = useState("");
    const [entityType, setEntityType] = useState<"association" | "municipality" | "fish_node" | "other">("association");
    const [territoryFocus, setTerritoryFocus] = useState("");

    const [saving, setSaving] = useState(false);

    useEffect(() => {
        async function init() {
            const supabase = supabaseBrowserClient();
            const { data: { session } } = await supabase.auth.getSession();

            if (!session) {
                router.push("/login");
                return;
            }

            setUserId(session.user.id);

            const { data: userRecord } = await supabase
                .from("users")
                .select("role")
                .eq("id", session.user.id)
                .maybeSingle();

            const { data: profile } = await supabase
                .from("profiles")
                .select("*")
                .eq("user_id", session.user.id)
                .maybeSingle();

            if (profile) {
                setStatus(profile.onboarding_status || "started");
                setRole(userRecord?.role as Role);
                setFirstName(profile.nome || "");
                setLastName(profile.cognome || "");
                setCity(profile.citta || "");
                setPhone(profile.telefono || "");
                setDescription(profile.descrizione || "");
            }

            if (profile?.onboarding_status === "completed") {
                router.push("/dashboard");
            } else {
                setLoading(false);
            }
        }
        init();
    }, [router]);

    async function updateStatus(nextStatus: OnboardingStatus) {
        if (!userId) return;
        const supabase = supabaseBrowserClient();
        await supabase.from("profiles").update({ onboarding_status: nextStatus }).eq("user_id", userId);
        setStatus(nextStatus);
    }

    async function handleRoleSelection(selectedRole: Role) {
        if (!selectedRole) return;
        setSaving(true);
        const supabase = supabaseBrowserClient();
        // Mappatura ruoli UI -> Database coerente con enum public.user_role
        await supabase.from("profiles").update({ role: selectedRole }).eq("user_id", userId);
        setRole(selectedRole);
        await updateStatus("role_done");
        setSaving(false);
    }

    async function handleBaseProfileSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        const supabase = supabaseBrowserClient();
        await supabase.from("profiles").update({
            nome: firstName,
            cognome: lastName,
            citta: city,
            telefono: phone,
            descrizione: description
        }).eq("user_id", userId);
        await updateStatus("profile_base_done");
        setSaving(false);
    }

    async function handleSpecificProfileSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        const supabase = supabaseBrowserClient();

        // Get profile ID
        const { data: profile } = await supabase.from("profiles").select("id").eq("user_id", userId).single();
        if (!profile) return;

        if (role === "disabile") {
            await supabase.from("disabili").upsert({
                profile_id: profile.id,
                tipo_disabilita: disabilityType,
                livello_autonomia: autonomyLevel,
                necessita_assistenza: assistanceNeeds
            });
            await supabase.from("badanti").upsert({
                profile_id: profile.id,
                anni_esperienza: experienceYears,
                competenze: skills.split(",").map(s => s.trim()),
                bio: availability
            });
        } else if (role === "associazione") {
            await supabase.from("entities").upsert({
                user_id: userId,
                name: entityName,
                entity_type: entityType,
                territory_focus: territoryFocus,
                description: description
            });
        }

        await updateStatus("completed");
        setSaving(false);
        router.push("/dashboard");
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
                <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Caricamento configurazione...</p>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-[#FDFDFD] flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background patterns */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-neutral-100/50 rounded-full blur-[100px] -mr-64 -mt-64" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-neutral-100/50 rounded-full blur-[100px] -ml-64 -mb-64" />

            <div className="w-full max-w-[600px] relative z-10">
                {/* Progress Bar */}
                <div className="mb-12">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-black">
                            Step {status === "started" ? "1" : status === "role_done" ? "2" : "3"} di 3
                        </span>
                        <span className="text-[10px] font-bold text-neutral-400 uppercase font-mono">
                            {status === "started" ? "Selezione Ruolo" : status === "role_done" ? "Anagrafica" : "Competenze Specifiche"}
                        </span>
                    </div>
                    <div className="h-1 w-full bg-neutral-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-black transition-all duration-700 ease-out"
                            style={{ width: `${status === "started" ? 33 : status === "role_done" ? 66 : 100}%` }}
                        />
                    </div>
                </div>

                {/* STEP 1: Scelta Ruolo */}
                {status === "started" && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="text-center mb-10">
                            <h1 className="text-4xl font-black tracking-tighter text-black mb-4">Come vuoi usare <span className="text-neutral-400 italic serif">CareMatch?</span></h1>
                            <p className="text-sm text-neutral-500">Seleziona la tua modalità di accesso per iniziare.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <button
                                onClick={() => handleRoleSelection("disabile")}
                                disabled={saving}
                                className="group text-left"
                            >
                                <SpotlightCard className="p-8 border-neutral-200 hover:border-black transition-all h-full">
                                    <div className="text-3xl mb-4 grayscale group-hover:grayscale-0 transition-all">👵</div>
                                    <h3 className="text-xs font-black uppercase tracking-widest text-neutral-400 group-hover:text-black mt-2">CERCO ASSISTENZA</h3>
                                    <p className="text-[10px] text-neutral-400 mt-2 font-mono uppercase leading-relaxed">Per me o un familiare che necessita di supporto.</p>
                                </SpotlightCard>
                            </button>

                            <button
                                onClick={() => handleRoleSelection("badante")}
                                disabled={saving}
                                className="group text-left"
                            >
                                <SpotlightCard className="p-8 border-neutral-200 hover:border-black transition-all h-full">
                                    <div className="text-3xl mb-4 grayscale group-hover:grayscale-0 transition-all">👩‍⚕️</div>
                                    <h3 className="text-xs font-black uppercase tracking-widest text-neutral-400 group-hover:text-black mt-2">OFFRO ASSISTENZA</h3>
                                    <p className="text-[10px] text-neutral-400 mt-2 font-mono uppercase leading-relaxed">Sono un professionista della cura e del benessere.</p>
                                </SpotlightCard>
                            </button>

                            <button
                                onClick={() => handleRoleSelection("associazione")}
                                disabled={saving}
                                className="group text-left"
                            >
                                <SpotlightCard className="p-8 border-neutral-200 hover:border-black transition-all h-full">
                                    <div className="text-3xl mb-4 grayscale group-hover:grayscale-0 transition-all">🏛️</div>
                                    <h3 className="text-xs font-black uppercase tracking-widest text-neutral-400 group-hover:text-black mt-2">RAPPRESENTANZA</h3>
                                    <p className="text-[10px] text-neutral-400 mt-2 font-mono uppercase leading-relaxed">Associazioni, Enti e coordinamento territoriale.</p>
                                </SpotlightCard>
                            </button>
                        </div>
                    </div>
                )}

                {/* STEP 2: Anagrafica Base */}
                {status === "role_done" && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="text-center mb-10">
                            <h1 className="text-4xl font-black tracking-tighter text-black mb-4">Parlaci un po' di <span className="text-neutral-400 italic serif">te.</span></h1>
                            <p className="text-sm text-neutral-500">Queste informazioni ci aiutano a creare i primi collegamenti.</p>
                        </div>

                        <SpotlightCard className="p-8 border-neutral-200">
                            <form onSubmit={handleBaseProfileSubmit} className="space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase text-neutral-500 font-mono tracking-widest">Nome</label>
                                        <input
                                            type="text" required value={firstName} onChange={e => setFirstName(e.target.value)}
                                            placeholder="John" className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:border-black transition-all outline-none"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase text-neutral-500 font-mono tracking-widest">Cognome</label>
                                        <input
                                            type="text" required value={lastName} onChange={e => setLastName(e.target.value)}
                                            placeholder="Doe" className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:border-black transition-all outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase text-neutral-500 font-mono tracking-widest">Città</label>
                                        <input
                                            type="text" required value={city} onChange={e => setCity(e.target.value)}
                                            placeholder="Roma" className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:border-black transition-all outline-none"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase text-neutral-500 font-mono tracking-widest">Telefono</label>
                                        <input
                                            type="tel" required value={phone} onChange={e => setPhone(e.target.value)}
                                            placeholder="+39 333 ..." className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:border-black transition-all outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase text-neutral-500 font-mono tracking-widest">Descrizione Breve</label>
                                    <textarea
                                        rows={3} required value={description} onChange={e => setDescription(e.target.value)}
                                        placeholder="Raccontaci brevemente chi sei..." className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:border-black transition-all outline-none resize-none"
                                    />
                                </div>

                                <button
                                    type="submit" disabled={saving}
                                    className="w-full bg-black text-white py-4 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-neutral-800 transition-all shadow-xl shadow-black/5 disabled:opacity-50"
                                >
                                    {saving ? "SAVING..." : "PROSSIMO STEP →"}
                                </button>
                            </form>
                        </SpotlightCard>
                    </div>
                )}

                {/* STEP 3: Dati Specifici */}
                {status === "profile_base_done" && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="text-center mb-10">
                            <h1 className="text-4xl font-black tracking-tighter text-black mb-4">Ultimi <span className="text-neutral-400 italic serif">dettagli.</span></h1>
                            <p className="text-sm text-neutral-500">Personalizza il tuo profilo per massimizzare il matching.</p>
                        </div>

                        <SpotlightCard className="p-8 border-neutral-200">
                            <form onSubmit={handleSpecificProfileSubmit} className="space-y-8">
                                {role === "disabile" ? (
                                    <>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase text-neutral-500 font-mono tracking-widest">Tipo di supporto richiesto</label>
                                            <input
                                                type="text" required value={disabilityType} onChange={e => setDisabilityType(e.target.value)}
                                                placeholder="Es. Assistenza motoria, supporto relazionale..." className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:border-black transition-all outline-none"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase text-neutral-500 font-mono tracking-widest">Livello di Autonomia</label>
                                            <select
                                                value={autonomyLevel} onChange={e => setAutonomyLevel(e.target.value as any)}
                                                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:border-black transition-all outline-none appearance-none"
                                            >
                                                <option value="alto">Alto (Parzialmente indipendente)</option>
                                                <option value="medio">Medio (Necessita di supporto costante)</option>
                                                <option value="basso">Basso (Dipendenza totale)</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase text-neutral-500 font-mono tracking-widest">Esigenze particolari</label>
                                            <textarea
                                                rows={3} required value={assistanceNeeds} onChange={e => setAssistanceNeeds(e.target.value)}
                                                placeholder="Descrivi eventuali esigenze mediche o quotidiane..." className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:border-black transition-all outline-none resize-none"
                                            />
                                        </div>
                                    </>
                                ) : role === "badante" ? (
                                    <>
                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold uppercase text-neutral-500 font-mono tracking-widest">Anni di Esperienza</label>
                                                <input
                                                    type="number" required value={experienceYears} onChange={e => setExperienceYears(parseInt(e.target.value))}
                                                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:border-black transition-all outline-none"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold uppercase text-neutral-500 font-mono tracking-widest">Competenze (separate da virgola)</label>
                                                <input
                                                    type="text" required value={skills} onChange={e => setSkills(e.target.value)}
                                                    placeholder="Es. Primo soccorso, Cucina, Mobilità..." className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:border-black transition-all outline-none"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase text-neutral-500 font-mono tracking-widest">Disponibilità e Bio Professionale</label>
                                            <textarea
                                                rows={4} required value={availability} onChange={e => setAvailability(e.target.value)}
                                                placeholder="Descrivi la tua disponibilità oraria e il tuo approccio professionale..." className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:border-black transition-all outline-none resize-none"
                                            />
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase text-neutral-500 font-mono tracking-widest">Nome Organizzazione / Ente</label>
                                            <input
                                                type="text" required value={entityName} onChange={e => setEntityName(e.target.value)}
                                                placeholder="Es. FISH Regionale, Consulta Handicap Comune X..." className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:border-black transition-all outline-none"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase text-neutral-500 font-mono tracking-widest">Tipo di Ente</label>
                                            <select
                                                value={entityType} onChange={e => setEntityType(e.target.value as any)}
                                                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:border-black transition-all outline-none appearance-none"
                                            >
                                                <option value="association">Associazione di Categoria</option>
                                                <option value="municipality">Comune / Ente Pubblico</option>
                                                <option value="fish_node">Nodo FISH / FAND</option>
                                                <option value="foundation">Fondazione / Terzo Settore</option>
                                                <option value="other">Altro</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase text-neutral-500 font-mono tracking-widest">Ambito Territoriale di Riferimento</label>
                                            <input
                                                type="text" required value={territoryFocus} onChange={e => setTerritoryFocus(e.target.value)}
                                                placeholder="Es. Lombardia, Provincia di Verona, Comune di Milano..." className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:border-black transition-all outline-none"
                                            />
                                        </div>
                                    </>
                                )}

                                <button
                                    type="submit" disabled={saving}
                                    className="w-full bg-black text-white py-4 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-neutral-800 transition-all shadow-xl shadow-black/5"
                                >
                                    {saving ? "FINALIZZAZIONE..." : "COMPLETA ONBOARDING 🎉"}
                                </button>
                            </form>
                        </SpotlightCard>
                    </div>
                )}
            </div>
        </main>
    );
}
