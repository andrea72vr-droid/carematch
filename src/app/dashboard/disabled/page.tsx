"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SpotlightCard } from "@/components/ui/SpotlightCard";
import { supabaseBrowserClient } from "@/lib/supabaseClient";

import { CompletionStatusCard } from "@/components/dashboard/CompletionStatusCard";

export default function DisabledDashboard() {
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadProfile() {
            const isDemo = document.cookie.includes("demo_mode=true");
            if (isDemo) {
                setProfile({
                    nome: "Utente",
                    cognome: "Demo",
                    completion_score: 75,
                    role: "disabled"
                });
                setLoading(false);
                return;
            }
            const supabase = supabaseBrowserClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: profileData } = await supabase
                    .from("profiles")
                    .select("*, disabili(*)")
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

        const disabile = profile.disabili?.[0];
        if (!disabile?.tipo_disabilita) missing.push("Tipo Disabilità");
        if (!disabile?.livello_autonomia) missing.push("Autonomia");
        if (!disabile?.necessita_assistenza) missing.push("Necessità Assistenza");

        return missing;
    };

    const profileName = profile ? `${profile.nome || ""} ${profile.cognome || ""}`.trim() : "Caricamento...";

    return (
        <div className="p-8 lg:p-12 space-y-12 max-w-6xl mx-auto">
            <header className="flex justify-between items-end mb-12">
                <div>
                    <span className="px-2 py-1 text-[9px] font-bold tracking-widest uppercase bg-black text-white rounded-full">Area Assistito</span>
                    <h1 className="text-4xl font-black text-black mt-6 tracking-tighter">Ciao, <span className="text-neutral-400 italic font-serif">{profileName || "Utente"}.</span></h1>
                    <p className="text-sm text-neutral-500 mt-2 max-w-md">Gestisci la tua ricerca e i tuoi bisogni assistenziali da qui.</p>
                </div>
                <div className="hidden md:block">
                    <div className="flex items-center gap-2 px-4 py-2 bg-white border border-neutral-200 rounded-full shadow-sm">
                        <span className={`w-2 h-2 rounded-full ${(profile?.completion_score || 0) >= 70 ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`} />
                        <span className="text-[10px] font-bold text-neutral-600 uppercase tracking-tight">
                            {(profile?.completion_score || 0) >= 70 ? "Sistema Online" : "Profilo Incompleto"}
                        </span>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Action */}
                <div className="lg:col-span-2">
                    <SpotlightCard className="p-10 h-full">
                        <div className="flex flex-col h-full justify-between">
                            <div>
                                <h2 className="text-2xl font-black tracking-tight mb-4">Trova il tuo assistente ideale</h2>
                                <p className="text-sm text-neutral-500 leading-relaxed max-w-lg mb-8">
                                    Il nostro algoritmo avanzato analizza non solo le competenze tecniche, ma anche la compatibilità caratteriale e relazionale.
                                </p>

                                <div className="space-y-4 mb-10 text-[11px] font-bold text-neutral-400 uppercase tracking-widest">
                                    <div className="flex items-center gap-3">
                                        <span className="w-5 h-5 rounded bg-neutral-100 flex items-center justify-center text-black">✓</span>
                                        Analisi Psicologica
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="w-5 h-5 rounded bg-neutral-100 flex items-center justify-center text-black">✓</span>
                                        Verifica Competenze
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="w-5 h-5 rounded bg-neutral-100 flex items-center justify-center text-black">✓</span>
                                        Matching Logistico
                                    </div>
                                </div>
                            </div>

                            <Link
                                href={(profile?.completion_score || 0) >= 70 ? "/dashboard/matches" : "/dashboard/profile/disabled"}
                                className={`bg-black text-white px-10 py-4 rounded-full text-xs font-bold uppercase tracking-widest text-center hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-black/10 ${(profile?.completion_score || 0) < 70 ? "opacity-50 grayscale" : ""}`}
                            >
                                {(profile?.completion_score || 0) >= 70 ? "Inizia Ricerca Intelligente" : "Completa Profilo per Cercare"}
                            </Link>
                        </div>
                    </SpotlightCard>
                </div>

                {/* Sidebar info */}
                <div className="space-y-8">
                    {!loading && (
                        <CompletionStatusCard
                            score={profile?.completion_score || 0}
                            role="disabled"
                            missingFields={getMissingFields()}
                        />
                    )}

                    <SpotlightCard className="p-8">
                        <h3 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-4">Assistenza</h3>
                        <p className="text-[10px] text-neutral-400 leading-relaxed mb-6">Hai bisogno di aiuto per configurare il tuo profilo o usare la piattaforma?</p>
                        <button className="w-full py-3 bg-neutral-100 text-black text-[10px] font-bold rounded-lg uppercase tracking-widest hover:bg-neutral-200 transition-colors">
                            Contatta Supporto
                        </button>
                    </SpotlightCard>
                </div>
            </div>
        </div>
    );
}
