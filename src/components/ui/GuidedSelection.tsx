"use client";

import React from "react";
import { SpotlightCard } from "./SpotlightCard";

interface Option {
    id: string;
    title: string;
    description?: string;
    icon?: React.ReactNode;
}

interface GuidedSelectionProps {
    options: Option[];
    value: string;
    onChange: (value: string) => void;
    className?: string;
}

export function GuidedSelection({
    options,
    value,
    onChange,
    className = "",
}: GuidedSelectionProps) {
    return (
        <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${className}`}>
            {options.map((option) => (
                <button
                    key={option.id}
                    type="button"
                    onClick={() => onChange(option.id)}
                    className="text-left group"
                >
                    <SpotlightCard
                        className={`transition-all duration-300 ${value === option.id
                                ? "border-black ring-1 ring-black shadow-md bg-white"
                                : "border-neutral-200 bg-neutral-50/50 hover:border-neutral-300"
                            }`}
                    >
                        <div className="p-6 relative z-10 flex items-start gap-4">
                            {option.icon && (
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${value === option.id ? "bg-black text-white" : "bg-white text-neutral-400 border border-neutral-100 shadow-sm"
                                    }`}>
                                    {option.icon}
                                </div>
                            )}
                            <div className="flex-1">
                                <h4 className={`text-sm font-semibold tracking-tight ${value === option.id ? "text-black" : "text-neutral-600"
                                    }`}>
                                    {option.title}
                                </h4>
                                {option.description && (
                                    <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                                        {option.description}
                                    </p>
                                )}
                            </div>
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center mt-0.5 transition-colors ${value === option.id ? "border-black bg-black" : "border-neutral-300 bg-white"
                                }`}>
                                {value === option.id && (
                                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                                )}
                            </div>
                        </div>
                    </SpotlightCard>
                </button>
            ))}
        </div>
    );
}
