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
    <main className="flex flex-1 flex-col items-center justify-center text-sm text-slate-100">
      {status === "checking" && (
        <p>Stiamo verificando il tuo accesso, attendi un attimo…</p>
      )}
      {status === "error" && (
        <p>
          Non siamo riusciti a completare l&apos;accesso. Torna alla{" "}
          <a href="/login" className="underline underline-offset-4">
            pagina di login
          </a>{" "}
          e richiedi un nuovo link.
        </p>
      )}
    </main>
  );
}

