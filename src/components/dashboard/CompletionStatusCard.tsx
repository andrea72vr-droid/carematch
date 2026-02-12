"use client";

import React from "react";
import Link from "next/link";
import { SpotlightCard } from "@/components/ui/SpotlightCard";
import { ProfileCompletionBar } from "@/components/profile/ProfileCompletionBar";

interface CompletionStatusCardProps {
    score: number;
    role: "disabled" | "caregiver";
    missingFields: string[];
}

export function CompletionStatusCard({ score, role, missingFields }: CompletionStatusCardProps) {
    const isBlocked = score < 70;
    const profileLink = role === "disabled" ? "/dashboard/profile/disabled" : "/dashboard/profile/caregiver";

    return (
        <SpotlightCard className={`p-8 border-neutral-100 ${isBlocked ? "bg-neutral-50/50" : ""}`}>
            <h3 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-6">Stato Profilo</h3>

            <div className="space-y-8">
                <ProfileCompletionBar score={score} />

                {isBlocked ? (
                    <div className="space-y-4">
                        <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-xl border border-amber-100">
                            <span className="text-amber-600 text-sm">⚠️</span>
                            <p className="text-[10px] text-amber-800 leading-relaxed font-medium">
                                Il matching è disattivato. Completa almeno il 70% del profilo per iniziare la ricerca.
                            </p>
                        </div>

                        <div className="space-y-3">
                            <p className="text-[9px] font-black text-neutral-400 uppercase tracking-tight">Suggerimenti:</p>
                            <ul className="space-y-2">
                                {missingFields.slice(0, 3).map((field, i) => (
                                    <li key={i} className="flex items-center gap-2 text-[10px] text-neutral-500">
                                        <span className="w-1 h-1 bg-neutral-300 rounded-full" />
                                        {field}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-start gap-3 p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                        <span className="text-emerald-600 text-sm">✨</span>
                        <p className="text-[10px] text-emerald-800 leading-relaxed font-medium">
                            Profilo pronto! Sei visibile nel sistema di matching.
                        </p>
                    </div>
                )}

                <Link
                    href={profileLink}
                    className="block w-full py-3 bg-black text-white text-[10px] font-bold rounded-full uppercase tracking-widest hover:bg-neutral-800 transition-all text-center"
                >
                    {isBlocked ? "Completa Profilo" : "Aggiorna Dettagli"}
                </Link>
            </div>
        </SpotlightCard>
    );
}
