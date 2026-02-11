'use client';

import { useEffect } from 'react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('Runtime Error:', error);
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-950 text-white p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-6">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
            </div>
            <h1 className="text-sm font-bold uppercase tracking-[0.3em] mb-2">Sistema in Errore</h1>
            <p className="text-xs text-neutral-500 font-mono mb-8 max-w-md italic">
                {error.message || 'Si è verificato un errore critico nel kernel di Carematch OS.'}
            </p>
            <button
                onClick={() => reset()}
                className="px-8 py-2 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-neutral-200 transition-all"
            >
                Reset Nucleo
            </button>
        </div>
    );
}
