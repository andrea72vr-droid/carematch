"use client";

import { FormEvent, useState } from "react";
import { supabaseBrowserClient } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Provider } from "@supabase/supabase-js";

type AuthMode = "magic" | "login" | "register";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [role, setRole] = useState<string>("disabile");

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

  async function handleOAuthLogin(provider: Provider) {
    setLoading(true);
    setMessage(null);
    try {
      const supabase = supabaseBrowserClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback?role=${role}`,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      console.error(err);
      setMessage("Errore: " + err.message);
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
            full_name: `${firstName} ${lastName}`.trim(),
            role: role
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
            <div className="w-5 h-5 bg-red-600 rounded-[2px]" />
            <span className="text-lg font-bold tracking-tight text-neutral-900">Carematch OS [LIVE]</span>
          </Link>
          <p className="text-xs font-medium text-neutral-500 uppercase tracking-widest font-mono">Authentication Gateway v3.0</p>
          {!process.env.NEXT_PUBLIC_SUPABASE_URL && (
            <p className="text-[10px] text-red-600 font-bold uppercase mt-2">⚠️ ENV MISSING ON VERCEL</p>
          )}
        </div>

        <div className="bg-white border border-neutral-200 p-8 rounded-2xl shadow-xl">
          {/* Pulsanti Social in alto per debug */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              onClick={() => handleOAuthLogin('google')}
              disabled={loading}
              className="flex items-center justify-center gap-2 py-3 px-4 border-2 border-red-200 rounded-xl hover:bg-neutral-50 transition-all bg-red-50/10 group"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-800">GOOGLE LOGIN</span>
            </button>
            <button
              onClick={() => handleOAuthLogin('github')}
              disabled={loading}
              className="flex items-center justify-center gap-2 py-3 px-4 border-2 border-neutral-200 rounded-xl hover:bg-neutral-50 transition-all group"
            >
              <svg className="w-4 h-4 text-neutral-900" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.167 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.27.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482C19.138 20.161 22 16.418 22 12c0-5.523-4.477-10-10-10z" clipRule="evenodd" />
              </svg>
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-800">GITHUB LOGIN</span>
            </button>
          </div>

          <div className="flex p-1 bg-neutral-100 rounded-lg mb-6">
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

          <div className="mb-8 space-y-3">
            <label className="text-[10px] font-bold uppercase text-neutral-400 font-mono tracking-widest pl-1">Seleziona il tuo ruolo</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'disabile', label: 'Persona', icon: '👤' },
                { id: 'badante', label: 'Caregiver', icon: '🩺' },
                { id: 'associazione', label: 'Ente', icon: '🏛️' }
              ].map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setRole(r.id)}
                  className={`py-3 px-2 rounded-xl border text-center transition-all ${role === r.id ? 'bg-black border-black text-white shadow-lg shadow-black/10' : 'bg-neutral-50 border-neutral-100 text-neutral-400 hover:border-neutral-200'}`}
                >
                  <div className="text-sm mb-1">{r.icon}</div>
                  <div className="text-[9px] font-black uppercase tracking-tighter">{r.label}</div>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={mode === "register" ? handleSignUp : handlePasswordLogin} className="space-y-6">
            {mode === "register" && (
              <>
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
                document.cookie = "demo_role=admin; path=/";
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
                document.cookie = "demo_role=disabile; path=/";
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
                document.cookie = "demo_role=badante; path=/";
                router.push("/dashboard");
              }}
              className="w-full py-3 text-[10px] font-bold text-neutral-500 border border-neutral-200 rounded-full hover:bg-neutral-50 transition-all uppercase tracking-widest"
            >
              Demo Badante/Caregiver
            </button>
            <button
              type="button"
              onClick={() => {
                document.cookie = "demo_mode=true; path=/";
                document.cookie = "demo_role=associazione; path=/";
                router.push("/dashboard");
              }}
              className="w-full py-3 text-[10px] font-bold text-blue-600 border border-blue-200 rounded-full bg-blue-50/50 hover:bg-blue-50 transition-all uppercase tracking-widest"
            >
              Demo Associazione/Enti
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
                        document.cookie = "demo_role=admin; path=/";
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
