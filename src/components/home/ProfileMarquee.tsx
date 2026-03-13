"use client";

import React from "react";

interface Profile {
    id: string;
    name: string;
    role: string;
    label: string;
    avatar?: string;
}

interface ProfileMarqueeProps {
    profiles: Profile[];
    direction?: "left" | "right";
    speed?: number;
    title: string;
}

export function ProfileMarquee({ profiles, direction = "left", speed = 40, title }: ProfileMarqueeProps) {
    // Duplicate profiles to create a seamless infinite scroll
    const doubledProfiles = [...profiles, ...profiles, ...profiles];

    return (
        <div className="w-full py-10 overflow-hidden relative">
            <div className="mb-6 px-6 max-w-7xl mx-auto flex justify-between items-end">
                <h3 className="text-[10px] font-bold text-neutral-400 uppercase tracking-[0.2em] font-mono">
                    {title}
                </h3>
                <div className="h-px flex-1 bg-neutral-100 ml-6 mb-1.5" />
            </div>

            <div className="relative flex overflow-x-hidden">
                <div
                    className={`flex animate-marquee gap-6 whitespace-nowrap py-4 ${direction === "right" ? "direction-reverse" : ""}`}
                    style={{ animationDuration: `${speed}s` }}
                >
                    {doubledProfiles.map((profile, idx) => (
                        <div
                            key={`${profile.id}-${idx}`}
                            className="inline-flex items-center gap-4 px-6 py-4 bg-white border border-neutral-100 rounded-2xl shadow-sm hover:border-black transition-all hover:scale-[1.02] group cursor-default"
                        >
                            <div className="w-12 h-12 rounded-xl bg-neutral-50 border border-neutral-100 flex items-center justify-center text-xl group-hover:bg-black group-hover:text-white transition-colors">
                                {profile.role === "caregiver" ? "🩺" : "👵"}
                            </div>
                            <div className="text-left">
                                <p className="text-[11px] font-black text-black uppercase tracking-tight">{profile.name}</p>
                                <p className="text-[9px] text-neutral-400 font-bold uppercase tracking-widest">{profile.label}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <style jsx>{`
                @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-33.33%); }
                }
                .animate-marquee {
                    animation: marquee linear infinite;
                }
                .direction-reverse {
                    animation-direction: reverse;
                }
            `}</style>
        </div>
    );
}
