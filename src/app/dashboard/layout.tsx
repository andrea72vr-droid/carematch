"use client";

import { useEffect, useState, ReactNode } from "react";
import { supabaseBrowserClient } from "@/lib/supabaseClient";
import { Sidebar } from "@/components/dashboard/Sidebar";

type Role = "disabile" | "disabled" | "badante" | "caregiver" | "admin" | "supervisor" | "associazione" | null;

export default function DashboardLayout({ children }: { children: ReactNode }) {
    const [loading, setLoading] = useState(true);
    const [email, setEmail] = useState<string | null>(null);
    const [role, setRole] = useState<Role>(null);

    useEffect(() => {
        async function loadAuth() {
            try {
                const supabase = supabaseBrowserClient();
                const { data: { user }, error: authError } = await supabase.auth.getUser();
                const isDemo = document.cookie.includes("demo_mode=true");

                if (user) {
                    setEmail(user.email ?? null);
                    
                    const { data: profile, error: profileError } = await supabase
                        .from("profiles")
                        .select("role")
                        .eq("user_id", user.id)
                        .maybeSingle();

                    if (profileError) throw profileError;
                    if (profile) {
                        setRole(profile.role as Role);
                    }
                } else if (isDemo) {
                    const demoRoleMatch = document.cookie.match(/demo_role=([^;]+)/);
                    const demoRole = (demoRoleMatch ? demoRoleMatch[1] : "admin") as Role;

                    const roleLabel = demoRole === "admin" || demoRole === "supervisor" ? "Admin"
                        : demoRole === "badante" || demoRole === "caregiver" ? "Caregiver"
                        : demoRole === "associazione" ? "Associazione"
                        : "Assistito";

                    setEmail(`${roleLabel} Demo`);
                    setRole(demoRole);
                } else {
                    window.location.href = "/login";
                    return;
                }
            } catch (err) {
                console.error("DashboardLayout Error:", err);
            } finally {
                setLoading(false);
            }
        }

        loadAuth();
    }, []);

    const handleLogout = async () => {
        document.cookie = "demo_mode=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        const supabase = supabaseBrowserClient();
        await supabase.auth.signOut();
        window.location.href = "/";
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-white">
                <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
                <p className="mt-4 text-[10px] font-black uppercase tracking-widest text-neutral-400">Inizializzazione Ecosistema...</p>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-neutral-50 selection:bg-black selection:text-white">
            <Sidebar role={role} email={email} onLogout={handleLogout} />
            <div className="flex-1 md:ml-64 relative min-h-screen">
                <main className="animate-in fade-in duration-700">
                    {children}
                </main>
            </div>
        </div>
    );
}

