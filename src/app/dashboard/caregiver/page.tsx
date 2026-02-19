"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SpotlightCard } from "@/components/ui/SpotlightCard";
import { supabaseBrowserClient } from "@/lib/supabaseClient";

export default function CaregiverDashboard() {
    const [profileName, setProfileName] = useState("Caricamento...");
    const [certifications, setCertifications] = useState<any[]>([]);

    useEffect(() => {
        async function loadData() {
            const isDemo = document.cookie.includes("demo_mode=true");
            if (isDemo) {
                setProfileName("Marco Rossi");
                setCertifications([
                    { id: '1', level: 'Avanzata', organization: 'FISH Regionale Veneto', date: '12/02/2026' }
                ]);
                return;
            }
            const supabase = supabaseBrowserClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                // Fetch Profile Name
                const { data: pData } = await supabase.from("profiles").select("nome, cognome").eq("user_id", user.id).maybeSingle();
                if (pData) setProfileName(`${pData.nome} ${pData.cognome}`);

                // Fetch Certifications (Future proof)
                // const { data: cData } = await supabase.from("caregiver_certifications")...
            }
        }
        loadData();
    }, []);

    return (
        <div className="p-8 lg:p-12 space-y-12 max-w-6xl mx-auto">
            <header className="flex justify-between items-end mb-12">
                <div>
                    <span className="px-2 py-1 text-[9px] font-bold tracking-widest uppercase bg-black text-white rounded-full">Profilo Professionale</span>
                    <h1 className="text-4xl font-black text-black mt-6 tracking-tighter">Benvenuto, <span className="text-neutral-400 italic font-serif">{profileName}.</span></h1>
                    <p className="text-sm text-neutral-500 mt-2 max-w-md">La tua vetrina professionale. Gestisci qui le tue competenze e la tua disponibilità.</p>
                </div>
                <div className="hidden md:block">
                    <div className="flex items-center gap-2 px-4 py-2 bg-white border border-neutral-200 rounded-full shadow-sm">
                        <span className="w-2 h-2 rounded-full bg-black animate-pulse" />
                        <span className="text-[10px] font-bold text-black uppercase tracking-tight">Visibilità Attiva</span>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Profile Card */}
                <div className="lg:col-span-2 space-y-8">
                    <SpotlightCard className="p-10">
                        <div className="flex flex-col md:flex-row gap-10">
                            <div className="relative">
                                <div className="w-32 h-32 rounded-3xl bg-neutral-100 flex items-center justify-center text-4xl border border-neutral-200">
                                    👤
                                </div>
                                {certifications.length > 0 && (
                                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-[10px] text-white shadow-xl animate-bounce">
                                        ✨
                                    </div>
                                )}
                            </div>
                            <div className="flex-1">
                                <h2 className="text-2xl font-black tracking-tight mb-2">Il tuo Profilo Umano</h2>
                                <p className="text-sm text-neutral-500 leading-relaxed mb-6 italic">
                                    "Professionista della cura certificato dall'ecosistema territoriale CareMatch OS. La tua dedizione è il cuore della nostra rete."
                                </p>
                                <div className="flex gap-4">
                                    <Link href="/dashboard/profile/caregiver" className="bg-black text-white px-6 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-neutral-800 transition-colors">
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
                        <SpotlightCard className="p-8 border-neutral-200">
                            <h3 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-4">Match Suggeriti</h3>
                            <p className="text-sm font-bold text-black mb-1">3 Nuove Famiglie</p>
                            <p className="text-[10px] text-neutral-400 mb-6">In base alle tue preferenze relazionali e tecniche.</p>
                            <Link href="/dashboard/matches" className="text-[10px] font-bold text-black underline uppercase">Visualizza Match</Link>
                        </SpotlightCard>

                        <div className="space-y-4">
                            {certifications.length === 0 ? (
                                <SpotlightCard className="p-8 border-neutral-200 bg-neutral-50/50">
                                    <h3 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-4">Certificazione Qualità</h3>
                                    <p className="text-[10px] text-neutral-400 font-medium italic">In attesa di validazione da parte delle associazioni del territorio.</p>
                                </SpotlightCard>
                            ) : (
                                certifications.map((cert) => (
                                    <SpotlightCard key={cert.id} className="p-8 border-blue-100 bg-blue-50/10">
                                        <h3 className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                                            <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
                                            Certificazione Ecosistema
                                        </h3>
                                        <p className="text-xl font-black text-black mb-1 uppercase tracking-tighter hover:text-blue-600 transition-colors cursor-default">Livello {cert.level}</p>
                                        <p className="text-[10px] text-neutral-500 mb-6 italic font-medium leading-relaxed">Emesso da: <span className="text-black font-extrabold uppercase tracking-tight">{cert.organization}</span> il {cert.date}.</p>
                                        <button
                                            onClick={() => alert("Download attestato PDF in corso...")}
                                            className="flex items-center gap-2 text-[9px] font-black text-blue-600 uppercase tracking-widest hover:underline"
                                        >
                                            📥 Scarica Attestato Ufficiale
                                        </button>
                                    </SpotlightCard>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar Checklist */}
                <div className="space-y-8">
                    <SpotlightCard className="p-8 border-neutral-100">
                        <h3 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-6">Ottimizzazione</h3>
                        <ul className="space-y-6">
                            <li className="flex gap-3">
                                <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 text-[10px]">✓</div>
                                <div>
                                    <p className="text-[11px] font-bold text-black">Certificato OSS</p>
                                    <p className="text-[9px] text-neutral-400">Verificato</p>
                                </div>
                            </li>
                            <li className="flex gap-3">
                                <div className="w-5 h-5 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-300 text-[10px] scale-90 border border-neutral-200">!</div>
                                <div>
                                    <p className="text-[11px] font-bold text-neutral-400 italic">Video Intro</p>
                                    <p className="text-[9px] text-neutral-400">Migliora del 40% il match</p>
                                    <button className="text-[9px] font-bold text-black underline uppercase mt-1">Registra</button>
                                </div>
                            </li>
                            <li className="flex gap-3">
                                <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-white text-[10px] shadow-lg shadow-blue-200">✓</div>
                                <div>
                                    <p className="text-[11px] font-black text-blue-600 uppercase tracking-tight">Bollino Territoriale</p>
                                    <p className="text-[9px] text-neutral-400 font-bold uppercase italic">Validato da Consulte</p>
                                </div>
                            </li>
                            <li className="flex gap-3 pt-2">
                                <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 text-[10px]">✓</div>
                                <div>
                                    <p className="text-[11px] font-bold text-black">Profilo Psicologico</p>
                                    <p className="text-[9px] text-neutral-400 uppercase">Completato</p>
                                </div>
                            </li>
                        </ul>
                    </SpotlightCard>

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
