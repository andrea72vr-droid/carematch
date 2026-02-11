"use client";

import React from "react";

interface MultiSelectProps {
    options: { id: string; label: string }[];
    selected: string[];
    onChange: (selected: string[]) => void;
    className?: string;
}

export function MultiSelect({
    options,
    selected,
    onChange,
    className = "",
}: MultiSelectProps) {
    const toggleOption = (id: string) => {
        if (selected.includes(id)) {
            onChange(selected.filter((s) => s !== id));
        } else {
            onChange([...selected, id]);
        }
    };

    return (
        <div className={`flex flex-wrap gap-2 ${className}`}>
            {options.map((option) => {
                const isSelected = selected.includes(option.id);
                return (
                    <button
                        key={option.id}
                        type="button"
                        onClick={() => toggleOption(option.id)}
                        className={`px-4 py-2 text-xs font-semibold rounded-full border transition-all duration-200 ${isSelected
                                ? "bg-black text-white border-black shadow-sm"
                                : "bg-white text-neutral-500 border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50"
                            }`}
                    >
                        {option.label}
                    </button>
                );
            })}
        </div>
    );
}
