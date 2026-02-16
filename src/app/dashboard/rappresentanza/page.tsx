"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SpotlightCard } from "@/components/ui/SpotlightCard";
import { supabaseBrowserClient } from "@/lib/supabaseClient";

export default function RappresentanzaPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [formData, setFormData] = useState({
        titolo: "",
        categoria: "assistenza",
        descrizione: "",
        is_pubblico: true
    });

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);

        try {
            const supabase = supabaseBrowserClient();
            const { data: { session } } = await supabase.auth.getSession();

            if (!session) {
                alert("Devi essere loggato per inviare una segnalazione.");
                return;
            }

            const { error } = await supabase.from("bisogni_espressi").insert({
                utente_id: session.user.id,
                titolo: formData.titolo,
                categoria: formData.categoria,
                descrizione_semantica: formData.descrizione,
                is_pubblico: formData.is_pubblico
            });

            if (error) throw error;
            setSubmitted(true);
        } catch (err) {
            console.error(err);
            alert("Errore durante l'invio della segnalazione.");
        } finally {
            setLoading(false);
        }
    }

    if (submitted) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[70vh] p-8 text-center animate-in fade-in zoom-in duration-500">
                <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-4xl mb-8">
                    ✓
                </div>
                <h2 className="text-3xl font-black tracking-tighter mb-4">Segnalazione Inviata.</h2>
                <p className="text-sm text-neutral-500 max-w-md mb-10">
                    Grazie per aver contribuito alla mappatura dei bisogni del tuo territorio. La tua segnalazione è stata inoltrata alle organizzazioni competenti.
                </p>
                <button
                    onClick={() => router.push("/dashboard/disabled")}
                    className="px-8 py-3 bg-black text-white text-[10px] font-bold uppercase tracking-widest rounded-full"
                >
                    Torna alla Dashboard
                </button>
            </div>
        );
    }

    return (
        <div className="p-8 lg:p-12 max-w-4xl mx-auto space-y-12">
            <header>
                <button
                    onClick={() => router.back()}
                    className="text-[10px] font-bold text-neutral-400 hover:text-black transition-colors uppercase tracking-widest flex items-center gap-2 mb-8"
                >
                    ← Indietro
                </button>
                <span className="px-2 py-0.5 text-[9px] font-bold tracking-widest uppercase bg-blue-600 text-white rounded-full">Rappresentanza</span>
                <h1 className="text-4xl font-black text-black mt-4 tracking-tighter">Esprimi un <span className="text-blue-600 italic font-serif">Bisogno.</span></h1>
                <p className="text-xs text-neutral-500 mt-4 leading-relaxed">
                    Utilizza questo modulo per segnalare necessità che vanno oltre l'assistenza individuale.
                    I dati verranno aggregati in forma anonima per supportare le associazioni nelle loro interlocuzioni istituzionali.
                </p>
            </header>

            <form onSubmit={handleSubmit} className="space-y-8">
                <SpotlightCard className="p-8 md:p-10 border-neutral-100">
                    <div className="space-y-8">
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 block mb-3">Oggetto del Bisogno</label>
                            <input
                                required
                                type="text"
                                placeholder="Es. Difficoltà trasporto pubblico attrezzato"
                                className="w-full bg-neutral-50 border-none px-4 py-4 text-sm font-medium focus:ring-1 focus:ring-blue-600 transition-all"
                                value={formData.titolo}
                                onChange={(e) => setFormData({ ...formData, titolo: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 block mb-3">Categoria</label>
                            <select
                                className="w-full bg-neutral-50 border-none px-4 py-4 text-sm font-medium focus:ring-1 focus:ring-blue-600 transition-all appearance-none"
                                value={formData.categoria}
                                onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                            >
                                <option value="assistenza">Assistenza Domiciliare</option>
                                <option value="trasporto">Trasporto e Mobilità</option>
                                <option value="scuola">Inclusione Scolastica</option>
                                <option value="burocrazia">Supporto Burocratico/Legale</option>
                                <option value="altro">Altro</option>
                            </select>
                        </div>

                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 block mb-3">Descrizione Dettagliata</label>
                            <textarea
                                required
                                rows={5}
                                placeholder="Descrivi la situazione, l'urgenza e l'impatto sulla tua vita quotidiana..."
                                className="w-full bg-neutral-50 border-none px-4 py-4 text-sm font-medium focus:ring-1 focus:ring-blue-600 transition-all resize-none"
                                value={formData.descrizione}
                                onChange={(e) => setFormData({ ...formData, descrizione: e.target.value })}
                            />
                        </div>

                        <div className="flex items-center gap-4 p-4 bg-blue-50/50 rounded-lg">
                            <input
                                type="checkbox"
                                id="is_pubblico"
                                className="w-4 h-4 text-blue-600 rounded bg-white border-neutral-200"
                                checked={formData.is_pubblico}
                                onChange={(e) => setFormData({ ...formData, is_pubblico: e.target.checked })}
                            />
                            <label htmlFor="is_pubblico" className="text-[10px] font-bold text-blue-900 uppercase tracking-tight leading-relaxed">
                                Autorizzo la condivisione del dato aggregato con le Associazioni del territorio (FISH, Consulte).
                            </label>
                        </div>
                    </div>

                    <div className="mt-12 flex justify-end">
                        <button
                            disabled={loading}
                            type="submit"
                            className="px-12 py-4 bg-blue-600 text-white text-[11px] font-bold uppercase tracking-[0.2em] rounded-full hover:bg-black transition-all shadow-xl shadow-blue-100 disabled:opacity-50"
                        >
                            {loading ? "Invio in corso..." : "Invia Rappresentanza"}
                        </button>
                    </div>
                </SpotlightCard>
            </form>
        </div>
    );
}
