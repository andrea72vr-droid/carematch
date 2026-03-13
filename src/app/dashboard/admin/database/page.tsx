"use client";

import { SpotlightCard } from "@/components/ui/SpotlightCard";

export default function AdminDatabasePage() {
    return (
        <div className="p-8 lg:p-12 space-y-12 max-w-6xl mx-auto">
            <header>
                <span className="px-2 py-1 text-[9px] font-black tracking-widest uppercase bg-neutral-900 text-white rounded-full">Infrastruttura Dati</span>
                <h1 className="text-4xl font-black text-black mt-6 tracking-tighter">Database <span className="text-neutral-400 italic font-serif">& Core.</span></h1>
                <p className="text-sm text-neutral-500 mt-2 max-w-md">Monitoraggio delle tabelle e integrità del sistema relazionale.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                    { title: "Tabelle Attive", value: "14", status: "OK", icon: "📊" },
                    { title: "Backup Recenti", value: "Oggi 04:00", status: "SICURO", icon: "🛡️" },
                    { title: "Storage Media", value: "2.4 GB", status: "8% UTILIZZO", icon: "☁️" },
                ].map((s, i) => (
                    <SpotlightCard key={i} className="p-8">
                        <div className="text-2xl mb-4 grayscale">{s.icon}</div>
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 mb-2">{s.title}</h3>
                        <p className="text-2xl font-black text-black mb-4">{s.value}</p>
                        <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-tighter">{s.status}</span>
                        </div>
                    </SpotlightCard>
                ))}
            </div>

            <SpotlightCard className="p-10 border-neutral-100">
                <h2 className="text-xl font-black uppercase tracking-tighter mb-8">Schemi Principali</h2>
                <div className="space-y-6">
                    {['profiles', 'badanti', 'bisogni_espressi', 'matches', 'institutional_dialogues'].map((table) => (
                        <div key={table} className="flex items-center justify-between py-4 border-b border-neutral-50 last:border-0 hover:px-4 transition-all hover:bg-neutral-50/50 rounded-xl group">
                            <div className="flex items-center gap-4">
                                <span className="text-lg grayscale group-hover:grayscale-0 transition-all">🗄️</span>
                                <span className="font-mono text-sm font-bold text-black uppercase tracking-tight">{table}</span>
                            </div>
                            <div className="flex items-center gap-6">
                                <span className="text-[10px] text-neutral-400 font-bold uppercase">Ready</span>
                                <button className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline">Ispeziona</button>
                            </div>
                        </div>
                    ))}
                </div>
            </SpotlightCard>
        </div>
    );
}
