"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SpotlightCard } from "@/components/ui/SpotlightCard";
import { supabaseBrowserClient } from "@/lib/supabaseClient";
import { EcosystemHeatmap } from "@/components/dashboard/EcosystemHeatmap";

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

interface Caregiver {
    id: string;
    profile_id: string;
    nome: string;
    cognome: string;
    specializzazione: string;
    certified?: boolean;
    tipo_certificazione?: string;
}

export default function AssociazioneDashboard() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'audit' | 'caregivers' | 'dialogue'>('audit');
    const [bisogni, setBisogni] = useState<Bisogno[]>([]);
    const [caregivers, setCaregivers] = useState<Caregiver[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedBisogno, setSelectedBisogno] = useState<Bisogno | null>(null);
    const [counts, setCounts] = useState({ in_attesa: 0, validati: 0, totale: 0 });
    const [analyzing, setAnalyzing] = useState(false);
    const [aiAnalysis, setAiAnalysis] = useState<any>(null);
    const [generatingReport, setGeneratingReport] = useState(false);
    const [dialogues, setDialogues] = useState<any[]>([]);
    const [selectedDialogue, setSelectedDialogue] = useState<any>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [showNewDialogueModal, setShowNewDialogueModal] = useState(false);
    const [newDialogueSubject, setNewDialogueSubject] = useState("");
    const [newDialogueInterlocutor, setNewDialogueInterlocutor] = useState("Comune");
    const [newDialogueInterlocutorName, setNewDialogueInterlocutorName] = useState("");

    useEffect(() => {
        if (activeTab === 'audit') fetchBisogni();
        else if (activeTab === 'caregivers') fetchCaregivers();
        else fetchDialogues();
    }, [activeTab]);

    async function fetchDialogues() {
        setLoading(true);
        const supabase = supabaseBrowserClient();
        const { data, error } = await supabase
            .from("institutional_dialogues")
            .select("*")
            .order("updated_at", { ascending: false });

        if (!error && data) {
            setDialogues(data);
            if (data.length > 0) {
                setSelectedDialogue(data[0]);
                fetchMessages(data[0].id);
            }
        }
        setLoading(false);
    }

    async function fetchMessages(dialogueId: string) {
        const supabase = supabaseBrowserClient();
        const { data, error } = await supabase
            .from("institutional_messages")
            .select("*")
            .eq("dialogue_id", dialogueId)
            .order("created_at", { ascending: true });

        if (!error && data) {
            setMessages(data);
        }
    }

    async function handleSendMessage() {
        if (!newMessage.trim() || !selectedDialogue) return;

        const supabase = supabaseBrowserClient();
        const { error } = await supabase
            .from("institutional_messages")
            .insert({
                dialogue_id: selectedDialogue.id,
                content: newMessage,
                sender_type: 'association',
                is_certified: true
            });

        if (!error) {
            setNewMessage("");
            fetchMessages(selectedDialogue.id);
        }
    }

    async function handleCreateDialogue() {
        if (!newDialogueSubject || !newDialogueInterlocutorName) return;

        const supabase = supabaseBrowserClient();
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) return;

        const { data, error } = await supabase
            .from("institutional_dialogues")
            .insert({
                initiator_id: userData.user.id,
                interlocutor_name: newDialogueInterlocutorName,
                interlocutor_type: newDialogueInterlocutor,
                subject: newDialogueSubject,
                status: 'active'
            })
            .select()
            .single();

        if (!error && data) {
            setNewDialogueSubject("");
            setNewDialogueInterlocutorName("");
            setShowNewDialogueModal(false);
            fetchDialogues();
        }
    }

    async function fetchCaregivers() {
        setLoading(true);
        const supabase = supabaseBrowserClient();
        const { data, error } = await supabase
            .from("badanti")
            .select(`
                id,
                certificazioni,
                profiles:profile_id (id, nome, cognome)
            `);

        if (!error && data) {
            const formatted = data.map((d: any) => ({
                id: d.id,
                profile_id: d.profiles.id,
                nome: d.profiles.nome,
                cognome: d.profiles.cognome,
                specializzazione: 'Professionista della Cura', // Default se non specificato in bio
                certified: (d.certificazioni?.length || 0) > 0,
                tipo_certificazione: d.certificazioni?.[0] || 'Base'
            }));
            setCaregivers(formatted);
        }
        setLoading(false);
    }

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

    async function handleCertify(caregiverId: string, level: string) {
        setLoading(true);
        const supabase = supabaseBrowserClient();

        // Recupero le certificazioni attuali
        const { data: current } = await supabase
            .from('badanti')
            .select('certificazioni')
            .eq('id', caregiverId)
            .single();

        const updatedCerts = Array.from(new Set([...(current?.certificazioni || []), level]));

        const { error } = await supabase
            .from('badanti')
            .update({ certificazioni: updatedCerts })
            .eq('id', caregiverId);

        if (!error) {
            alert(`Certificazione ${level} emessa con successo.`);
            fetchCaregivers();
        }
        setLoading(false);
    }

    async function downloadInstitutionalReport() {
        setGeneratingReport(true);
        // Generazione di un report testuale basato sui dati reali
        const reportContent = bisogni.map(b => `${b.created_at}: [${b.categoria.toUpperCase()}] ${b.titolo} - Stato: ${b.stato_validazione}`).join('\n');
        const blob = new Blob([`CAREMATCH ECOSYSTEM REPORT - ${new Date().toLocaleDateString()}\n\n${reportContent}`], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `report_istituzionale_${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        setGeneratingReport(false);
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
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10">
                <div className="flex-1">
                    <span className="px-2 py-0.5 text-[10px] font-bold tracking-widest uppercase bg-blue-600 text-white rounded-full">Ecosistema Territoriale</span>
                    <h1 className="text-5xl font-black text-black mt-4 tracking-tighter">Nodo di <span className="text-blue-600 italic font-serif">Rappresentanza.</span></h1>
                    <p className="text-sm text-neutral-500 mt-4 max-w-xl leading-relaxed">
                        Monitoraggio dei bisogni di cura espressi dalla comunità e coordinamento delle risposte territoriali per finalità istituzionali.
                    </p>
                </div>
                <button
                    onClick={() => router.push("/dashboard/associazione/rappresentanza")}
                    className="px-10 py-5 bg-black text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-blue-600 hover:shadow-2xl hover:shadow-blue-200 transition-all flex items-center gap-3"
                >
                    <span className="text-lg leading-none">+</span> Inserisci Bisogno Territoriale
                </button>
            </header>

            <div className="flex gap-8 border-b border-neutral-100 pb-1">
                <button
                    onClick={() => setActiveTab('audit')}
                    className={`pb-4 text-[11px] font-black uppercase tracking-widest transition-all relative ${activeTab === 'audit' ? 'text-blue-600' : 'text-neutral-400 hover:text-black'}`}
                >
                    Audit & Rappresentanza
                    {activeTab === 'audit' && <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-600 rounded-full" />}
                </button>
                <button
                    onClick={() => setActiveTab('caregivers')}
                    className={`pb-4 text-[11px] font-black uppercase tracking-widest transition-all relative ${activeTab === 'caregivers' ? 'text-blue-600' : 'text-neutral-400 hover:text-black'}`}
                >
                    Qualità & Certificazioni
                    {activeTab === 'caregivers' && <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-600 rounded-full" />}
                </button>
                <button
                    onClick={() => setActiveTab('dialogue')}
                    className={`pb-4 text-[11px] font-black uppercase tracking-widest transition-all relative ${activeTab === 'dialogue' ? 'text-blue-600' : 'text-neutral-400 hover:text-black'}`}
                >
                    Dialogo Istituzionale
                    {activeTab === 'dialogue' && <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-600 rounded-full" />}
                </button>
            </div>

            {activeTab === 'audit' ? (
                <>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-top-4 duration-500">
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

                    <section className="animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-300">
                        <div className="flex justify-between items-end mb-8">
                            <div>
                                <h3 className="text-xs font-black uppercase tracking-widest text-neutral-400">Osservatorio Ecosistema</h3>
                                <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-tight mt-1 italic">Analisi densità bisogni e saturazione servizi nel comprensorio</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
                            <div className="lg:col-span-3">
                                <EcosystemHeatmap
                                    points={bisogni.map((b, i) => ({
                                        id: b.id,
                                        x: 10 + (parseInt(b.id.substring(0, 2), 16) % 80), // Posizione deterministica ma distribuita
                                        y: 15 + (parseInt(b.id.substring(2, 4), 16) % 70),
                                        intensity: b.stato_validazione === 'in_attesa' ? 0.9 : 0.4,
                                        label: b.titolo,
                                        category: b.categoria
                                    }))}
                                />
                            </div>
                            <div className="space-y-6">
                                <SpotlightCard className="p-6 border-blue-100 bg-blue-50/30">
                                    <span className="text-[8px] font-black text-blue-400 uppercase tracking-widest">Stakeholder Alert</span>
                                    <h4 className="text-[11px] font-black mt-2 uppercase">Picco in Area Ovest</h4>
                                    <p className="text-[10px] text-blue-800/70 mt-2 leading-relaxed">Rilevate 12 nuove segnalazioni di trasporto negato nelle ultime 48h. Necessaria interlocuzione AUSL.</p>
                                </SpotlightCard>
                                <button
                                    onClick={downloadInstitutionalReport}
                                    disabled={generatingReport}
                                    className="w-full py-4 bg-black text-white text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-blue-600 transition-all shadow-xl shadow-blue-900/10 flex items-center justify-center gap-3"
                                >
                                    {generatingReport ? (
                                        <>
                                            <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            Generazione in corso...
                                        </>
                                    ) : (
                                        "Genera Report Istituzionale"
                                    )}
                                </button>
                            </div>
                        </div>
                    </section>

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
                </>
            ) : activeTab === 'caregivers' ? (
                <section className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <header>
                        <h3 className="text-2xl font-black tracking-tighter text-black uppercase">Certification <span className="text-blue-600 italic">Lab.</span></h3>
                        <p className="text-xs text-neutral-400 font-bold uppercase tracking-tight mt-1">Acclama e certifica i professionisti della cura sul territorio</p>
                    </header>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {caregivers.map((cg) => (
                            <SpotlightCard key={cg.id} className="p-8 border-neutral-100 group">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="w-12 h-12 bg-neutral-900 rounded-2xl flex items-center justify-center text-xl grayscale group-hover:grayscale-0 transition-all">
                                        👤
                                    </div>
                                    {cg.certified && (
                                        <span className="px-3 py-1 bg-blue-600 text-white text-[8px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-blue-200">
                                            {cg.tipo_certificazione}
                                        </span>
                                    )}
                                </div>
                                <h4 className="text-lg font-black tracking-tighter text-black uppercase">{cg.nome} {cg.cognome}</h4>
                                <p className="text-[10px] font-mono text-neutral-400 uppercase mt-1">{cg.specializzazione}</p>

                                <div className="mt-8 pt-6 border-t border-neutral-50 space-y-3">
                                    <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest mb-4">Certifica Competenze:</p>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            onClick={() => handleCertify(cg.id, 'Base')}
                                            className="py-2.5 bg-neutral-50 text-[8px] font-black text-neutral-500 uppercase tracking-tighter rounded-lg hover:bg-blue-600 hover:text-white transition-all"
                                        >
                                            Base
                                        </button>
                                        <button
                                            onClick={() => handleCertify(cg.id, 'Avanzata')}
                                            className="py-2.5 bg-neutral-50 text-[8px] font-black text-neutral-500 uppercase tracking-tighter rounded-lg hover:bg-blue-600 hover:text-white transition-all"
                                        >
                                            Avanzata
                                        </button>
                                    </div>
                                    <button className="w-full py-3 border border-neutral-100 text-[9px] font-black text-black uppercase tracking-widest rounded-xl hover:border-blue-600 hover:text-blue-600 transition-all">
                                        Vedi Curriculum
                                    </button>
                                </div>
                            </SpotlightCard>
                        ))}
                    </div>
                </section>
            ) : (
                /* Dialogue Tab - Real Logic */
                <section className="animate-in fade-in slide-in-from-left-4 duration-500">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
                        <div className="lg:col-span-1 space-y-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xs font-black uppercase tracking-widest text-neutral-400">Interlocutori Attivi</h3>
                                <button
                                    onClick={() => setShowNewDialogueModal(true)}
                                    className="text-[10px] font-black text-blue-600 hover:text-black uppercase tracking-tighter"
                                >
                                    + Nuovo
                                </button>
                            </div>
                            {dialogues.length === 0 ? (
                                <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest pl-2">Nessun dialogo attivo</p>
                            ) : dialogues.map((dialogue, i) => (
                                <div
                                    key={dialogue.id}
                                    onClick={() => {
                                        setSelectedDialogue(dialogue);
                                        fetchMessages(dialogue.id);
                                    }}
                                    className={`p-4 bg-white border rounded-2xl transition-all cursor-pointer group ${selectedDialogue?.id === dialogue.id ? 'border-blue-600 shadow-lg' : 'border-neutral-100 hover:border-blue-300'}`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-2 h-2 rounded-full ${dialogue.status === 'active' ? 'bg-green-500' : 'bg-neutral-300'}`} />
                                        <div className="flex-1">
                                            <p className="text-[10px] font-black uppercase tracking-tight text-black">{dialogue.interlocutor_name}</p>
                                            <p className="text-[8px] text-neutral-400 font-bold uppercase mt-0.5">{dialogue.interlocutor_type} • {new Date(dialogue.updated_at).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="lg:col-span-3 flex flex-col h-[600px] border border-neutral-100 rounded-3xl overflow-hidden bg-white shadow-2xl shadow-neutral-200/50">
                            {selectedDialogue ? (
                                <>
                                    <div className="p-6 border-b border-neutral-50 flex justify-between items-center bg-neutral-50/50">
                                        <div>
                                            <h4 className="text-xs font-black uppercase tracking-widest">{selectedDialogue.interlocutor_name}</h4>
                                            <p className="text-[9px] text-blue-600 font-bold uppercase mt-1 italic">Oggetto: {selectedDialogue.subject}</p>
                                        </div>
                                        <span className="px-3 py-1 bg-black text-white text-[8px] font-black uppercase tracking-widest rounded-full">Canale Certificato</span>
                                    </div>
                                    <div className="flex-1 p-8 overflow-y-auto space-y-8">
                                        {messages.length === 0 ? (
                                            <div className="h-full flex items-center justify-center text-[10px] text-neutral-300 uppercase font-black tracking-widest italic">
                                                Inizio della comunicazione certificata
                                            </div>
                                        ) : messages.map((msg: any) => (
                                            <div key={msg.id} className={`max-w-[80%] ${msg.sender_type === 'association' ? 'ml-auto text-right' : ''}`}>
                                                <div className={`p-6 rounded-2xl ${msg.sender_type === 'association'
                                                    ? 'bg-blue-600 text-white rounded-tr-none text-xs'
                                                    : 'bg-neutral-100 text-neutral-600 rounded-tl-none font-serif italic text-sm'
                                                    } leading-relaxed`}>
                                                    {msg.content}
                                                </div>
                                                <span className={`text-[8px] font-mono uppercase text-neutral-400 mt-2 block ${msg.sender_type === 'association' ? 'mr-2' : 'ml-2'}`}>
                                                    {msg.sender_type === 'association' ? 'Voi (FISH Node)' : selectedDialogue.interlocutor_name} • {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="p-6 border-t border-neutral-50 bg-neutral-50/20">
                                        <div className="flex gap-4">
                                            <input
                                                type="text"
                                                value={newMessage}
                                                onChange={(e) => setNewMessage(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                                placeholder="Scrivi un messaggio certificato..."
                                                className="flex-1 bg-white border border-neutral-200 px-6 py-4 rounded-xl text-xs outline-none focus:border-blue-600 transition-all"
                                            />
                                            <button
                                                onClick={handleSendMessage}
                                                className="px-8 py-4 bg-black text-white text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-blue-600 transition-all"
                                            >
                                                Invia Corrispondenza
                                            </button>
                                        </div>
                                        <p className="text-[8px] text-neutral-400 mt-4 text-center uppercase tracking-widest font-bold">I messaggi inviati tramite questo canale hanno valore di notifica istituzionale.</p>
                                    </div>
                                </>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center space-y-6">
                                    <div className="w-12 h-12 bg-neutral-50 rounded-3xl flex items-center justify-center text-2xl grayscale opacity-30">🏛️</div>
                                    <p className="text-[10px] text-neutral-300 font-bold uppercase tracking-widest italic">Seleziona un interlocutore per iniziare il dialogo</p>
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            )}

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

                            {selectedBisogno.metadata && selectedBisogno.metadata.source === 'associazione_rappresentanza' && (
                                <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-left-2 duration-500">
                                    <div className="p-4 bg-neutral-900 rounded-2xl">
                                        <span className="text-[8px] font-black text-neutral-500 uppercase tracking-widest">Ambito Territoriale</span>
                                        <p className="text-xs text-white font-bold mt-1 uppercase">{selectedBisogno.metadata.territorio}</p>
                                    </div>
                                    <div className="p-4 bg-neutral-900 rounded-2xl">
                                        <span className="text-[8px] font-black text-neutral-500 uppercase tracking-widest">Livello Urgenza</span>
                                        <p className={`text-xs font-black mt-1 uppercase ${selectedBisogno.metadata.livello_urgenza === 'critico' ? 'text-red-500' : 'text-blue-400'
                                            }`}>{selectedBisogno.metadata.livello_urgenza}</p>
                                    </div>
                                    <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-100">
                                        <span className="text-[8px] font-black text-neutral-400 uppercase tracking-widest">Target Utenti</span>
                                        <p className="text-[10px] text-neutral-600 font-bold mt-1 uppercase">{selectedBisogno.metadata.target_utenti}</p>
                                    </div>
                                    <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-100">
                                        <span className="text-[8px] font-black text-neutral-400 uppercase tracking-widest">Tipo Rappresentanza</span>
                                        <p className="text-[10px] text-neutral-600 font-bold mt-1 uppercase">{selectedBisogno.metadata.livello_rappresentativo}</p>
                                    </div>
                                </div>
                            )}

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

            {/* Modal di Nuovo Dialogo */}
            {showNewDialogueModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] flex items-center justify-center p-6">
                    <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl p-10 space-y-8 animate-in zoom-in-95 duration-300">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xl font-black tracking-tighter uppercase font-serif italic">Avvia Dialogo Certificato</h3>
                            <button onClick={() => setShowNewDialogueModal(false)} className="text-neutral-400">✕</button>
                        </div>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-neutral-400 tracking-widest">Ente Destinatario</label>
                                <input
                                    type="text"
                                    placeholder="Es: Comune di Milano - Settore Sociale"
                                    value={newDialogueInterlocutorName}
                                    onChange={(e) => setNewDialogueInterlocutorName(e.target.value)}
                                    className="w-full bg-neutral-50 border border-neutral-100 p-4 rounded-xl text-xs outline-none focus:border-blue-600"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-neutral-400 tracking-widest">Tipo Istituzione</label>
                                <select
                                    value={newDialogueInterlocutor}
                                    onChange={(e) => setNewDialogueInterlocutor(e.target.value)}
                                    className="w-full bg-neutral-50 border border-neutral-100 p-4 rounded-xl text-xs outline-none focus:border-blue-600"
                                >
                                    <option value="Comune">Comune</option>
                                    <option value="AUSL">AUSL</option>
                                    <option value="Provincia">Provincia</option>
                                    <option value="Regione">Regione</option>
                                    <option value="Istituzione">Altro Ente</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-neutral-400 tracking-widest">Oggetto della Corrispondenza</label>
                                <input
                                    type="text"
                                    placeholder="Es: Riorganizzazione servizi Area Ovest"
                                    value={newDialogueSubject}
                                    onChange={(e) => setNewDialogueSubject(e.target.value)}
                                    className="w-full bg-neutral-50 border border-neutral-100 p-4 rounded-xl text-xs outline-none focus:border-blue-600"
                                />
                            </div>
                        </div>
                        <button
                            onClick={handleCreateDialogue}
                            className="w-full py-4 bg-black text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-blue-600 transition-all"
                        >
                            Crea Canale Certificato
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
