"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowserClient } from "@/lib/supabaseClient";
import { SpotlightCard } from "@/components/ui/SpotlightCard";

export default function EntityDashboard() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [entity, setEntity] = useState<any>(null);
    const [needs, setNeeds] = useState<any[]>([]);

    useEffect(() => {
        async function fetchDashboardData() {
            const supabase = supabaseBrowserClient();
            const { data: { session } } = await supabase.auth.getSession();

            if (!session) {
                router.push("/login");
                return;
            }

            // Fetch entity profile
            const { data: entityData } = await supabase
                .from("entities")
                .select("*")
                .eq("user_id", session.user.id)
                .single();

            if (!entityData) {
                // Se non ha un profilo entità, forse deve finire l'onboarding
                router.push("/onboarding");
                return;
            }

            setEntity(entityData);

            // Fetch territorial needs
            const { data: needsData } = await supabase
                .from("territorial_needs")
                .select("*")
                .eq("entity_id", entityData.id)
                .order("created_at", { ascending: false });

            setNeeds(needsData || []);
            setLoading(false);
        }

        fetchDashboardData();
    }, [router]);

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FAFAFA] text-black p-8">
            <header className="max-w-7xl mx-auto mb-12 flex justify-between items-end">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-mono bg-black text-white px-2 py-0.5 rounded uppercase">Partner Hub</span>
                        <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest">{entity.territory_focus}</span>
                    </div>
                    <h1 className="text-4xl font-black tracking-tight uppercase">{entity.name}</h1>
                </div>
                <button className="bg-black text-white px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-neutral-800 transition-all shadow-lg shadow-black/10">
                    + Registra Nuovo Bisogno
                </button>
            </header>

            <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Statistics Column */}
                <div className="lg:col-span-1 space-y-6">
                    <SpotlightCard className="p-6 border-neutral-200 bg-white">
                        <h3 className="text-[10px] font-black uppercase text-neutral-400 mb-6 tracking-widest">Stato Coordinamento</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-end">
                                <span className="text-xs font-bold text-neutral-500 uppercase">Bisogni Attivi</span>
                                <span className="text-2xl font-black">{needs.filter(n => n.status === 'active').length}</span>
                            </div>
                            <div className="h-1 w-full bg-neutral-100 rounded-full">
                                <div className="h-full bg-black w-[40%]"></div>
                            </div>
                            <div className="flex justify-between items-end">
                                <span className="text-xs font-bold text-neutral-500 uppercase">Impatto Sociale</span>
                                <span className="text-2xl font-black text-emerald-500">High</span>
                            </div>
                        </div>
                    </SpotlightCard>

                    <div className="p-6 rounded-2xl border border-dashed border-neutral-200">
                        <h4 className="text-[10px] font-bold uppercase text-neutral-400 mb-4">Focus Territoriale</h4>
                        <p className="text-sm font-medium leading-relaxed">{entity.description || "Nessuna descrizione fornita."}</p>
                    </div>
                </div>

                {/* Needs List Column */}
                <div className="lg:col-span-2 space-y-6">
                    <h2 className="text-sm font-black uppercase tracking-widest text-neutral-400 flex items-center gap-2">
                        Bisogni Rappresentati <span className="w-1.5 h-1.5 bg-neutral-200 rounded-full"></span> {needs.length}
                    </h2>

                    {needs.length === 0 ? (
                        <div className="bg-white border border-neutral-200 rounded-3xl p-12 text-center">
                            <p className="text-xs text-neutral-400 font-medium uppercase tracking-widest">Nessun bisogno registrato in questo territorio.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {needs.map((need) => (
                                <SpotlightCard key={need.id} className="p-6 border-neutral-200 bg-white hover:border-black transition-colors cursor-pointer group">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <span className={`text-[9px] font-mono px-2 py-0.5 rounded uppercase ${need.priority_level === 'critical' ? 'bg-red-100 text-red-600' : 'bg-neutral-100 text-neutral-500'
                                                }`}>
                                                {need.priority_level || 'Normal Priority'}
                                            </span>
                                            <h3 className="text-lg font-bold mt-2 group-hover:underline">{need.title}</h3>
                                        </div>
                                        <span className="text-[10px] font-mono text-neutral-300">
                                            {new Date(need.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className="text-xs text-neutral-500 line-clamp-2 leading-relaxed">
                                        {need.raw_description}
                                    </p>
                                </SpotlightCard>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
