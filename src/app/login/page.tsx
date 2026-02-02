"use client";

import { FormEvent, useState } from "react";
import { supabaseBrowserClient } from "@/lib/supabaseClient";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle"
  );
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setMessage(null);

    try {
      const supabase = supabaseBrowserClient();
      const origin =
        typeof window !== "undefined" ? window.location.origin : "";

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${origin}/auth/callback`
        }
      });

      if (error) {
        console.error(error);
        setStatus("error");
        setMessage(
          "Non siamo riusciti a inviare il link. Controlla l'email e riprova."
        );
        return;
      }

      setStatus("sent");
      setMessage(
        "Ti abbiamo inviato un link via email. Aprilo dallo stesso dispositivo per entrare."
      );
    } catch (err) {
      console.error(err);
      setStatus("error");
      setMessage("Qualcosa è andato storto. Riprova fra qualche minuto.");
    }
  }

  return (
    <main className="flex flex-1 flex-col justify-center">
      <div className="max-w-md rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
        <h1 className="text-2xl font-semibold text-brand-100">
          Accedi a Carematch
        </h1>
        <p className="mt-2 text-sm text-slate-200">
          Per questa demo usiamo un <strong>link magico via email</strong>.
          Niente password da ricordare.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-xs font-medium text-slate-200"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-50 outline-none ring-brand-500/50 focus:border-brand-400 focus:ring-2"
              placeholder="nome@esempio.it"
            />
          </div>

          <button
            type="submit"
            disabled={status === "sending" || !email}
            className="w-full rounded-full bg-brand-500 px-4 py-2 text-sm font-medium text-white shadow hover:bg-brand-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {status === "sending" ? "Invio in corso..." : "Mandami il link"}
          </button>
        </form>

        {message && (
          <p className="mt-4 text-xs text-slate-200">
            {message}
          </p>
        )}
      </div>
    </main>
  );
}

