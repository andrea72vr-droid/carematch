"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowserClient } from "@/lib/supabaseClient";
import { SpotlightCard } from "@/components/ui/SpotlightCard";

type Role = "disabled" | "caregiver" | "supervisor" | null;

export default function DashboardRouter() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<Role>(null);
  const [savingRole, setSavingRole] = useState(false);

  useEffect(() => {
    async function checkRole() {
      const isDemo = document.cookie.includes("demo_mode=true");
      if (isDemo) {
        const demoRoleMatch = document.cookie.match(/demo_role=([^;]+)/);
        const demoRole = (demoRoleMatch ? demoRoleMatch[1] : "supervisor") as Role;
        const target = demoRole === "supervisor" ? "admin" : demoRole;
        setRole(demoRole);
        router.push(`/dashboard/${target}`);
        return;
      }

      const supabase = supabaseBrowserClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .maybeSingle();

      if (profile?.role) {
        const r = profile.role as Role;
        const target = r === "supervisor" ? "admin" : r;
        router.push(`/dashboard/${target}`);
      } else {
        setLoading(false);
      }
    }
    checkRole();
  }, [router]);

  async function handleChooseRole(nextRole: Role) {
    if (!nextRole) return;
    setSavingRole(true);
    try {
      const isDemo = document.cookie.includes("demo_mode=true");
      if (!isDemo) {
        const supabase = supabaseBrowserClient();
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          await supabase.from("profiles").upsert(
            { id: session.user.id, role: nextRole },
            { onConflict: "id" }
          );
        }
      }
      const target = nextRole === "supervisor" ? "admin" : nextRole;
      router.push(`/dashboard/${target}`);
    } catch (err) {
      console.error(err);
    } finally {
      setSavingRole(false);
    }
  }

  if (loading || savingRole) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
        <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Reindirizzamento...</p>
      </div>
    );
  }

  return (
    <div className="p-8 lg:p-12 space-y-12 max-w-6xl mx-auto">
      <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="mb-10 text-center md:text-left">
          <span className="px-2 py-1 text-[9px] font-bold tracking-widest uppercase bg-black text-white rounded-full">Benvenuto</span>
          <h2 className="text-4xl font-black text-black mt-6 tracking-tighter mb-4">Configura il tuo <span className="text-neutral-400 italic font-serif">accesso.</span></h2>
          <p className="text-sm text-neutral-500 max-w-xl">
            Per offrirti la migliore esperienza su CareMatch, abbiamo bisogno di sapere chi sei. Seleziona il tuo ruolo per accedere alla tua area dedicata.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { id: "disabled", title: "Assistito", desc: "Cerco assistenza per me o un caro.", icon: "👵" },
            { id: "caregiver", title: "Badante", desc: "Offro competenze e professionalità.", icon: "🩺" },
            { id: "supervisor", title: "Amministratore", desc: "Gestione e monitoraggio sistema.", icon: "🗝️" },
          ].map((r) => (
            <button
              key={r.id}
              onClick={() => handleChooseRole(r.id as Role)}
              className="text-left group relative"
            >
              <SpotlightCard className="p-8 h-full border-neutral-200 hover:border-black transition-all duration-500">
                <div className="flex flex-col h-full">
                  <div className="text-3xl mb-6 grayscale group-hover:grayscale-0 transition-all duration-500">{r.icon}</div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-neutral-400 group-hover:text-black transition-colors">{r.title}</h3>
                  <p className="text-[10px] text-neutral-400 mt-2 font-mono uppercase leading-relaxed">{r.desc}</p>

                  <div className="mt-8 flex items-center gap-2 text-black font-bold text-[9px] opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0">
                    SELEZIONA <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
                  </div>
                </div>
              </SpotlightCard>
            </button>
          ))}
        </div>
      </section>

      <footer className="pt-20 border-t border-neutral-100 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-[10px] font-bold">CM</div>
          <p className="text-[10px] text-neutral-400 font-medium tracking-tight">© 2024 CareMatch OS. Tutti i diritti riservati.</p>
        </div>
        <div className="flex gap-8">
          <a href="#" className="text-[10px] font-bold text-neutral-300 hover:text-black transition-colors uppercase tracking-widest">Supporto</a>
          <a href="#" className="text-[10px] font-bold text-neutral-300 hover:text-black transition-colors uppercase tracking-widest">Privacy</a>
        </div>
      </footer>
    </div>
  );
}
