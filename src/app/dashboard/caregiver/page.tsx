"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SpotlightCard } from "@/components/ui/SpotlightCard";
import { supabaseBrowserClient } from "@/lib/supabaseClient";
import { CompletionStatusCard } from "@/components/dashboard/CompletionStatusCard";

export default function CaregiverDashboard() {
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadProfile() {
            const isDemo = document.cookie.includes("demo_mode=true");
            if (isDemo) {
                setProfile({
                    nome: "Caregiver",
                    cognome: "Demo",
                    completion_score: 85,
                    role: "caregiver"
                });
                setLoading(false);
                return;
            }
            const supabase = supabaseBrowserClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: profileData } = await supabase
                    .from("profiles")
                    .select("*, badanti(*)")
                    .eq("user_id", user.id)
                    .maybeSingle();

                if (profileData) {
                    setProfile(profileData);
                }
            }
            setLoading(false);
        }
        loadProfile();
    }, []);

    const getMissingFields = () => {
        if (!profile) return [];
        const missing = [];
        if (!profile.nome) missing.push("Nome");
        if (!profile.citta) missing.push("Città");
        if (!profile.telefono) missing.push("Telefono");
        if (!profile.descrizione) missing.push("Descrizione");
        if (!profile.foto_url) missing.push("Foto Profilo");

        const badante = profile.badanti?.[0];
        if (!badante?.anni_esperienza) missing.push("Esperienza");
        if (!badante?.competenze || badante.competenze.length === 0) missing.push("Competenze");
        if (!badante?.disponibilita_oraria) missing.push("Disponibilità");

        return missing;
    };

    const profileName = profile ? `${profile.nome || ""} ${profile.cognome || ""}`.trim() : "Caricamento...";

    return (
        <div className="p-8 lg:p-12 space-y-12 max-w-6xl mx-auto">
            <header className="flex justify-between items-end mb-12">
                <div>
                    <span className="px-2 py-1 text-[9px] font-bold tracking-widest uppercase bg-black text-white rounded-full">Profilo Professionale</span>
                    <h1 className="text-4xl font-black text-black mt-6 tracking-tighter">Benvenuto, <span className="text-neutral-400 italic font-serif">{profileName || "Utente"}.</span></h1>
                    <p className="text-sm text-neutral-500 mt-2 max-w-md">La tua vetrina professionale. Gestisci qui le tue competenze e la tua disponibilità.</p>
                </div>
                <div className="hidden md:block">
                    <div className="flex items-center gap-2 px-4 py-2 bg-white border border-neutral-200 rounded-full shadow-sm">
                        <span className={`w-2 h-2 rounded-full ${(profile?.completion_score || 0) >= 70 ? "bg-black animate-pulse" : "bg-rose-500"}`} />
                        <span className="text-[10px] font-bold text-black uppercase tracking-tight">
                            {(profile?.completion_score || 0) >= 70 ? "Visibilità Attiva" : "Visibilità Limitata"}
                        </span>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Profile Card */}
                <div className="lg:col-span-2 space-y-8">
                    <SpotlightCard className="p-10">
                        <div className="flex flex-col md:flex-row gap-10">
                            <div className="w-32 h-32 rounded-3xl bg-neutral-100 flex items-center justify-center text-4xl border border-neutral-200 overflow-hidden">
                                {profile?.foto_url ? (
                                    <img src={profile.foto_url} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    "👋"
                                )}
                            </div>
                            <div className="flex-1">
                                <h2 className="text-2xl font-black tracking-tight mb-2">Il tuo Profilo Umano</h2>
                                <p className="text-sm text-neutral-500 leading-relaxed mb-6">
                                    {(profile?.completion_score || 0) >= 70
                                        ? "Il tuo profilo è attualmente visibile alle famiglie che cercano assistenza nella tua zona. Assicurati che le tue competenze siano aggiornate."
                                        : "Il tuo profilo non è ancora visibile. Completa i dati richiesti per iniziare a ricevere proposte di matching."}
                                </p>
                                <div className="flex gap-4">
                                    <Link href="/dashboard/profile/caregiver" className="bg-black text-white px-6 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-neutral-800 transition-colors text-center">
                                        Modifica Profilo
                                    </Link>
                                    <button className="px-6 py-2.5 text-[10px] font-bold text-neutral-400 border border-neutral-200 rounded-full hover:bg-neutral-50 transition-colors uppercase">
                                        Anteprima Pubblica
                                    </button>
                                </div>
                            </div>
                        </div>
                    </SpotlightCard>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <SpotlightCard className={`p-8 border-neutral-200 ${(profile?.completion_score || 0) < 70 ? "opacity-50 grayscale pointer-events-none" : ""}`}>
                            <h3 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-4">Match Suggeriti</h3>
                            <p className="text-sm font-bold text-black mb-1">3 Nuove Famiglie</p>
                            <p className="text-[10px] text-neutral-400 mb-6">In base alle tue preferenze relazionali e tecniche.</p>
                            <Link href="/dashboard/matches" className="text-[10px] font-bold text-black underline uppercase">Visualizza Match</Link>
                        </SpotlightCard>

                        <SpotlightCard className="p-8 border-neutral-200 bg-neutral-50/30">
                            <h3 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-4">Punteggio Qualità</h3>
                            <p className="text-sm font-bold text-black mb-1">
                                {(profile?.completion_score || 0) >= 90 ? "A+ Eccellente" : (profile?.completion_score || 0) >= 70 ? "B Buono" : "Incompleto"}
                            </p>
                            <p className="text-[10px] text-neutral-400 mb-6">Basato sul completamento del tuo profilo professionale.</p>
                        </SpotlightCard>
                    </div>
                </div>

                {/* Sidebar Checklist */}
                <div className="space-y-8">
                    {!loading && (
                        <CompletionStatusCard
                            score={profile?.completion_score || 0}
                            role="caregiver"
                            missingFields={getMissingFields()}
                        />
                    )}

                    <SpotlightCard className="p-8 bg-neutral-900 text-white border-none">
                        <h3 className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-4">Supporto Professional</h3>
                        <p className="text-[10px] text-neutral-400 leading-relaxed mb-6">Il nostro team è qui per aiutarti a trovare la famiglia più adatta al tuo stile di cura.</p>
                        <button className="w-full py-3 bg-white text-black text-[10px] font-bold rounded-lg uppercase tracking-widest hover:bg-neutral-100 transition-colors">
                            Supporto h24
                        </button>
                    </SpotlightCard>
                </div>
            </div>
        </div>
    );
}
