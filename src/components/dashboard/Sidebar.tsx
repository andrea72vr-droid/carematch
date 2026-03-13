"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

type Role = "disabile" | "disabled" | "badante" | "caregiver" | "admin" | "supervisor" | "associazione" | null;

interface SidebarProps {
    role: Role;
    email: string | null;
    onLogout: () => void;
    children?: React.ReactNode;
}

export function Sidebar({ role, email, onLogout, children }: SidebarProps) {
    const pathname = usePathname();

    // Normalizzazione ruolo per il menu
    const getMenuRole = (r: Role): "admin" | "caregiver" | "disabled" | "association" | null => {
        if (!r) return null;
        if (r === "admin" || r === "supervisor") return "admin";
        if (r === "badante" || r === "caregiver") return "caregiver";
        if (r === "disabile" || r === "disabled") return "disabled";
        if (r === "associazione") return "association";
        return null;
    };

    const menuRole = getMenuRole(role);

    const menuItems = {
        admin: [
            { label: "Control Tower", href: "/dashboard/admin", icon: "🗝️" },
            { label: "Utenti & Profili", href: "/dashboard/admin/users", icon: "👥" },
            { label: "Monitoraggio Match", href: "/dashboard/admin/logs", icon: "📊" },
            { label: "Configurazione Sistema", href: "/dashboard/admin/database", icon: "⚙️" },
        ],
        caregiver: [
            { label: "Mio Profilo", href: "/dashboard/caregiver", icon: "👤" },
            { label: "Opportunità Match", href: "/dashboard/matches", icon: "✨" },
            { label: "Compilazione Dati", href: "/dashboard/profile/caregiver", icon: "📝" },
            { label: "Certificazioni", href: "/dashboard/caregiver#cert", icon: "📜" },
        ],
        disabled: [
            { label: "Panoramica", href: "/dashboard/disabled", icon: "🏠" },
            { label: "Ricerca Caregiver", href: "/dashboard/matches", icon: "🔍" },
            { label: "Aggiorna Bisogni", href: "/dashboard/profile/disabled", icon: "✍️" },
            { label: "Rappresentanza", href: "/dashboard/rappresentanza", icon: "🏛️" },
        ],
        association: [
            { label: "Hub Associazione", href: "/dashboard/associazione", icon: "🤝" },
            { label: "Audit Territoriale", href: "/dashboard/associazione", icon: "📡" },
            { label: "Nuova Rappresentanza", href: "/dashboard/associazione/rappresentanza", icon: "📜" },
            { label: "Dialogo Istituzionale", href: "/dashboard/associazione", icon: "🏛️" },
        ],
    };

    const currentMenu = menuRole ? menuItems[menuRole] || [] : [];

    return (
        <aside className="fixed w-64 h-screen border-r border-neutral-200 bg-white/80 backdrop-blur-xl z-40 hidden md:flex flex-col">
            {/* Header / Logo */}
            <div className="p-8">
                <Link href="/dashboard" className="flex items-center gap-3 group">
                    <div className="w-8 h-8 bg-black rounded-xl flex items-center justify-center text-white shadow-lg shadow-black/10 group-hover:scale-105 transition-transform duration-500">
                        <span className="text-xs font-black italic">C</span>
                    </div>
                    <div>
                        <span className="text-xs font-black tracking-tighter text-black block leading-none">CareMatch</span>
                        <span className="text-[8px] font-bold text-neutral-400 uppercase tracking-widest leading-none mt-1 block">Ecosystem OS</span>
                    </div>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto px-4 py-2">
                <div className="space-y-8">
                    {/* Role-based Menu */}
                    <div>
                        <div className="flex items-center justify-between px-4 mb-4">
                            <h4 className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] font-mono">
                                Area {menuRole || "Sistema"}
                            </h4>
                            {menuRole === 'admin' && <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />}
                        </div>
                        <ul className="space-y-1">
                            {currentMenu.map((item) => {
                                const isActive = pathname === item.href;
                                return (
                                    <li key={item.href}>
                                        <Link
                                            href={item.href}
                                            className={`group flex items-center gap-3 px-4 py-2.5 text-[11px] font-bold uppercase tracking-tight rounded-xl transition-all duration-300 ${isActive
                                                ? "bg-black text-white shadow-xl shadow-black/5"
                                                : "text-neutral-500 hover:text-black hover:bg-neutral-50"
                                                }`}
                                        >
                                            <span className={`text-base transition-transform group-hover:scale-110 ${isActive ? 'grayscale-0' : 'grayscale group-hover:grayscale-0'}`}>
                                                {item.icon}
                                            </span>
                                            {item.label}
                                            {isActive && (
                                                <motion.div
                                                    layoutId="active-pill"
                                                    className="ml-auto w-1 h-1 bg-white rounded-full"
                                                />
                                            )}
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>

                    {/* Secondary Navigation */}
                    <div className="pt-6 border-t border-neutral-100">
                        <h4 className="px-4 text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] font-mono mb-4">Utilità</h4>
                        <ul className="space-y-1">
                            <li>
                                <Link href="/dashboard" className="flex items-center gap-3 px-4 py-2 text-[10px] font-bold text-neutral-400 hover:text-black transition-all uppercase tracking-widest">
                                    <span>⚙️</span> Impostazioni Account
                                </Link>
                            </li>
                            <li>
                                <Link href="#" className="flex items-center gap-3 px-4 py-2 text-[10px] font-bold text-neutral-400 hover:text-black transition-all uppercase tracking-widest">
                                    <span>❓</span> Centro Assistenza
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>
                {children}
            </nav>

            {/* Footer / User Profile */}
            <div className="p-4 border-t border-neutral-100">
                <button
                    onClick={onLogout}
                    className="w-full flex items-center gap-4 p-3 bg-neutral-50 hover:bg-black group rounded-2xl transition-all duration-500"
                >
                    <div className="w-10 h-10 rounded-xl bg-white border border-neutral-200 flex items-center justify-center text-neutral-500 group-hover:bg-neutral-900 group-hover:border-neutral-800 group-hover:text-white shadow-sm transition-all">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                            <polyline points="16 17 21 12 16 7" />
                            <line x1="21" y1="12" x2="9" y2="12" />
                        </svg>
                    </div>
                    <div className="text-left overflow-hidden">
                        <p className="text-[10px] font-black text-black group-hover:text-white uppercase tracking-tighter whitespace-nowrap">Logout</p>
                        <p className="text-[9px] text-neutral-400 font-mono truncate w-full group-hover:text-neutral-500 transition-colors uppercase">{email?.split('@')[0]}</p>
                    </div>
                </button>
            </div>
        </aside>
    );
}

