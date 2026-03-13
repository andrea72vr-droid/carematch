"use client";

import React from "react";

interface ToggleProps {
    label: string;
    description?: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
    className?: string;
}

export function Toggle({
    label,
    description,
    checked,
    onChange,
    className = "",
}: ToggleProps) {
    return (
        <div className={`flex items-start justify-between gap-4 p-4 rounded-2xl border border-neutral-100 bg-neutral-50/30 transition-colors hover:bg-neutral-50 ${className}`}>
            <div className="flex-1">
                <h4 className="text-sm font-semibold text-neutral-900">{label}</h4>
                {description && (
                    <p className="text-xs text-neutral-400 mt-0.5">{description}</p>
                )}
            </div>
            <button
                type="button"
                role="switch"
                aria-checked={checked}
                onClick={() => onChange(!checked)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 ${checked ? "bg-black" : "bg-neutral-200"
                    }`}
            >
                <span
                    aria-hidden="true"
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${checked ? "translate-x-5" : "translate-x-0"
                        }`}
                />
            </button>
        </div>
    );
}
