"use client";

import { SpotlightCard } from "@/components/ui/SpotlightCard";

export default function AdminLogsPage() {
    const logs = [
        { type: "AUTH", message: "User Login Success: albino@example.com", time: "2m fa", status: "success" },
        { type: "MATCH", message: "Algoritmo eseguito per ID_294", time: "15m fa", status: "info" },
        { type: "DB", message: "Backup automatico completato", time: "4h fa", status: "success" },
        { type: "ERROR", message: "Timeout in API route mismatch-fix", time: "6h fa", status: "error" },
        { type: "AUTH", message: "Nuova registrazione: Maria Rossi", time: "12h fa", status: "success" },
    ];

    return (
        <div className="p-8 lg:p-12 space-y-12 max-w-6xl mx-auto">
            <header>
                <span className="px-2 py-1 text-[9px] font-black tracking-widest uppercase bg-blue-600 text-white rounded-full">System Audit</span>
                <h1 className="text-4xl font-black text-black mt-6 tracking-tighter">Log di <span className="text-neutral-400 italic font-serif">Sistema.</span></h1>
                <p className="text-sm text-neutral-500 mt-2 max-w-md">Tracciamento granulare di ogni evento critico sulla piattaforma.</p>
            </header>

            <SpotlightCard className="p-0">
                <div className="flex flex-col">
                    {logs.map((log, i) => (
                        <div key={i} className="flex flex-col md:flex-row md:items-center justify-between p-6 border-b border-neutral-50 last:border-0 hover:bg-neutral-50/80 transition-all group">
                            <div className="flex items-center gap-6">
                                <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-md min-w-[70px] text-center ${
                                    log.status === 'success' ? 'bg-emerald-50 text-emerald-600' :
                                    log.status === 'error' ? 'bg-red-50 text-red-600' :
                                    'bg-blue-50 text-blue-600'
                                }`}>
                                    {log.type}
                                </span>
                                <p className="text-xs font-bold text-black uppercase tracking-tight group-hover:text-blue-600 transition-colors uppercase">{log.message}</p>
                            </div>
                            <span className="text-[10px] font-mono text-neutral-400 mt-2 md:mt-0 uppercase">{log.time}</span>
                        </div>
                    ))}
                </div>
            </SpotlightCard>

            <div className="flex justify-center">
                <button className="px-10 py-4 bg-black text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-blue-600 transition-all shadow-xl shadow-blue-200/20">
                    Carica Log Storici
                </button>
            </div>
        </div>
    );
}
