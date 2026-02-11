"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Role = "disabled" | "caregiver" | "supervisor" | null;

interface SidebarProps {
    role: Role;
    email: string | null;
    onLogout: () => void;
    children?: React.ReactNode;
}

export function Sidebar({ role, email, onLogout, children }: SidebarProps) {
    const pathname = usePathname();

    const menuItems = {
        admin: [
            { label: "Dashboard", href: "/dashboard/admin", icon: "📊" },
            { label: "Utenti", href: "/dashboard/admin/users", icon: "👥" },
            { label: "Database", href: "/dashboard/admin/database", icon: "🗄️" },
            { label: "Log Match", href: "/dashboard/admin/logs", icon: "📝" },
        ],
        caregiver: [
            { label: "Il Mio Profilo", href: "/dashboard/caregiver", icon: "👤" },
            { label: "Match Trovati", href: "/dashboard/matches", icon: "🤝" },
            { label: "Preferenze", href: "/dashboard/profile/caregiver", icon: "⚙️" },
        ],
        disabled: [
            { label: "Panoramica", href: "/dashboard/disabled", icon: "🏠" },
            { label: "Trova Badante", href: "/dashboard/matches", icon: "🔍" },
            { label: "Mio Profilo", href: "/dashboard/profile/disabled", icon: "📝" },
        ],
    };

    const currentRoleKey = role === "supervisor" ? "admin" : role as keyof typeof menuItems;
    const currentMenu = role ? menuItems[currentRoleKey] || [] : [];

    return (
        <aside className="fixed w-64 h-screen border-r border-neutral-200 bg-neutral-50 z-40 hidden md:flex flex-col">
            <div className="p-6 border-b border-neutral-100">
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-black rounded-[2px]" />
                    <span className="text-sm font-bold tracking-tight text-black">Carematch OS</span>
                </div>
            </div>

            <nav className="flex-1 overflow-y-auto p-4 space-y-8">
                <div>
                    <h4 className="px-3 text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-3 font-mono">
                        {role ? `Area ${currentRoleKey}` : "Menu"}
                    </h4>
                    <ul className="space-y-1">
                        {currentMenu.map((item) => (
                            <li key={item.href}>
                                <Link
                                    href={item.href}
                                    className={`flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-lg transition-all ${pathname === item.href
                                        ? "bg-black text-white shadow-sm"
                                        : "text-neutral-500 hover:text-black hover:bg-neutral-100"
                                        }`}
                                >
                                    <span className="text-sm">{item.icon}</span>
                                    {item.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                {role && (
                    <div className="pt-4 border-t border-neutral-100">
                        <h4 className="px-3 text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-3 font-mono">Sistema</h4>
                        <Link href="/dashboard" className="flex items-center gap-3 px-3 py-1.5 text-[10px] font-bold text-neutral-400 hover:text-black transition-colors uppercase">
                            ⚙️ Impostazioni
                        </Link>
                    </div>
                )}
                {children}
            </nav>

            <div className="p-4 border-t border-neutral-100">
                <button
                    onClick={onLogout}
                    className="w-full flex items-center gap-3 p-3 hover:bg-neutral-100 rounded-xl transition-all group"
                >
                    <div className="w-8 h-8 rounded-full bg-neutral-200 flex items-center justify-center text-neutral-500 group-hover:bg-black group-hover:text-white transition-all">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                            <polyline points="16 17 21 12 16 7" />
                            <line x1="21" y1="12" x2="9" y2="12" />
                        </svg>
                    </div>
                    <div className="text-left">
                        <p className="text-[10px] font-bold text-neutral-900 uppercase tracking-tight">Esci</p>
                        <p className="text-[9px] text-neutral-400 font-mono truncate max-w-[120px]">{email}</p>
                    </div>
                </button>
            </div>
        </aside>
    );
}
