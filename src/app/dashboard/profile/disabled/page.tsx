"use client";

import { DisabledProfileForm } from "@/components/profile/DisabledProfileForm";
import Link from "next/link";

export default function DisabledProfilePage() {
    return (
        <main className="min-h-screen bg-white relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-neutral-50 via-white to-neutral-50 z-0" />

            <div className="relative z-10 max-w-4xl mx-auto px-6 py-12">
                <div className="mb-12 flex items-center justify-between">
                    <Link
                        href="/dashboard"
                        className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 hover:text-neutral-900 transition-colors font-mono"
                    >
                        ← Torna alla Dashboard
                    </Link>
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 font-mono">
                        Profilo Assistito
                    </span>
                </div>

                <DisabledProfileForm />
            </div>
        </main>
    );
}
