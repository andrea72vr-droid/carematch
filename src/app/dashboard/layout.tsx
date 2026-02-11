"use client";

import { useEffect, useState, ReactNode } from "react";
import { supabaseBrowserClient } from "@/lib/supabaseClient";
import { Sidebar } from "@/components/dashboard/Sidebar";

type Role = "disabled" | "caregiver" | "supervisor" | null;

export default function DashboardLayout({ children }: { children: ReactNode }) {
    const [loading, setLoading] = useState(true);
    const [email, setEmail] = useState<string | null>(null);
    const [role, setRole] = useState<Role>(null);

    useEffect(() => {
        async function loadAuth() {
            try {
                const isDemo = document.cookie.includes("demo_mode=true");
                if (isDemo) {
                    const demoRoleMatch = document.cookie.match(/demo_role=([^;]+)/);
                    const demoRole = (demoRoleMatch ? demoRoleMatch[1] : "supervisor") as Role;

                    const roleLabel = demoRole === "supervisor" ? "Admin"
                        : demoRole === "caregiver" ? "Caregiver"
                            : "Assistito";

                    setEmail(`Utente Demo (${roleLabel})`);
                    setRole(demoRole);
                    setLoading(false);
                    return;
                }

                const supabase = supabaseBrowserClient();
                const { data: { session } } = await supabase.auth.getSession();

                if (!session) {
                    window.location.href = "/";
                    return;
                }

                setEmail(session.user.email ?? null);

                const { data: profile } = await supabase
                    .from("profiles")
                    .select("role")
                    .eq("id", session.user.id)
                    .maybeSingle();

                if (profile) {
                    setRole(profile.role as Role);
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
            <div className="flex items-center justify-center min-h-screen bg-black">
                <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-neutral-50 selection:bg-black selection:text-white">
            <Sidebar role={role} email={email} onLogout={handleLogout} />
            <div className="flex-1 md:ml-64 relative min-h-screen">
                {children}
            </div>
        </div>
    );
}
