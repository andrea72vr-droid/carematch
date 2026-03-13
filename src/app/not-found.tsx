import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-950 text-white p-6 text-center">
            <h1 className="text-sm font-bold uppercase tracking-[0.3em] mb-2">404 - Percorso Non Trovato</h1>
            <p className="text-xs text-neutral-500 font-mono mb-8">
                L'indirizzo richiesto non fa parte della rete Carematch OS.
            </p>
            <Link
                href="/"
                className="px-8 py-2 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-full"
            >
                Torna alla Base
            </Link>
        </div>
    );
}
