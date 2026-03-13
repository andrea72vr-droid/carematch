"use client";

import React from "react";
import { SpotlightCard } from "@/components/ui/SpotlightCard";
import { MatchScore } from "@/lib/matchingAlgorithm";

interface CompatibilityCardProps {
    matchScore: MatchScore;
    caregiverName: string;
    description?: string;
    compatibilityReason?: string;
}

export function CompatibilityCard({
    matchScore,
    caregiverName,
    description,
    compatibilityReason
}: CompatibilityCardProps) {
    const { totalScore, breakdown, harmonyPoints, warnings } = matchScore;

    // Helper for progress bars
    const ScoreBar = ({ label, score, weight }: { label: string, score: number, weight: string }) => (
        <div className="mb-2">
            <div className="flex justify-between text-[10px] uppercase tracking-wider text-neutral-500 mb-1">
                <span>{label}</span>
                <span>{Math.round(score)}%</span>
            </div>
            <div className="h-1.5 w-full bg-neutral-100 rounded-full overflow-hidden">
                <div
                    className="h-full bg-black rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${Math.min(100, score)}%` }}
                />
            </div>
            <p className="text-[9px] text-neutral-400 mt-0.5 text-right">Peso: {weight}</p>
        </div>
    );

    return (
        <SpotlightCard className="w-full bg-white border border-neutral-200 shadow-sm hover:border-neutral-300 transition-all p-0 overflow-hidden">
            <div className="p-6 md:p-8 flex flex-col md:flex-row gap-8">

                {/* Left: Score & Overview */}
                <div className="md:w-1/3 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-neutral-100 pb-6 md:pb-0 md:pr-6">
                    <div className="relative w-32 h-32 flex items-center justify-center">
                        {/* Simple Circular Progress - SVG */}
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                            <path
                                className="text-neutral-100"
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                            />
                            <path
                                className="text-black transition-all duration-1000 ease-out"
                                strokeDasharray={`${totalScore}, 100`}
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                            />
                        </svg>
                        <div className="absolute flex flex-col items-center">
                            <span className="text-4xl font-black text-black tracking-tighter">{totalScore}%</span>
                            <span className="text-[10px] uppercase tracking-widest text-neutral-400">Compatibilità</span>
                        </div>
                    </div>

                    <h3 className="text-lg font-bold text-neutral-900 mt-4 text-center">{caregiverName}</h3>
                    {description && (
                        <p className="text-xs text-neutral-500 text-center mt-2 line-clamp-2 px-2 max-w-[200px]">
                            {description}
                        </p>
                    )}
                </div>

                {/* Right: Detailed Breakdown */}
                <div className="md:w-2/3 space-y-6">

                    {/* Compatibility Reason (AI/Human text) */}
                    {compatibilityReason && (
                        <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-100">
                            <p className="text-sm text-neutral-700 italic leading-relaxed">
                                "{compatibilityReason}"
                            </p>
                        </div>
                    )}

                    {/* Scores */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <ScoreBar label="Competenze Tecniche" score={(breakdown.technical / 40) * 100} weight="40%" />
                        <ScoreBar label="Affinità Relazionale" score={(breakdown.relational / 30) * 100} weight="30%" />
                        <ScoreBar label="Logistica & Orari" score={(breakdown.logistics / 20) * 100} weight="20%" />
                        <ScoreBar label="Valori & Preferenze" score={(breakdown.preferences / 10) * 100} weight="10%" />
                    </div>

                    {/* Harmony & Warnings */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                        {/* Harmony Points */}
                        <div>
                            <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-neutral-900 mb-3">
                                <span>✨</span> Punti di Armonia
                            </h4>
                            {harmonyPoints.length > 0 ? (
                                <ul className="space-y-2">
                                    {harmonyPoints.map((point, idx) => (
                                        <li key={idx} className="flex items-start gap-2 text-xs text-neutral-600">
                                            <span className="mt-0.5 text-neutral-400">•</span>
                                            <span>{point}</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-xs text-neutral-400 italic">Nessun punto di armonia specifico rilevato.</p>
                            )}
                        </div>

                        {/* Warnings */}
                        {warnings.length > 0 && (
                            <div>
                                <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-neutral-900 mb-3">
                                    <span>⚠️</span> Da valutare
                                </h4>
                                <ul className="space-y-2">
                                    {warnings.map((warning, idx) => (
                                        <li key={idx} className="flex items-start gap-2 text-xs text-neutral-600">
                                            <span className="mt-0.5 text-neutral-400">•</span>
                                            <span>{warning}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </SpotlightCard>
    );
}
