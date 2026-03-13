"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SpotlightCard } from "@/components/ui/SpotlightCard";
import { supabaseBrowserClient } from "@/lib/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";

export default function DisabledDashboard() {
    const router = useRouter();
    const [profileName, setProfileName] = useState("Caricamento...");
    const [myNeeds, setMyNeeds] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            setLoading(true);
            const isDemo = document.cookie.includes("demo_mode=true");
            if (isDemo) {
                setProfileName("Utente Demo");
                setMyNeeds([
                    { id: '1', titolo: 'Trasporto Disabili Verona Sud', stato: 'validato', associazione: 'FISH Veneto' },
                    { id: '2', titolo: 'Assistenza Domiciliare Notturna', stato: 'in_attesa' }
                ]);
                setLoading(false);
                return;
            }
            const supabase = supabaseBrowserClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: pData } = await supabase.from("profiles").select("nome, cognome").eq("user_id", user.id).maybeSingle();
                if (pData) setProfileName(`${pData.nome} ${pData.cognome}`);

                const { data: nData } = await supabase.from("bisogni_espressi").select("*").eq("utente_id", user.id).order("created_at", { ascending: false });
                if (nData) setMyNeeds(nData || []);
            }
            setLoading(false);
        }
        loadData();
    }, []);

    return (
        <div className="p-8 lg:p-12 space-y-12 max-w-7xl mx-auto min-h-screen relative">
            {/* Background Aesthetic */}
            <div className="fixed top-0 left-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px] -z-10 pointer-events-none" />
            
            <motion.header 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10"
            >
                <div>
                    <span className="px-3 py-1 text-[10px] font-black tracking-widest uppercase bg-neutral-900 text-white rounded-full shadow-2xl">Area Assistito</span>
                    <h1 className="text-5xl font-black text-black mt-6 tracking-tighter">Ciao, <span className="text-blue-600 italic font-serif opacity-80">{profileName}.</span></h1>
                    <p className="text-sm text-neutral-500 mt-4 max-w-lg leading-relaxed">
                        Il tuo ecosistema di cura personalizzato. Monitora i tuoi match e le tue istanze istituzionali.
                    </p>
                </div>
                <div className="hidden lg:flex items-center gap-2 px-6 py-3 bg-white border border-neutral-100 rounded-2xl shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Connesso al Nodo Territoriale</span>
                </div>
            </motion.header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Main Action - Ricerca Caregiver */}
                <motion.div 
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className="lg:col-span-2"
                >
                    <SpotlightCard className="p-12 h-full border-neutral-100 bg-white/50 backdrop-blur-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                            <svg width="200" height="200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                                <circle cx="12" cy="12" r="10" />
                                <path d="M12 2v20M2 12h20" />
                            </svg>
                        </div>
                        <div className="flex flex-col h-full justify-between relative z-10">
                            <div>
                                <h2 className="text-4xl font-black tracking-tighter mb-6 text-black">Cerca il tuo <br/><span className="text-blue-600 italic font-serif">Assistente Ideale.</span></h2>
                                <p className="text-sm text-neutral-500 leading-relaxed max-w-md mb-10 font-medium">
                                    Andiamo oltre il curriculum. Analizziamo compatibilità caratteriale, valori condivisi e specificità tecniche per un match autentico.
                                </p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                                    {[
                                        { label: "Validazione Ecosistematica", sub: "Collaborazione con Associazioni", icon: "🤝" },
                                        { label: "Algoritmo Relazionale", sub: "Oltre la prestazione tecnica", icon: "🧠" },
                                    ].map((feat, i) => (
                                        <div key={i} className="flex gap-4 items-start">
                                            <span className="text-2xl grayscale group-hover:grayscale-0 transition-all">{feat.icon}</span>
                                            <div>
                                                <p className="text-[11px] font-black uppercase text-black">{feat.label}</p>
                                                <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-tight mt-1">{feat.sub}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <Link
                                href="/dashboard/matches"
                                className="inline-block bg-black text-white px-12 py-5 rounded-[2rem] text-[11px] font-black uppercase tracking-[0.2em] text-center hover:bg-blue-600 hover:shadow-2xl hover:shadow-blue-200 transition-all group"
                            >
                                Inizia Ricerca Intelligente <span className="inline-block group-hover:translate-x-2 transition-transform ml-2">→</span>
                            </Link>
                        </div>
                    </SpotlightCard>
                </motion.div>

                {/* Status Profilo */}
                <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-8"
                >
                    <SpotlightCard className="p-8 border-neutral-100 flex flex-col h-full">
                        <h3 className="text-xs font-black uppercase tracking-widest text-neutral-400 mb-8">Salute del Profilo</h3>
                        <div className="flex-1 space-y-10">
                            <div className="relative pt-1">
                                <div className="flex mb-4 items-center justify-between">
                                    <div>
                                        <span className="text-[10px] font-black inline-block py-1 px-3 uppercase rounded-full text-blue-600 bg-blue-50">
                                            Completamento
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-sm font-black inline-block text-black">
                                            85%
                                        </span>
                                    </div>
                                </div>
                                <div className="overflow-hidden h-2 mb-4 text-xs flex rounded-full bg-neutral-100">
                                    <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: "85%" }}
                                        transition={{ duration: 1, delay: 0.5 }}
                                        className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-600"
                                    />
                                </div>
                                <p className="text-[10px] text-neutral-500 font-medium italic leading-relaxed">
                                    "Hai quasi terminato. Un profilo completo aumenta la precisione del match del 35%."
                                </p>
                            </div>
                            
                            <Link href="/dashboard/profile/disabled" className="block w-full py-4 text-[10px] font-black text-black border-2 border-neutral-50 rounded-2xl hover:bg-neutral-50 transition-all text-center uppercase tracking-widest">
                                Perfeziona Dati
                            </Link>
                        </div>
                    </SpotlightCard>
                </motion.div>

                {/* Trasparenza Rappresentanza */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="lg:col-span-3"
                >
                    <SpotlightCard className="p-10 border-neutral-100 relative overflow-hidden">
                        <div className="flex flex-col lg:flex-row justify-between items-stretch gap-12">
                            <div className="flex-1">
                                <div className="flex items-center gap-4 mb-8">
                                    <h3 className="text-xs font-black uppercase tracking-widest text-neutral-400">Monitor Audit & Rappresentanza</h3>
                                    <div className="h-[1px] flex-1 bg-neutral-50" />
                                </div>
                                <div className="space-y-4">
                                    <AnimatePresence>
                                        {myNeeds.length === 0 ? (
                                            <motion.p 
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className="text-xs text-neutral-400 italic py-6"
                                            >
                                                Nessuna istanza attiva rilevata nel nodo territoriale attuale.
                                            </motion.p>
                                        ) : (
                                            myNeeds.map((need, idx) => (
                                                <motion.div 
                                                    key={need.id}
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: 0.4 + idx * 0.1 }}
                                                    className="flex items-center justify-between p-6 bg-white hover:bg-neutral-50 rounded-2xl border border-neutral-50 group transition-all"
                                                >
                                                    <div className="flex items-center gap-6">
                                                        <div className={`w-2.5 h-2.5 rounded-full ${need.stato === 'validato' ? 'bg-emerald-500' :
                                                            need.stato === 'preso_in_carico' ? 'bg-blue-600' : 'bg-neutral-200'
                                                            } ring-4 ring-neutral-50`} />
                                                        <span className="text-[11px] font-black text-black uppercase tracking-tight group-hover:text-blue-600 transition-colors uppercase">{need.titolo}</span>
                                                    </div>
                                                    <div className="flex items-center gap-8">
                                                        {need.associazione && (
                                                            <span className="hidden md:block text-[9px] font-black text-blue-600 uppercase tracking-[0.2em] bg-blue-50/50 px-3 py-1 rounded-md">Validato: {need.associazione}</span>
                                                        )}
                                                        <span className="text-[9px] font-mono text-neutral-400 font-bold uppercase">{need.stato || 'Protocollo'}</span>
                                                    </div>
                                                </motion.div>
                                            ))
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                            
                            <div className="w-full lg:w-80 p-10 bg-neutral-950 rounded-[2.5rem] text-white flex flex-col justify-between relative overflow-hidden group">
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700" />
                                <div className="relative z-10">
                                    <span className="text-[9px] font-black text-neutral-500 uppercase tracking-widest">Ecosistema Attivo</span>
                                    <h4 className="text-3xl font-black mt-4 tracking-tighter">1.240 <br/><span className="text-blue-500 font-serif italic text-xl opacity-80">Segnalazioni.</span></h4>
                                    <p className="text-[11px] text-neutral-400 mt-6 leading-relaxed font-medium">
                                        Singole voci che aggregate generano pressione sulle istituzioni per nuovi servizi.
                                    </p>
                                </div>
                                <button
                                    onClick={() => router.push("/dashboard/rappresentanza")}
                                    className="relative z-10 w-full py-5 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-2xl mt-10 hover:bg-blue-500 hover:text-white transition-all shadow-2xl"
                                >
                                    Nuova Istanza
                                </button>
                            </div>
                        </div>
                    </SpotlightCard>
                </motion.div>

                {/* Ecosystem CTA */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="lg:col-span-3"
                >
                    <SpotlightCard className="p-12 bg-blue-900 border-none relative overflow-hidden group">
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
                        <div className="flex flex-col md:flex-row justify-between items-center gap-10 relative z-10">
                            <div className="flex-1">
                                <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] mb-4 block">Manifesto di Rappresentanza</span>
                                <h2 className="text-4xl font-black tracking-tighter mb-6 text-white leading-none">Il tuo bisogno è <br/><span className="text-blue-400 italic font-serif">Politica Sociale.</span></h2>
                                <p className="text-sm text-neutral-300 leading-relaxed max-w-2xl font-medium">
                                    CareMatch trasforma le carenze individuali in dati strutturati per le Associazioni di Categoria. 
                                    Ogni tua segnalazione è un tassello fondamentale per la governance del territorio.
                                </p>
                            </div>
                            <button
                                onClick={() => router.push("/dashboard/rappresentanza")}
                                className="whitespace-nowrap bg-blue-500 text-white px-10 py-5 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-white hover:text-blue-900 transition-all shadow-2xl shadow-blue-500/20"
                            >
                                Agisci Ora
                            </button>
                        </div>
                    </SpotlightCard>
                </motion.div>
            </div>
        </div>
    );
}

