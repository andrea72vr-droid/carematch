import Link from "next/link";
import { ProfileMarquee } from "@/components/home/ProfileMarquee";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white flex flex-col items-center">
      <div className="noise-bg" />

      {/* Header / Nav */}
      <header className="w-full border-b border-neutral-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-black rounded-[2px]" />
            <span className="text-sm font-bold tracking-tight text-black">Carematch OS</span>
            <span className="text-[10px] bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded text-blue-600 font-mono">v2.0 - Ecosystem</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/login" className="text-xs font-medium text-neutral-500 hover:text-black transition-colors">
              Rappresentanza
            </Link>
            <Link href="/login" className="px-4 py-1.5 bg-black text-white text-xs font-semibold rounded-md hover:bg-neutral-800 transition-all shadow-sm">
              Area Riservata
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="w-full max-w-5xl px-6 pt-24 pb-20 text-center animate-fade-in relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full technical-grid opacity-[0.4] z-[-1]" />

        <div className="inline-flex items-center gap-2 px-3 py-1 mb-10 text-[10px] font-mono uppercase tracking-widest text-blue-600 bg-blue-50 border border-blue-100 rounded-full">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping-slow absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
          </span>
          Evoluzione Ecosistema attiva
        </div>

        <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-black leading-[1.05] mb-8">
          Dai bisogni alla <br />
          <span className="text-blue-600 italic font-serif">Rappresentanza.</span>
        </h1>

        <p className="text-sm md:text-base text-neutral-500 max-w-2xl mx-auto mb-12 leading-relaxed">
          CareMatch evolve: oltre il matching caregiver, diventiamo la piattaforma di coordinamento territoriale per dare voce ai bisogni di cura e collegarli alle risposte di Associazioni e Istituzioni.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up">
          <Link
            href="/login"
            className="px-10 py-4 bg-black text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-full hover:bg-blue-600 transition-all shadow-xl shadow-black/10"
          >
            Esplora Ecosistema
          </Link>
          <p className="text-[10px] font-mono text-neutral-400 uppercase tracking-tighter">
            Un progetto sociale condiviso • v2.0
          </p>
        </div>
      </section>

      {/* Scrolling Profiles Section */}
      <section className="w-full bg-neutral-50/50 border-y border-neutral-100 py-10">
        <ProfileMarquee
          title="Bisogni Espressi nel Territorio"
          direction="left"
          speed={60}
          profiles={[
            { id: "b1", name: "Trasporto Legnago", role: "disabled", label: "Mobilità Ridotta" },
            { id: "b2", name: "Assistenza Notturna", role: "disabled", label: "Carenza Servizi VR" },
            { id: "b3", name: "Supporto Burocratico", role: "disabled", label: "Inclusione" },
            { id: "b4", name: "Barriere Architettoniche", role: "disabled", label: "Segnalazione FISH" },
          ]}
        />
      </section>

      {/* Features Grid */}
      <section className="w-full max-w-6xl px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 border border-neutral-200 rounded-2xl bg-white/50">
            <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center mb-6 text-blue-600">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
            </div>
            <h3 className="text-xs font-black text-black mb-3 uppercase tracking-widest">Rappresentanza</h3>
            <p className="text-[11px] text-neutral-400 leading-relaxed uppercase tracking-tighter font-mono">
              Non più solo richieste individuali, ma espressione collettiva di bisogni per influenzare la progettazione sociale.
            </p>
          </div>

          <div className="p-8 border border-neutral-200 rounded-2xl bg-white/50 group">
            <div className="w-10 h-10 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center mb-6 shadow-sm transition-transform group-hover:scale-110 text-white">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20m10-10H2" /><circle cx="12" cy="12" r="10" /></svg>
            </div>
            <h3 className="text-xs font-black text-black mb-3 uppercase tracking-widest">Validazione Enti</h3>
            <p className="text-[11px] text-neutral-400 leading-relaxed uppercase tracking-tighter font-mono">
              I bisogni vengono validati dalle Associazioni di categoria (FISH, Consulte) per garantire risposte reali e istituzionali.
            </p>
          </div>

          <div className="p-8 border border-neutral-200 rounded-2xl bg-white/50">
            <div className="w-10 h-10 rounded-lg bg-neutral-50 border border-neutral-100 flex items-center justify-center mb-6 text-black">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10.5V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h8.5" /><path d="m16 2 5 5" /><path d="m21 2-5 5" /></svg>
            </div>
            <h3 className="text-xs font-black text-black mb-3 uppercase tracking-widest">Dati per Sociale</h3>
            <p className="text-[11px] text-neutral-400 leading-relaxed uppercase tracking-tighter font-mono">
              Generiamo dati aggregati utili per il dialogo con le istituzioni e la programmazione dei servizi comunali.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full border-t border-neutral-100 bg-neutral-50 mt-auto py-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-mono text-neutral-500 uppercase">Carematch Ecosystem Framework © 2026</span>
            <span className="w-1 h-1 bg-neutral-200 rounded-full" />
            <span className="text-[10px] font-mono text-neutral-500 uppercase">Impatto Territoriale</span>
          </div>
          <div className="flex gap-6">
            <Link href="#" className="text-[10px] font-mono text-neutral-500 hover:text-black uppercase">Github</Link>
            <Link href="#" className="text-[10px] font-mono text-neutral-500 hover:text-black uppercase">Roadmap</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
