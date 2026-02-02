import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col justify-center gap-10">
      <section>
        <h1 className="text-4xl font-semibold tracking-tight text-brand-200">
          Carematch
        </h1>
        <p className="mt-4 max-w-xl text-base text-slate-200">
          Una piccola app pensata per aiutare{" "}
          <strong>persone con disabilità</strong> e{" "}
          <strong>badanti</strong> a incontrarsi in modo più sereno, grazie a
          un mediatore relazionale basato su IA, sempre supervisionato da un
          operatore umano.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <h2 className="text-lg font-medium text-brand-100">
            Per chi cerca assistenza
          </h2>
          <p className="mt-2 text-sm text-slate-200">
            Compila un modulo semplice, centrato sulla tua vita quotidiana, non
            sulle etichette cliniche.
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <h2 className="text-lg font-medium text-brand-100">
            Per chi offre cura
          </h2>
          <p className="mt-2 text-sm text-slate-200">
            Racconta il tuo modo di lavorare, le esperienze passate e il tuo
            stile relazionale.
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <h2 className="text-lg font-medium text-brand-100">
            Supervisione umana
          </h2>
          <p className="mt-2 text-sm text-slate-200">
            Ogni proposta di abbinamento è spiegata in modo chiaro e può essere
            sempre rivista da un operatore.
          </p>
        </div>
      </section>

      <section className="flex flex-wrap gap-4">
        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center rounded-full bg-brand-500 px-5 py-2 text-sm font-medium text-white shadow hover:bg-brand-400"
        >
          Entra nell&apos;app di prova
        </Link>
        <span className="text-xs text-slate-300">
          (per ora è solo una demo, senza login reale)
        </span>
      </section>
    </main>
  );
}

