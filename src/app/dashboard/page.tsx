"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabaseBrowserClient } from "@/lib/supabaseClient";

type Role = "disabled" | "caregiver" | "supervisor" | null;

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState<string | null>(null);
  const [role, setRole] = useState<Role>(null);
  const [savingRole, setSavingRole] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      try {
        const supabase = supabaseBrowserClient();

        const { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData.session) {
          setLoading(false);
          return;
        }

        const user = sessionData.session.user;
        setEmail(user.email ?? null);

        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .maybeSingle();

        if (profile?.role) {
          setRole(profile.role as Role);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  async function handleChooseRole(nextRole: Role) {
    if (!nextRole) return;
    setSavingRole(true);
    try {
      const supabase = supabaseBrowserClient();
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData.session?.user;
      if (!user) return;

      const { error } = await supabase.from("profiles").upsert(
        {
          id: user.id,
          role: nextRole
        },
        { onConflict: "id" }
      );

      if (error) {
        console.error(error);
        return;
      }

      setRole(nextRole);
    } finally {
      setSavingRole(false);
    }
  }

  async function handleLogout() {
    const supabase = supabaseBrowserClient();
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  if (loading) {
    return (
      <main className="flex flex-1 items-center justify-center text-sm text-slate-100">
        <p>Carico le tue informazioni…</p>
      </main>
    );
  }

  return (
    <main className="flex flex-1 flex-col gap-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-brand-100">
            Benvenuto su Carematch
          </h1>
          {email ? (
            <p className="mt-2 text-sm text-slate-200">
              Sei collegato come <span className="font-medium">{email}</span>.
            </p>
          ) : (
            <p className="mt-2 text-sm text-slate-200">
              Per provare davvero i flussi fai prima{" "}
              <Link
                href="/login"
                className="underline underline-offset-4 text-brand-300"
              >
                login con link magico
              </Link>
              .
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="text-xs text-slate-300 underline underline-offset-4"
          >
            Torna alla landing
          </Link>
          {email && (
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-100 hover:border-slate-500"
            >
              Esci
            </button>
          )}
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <button
          type="button"
          onClick={() => handleChooseRole("disabled")}
          disabled={!email || savingRole}
          className={`rounded-xl border p-4 text-left text-sm transition ${
            role === "disabled"
              ? "border-brand-400 bg-brand-500/10"
              : "border-slate-800 bg-slate-900/60 hover:border-slate-700"
          } ${!email ? "opacity-60 cursor-not-allowed" : ""}`}
        >
          <h2 className="text-base font-medium text-brand-100">
            Sono una persona che cerca assistenza
          </h2>
          <p className="mt-2 text-slate-200">
            Compilo il mio profilo quotidiano e vedo alcune proposte di
            badanti.
          </p>
        </button>

        <button
          type="button"
          onClick={() => handleChooseRole("caregiver")}
          disabled={!email || savingRole}
          className={`rounded-xl border p-4 text-left text-sm transition ${
            role === "caregiver"
              ? "border-brand-400 bg-brand-500/10"
              : "border-slate-800 bg-slate-900/60 hover:border-slate-700"
          } ${!email ? "opacity-60 cursor-not-allowed" : ""}`}
        >
          <h2 className="text-base font-medium text-brand-100">
            Sono una badante / caregiver
          </h2>
          <p className="mt-2 text-slate-200">
            Creo il mio profilo di cura e vedo persone che potrebbero essere in
            linea con il mio modo di lavorare.
          </p>
        </button>

        <button
          type="button"
          onClick={() => handleChooseRole("supervisor")}
          disabled={!email || savingRole}
          className={`rounded-xl border p-4 text-left text-sm transition ${
            role === "supervisor"
              ? "border-brand-400 bg-brand-500/10"
              : "border-slate-800 bg-slate-900/60 hover:border-slate-700"
          } ${!email ? "opacity-60 cursor-not-allowed" : ""}`}
        >
          <h2 className="text-base font-medium text-brand-100">
            Sono un supervisore
          </h2>
          <p className="mt-2 text-slate-200">
            Vedo i match proposti, le spiegazioni dell&apos;IA e posso
            modificarli.
          </p>
        </button>
      </section>

      {role && (
        <section className="mt-2 rounded-xl border border-slate-800 bg-slate-900/70 p-4 text-sm text-slate-100">
          {role === "disabled" && (
            <>
              <h2 className="text-base font-semibold text-brand-100">
                Flusso: persona che cerca assistenza
              </h2>
              <p className="mt-2">
                Nella versione completa qui vedrai un modulo a step per raccontare
                la tua giornata, i tuoi bisogni concreti e il tipo di relazione che
                desideri. Alla fine, l&apos;IA creerà un profilo relazionale in
                linguaggio semplice.
              </p>
              <p className="mt-2">
                Poi potrai aprire una pagina con alcune proposte di badanti, con{" "}
                <strong>spiegazioni chiare</strong> dei motivi, dei punti di forza
                e delle possibili fatiche.
              </p>
            </>
          )}

          {role === "caregiver" && (
            <>
              <h2 className="text-base font-semibold text-brand-100">
                Flusso: badante / caregiver
              </h2>
              <p className="mt-2">
                Qui compilerai un modulo sul tuo modo di lavorare, sulle esperienze
                che hai già fatto e su come gestisci le situazioni di stress.
              </p>
              <p className="mt-2">
                L&apos;IA userà queste informazioni per capire il tuo{" "}
                <strong>stile relazionale</strong> e proporre persone con cui
                costruire un rapporto sostenibile nel tempo.
              </p>
            </>
          )}

          {role === "supervisor" && (
            <>
              <h2 className="text-base font-semibold text-brand-100">
                Flusso: supervisore
              </h2>
              <p className="mt-2">
                In questa sezione vedrai una lista di match suggeriti dal motore
                ibrido (regole + IA) con per ognuno: spiegazione, punti di forza,
                possibili criticità e suggerimenti pratici.
              </p>
              <p className="mt-2">
                Potrai <strong>accettare, modificare o rifiutare</strong> i match,
                e consultare i feedback raccolti dopo le prime settimane.
              </p>
            </>
          )}
        </section>
      )}
    </main>
  );
}

