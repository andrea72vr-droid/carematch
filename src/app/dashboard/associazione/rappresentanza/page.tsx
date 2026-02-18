"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SpotlightCard } from "@/components/ui/SpotlightCard";
import { supabaseBrowserClient } from "@/lib/supabaseClient";

export default function AssociazioneRappresentanza() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    // Form State compatibile con le nuove richieste
    const [formData, setFormData] = useState({
        titolo: "",
        categoria: "assistenza",
        descrizione: "",
        livello_rappresentativo: "singolo",
        target_utenti: "",
        livello_urgenza: "medio",
        territorio: "",
        is_pubblico: true
    });

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);

        try {
            const supabase = supabaseBrowserClient();
            const { data: { session } } = await supabase.auth.getSession();

            if (!session) {
                alert("Sessione scaduta o non valida.");
                return;
            }

            // Inserimento con estensione dei metadati per non rompere lo schema esistente
            const { error } = await supabase.from("bisogni_espressi").insert({
                utente_id: session.user.id,
                titolo: formData.titolo,
                categoria: formData.categoria,
                descrizione_semantica: formData.descrizione,
                stato_validazione: 'validato', // Auto-validato poiché inserito da associazione
                is_pubblico: formData.is_pubblico,
                metadata: {
                    livello_rappresentativo: formData.livello_rappresentativo,
                    target_utenti: formData.target_utenti,
                    livello_urgenza: formData.livello_urgenza,
                    territorio: formData.territorio,
                    source: 'associazione_rappresentanza'
                }
            });

            if (error) throw error;
            setSubmitted(true);
        } catch (err: any) {
            console.error(err);
            alert("Errore: " + err.message);
        } finally {
            setLoading(false);
        }
    }

    if (submitted) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[70vh] p-8 text-center animate-in fade-in zoom-in duration-500">
                <div className="w-20 h-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center text-4xl mb-8">✓</div>
                <h2 className="text-3xl font-black tracking-tighter mb-4">Bisogno Validato e Archiviato.</h2>
                <p className="text-sm text-neutral-500 max-w-md mb-10 uppercase font-bold tracking-tight">
                    Il dato è ora parte dell'ecosistema di cura territoriale. Potrà essere aggregato per analisi strategiche e istituzionali.
                </p>
                <button
                    onClick={() => router.push("/dashboard/associazione")}
                    className="px-8 py-3 bg-black text-white text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-blue-600 transition-all"
                >
                    Torna alla Dashboard
                </button>
            </div>
        );
    }

    return (
        <div className="p-8 lg:p-12 max-w-6xl mx-auto space-y-12 mb-20">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <button onClick={() => router.back()} className="text-[9px] font-black text-neutral-400 hover:text-black uppercase tracking-widest mb-4">← Dashboard Associazione</button>
                    <h1 className="text-5xl font-black tracking-tighter text-black">Rappresentanza <span className="text-blue-600 italic font-serif">Istituzionale.</span></h1>
                    <p className="text-xs text-neutral-400 mt-2 font-bold uppercase tracking-tight italic">Registra un bisogno territoriale per la programmazione sociale</p>
                </div>
                <div className="px-6 py-3 bg-neutral-50 border border-neutral-100 rounded-2xl">
                    <span className="text-[9px] font-black text-neutral-400 uppercase block tracking-widest mb-1">Status Operatore</span>
                    <span className="text-[11px] font-bold text-blue-600 uppercase flex items-center gap-2">
                        <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
                        Validatore Certificato
                    </span>
                </div>
            </header>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Colonna Sinistra: Dati Principali */}
                <div className="lg:col-span-7 space-y-8">
                    <SpotlightCard className="p-10 border-neutral-100 bg-white">
                        <div className="space-y-8">
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 block mb-4">Oggetto della Rappresentanza (Titolo)</label>
                                <input
                                    required type="text"
                                    placeholder="Es. Criticità Percorsi Riabilitativi Provincia Verona"
                                    className="w-full bg-neutral-50 border-neutral-100 px-6 py-5 text-lg font-black tracking-tight focus:ring-2 focus:ring-blue-600 rounded-2xl transition-all"
                                    value={formData.titolo}
                                    onChange={(e) => setFormData({ ...formData, titolo: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 block mb-3">Categoria Tecnica</label>
                                    <select
                                        className="w-full bg-neutral-50 border-neutral-100 px-6 py-4 text-sm font-bold uppercase tracking-tight focus:ring-2 focus:ring-blue-600 rounded-2xl appearance-none"
                                        value={formData.categoria}
                                        onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                                    >
                                        <option value="assistenza">Cura e Assistenza</option>
                                        <option value="trasporto">Mobilità Inclusiva</option>
                                        <option value="scuola">Diritto allo Studio</option>
                                        <option value="burocrazia">Sostegno Legale/Normativo</option>
                                        <option value="lavoro">Inclusione Lavorativa</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 block mb-3">Ambito Territoriale (Comune/AUSL)</label>
                                    <input
                                        required type="text"
                                        placeholder="Es. ULSS 9 Scaligera"
                                        className="w-full bg-neutral-50 border-neutral-100 px-6 py-4 text-sm font-bold tracking-tight focus:ring-2 focus:ring-blue-600 rounded-2xl"
                                        value={formData.territorio}
                                        onChange={(e) => setFormData({ ...formData, territorio: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 block mb-4">Analisi delle Criticità (Descrizione Semantica)</label>
                                <textarea
                                    required rows={8}
                                    placeholder="Analisi dettagliata del bisogno, delle lacune nei servizi attuali e delle possibili soluzioni strutturali..."
                                    className="w-full bg-neutral-50 border-neutral-100 px-6 py-5 text-sm leading-relaxed focus:ring-2 focus:ring-blue-600 rounded-2xl resize-none font-medium italic"
                                    value={formData.descrizione}
                                    onChange={(e) => setFormData({ ...formData, descrizione: e.target.value })}
                                />
                                <p className="text-[9px] text-neutral-400 mt-4 font-bold uppercase tracking-tighter uppercase">
                                    💡 Questo testo verrà processato dall'IA per generare insight strategici durante l'analisi ecosistemica.
                                </p>
                            </div>
                        </div>
                    </SpotlightCard>
                </div>

                {/* Colonna Destra: Metadati Strategici */}
                <div className="lg:col-span-5 space-y-8">
                    <SpotlightCard className="p-10 border-neutral-100 bg-neutral-900 text-white">
                        <div className="space-y-10">
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 block mb-5">Livello Rappresentativo</label>
                                <div className="space-y-3">
                                    {['singolo', 'ricorrente', 'diffuso'].map((lvl) => (
                                        <button
                                            key={lvl} type="button"
                                            onClick={() => setFormData({ ...formData, livello_rappresentativo: lvl })}
                                            className={`w-full text-left px-6 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${formData.livello_rappresentativo === lvl
                                                    ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-900/40 translate-x-1'
                                                    : 'border-neutral-800 text-neutral-500 hover:border-neutral-600'
                                                }`}
                                        >
                                            {lvl === 'singolo' ? '📍 Caso Individuale' : lvl === 'ricorrente' ? '🔄 Bisogno Ricorrente' : '🛰️ Fenomeno Diffuso'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 block mb-4">Target di Riferimento</label>
                                <input
                                    required type="text"
                                    placeholder="Es. Caregiver familiari over 65"
                                    className="w-full bg-neutral-800 border-neutral-700 px-6 py-4 text-xs font-bold text-white focus:ring-1 focus:ring-blue-500 rounded-xl outline-none"
                                    value={formData.target_utenti}
                                    onChange={(e) => setFormData({ ...formData, target_utenti: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 block mb-5">Livello Urgenza Strategica</label>
                                <div className="flex gap-2">
                                    {['basso', 'medio', 'alto', 'critico'].map((u) => (
                                        <button
                                            key={u} type="button"
                                            onClick={() => setFormData({ ...formData, livello_urgenza: u })}
                                            className={`flex-1 py-3 rounded-lg text-[9px] font-black uppercase tracking-tighter border transition-all ${formData.livello_urgenza === u
                                                    ? (u === 'critico' ? 'bg-red-600 border-red-600 text-white shadow-lg shadow-red-900/40' : 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-900/40')
                                                    : 'border-neutral-800 text-neutral-500'
                                                }`}
                                        >
                                            {u}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-6 border-t border-neutral-800">
                                <button
                                    disabled={loading}
                                    type="submit"
                                    className="w-full py-5 bg-white text-black text-[12px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-blue-600 hover:text-white transition-all shadow-2xl disabled:opacity-50"
                                >
                                    {loading ? "Archiviazione..." : "Conferma e Valida Bisogno"}
                                </button>
                                <p className="text-[8px] text-neutral-600 mt-4 text-center font-bold uppercase tracking-widest">
                                    L'azione ha valore istituzionale nel database CareMatch Ecosystem.
                                </p>
                            </div>
                        </div>
                    </SpotlightCard>
                </div>
            </form>
        </div>
    );
}
