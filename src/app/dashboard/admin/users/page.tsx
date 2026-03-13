"use client";

import { SpotlightCard } from "@/components/ui/SpotlightCard";
import { useState, useEffect } from "react";
import { supabaseBrowserClient } from "@/lib/supabaseClient";

export default function AdminUsersPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchUsers() {
            const isDemo = document.cookie.includes("demo_mode=true");
            if (isDemo) {
                setUsers([
                    { id: '1', nome: 'Marco', cognome: 'Rossi', role: 'badante', email: 'marco@demo.com', created_at: new Date().toISOString() },
                    { id: '2', nome: 'Anna', cognome: 'Bianchi', role: 'disabile', email: 'anna@demo.com', created_at: new Date().toISOString() },
                    { id: '3', nome: 'FISH Veneto', cognome: '', role: 'associazione', email: 'info@fish.it', created_at: new Date().toISOString() },
                ]);
                setLoading(false);
                return;
            }
            const supabase = supabaseBrowserClient();
            const { data } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
            if (data) setUsers(data);
            setLoading(false);
        }
        fetchUsers();
    }, []);

    return (
        <div className="p-8 lg:p-12 space-y-12 max-w-6xl mx-auto">
            <header>
                <span className="px-2 py-1 text-[9px] font-black tracking-widest uppercase bg-amber-500 text-white rounded-full">Gestione Profili</span>
                <h1 className="text-4xl font-black text-black mt-6 tracking-tighter">Utenti & <span className="text-neutral-400 italic font-serif">Permessi.</span></h1>
                <p className="text-sm text-neutral-500 mt-2 max-w-md">Amministrazione centralizzata dell'ecosistema CareMatch.</p>
            </header>

            <SpotlightCard className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-neutral-100">
                                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-neutral-400">Utente</th>
                                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-neutral-400">Ruolo</th>
                                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-neutral-400">Email</th>
                                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-neutral-400">Data Iscrizione</th>
                                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-neutral-400 text-right">Azioni</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-50">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="p-12 text-center text-[10px] font-bold text-neutral-300 uppercase animate-pulse">Caricamento database utenti...</td>
                                </tr>
                            ) : users.map((user) => (
                                <tr key={user.id} className="hover:bg-neutral-50/50 transition-colors group">
                                    <td className="p-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-xs grayscale group-hover:grayscale-0 transition-all">👤</div>
                                            <span className="text-xs font-black uppercase">{user.nome} {user.cognome}</span>
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <span className={`px-2 py-1 text-[8px] font-black uppercase tracking-tighter rounded-full ${
                                            user.role === 'admin' ? 'bg-amber-100 text-amber-700' :
                                            user.role === 'badante' ? 'bg-emerald-100 text-emerald-700' :
                                            user.role === 'associazione' ? 'bg-blue-100 text-blue-700' :
                                            'bg-purple-100 text-purple-700'
                                        }`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="p-6 text-[10px] font-mono text-neutral-400">{user.email || 'N/A'}</td>
                                    <td className="p-6 text-[10px] font-mono text-neutral-400">{new Date(user.created_at).toLocaleDateString()}</td>
                                    <td className="p-6 text-right">
                                        <button className="text-[10px] font-black text-blue-600 hover:text-black uppercase tracking-widest underline transition-all">Dettagli</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </SpotlightCard>
        </div>
    );
}
