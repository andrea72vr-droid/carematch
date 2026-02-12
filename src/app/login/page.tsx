"use client";

import { FormEvent, useState } from "react";
import { supabaseBrowserClient } from "@/lib/supabaseClient";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

type AuthMode = "magic" | "login" | "register";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialMode = (searchParams.get("mode") as AuthMode) || "login";

  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [selectedRole, setSelectedRole] = useState<"disabile" | "badante">("disabile");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handlePasswordLogin(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const supabase = supabaseBrowserClient();
      const trimmedEmail = email.trim();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password,
      });

      if (error) throw error;
      if (data.session) router.push("/dashboard");
    } catch (err: any) {
      console.error(err);
      setMessage("Errore: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSignUp(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const supabase = supabaseBrowserClient();
      const trimmedEmail = email.trim();
      const { data, error } = await supabase.auth.signUp({
        email: trimmedEmail,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            role: selectedRole
          }
        }
      });
      if (error) throw error;

      if (data.session) {
        router.push("/dashboard");
      } else {
        setMessage("Registrazione completata. Se richiesto, conferma l'email per procedere.");
      }
    } catch (err: any) {
      console.error(err);
      setMessage("Errore: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-white flex items-center justify-center p-6 relative">
      <div className="absolute inset-0 bg-neutral-50 z-0" />

      <div className="w-full max-w-[400px] relative z-10 animate-slide-up">
        <div className="mb-10 text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-5 h-5 bg-black rounded-[2px]" />
            <span className="text-lg font-bold tracking-tight text-neutral-900">Carematch OS</span>
          </Link>
          <p className="text-xs font-medium text-neutral-500 uppercase tracking-widest font-mono">Authentication Gateway</p>
        </div>

        <div className="bg-white border border-neutral-200 p-8 rounded-2xl shadow-xl">
          <div className="flex p-1 bg-neutral-100 rounded-lg mb-8">
            <button
              onClick={() => setMode("login")}
              className={`flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all ${mode !== "register" ? "bg-white text-black shadow-sm" : "text-neutral-500 hover:text-neutral-700"}`}
            >
              Login
            </button>
            <button
              onClick={() => setMode("register")}
              className={`flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all ${mode === "register" ? "bg-white text-black shadow-sm" : "text-neutral-500 hover:text-neutral-700"}`}
            >
              Register
            </button>
          </div>

          <form onSubmit={mode === "register" ? handleSignUp : handlePasswordLogin} className="space-y-6">
            {mode === "register" && (
              <>
                <div className="space-y-4 mb-8 p-4 bg-neutral-50 rounded-xl border border-neutral-100">
                  <label className="text-[10px] font-bold uppercase text-neutral-500 font-mono tracking-widest block mb-4">Chi sei?</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedRole("disabile")}
                      className={`py-6 px-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${selectedRole === "disabile" ? "border-black bg-white shadow-md shadow-black/5" : "border-transparent bg-neutral-100 grayscale hover:grayscale-0"}`}
                    >
                      <span className="text-2xl">👵</span>
                      <span className="text-[9px] font-black uppercase tracking-widest">Assistito</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedRole("badante")}
                      className={`py-6 px-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${selectedRole === "badante" ? "border-black bg-white shadow-md shadow-black/5" : "border-transparent bg-neutral-100 grayscale hover:grayscale-0"}`}
                    >
                      <span className="text-2xl">👩‍⚕️</span>
                      <span className="text-[9px] font-black uppercase tracking-widest">Caregiver</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase text-neutral-500 font-mono tracking-widest">Nome</label>
                    <input
                      type="text"
                      required
                      placeholder="John"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-sm text-neutral-900 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase text-neutral-500 font-mono tracking-widest">Cognome</label>
                    <input
                      type="text"
                      required
                      placeholder="Doe"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-sm text-neutral-900 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
                    />
                  </div>
                </div>
              </>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-neutral-500 font-mono tracking-widest">Email Address</label>
              <input
                type="email"
                required
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-sm text-neutral-900 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-neutral-500 font-mono tracking-widest">Password</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-sm text-neutral-900 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full shiny-button py-3 text-xs font-bold text-black rounded-full transition-all"
            >
              {loading ? "PROCESSO IN CORSO..." : mode === "register" ? "CREA ACCOUNT" : "AUTENTICAZIONE"}
            </button>
          </form>


          <div className="relative flex items-center justify-center my-8">
            <div className="w-full h-px bg-neutral-200" />
            <span className="absolute px-4 text-[9px] font-bold tracking-[0.3em] text-neutral-400 uppercase bg-white">Dev Access</span>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <button
              type="button"
              onClick={() => {
                document.cookie = "demo_mode=true; path=/";
                document.cookie = "demo_role=supervisor; path=/";
                router.push("/dashboard");
              }}
              className="w-full py-3 text-[10px] font-bold text-amber-600 border border-amber-200 rounded-full hover:bg-amber-50 transition-all uppercase tracking-widest"
            >
              Demo Amministratore
            </button>
            <button
              type="button"
              onClick={() => {
                document.cookie = "demo_mode=true; path=/";
                document.cookie = "demo_role=disabled; path=/";
                router.push("/dashboard");
              }}
              className="w-full py-3 text-[10px] font-bold text-neutral-500 border border-neutral-200 rounded-full hover:bg-neutral-50 transition-all uppercase tracking-widest"
            >
              Demo Assistito/Famiglia
            </button>
            <button
              type="button"
              onClick={() => {
                document.cookie = "demo_mode=true; path=/";
                document.cookie = "demo_role=caregiver; path=/";
                router.push("/dashboard");
              }}
              className="w-full py-3 text-[10px] font-bold text-neutral-500 border border-neutral-200 rounded-full hover:bg-neutral-50 transition-all uppercase tracking-widest"
            >
              Demo Badante/Caregiver
            </button>
          </div>

          {message && (
            <div className={`mt-6 p-4 text-[11px] font-mono text-center border rounded-xl animate-in fade-in slide-in-from-top-2 duration-300 ${message.includes("not confirmed")
              ? "bg-amber-50 border-amber-200 text-amber-800"
              : "bg-neutral-50 border-neutral-200 text-neutral-600"
              }`}>
              {message.includes("not confirmed") ? (
                <div className="space-y-3 text-center">
                  <p className="font-bold uppercase tracking-tight">⚠️ Azione Richiesta</p>
                  <p>L'account è stato creato ma devi confermare l'email per accedere.</p>

                  <div className="flex flex-col gap-2 pt-2">
                    <button
                      onClick={() => {
                        document.cookie = "demo_mode=true; path=/";
                        document.cookie = "demo_role=supervisor; path=/";
                        window.location.href = "/dashboard";
                      }}
                      className="w-full py-2 bg-amber-200 text-amber-900 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-amber-300 transition-all shadow-sm"
                    >
                      Entra in Modalità Demo (Subito)
                    </button>
                  </div>

                  <div className="h-px bg-amber-200 my-2" />
                  <p className="text-[9px] leading-relaxed opacity-80 italic">
                    TIP: Puoi disabilitare la conferma email in <br />
                    <span className="font-bold">Authentication → Providers → Email</span> <br />
                    nella tua dashboard Supabase.
                  </p>
                </div>
              ) : (
                message
              )}
            </div>
          )}
        </div>

        <div className="mt-8 text-center flex flex-col gap-2">
          <button
            className="text-[10px] font-mono text-neutral-400 hover:text-neutral-900 uppercase tracking-tighter transition-colors"
          >
            Password dimenticata?
          </button>
          <Link href="/" className="text-[10px] font-mono text-neutral-400 hover:text-neutral-900 uppercase tracking-tighter transition-colors">
            ← Torna al sito principale
          </Link>
        </div>
      </div>
    </main >
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
