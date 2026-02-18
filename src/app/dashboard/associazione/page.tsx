"use client";

import { useEffect, useState } from "react";
import { SpotlightCard } from "@/components/ui/SpotlightCard";
import { supabaseBrowserClient } from "@/lib/supabaseClient";

interface Bisogno {
    id: string;
    titolo: string;
    categoria: string;
    stato_validazione: string;
    descrizione_semantica: string;
    created_at: string;
    is_pubblico: boolean;
    metadata: any;
}

export default function AssociazioneDashboard() {
    const [bisogni, setBisogni] = useState<Bisogno[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedBisogno, setSelectedBisogno] = useState<Bisogno | null>(null);
    const [counts, setCounts] = useState({ in_attesa: 0, validati: 0, totale: 0 });
    const [analyzing, setAnalyzing] = useState(false);
    const [aiAnalysis, setAiAnalysis] = useState<any>(null);

    useEffect(() => {
        fetchBisogni();
    }, []);

    async function fetchBisogni() {
        setLoading(true);
        const supabase = supabaseBrowserClient();
        const { data, error } = await supabase
            .from("bisogni_espressi")
            .select("*")
            .order("created_at", { ascending: false });

        if (!error && data) {
            setBisogni(data);
            const inAttesa = data.filter(b => b.stato_validazione === 'in_attesa').length;
            const validati = data.filter(b => b.stato_validazione === 'validato').length;
            setCounts({ in_attesa: inAttesa, validati: validati, totale: data.length });
        }
        setLoading(false);
    }

    async function handleUpdateStatus(id: string, newStatus: string) {
        const supabase = supabaseBrowserClient();
        const { error } = await supabase
            .from("bisogni_espressi")
            .update({ stato_validazione: newStatus })
            .eq("id", id);

        if (!error) {
            setSelectedBisogno(null);
            fetchBisogni();
        }
    }

    return (
        <div className="p-8 lg:p-12 space-y-12 max-w-7xl mx-auto min-h-screen">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <span className="px-2 py-0.5 text-[10px] font-bold tracking-widest uppercase bg-blue-600 text-white rounded-full">Ecosistema Territoriale</span>
                    <h1 className="text-5xl font-black text-black mt-4 tracking-tighter">Nodo di <span className="text-blue-600 italic font-serif">Rappresentanza.</span></h1>
                    <p className="text-sm text-neutral-500 mt-4 max-w-xl">
                        Monitoraggio dei bisogni di cura espressi dalla comunità e coordinamento delle risposte territoriali.
                    </p>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <SpotlightCard className="p-8 border-neutral-100">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-6">Bisogni in attesa</h3>
                    <div className="text-4xl font-black">{counts.in_attesa}</div>
                    <p className="text-[10px] text-blue-600 mt-2 uppercase font-mono tracking-tighter font-bold">Richiedono validazione</p>
                </SpotlightCard>

                <SpotlightCard className="p-8 border-neutral-100">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-6">Validati / In Carico</h3>
                    <div className="text-4xl font-black">{counts.validati}</div>
                    <p className="text-[10px] text-green-600 mt-2 uppercase font-mono tracking-tighter font-bold">In fase di risoluzione</p>
                </SpotlightCard>

                <SpotlightCard className="p-8 border-neutral-100">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-6">Totale Segnalazioni</h3>
                    <div className="text-4xl font-black">{counts.totale}</div>
                    <p className="text-[10px] text-neutral-400 mt-2 uppercase font-mono tracking-tighter font-bold">Mappatura storica</p>
                </SpotlightCard>
            </div>

            <section className="space-y-6">
                <div className="flex justify-between items-center px-2">
                    <h2 className="text-xs font-black uppercase tracking-[0.2em] text-black">Flusso Bisogni Territoriali</h2>
                    <button onClick={fetchBisogni} className="text-[10px] font-bold uppercase text-blue-600 hover:text-black transition-colors">Aggiorna Dati</button>
                </div>

                {loading ? (
                    <div className="h-64 flex items-center justify-center border border-dashed border-neutral-200 rounded-2xl">
                        <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : bisogni.length === 0 ? (
                    <div className="h-64 flex flex-col items-center justify-center border border-dashed border-neutral-200 rounded-2xl p-8 text-center">
                        <p className="text-sm text-neutral-400 uppercase font-bold tracking-tight">Nessuna segnalazione trovata nel tuo territorio.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {bisogni.map((item) => (
                            <div key={item.id} className="group bg-white border border-neutral-100 p-6 flex flex-col md:flex-row justify-between items-center hover:shadow-xl hover:shadow-blue-900/5 hover:border-blue-200 transition-all duration-300 rounded-xl">
                                <div className="flex items-center gap-6">
                                    <div className="w-12 h-12 bg-neutral-50 rounded-full flex items-center justify-center text-xl grayscale group-hover:grayscale-0 transition-all">
                                        {item.categoria === "assistenza" ? "🩺" : item.categoria === "trasporto" ? "♿" : "📄"}
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-black group-hover:text-blue-600 transition-colors uppercase tracking-tight">{item.titolo}</h4>
                                        <div className="flex gap-4 mt-1">
                                            <span className="text-[9px] font-mono text-neutral-400 uppercase">{item.categoria}</span>
                                            <span className="text-[9px] font-mono text-neutral-400 uppercase">•</span>
                                            <span className="text-[9px] font-mono text-neutral-400 uppercase">{new Date(item.created_at).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6 mt-4 md:mt-0">
                                    <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full ${item.stato_validazione === 'validato' ? 'bg-green-50 text-green-600' :
                                        item.stato_validazione === 'preso_in_carico' ? 'bg-blue-50 text-blue-600' : 'bg-neutral-100 text-neutral-400'
                                        }`}>
                                        {item.stato_validazione.replace('_', ' ')}
                                    </span>
                                    <button
                                        onClick={() => setSelectedBisogno(item)}
                                        className="px-6 py-2 bg-black text-white text-[9px] font-bold uppercase tracking-widest rounded-full hover:bg-blue-600 transition-all"
                                    >
                                        Gestisci
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* Modal di Gestione Bisogno */}
            {selectedBisogno && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
                    <div className="bg-white w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="p-10 space-y-8">
                            <div className="flex justify-between items-start">
                                <div>
                                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{selectedBisogno.categoria}</span>
                                    <h2 className="text-3xl font-black tracking-tighter mt-2">{selectedBisogno.titolo}</h2>
                                </div>
                                <button onClick={() => { setSelectedBisogno(null); setAiAnalysis(null); }} className="text-neutral-400 hover:text-black text-xl font-bold p-2">✕</button>
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Descrizione del Bisogno</h4>
                                <p className="text-sm text-neutral-600 leading-relaxed bg-neutral-50 p-6 rounded-2xl italic">
                                    "{selectedBisogno.descrizione_semantica}"
                                </p>
                            </div>

                            <div className="space-y-6 pt-4 border-t border-neutral-100">
                                <div className="flex justify-between items-center">
                                    <h4 className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Analisi Ecosistemica IA</h4>
                                    <button
                                        onClick={async () => {
                                            setAnalyzing(true);
                                            try {
                                                const res = await fetch('/api/analyze-need', {
                                                    method: 'POST',
                                                    body: JSON.stringify({
                                                        id: selectedBisogno.id,
                                                        title: selectedBisogno.titolo,
                                                        text: selectedBisogno.descrizione_semantica
                                                    })
                                                });
                                                const data = await res.json();
                                                setAiAnalysis(data.analysis);
                                            } catch (e) {
                                                console.error(e);
                                            } finally {
                                                setAnalyzing(false);
                                            }
                                        }}
                                        disabled={analyzing}
                                        className="text-[9px] font-bold text-blue-600 hover:text-black uppercase tracking-tight flex items-center gap-2"
                                    >
                                        {analyzing ? (
                                            <>
                                                <div className="w-2 h-2 border border-blue-600 border-t-transparent rounded-full animate-spin" />
                                                Analisi in corso...
                                            </>
                                        ) : (
                                            <>✨ {aiAnalysis ? 'Rigenera Insight' : 'Estrai Insight Strategici'}</>
                                        )}
                                    </button>
                                </div>

                                {aiAnalysis ? (
                                    <div className="p-6 bg-blue-50/50 rounded-2xl space-y-4 animate-in fade-in slide-in-from-top-2 duration-500">
                                        <div>
                                            <span className="text-[8px] font-black text-blue-400 uppercase tracking-widest">Categoria Tecnica</span>
                                            <p className="text-xs text-blue-900 font-bold mt-1 uppercase leading-tight">{aiAnalysis.category}</p>
                                        </div>
                                        <div>
                                            <span className="text-[8px] font-black text-blue-400 uppercase tracking-widest">Impact Assessment</span>
                                            <p className="text-[11px] text-blue-800 leading-relaxed mt-1">{aiAnalysis.impact_assessment}</p>
                                        </div>
                                        <div>
                                            <span className="text-[8px] font-black text-blue-400 uppercase tracking-widest">Strategia Territoriale</span>
                                            <p className="text-[11px] text-blue-800 leading-relaxed mt-1 italic font-medium">"{aiAnalysis.strategic_advice}"</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-6 border border-dashed border-neutral-200 rounded-2xl text-center">
                                        <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-tight italic">
                                            Clicca per estrarre insight politici e territoriali tramite IA.
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-6 pt-6">
                                <button
                                    onClick={() => handleUpdateStatus(selectedBisogno.id, 'validato')}
                                    className="py-4 bg-green-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-green-700 transition-all shadow-lg shadow-green-100/50"
                                >
                                    Valida Bisogno
                                </button>
                                <button
                                    onClick={() => handleUpdateStatus(selectedBisogno.id, 'preso_in_carico')}
                                    className="py-4 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-100/50"
                                >
                                    Prendi in Carico
                                </button>
                            </div>

                            <p className="text-center text-[9px] text-neutral-400 uppercase font-medium">
                                L'azione aggiornerà lo stato per il cittadino e per l'ecosistema territoriale.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
