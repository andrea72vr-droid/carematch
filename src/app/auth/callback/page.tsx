"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowserClient } from "@/lib/supabaseClient";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"checking" | "ok" | "error">("checking");

  useEffect(() => {
    async function handleAuth() {
      try {
        const supabase = supabaseBrowserClient();
        const { data, error } = await supabase.auth.getSession();

        if (error || !data.session) {
          setStatus("error");
          return;
        }

        setStatus("ok");
        router.replace("/dashboard");
      } catch (err) {
        console.error(err);
        setStatus("error");
      }
    }

    handleAuth();
  }, [router]);

  return (
    <main className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-700">
      <div className="w-12 h-12 bg-black rounded-2xl mb-8 flex items-center justify-center shadow-2xl shadow-black/10">
        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
      </div>

      {status === "checking" && (
        <div className="space-y-3">
          <h1 className="text-xl font-black tracking-tighter uppercase italic font-serif">Verifica in corso...</h1>
          <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">Stiamo stabilendo la tua sessione sicura</p>
        </div>
      )}

      {status === "error" && (
        <div className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-xl font-black tracking-tighter uppercase text-red-600">Errore di Accesso</h1>
            <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest max-w-[280px]">
              Non siamo riusciti a completare l&apos;autenticazione. La sessione potrebbe essere scaduta.
            </p>
          </div>
          <a
            href="/login"
            className="inline-block px-8 py-3 bg-black text-white text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-neutral-800 transition-all"
          >
            Torna al Login
          </a>
        </div>
      )}
    </main>
  );
}

