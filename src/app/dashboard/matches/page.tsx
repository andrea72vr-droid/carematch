"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabaseBrowserClient } from "@/lib/supabaseClient";
import { CompatibilityCard } from "@/components/matches/CompatibilityCard";
import { MatchScore } from "@/lib/matchingAlgorithm";

type MatchResult = {
    candidate: {
        id: string;
        name: string;
        role: string;
        raw_competenze_esperienze: string;
    };
    matchData: {
        score: number;
        reason: string;
        strengths: string[];
        weaknesses: string[];
        algoBreakdown: MatchScore["breakdown"];
        harmonyPoints: string[];
    };
};

export default function MatchesPage() {
    const [loading, setLoading] = useState(true);
    const [matches, setMatches] = useState<MatchResult[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [personas, setPersonas] = useState<any[]>([]);
    const [selectedPersona, setSelectedPersona] = useState<any>(null);
    const [userRole, setUserRole] = useState<string | null>(null);
    const [completionScore, setCompletionScore] = useState<number>(0);
    const [isCheckingProfile, setIsCheckingProfile] = useState(true);

    // Initial fetch of personas and user role
    useEffect(() => {
        async function init() {
            try {
                const isDemo = document.cookie.includes("demo_mode=true");

                // Fetch structured personas for testing
                const personasRes = await fetch("/test-data/structured_disabled_profiles.json");
                if (personasRes.ok) {
                    const personasData = await personasRes.json();
                    setPersonas(personasData.disabled_profiles);
                    if (isDemo && personasData.disabled_profiles?.length > 0) {
                        setSelectedPersona(personasData.disabled_profiles[2] || personasData.disabled_profiles[0]);
                    }
                }

                const supabase = supabaseBrowserClient();
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    const { data } = await supabase.from("profiles").select("role, completion_score").eq("id", user.id).maybeSingle();
                    setUserRole(data?.role || null);
                    setCompletionScore(data?.completion_score || 0);
                } else if (isDemo) {
                    setUserRole("supervisor");
                    setCompletionScore(85); // Demo always passed
                }

                setIsCheckingProfile(false);
                if (!isDemo) {
                    setLoading(false);
                }
            } catch (e) {
                console.error("Failed to init MatchesPage", e);
                setIsCheckingProfile(false);
                setLoading(false);
            }
        }
        init();
    }, []);

    useEffect(() => {
        async function fetchMatches() {
            // Se stiamo controllando il profilo o il punteggio è basso, non facciamo nulla
            if (isCheckingProfile || completionScore < 70) return;

            // Se siamo in demo e non abbiamo ancora scelto una persona, aspettiamo l'init
            const isDemo = document.cookie.includes("demo_mode=true");
            if (isDemo && !selectedPersona) return;

            setLoading(true);
            try {
                let currentProfile = selectedPersona;
                let targetRoleForMatch = userRole === "caregiver" ? "disabled" : "caregiver";

                if (!isDemo && !selectedPersona) {
                    const supabase = supabaseBrowserClient();
                    const { data: { user } } = await supabase.auth.getUser();
                    if (user) {
                        const table = userRole === "caregiver" ? "caregiver_profiles" : "disabled_profiles";
                        const { data } = await supabase.from(table).select("*").eq("user_id", user.id).maybeSingle();
                        currentProfile = data;
                    }
                }

                if (!currentProfile) {
                    setError("Profilo non configurato. Completa il tuo profilo per vedere i match.");
                    setLoading(false);
                    return;
                }

                const res = await fetch("/api/match-profile", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        userProfile: currentProfile,
                        targetRole: targetRoleForMatch
                    })
                });

                const data = await res.json();
                if (data.matches) {
                    setMatches(data.matches);
                    setError(null);
                } else {
                    setError(data.message || "La ricerca non ha prodotto risultati.");
                }

            } catch (err) {
                console.error(err);
                setError("Errore di sistema nel caricamento dei match.");
            } finally {
                setLoading(false);
            }
        }
        fetchMatches();
    }, [selectedPersona, userRole, completionScore, isCheckingProfile]);

    if (!isCheckingProfile && completionScore < 70) {
        const profileLink = userRole === "caregiver" ? "/dashboard/profile/caregiver" : "/dashboard/profile/disabled";

        return (
            <div className="p-8 lg:p-12 space-y-12 max-w-2xl mx-auto py-20 flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-full bg-rose-50 flex items-center justify-center text-3xl mb-8 border border-rose-100">
                    🔒
                </div>
                <h1 className="text-3xl font-black text-black tracking-tight mb-4">Matching Disattivato</h1>
                <p className="text-sm text-neutral-500 leading-relaxed mb-10">
                    Per garantire la qualità degli incontri e la sicurezza della piattaforma, richiediamo che il tuo profilo sia completo almeno al <span className="text-black font-bold">70%</span>.
                    <br />
                    Attualmente il tuo punteggio è: <span className="text-rose-500 font-bold">{completionScore}%</span>
                </p>
                <Link
                    href={profileLink}
                    className="bg-black text-white px-10 py-4 rounded-full text-xs font-bold uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-black/10"
                >
                    Completa Profilo
                </Link>
            </div>
        );
    }

    return (
        <div className="p-8 lg:p-12 space-y-12 max-w-5xl mx-auto pb-32">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
                <div>
                    <span className="px-2 py-1 text-[9px] font-bold tracking-widest uppercase bg-black text-white rounded-full">Intelligenza Artificiale</span>
                    <h1 className="text-4xl font-black text-black mt-6 tracking-tighter">
                        {userRole === "caregiver" ? "Opportunità di" : "Compagni di"} <span className="text-neutral-400 italic font-serif">Valore.</span>
                    </h1>
                    <p className="text-sm text-neutral-500 mt-2 max-w-md">
                        {selectedPersona
                            ? `Analisi effettuata per il test di: ${selectedPersona.name}`
                            : "Analisi basata sulla tua compatibilità caratteriale e tecnica."
                        }
                    </p>
                </div>

                {/* Persona Selector for Testing (Demo Mode Only) */}
                {personas.length > 0 && document.cookie.includes("demo_mode=true") && (
                    <div className="bg-white border border-neutral-200 rounded-2xl p-4 shadow-sm w-full md:w-64">
                        <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest mb-3">Simula Assistito (Test)</p>
                        <select
                            value={selectedPersona?.id || ""}
                            onChange={(e) => setSelectedPersona(personas.find(p => p.id === e.target.value))}
                            className="w-full bg-neutral-50 border-none text-xs font-bold p-2 rounded-lg"
                        >
                            {personas.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                    </div>
                )}
            </header>

            <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                {error && (
                    <div className="p-8 rounded-2xl border border-neutral-200 bg-white shadow-sm flex items-center gap-4">
                        <span className="text-2xl">⚠️</span>
                        <div>
                            <p className="text-xs font-bold text-black uppercase">Attenzione</p>
                            <p className="text-[11px] text-neutral-500">{error}</p>
                        </div>
                    </div>
                )}

                {(loading || isCheckingProfile) && (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
                        <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Analisi profili in corso...</p>
                    </div>
                )}

                <div className="grid grid-cols-1 gap-8 mt-8">
                    {matches.map((match, idx) => {
                        const matchScore: MatchScore = {
                            totalScore: match.matchData.score || 0,
                            breakdown: match.matchData.algoBreakdown || { technical: 0, relational: 0, logistics: 0, preferences: 0 },
                            harmonyPoints: match.matchData.harmonyPoints || match.matchData.strengths || [],
                            warnings: match.matchData.weaknesses || []
                        };

                        return (
                            <div key={match.candidate.id} className="animate-in fade-in slide-in-from-bottom-8 fill-mode-backwards" style={{ animationDelay: `${idx * 100}ms` }}>
                                <CompatibilityCard
                                    matchScore={matchScore}
                                    caregiverName={match.candidate.name}
                                    compatibilityReason={match.matchData.reason}
                                    description={match.candidate.role}
                                />
                            </div>
                        );
                    })}
                </div>

                {!loading && !isCheckingProfile && matches.length === 0 && !error && (
                    <div className="text-center py-32 bg-white rounded-3xl border border-neutral-100 border-dashed">
                        <p className="text-xs font-bold text-neutral-300 uppercase tracking-widest">Nessun risultato rilevante trovato</p>
                    </div>
                )}
            </section>
        </div>
    );
}
