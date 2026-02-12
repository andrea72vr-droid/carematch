"use client";

import React from "react";

interface ProfileCompletionBarProps {
    score: number;
    showText?: boolean;
}

export function ProfileCompletionBar({ score, showText = true }: ProfileCompletionBarProps) {
    // Determine color based on score
    const getColor = () => {
        if (score < 40) return "bg-rose-500";
        if (score < 70) return "bg-amber-500";
        return "bg-emerald-500";
    };

    const getLabel = () => {
        if (score < 40) return "Profilo Incompleto";
        if (score < 70) return "Quasi pronto";
        if (score < 100) return "Ottimo";
        return "Profilo Completo";
    };

    return (
        <div className="w-full space-y-2">
            {showText && (
                <div className="flex justify-between items-end">
                    <span className="text-[10px] font-black uppercase tracking-[0.15em] text-neutral-400">
                        {getLabel()}
                    </span>
                    <span className="text-sm font-black text-black tabular-nums">
                        {score}%
                    </span>
                </div>
            )}
            <div className="h-1.5 w-full bg-neutral-100 rounded-full overflow-hidden">
                <div
                    className={`h-full transition-all duration-1000 ease-out fill-mode-forwards ${getColor()}`}
                    style={{ width: `${score}%` }}
                />
            </div>
        </div>
    );
}
