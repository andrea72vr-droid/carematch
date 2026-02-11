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
            <span className="text-[10px] bg-neutral-50 border border-neutral-200 px-1.5 py-0.5 rounded text-neutral-400 font-mono">v1.2</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/login" className="text-xs font-medium text-neutral-500 hover:text-black transition-colors">
              Documentazione
            </Link>
            <Link href="/login" className="px-4 py-1.5 bg-black text-white text-xs font-semibold rounded-md hover:bg-neutral-800 transition-all shadow-sm">
              Accedi
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="w-full max-w-5xl px-6 pt-24 pb-20 text-center animate-fade-in relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full technical-grid opacity-[0.4] z-[-1]" />

        <div className="inline-flex items-center gap-2 px-3 py-1 mb-10 text-[10px] font-mono uppercase tracking-widest text-neutral-500 bg-neutral-50 border border-neutral-200 rounded-full">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping-slow absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          Ricerca di supporto umano attiva
        </div>

        <h1 className="text-5xl md:text-7xl font-semibold tracking-tighter text-black leading-[1.1] mb-8">
          L&apos;assistenza che <br />
          <span className="text-neutral-400 italic">mette al centro la persona.</span>
        </h1>

        <p className="text-sm md:text-base text-neutral-400 max-w-2xl mx-auto mb-12 leading-relaxed">
          Un percorso guidato che unisce l&apos;empatia umana alla precisione del matching intelligente per creare legami stabili e duraturi tra caregiver e famiglie.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up">
          <Link
            href="/login"
            className="shiny-button px-8 py-3 text-sm font-semibold text-black rounded-full min-w-[200px]"
          >
            Esplora Dashboard
          </Link>
          <p className="text-[10px] font-mono text-neutral-500 uppercase tracking-tighter">
            Un percorso verso la cura • Inizia ora
          </p>
        </div>
      </section>

      {/* Scrolling Profiles Section */}
      <section className="w-full bg-neutral-50/50 border-y border-neutral-100 py-10">
        <ProfileMarquee
          title="Caregiver nella tua zona"
          direction="left"
          speed={60}
          profiles={[
            { id: "c1", name: "Elena R.", role: "caregiver", label: "Specialista Alzheimer" },
            { id: "c2", name: "Marco V.", role: "caregiver", label: "Infermiere Certificato" },
            { id: "c3", name: "Giulia M.", role: "caregiver", label: "Assistente Domiciliare" },
            { id: "c4", name: "Roberto P.", role: "caregiver", label: "Fisioterapista" },
            { id: "c5", name: "Sara L.", role: "caregiver", label: "Supporto Psicologico" },
          ]}
        />
        <ProfileMarquee
          title="Famiglie che cercano supporto"
          direction="right"
          speed={70}
          profiles={[
            { id: "d1", name: "Famiglia Bianchi", role: "disabled", label: "Supporto Notturno" },
            { id: "d2", name: "Giorgio K.", role: "disabled", label: "Compagnia & Pasti" },
            { id: "d3", name: "Maria Rosa", role: "disabled", label: "Assistenza Post-Operatoria" },
            { id: "d4", name: "Famiglia Verdi", role: "disabled", label: "Weekend Part-time" },
            { id: "d5", name: "Antonio S.", role: "disabled", label: "Trasporto Medico" },
          ]}
        />
      </section>

      {/* Features Grid */}
      <section className="w-full max-w-6xl px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 border border-neutral-200 rounded-2xl bg-white/50">
            <div className="w-10 h-10 rounded-lg bg-neutral-50 border border-neutral-100 flex items-center justify-center mb-6">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
            </div>
            <h3 className="text-sm font-semibold text-black mb-3 uppercase tracking-tight">Modulistica Life-Centered</h3>
            <p className="text-xs text-neutral-400 leading-relaxed uppercase tracking-tighter font-medium">
              Focus sui ritmi di vita e sui valori. Al centro ci sei tu, con i tuoi bisogni e i tuoi desideri.
            </p>
          </div>

          <div className="p-8 border border-neutral-200 rounded-2xl bg-white/50 group">
            <div className="w-10 h-10 rounded-lg bg-white border border-neutral-200 flex items-center justify-center mb-6 shadow-sm transition-transform group-hover:scale-110">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1.5"><path d="M12 2v20m10-10H2" /><circle cx="12" cy="12" r="10" /></svg>
            </div>
            <h3 className="text-sm font-semibold text-black mb-3 uppercase tracking-tight">Motore Hybrid IA</h3>
            <p className="text-xs text-neutral-400 leading-relaxed uppercase tracking-tighter font-medium">
              Utilizziamo l&apos;intelligenza artificiale per comprendere le sfumature della personalità e creare l&apos;abbinamento perfetto.
            </p>
          </div>

          <div className="p-8 border border-neutral-200 rounded-2xl bg-white/50">
            <div className="w-10 h-10 rounded-lg bg-neutral-50 border border-neutral-100 flex items-center justify-center mb-6">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
            </div>
            <h3 className="text-sm font-semibold text-black mb-3 uppercase tracking-tight">Validazione HEMS</h3>
            <p className="text-xs text-neutral-400 leading-relaxed uppercase tracking-tighter font-medium">
              Supervisione umana garantita. Qualità e sicurezza verificate da esperti del settore assistenziale.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full border-t border-neutral-100 bg-neutral-50 mt-auto py-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-mono text-neutral-500 uppercase">Carematch Framework © 2024</span>
            <span className="w-1 h-1 bg-neutral-200 rounded-full" />
            <span className="text-[10px] font-mono text-neutral-500 uppercase">Privacy Compliant</span>
          </div>
          <div className="flex gap-6">
            <Link href="#" className="text-[10px] font-mono text-neutral-500 hover:text-black uppercase">Github</Link>
            <Link href="#" className="text-[10px] font-mono text-neutral-500 hover:text-black uppercase">Changelog</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
