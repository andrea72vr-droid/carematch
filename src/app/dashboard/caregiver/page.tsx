"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SpotlightCard } from "@/components/ui/SpotlightCard";
import { supabaseBrowserClient } from "@/lib/supabaseClient";
import { motion } from "framer-motion";

export default function CaregiverDashboard() {
    const [profileName, setProfileName] = useState("Caricamento...");
    const [certifications, setCertifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            setLoading(true);
            const isDemo = document.cookie.includes("demo_mode=true");
            if (isDemo) {
                setProfileName("Marco Rossi");
                setCertifications([
                    { id: '1', level: 'Avanzata', organization: 'FISH Regionale Veneto', date: '12/02/2026' }
                ]);
                setLoading(false);
                return;
            }
            const supabase = supabaseBrowserClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: pData } = await supabase.from("profiles").select("nome, cognome").eq("user_id", user.id).maybeSingle();
                if (pData) setProfileName(`${pData.nome} ${pData.cognome}`);

                // In futuro: fetch reale certificazioni
            }
            setLoading(false);
        }
        loadData();
    }, []);

    return (
        <div className="p-8 lg:p-12 space-y-12 max-w-7xl mx-auto min-h-screen">
            {/* Background Accent */}
            <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px] -z-10 pointer-events-none" />

            <motion.header 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10"
            >
                <div className="flex-1">
                    <span className="px-2 py-0.5 text-[10px] font-black tracking-widest uppercase bg-emerald-600 text-white rounded-full shadow-lg shadow-emerald-200">Vetrine Professionale</span>
                    <h1 className="text-5xl font-black text-black mt-4 tracking-tighter">Benvenuto, <span className="text-emerald-600 italic font-serif opacity-80">{profileName}.</span></h1>
                    <p className="text-sm text-neutral-500 mt-4 max-w-xl leading-relaxed">
                        Il tuo hub operativo per gestire la tua professionalità, le tue certificazioni e le opportunità di cura nel territorio.
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="hidden lg:flex flex-col items-right text-right">
                        <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Score Qualità</span>
                        <span className="text-2xl font-black text-emerald-600 mt-1">98/100</span>
                    </div>
                </div>
            </motion.header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-10">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        <SpotlightCard className="p-10 border-neutral-100 bg-white/50 backdrop-blur-sm">
                            <div className="flex flex-col md:flex-row gap-12">
                                <div className="relative group">
                                    <div className="w-40 h-40 rounded-[2.5rem] bg-neutral-900 flex items-center justify-center text-5xl text-white shadow-2xl group-hover:rotate-3 transition-transform duration-500 overflow-hidden relative">
                                        👤
                                        <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/20 to-transparent" />
                                    </div>
                                    <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-white rounded-2xl shadow-xl flex items-center justify-center border border-neutral-100 group-hover:-translate-y-1 transition-transform">
                                        ✨
                                    </div>
                                </div>
                                <div className="flex-1 space-y-6">
                                    <div>
                                        <h2 className="text-3xl font-black tracking-tight text-black flex items-center gap-4">
                                            Profilo Umano 
                                            <span className="text-[10px] bg-neutral-100 px-3 py-1 rounded-full uppercase tracking-widest text-neutral-500">Verified</span>
                                        </h2>
                                        <p className="text-sm text-neutral-500 leading-relaxed mt-4 font-medium italic">
                                            "Il tuo impegno nella cura domiciliare è fondamentale per il nostro ecosistema. La tua vetrina è ora visibile alle famiglie verificate."
                                        </p>
                                    </div>
                                    <div className="flex flex-wrap gap-4 pt-4">
                                        <Link href="/dashboard/profile/caregiver" className="bg-black text-white px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-emerald-600 hover:shadow-2xl hover:shadow-emerald-200 transition-all">
                                            Modifica Identità
                                        </Link>
                                        <button className="px-8 py-4 text-[10px] font-black text-black border-2 border-neutral-100 rounded-2xl hover:bg-neutral-50 transition-all uppercase tracking-widest">
                                            Anteprima Pubblica
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </SpotlightCard>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 }}
                        >
                            <SpotlightCard className="p-8 border-neutral-100 hover:border-emerald-200 transition-colors h-full">
                                <span className="text-[9px] font-black text-neutral-300 uppercase tracking-[0.2em] mb-6 block">Matching attivo</span>
                                <h3 className="text-xl font-black text-black mb-1 font-serif italic">Opportunità nel Radar.</h3>
                                <p className="text-[10px] text-neutral-500 mb-8 font-bold uppercase tracking-tight">3 Famiglie vicine compatibili con le tue skills.</p>
                                <Link 
                                    href="/dashboard/matches" 
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-emerald-600 transition-all"
                                >
                                    Scopri i Match 
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
                                </Link>
                            </SpotlightCard>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 }}
                            className="space-y-6"
                        >
                            {certifications.length === 0 ? (
                                <SpotlightCard className="p-8 border-dashed border-neutral-200 bg-neutral-50/30 flex flex-col items-center justify-center text-center">
                                    <h3 className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-4">Certificazioni</h3>
                                    <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-tight italic">Nessuna certificazione ecosistemica rilevata.</p>
                                    <button className="mt-6 text-[9px] font-black text-emerald-600 underline uppercase tracking-widest">Richiedi Audit</button>
                                </SpotlightCard>
                            ) : (
                                certifications.map((cert) => (
                                    <SpotlightCard key={cert.id} className="p-8 border-emerald-100 bg-emerald-50/30 relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                            <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                                <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" />
                                                <path d="M7 12L10 15L17 8" />
                                            </svg>
                                        </div>
                                        <span className="text-[8px] font-black text-emerald-600 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-pulse" />
                                            Certificato Validato
                                        </span>
                                        <p className="text-2xl font-black text-black mb-1 tracking-tighter uppercase">{cert.level}</p>
                                        <p className="text-[9px] text-neutral-500 mb-6 font-bold uppercase tracking-widest">Emesso da: <span className="text-black">{cert.organization}</span></p>
                                        <button className="text-[9px] font-black text-black hover:text-emerald-600 transition-colors uppercase tracking-widest flex items-center gap-2">
                                            📥 Download PDF
                                        </button>
                                    </SpotlightCard>
                                ))
                            )}
                        </motion.div>
                    </div>
                </div>

                {/* Sidebar Checklist */}
                <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 }}
                    className="space-y-10"
                >
                    <SpotlightCard className="p-8 border-neutral-100">
                        <h3 className="text-xs font-black uppercase tracking-widest text-black mb-8 border-b border-neutral-50 pb-4">Checklist Professionale</h3>
                        <ul className="space-y-8">
                            {[
                                { label: "Certificato OSS/OSA", sub: "Documento Verificato", done: true, points: 20 },
                                { label: "Video Presentazione", sub: "Manca (boost matching +40%)", done: false, points: 40, action: "Registra" },
                                { label: "Test Psicometrico", sub: "Profilo Relazionale OK", done: true, points: 15 },
                                { label: "IBAN & Fatturazione", sub: "Configurato", done: true, points: 5 },
                            ].map((item, idx) => (
                                <li key={idx} className="flex gap-4">
                                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] shrink-0 ${
                                        item.done ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-neutral-50 text-neutral-300 border border-neutral-100'
                                    }`}>
                                        {item.done ? '✓' : '!'}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <p className={`text-[11px] font-black uppercase tracking-tight ${item.done ? 'text-black' : 'text-neutral-400 italic'}`}>{item.label}</p>
                                            <span className="text-[9px] font-mono text-neutral-300">+{item.points}</span>
                                        </div>
                                        <p className="text-[9px] text-neutral-400 font-bold uppercase tracking-tight mt-1">{item.sub}</p>
                                        {item.action && (
                                            <button className="text-[9px] font-black text-emerald-600 underline uppercase mt-2 group flex items-center gap-2">
                                                {item.action} <span className="group-hover:translate-x-1 transition-transform">→</span>
                                            </button>
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </SpotlightCard>

                    <SpotlightCard className="p-8 bg-neutral-900 border-none relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                        <h3 className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] mb-4">Supporto Professional</h3>
                        <p className="text-sm text-neutral-400 leading-relaxed mb-8 font-serif italic">
                            "Hai bisogno di aiuto con la piattaforma o con i pagamenti? Il nostro team dedicato ai caregiver è sempre attivo."
                        </p>
                        <button className="w-full py-4 bg-white text-black text-[10px] font-black rounded-xl uppercase tracking-widest hover:bg-emerald-400 hover:scale-[1.02] transition-all shadow-xl shadow-black/20">
                            Chat Concierge h24
                        </button>
                    </SpotlightCard>
                </motion.div>
            </div>
        </div>
    );
}



