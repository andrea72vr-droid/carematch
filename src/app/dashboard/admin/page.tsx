"use client";

import { useEffect, useState } from "react";
import { SpotlightCard } from "@/components/ui/SpotlightCard";
import { supabaseBrowserClient } from "@/lib/supabaseClient";

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalCaregivers: 0,
        totalDisabled: 0,
        activeMatches: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadStats() {
            try {
                const isDemo = document.cookie.includes("demo_mode=true");
                if (isDemo) {
                    setStats({
                        totalUsers: 200,
                        totalCaregivers: 120,
                        totalDisabled: 80,
                        activeMatches: 45
                    });
                    setLoading(false);
                    return;
                }

                const supabase = supabaseBrowserClient();

                const { count: uCount } = await supabase.from("profiles").select("*", { count: 'exact', head: true });
                const { count: cCount } = await supabase.from("caregiver_profiles").select("*", { count: 'exact', head: true });
                const { count: dCount } = await supabase.from("disabled_profiles").select("*", { count: 'exact', head: true });

                setStats({
                    totalUsers: uCount || 0,
                    totalCaregivers: cCount || 0,
                    totalDisabled: dCount || 0,
                    activeMatches: Math.floor((cCount || 0) * 0.4) // Mocked calculation for active matches
                });
            } catch (e) {
                console.error("Admin stats failed", e);
            } finally {
                setLoading(false);
            }
        }
        loadStats();
    }, []);

    return (
        <div className="p-8 lg:p-12 space-y-12 max-w-6xl mx-auto">
            <header className="flex justify-between items-end mb-12">
                <div>
                    <span className="px-2 py-1 text-[9px] font-bold tracking-widest uppercase bg-amber-500 text-white rounded-full">Administrator OS</span>
                    <h1 className="text-4xl font-black text-black mt-6 tracking-tighter">Control <span className="text-neutral-400 italic font-serif">Tower.</span></h1>
                    <p className="text-sm text-neutral-500 mt-2 max-w-md">Visione globale del sistema CareMatch. Monitoraggio in tempo reale.</p>
                </div>
                <div className="hidden md:block">
                    <div className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-full shadow-lg">
                        <span className="w-2 h-2 rounded-full bg-amber-500" />
                        <span className="text-[10px] font-bold uppercase tracking-tight">Accesso Root Attivo</span>
                    </div>
                </div>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: "Utenti Totali", value: stats.totalUsers, color: "bg-blue-500" },
                    { label: "Badanti (Caregiver)", value: stats.totalCaregivers, color: "bg-emerald-500" },
                    { label: "Assistiti", value: stats.totalDisabled, color: "bg-purple-500" },
                    { label: "Match Suggeriti", value: stats.activeMatches, color: "bg-amber-500" },
                ].map((s, i) => (
                    <SpotlightCard key={i} className="p-8 border-neutral-100">
                        <div className={`w-8 h-1 mb-4 ${s.color} rounded-full`} />
                        <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1">{s.label}</p>
                        <p className="text-3xl font-black text-black">{loading ? "..." : s.value}</p>
                    </SpotlightCard>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* User Activity Mockup */}
                <div className="lg:col-span-2">
                    <SpotlightCard className="p-8">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-xs font-black uppercase tracking-widest">Attività Recente</h3>
                            <button className="text-[9px] font-bold text-neutral-400 hover:text-black uppercase">Vedi tutti i log</button>
                        </div>

                        <div className="space-y-6">
                            {[1, 2, 3, 4, 5].map((_, i) => (
                                <div key={i} className="flex items-center justify-between py-3 border-b border-neutral-100 last:border-0">
                                    <div className="flex items-center gap-4">
                                        <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-xs">👤</div>
                                        <div>
                                            <p className="text-[11px] font-bold text-black uppercase">Nuovo Profilo Creato</p>
                                            <p className="text-[9px] text-neutral-400 font-mono">UTENTE_ID_{100 + i}</p>
                                        </div>
                                    </div>
                                    <span className="text-[9px] font-bold text-neutral-300 uppercase">{2 * i + 1} min fa</span>
                                </div>
                            ))}
                        </div>
                    </SpotlightCard>
                </div>

                {/* System Health */}
                <div className="space-y-8">
                    <SpotlightCard className="p-8 border-neutral-900 bg-neutral-950 text-white">
                        <h3 className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-6">Status Database</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-[10px] font-mono">
                                <span className="text-neutral-500">CONNESSIONE</span>
                                <span className="text-emerald-500 font-bold">STABILE</span>
                            </div>
                            <div className="flex justify-between items-center text-[10px] font-mono">
                                <span className="text-neutral-500">LATENZA</span>
                                <span className="text-amber-500 font-bold">42ms</span>
                            </div>
                            <div className="flex justify-between items-center text-[10px] font-mono">
                                <span className="text-neutral-500">API MATCHING</span>
                                <span className="text-emerald-500 font-bold">ONLINE</span>
                            </div>
                        </div>
                        <div className="mt-8 pt-6 border-t border-neutral-800">
                            <button className="w-full py-3 bg-white text-black text-[10px] font-bold rounded-lg uppercase tracking-widest hover:bg-neutral-100 transition-colors">
                                Manutenzione Database
                            </button>
                        </div>
                    </SpotlightCard>

                    <SpotlightCard className="p-8 border-neutral-100">
                        <h3 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-4">Export Dati</h3>
                        <p className="text-[10px] text-neutral-400 leading-relaxed mb-6">Scarica i report CSV completi per l'analisi offline.</p>
                        <div className="grid grid-cols-2 gap-3">
                            <button className="py-2.5 bg-neutral-100 text-[9px] font-black rounded-lg uppercase tracking-widest">CSV Utenti</button>
                            <button className="py-2.5 bg-neutral-100 text-[9px] font-black rounded-lg uppercase tracking-widest">CSV Match</button>
                        </div>
                    </SpotlightCard>
                </div>
            </div>
        </div>
    );
}
