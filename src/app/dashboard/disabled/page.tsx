"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SpotlightCard } from "@/components/ui/SpotlightCard";
import { supabaseBrowserClient } from "@/lib/supabaseClient";

export default function DisabledDashboard() {
    const [profileName, setProfileName] = useState("Caricamento...");

    useEffect(() => {
        async function loadName() {
            const isDemo = document.cookie.includes("demo_mode=true");
            if (isDemo) {
                setProfileName("Utente Demo");
                return;
            }
            const supabase = supabaseBrowserClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data } = await supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle();
                if (data?.full_name) setProfileName(data.full_name);
            }
        }
        loadName();
    }, []);

    return (
        <div className="p-8 lg:p-12 space-y-12 max-w-6xl mx-auto">
            <header className="flex justify-between items-end mb-12">
                <div>
                    <span className="px-2 py-1 text-[9px] font-bold tracking-widest uppercase bg-black text-white rounded-full">Area Assistito</span>
                    <h1 className="text-4xl font-black text-black mt-6 tracking-tighter">Ciao, <span className="text-neutral-400 italic font-serif">{profileName}.</span></h1>
                    <p className="text-sm text-neutral-500 mt-2 max-w-md">Gestisci la tua ricerca e i tuoi bisogni assistenziali da qui.</p>
                </div>
                <div className="hidden md:block">
                    <div className="flex items-center gap-2 px-4 py-2 bg-white border border-neutral-200 rounded-full shadow-sm">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-bold text-neutral-600 uppercase tracking-tight">Sistema Online</span>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Action - Ricerca Caregiver */}
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
                                href="/dashboard/matches"
                                className="bg-black text-white px-10 py-4 rounded-full text-xs font-bold uppercase tracking-widest text-center hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-black/10"
                            >
                                Inizia Ricerca Intelligente
                            </Link>
                        </div>
                    </SpotlightCard>
                </div>

                {/* Rappresentanza Bisogni (Nuovo Elemento Ecosistema) */}
                <div className="lg:col-span-3">
                    <SpotlightCard className="p-10 bg-blue-50/30 border-blue-100">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                            <div className="flex-1">
                                <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2 block">Novità: Ecosistema Territoriale</span>
                                <h2 className="text-3xl font-black tracking-tighter mb-4 text-black">Esprimi un <span className="text-blue-600 italic font-serif">Bisogno di Comunità.</span></h2>
                                <p className="text-sm text-neutral-600 leading-relaxed max-w-2xl">
                                    CareMatch non è solo per trovare una badante. Qui puoi segnalare carenze di servizi, necessità di trasporto o bisogni burocratici che verranno aggregati e inviati alle <strong>Associazioni e Consulte territoriali</strong> per generare cambiamenti reali.
                                </p>
                            </div>
                            <Link
                                href="/dashboard/rappresentanza"
                                className="whitespace-nowrap bg-blue-600 text-white px-8 py-4 rounded-xl text-[11px] font-bold uppercase tracking-widest hover:bg-black transition-all shadow-lg shadow-blue-200"
                            >
                                Invia Segnalazione
                            </Link>
                        </div>
                    </SpotlightCard>
                </div>

                {/* Sidebar info */}
                <div className="lg:col-span-1 space-y-8">
                    <SpotlightCard className="p-8 border-neutral-100">
                        <h3 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-6">Stato Profilo</h3>
                        <div className="space-y-6">
                            <div>
                                <div className="flex justify-between text-[10px] font-bold mb-2">
                                    <span>COMPLETAMENTO</span>
                                    <span>75%</span>
                                </div>
                                <div className="h-1 bg-neutral-200 rounded-full overflow-hidden">
                                    <div className="w-3/4 h-full bg-black" />
                                </div>
                            </div>
                            <p className="text-[10px] text-neutral-400 leading-relaxed italic">
                                "Aggiungi i tuoi valori di convivenza per migliorare la qualità del matching relazionale."
                            </p>
                            <Link href="/dashboard/profile/disabled" className="block text-[10px] font-bold text-black border-b border-black w-fit pb-0.5 hover:opacity-60 transition-opacity uppercase">
                                Aggiorna Profilo
                            </Link>
                        </div>
                    </SpotlightCard>
                </div>

                <div className="lg:col-span-2">
                    <SpotlightCard className="p-8 h-full bg-neutral-50/40 border-dashed">
                        <h3 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-4">I Tuoi Thread Attivi</h3>
                        <div className="flex flex-col items-center justify-center p-12 text-center text-neutral-300">
                            <div className="text-3xl mb-4 opacity-30">💬</div>
                            <p className="text-[10px] font-bold uppercase tracking-widest">Nessuna conversazione attiva</p>
                        </div>
                    </SpotlightCard>
                </div>
            </div>
        </div>
    );
}
