"use client";

import { SpotlightCard } from "@/components/ui/SpotlightCard";

export default function AssociazioneDashboard() {
    return (
        <div className="p-8 lg:p-12 space-y-12 max-w-7xl mx-auto">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <span className="px-2 py-0.5 text-[10px] font-bold tracking-widest uppercase bg-blue-600 text-white rounded-full">Ecosistema Territoriale</span>
                    <h1 className="text-5xl font-black text-black mt-4 tracking-tighter">Nodo di <span className="text-blue-600 italic font-serif">Rappresentanza.</span></h1>
                    <p className="text-sm text-neutral-500 mt-4 max-w-xl">
                        Benvenuto nel pannello dedicato alle associazioni. Qui puoi monitorare i bisogni espressi dalla comunità e validare le richieste per una risposta coordinata.
                    </p>
                </div>
                <div className="flex gap-4">
                    <button className="px-6 py-3 bg-black text-white text-[10px] font-bold uppercase tracking-widest rounded-lg hover:bg-neutral-800 transition-all">
                        Nuova Iniziativa
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Statistiche Quick View */}
                <SpotlightCard className="p-8 border-neutral-100">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-6">Bisogni in attesa</h3>
                    <div className="text-4xl font-black">12</div>
                    <p className="text-[10px] text-neutral-400 mt-2 uppercase font-mono">+3 nelle ultime 24 ore</p>
                </SpotlightCard>

                <SpotlightCard className="p-8 border-neutral-100">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-6">Membri Validati</h3>
                    <div className="text-4xl font-black">45</div>
                    <p className="text-[10px] text-neutral-400 mt-2 uppercase font-mono">Caregiver certificati nel territorio</p>
                </SpotlightCard>

                <SpotlightCard className="p-8 border-neutral-100">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-6">Impatto Sociale</h3>
                    <div className="text-4xl font-black">92%</div>
                    <p className="text-[10px] text-neutral-400 mt-2 uppercase font-mono">Indice di risposta territoriale</p>
                </SpotlightCard>
            </div>

            <section className="space-y-6">
                <div className="flex justify-between items-center px-2">
                    <h2 className="text-xs font-black uppercase tracking-[0.2em] text-black">Bisogni Espressi Recenti</h2>
                    <button className="text-[9px] font-bold uppercase text-neutral-400 hover:text-black transition-colors">Vedi tutti</button>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {[
                        { titolo: "Mancanza continuità assistenziale notturna", categoria: "Assistenza", territorio: "Verona", status: "In Attesa" },
                        { titolo: "Barriere architettoniche trasporto pubblico", categoria: "Mobilità", territorio: "Legnago", status: "Validato" },
                        { titolo: "Supporto burocratico per rinnovo indennità", categoria: "Burocrazia", territorio: "Verona", status: "Preso in carico" },
                    ].map((item, i) => (
                        <div key={i} className="group bg-white border border-neutral-100 p-6 flex flex-col md:flex-row justify-between items-center hover:border-black transition-all duration-300">
                            <div className="flex items-center gap-6">
                                <div className="w-12 h-12 bg-neutral-50 rounded-full flex items-center justify-center text-xl grayscale group-hover:grayscale-0 transition-all">
                                    {item.categoria === "Assistenza" ? "🩺" : item.categoria === "Mobilità" ? "♿" : "📄"}
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-black group-hover:text-blue-600 transition-colors uppercase tracking-tight">{item.titolo}</h4>
                                    <div className="flex gap-4 mt-1">
                                        <span className="text-[9px] font-mono text-neutral-400 uppercase">{item.territorio}</span>
                                        <span className="text-[9px] font-mono text-neutral-400 uppercase">•</span>
                                        <span className="text-[9px] font-mono text-neutral-400 uppercase">{item.categoria}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-6 mt-4 md:mt-0">
                                <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded ${item.status === 'Validato' ? 'bg-green-50 text-green-600' :
                                        item.status === 'Preso in carico' ? 'bg-blue-50 text-blue-600' : 'bg-neutral-50 text-neutral-400'
                                    }`}>
                                    {item.status}
                                </span>
                                <button className="px-4 py-2 border border-neutral-200 text-[9px] font-bold uppercase tracking-widest hover:border-black transition-all">
                                    Dettagli
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
