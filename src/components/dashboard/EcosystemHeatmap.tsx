"use client";

import { motion } from "framer-motion";

interface NeedPoint {
    id: string;
    x: number;
    y: number;
    intensity: number; // 0-1
    label: string;
    category: string;
}

interface EcosystemHeatmapProps {
    points: NeedPoint[];
}

export function EcosystemHeatmap({ points }: EcosystemHeatmapProps) {
    return (
        <div className="relative w-full aspect-[16/9] bg-neutral-950 rounded-3xl overflow-hidden border border-neutral-800 shadow-2xl">
            {/* Abstract Territorial Grid */}
            <div className="absolute inset-0 opacity-20 technical-grid scale-150" />
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_50%_50%,#3b82f6,transparent_70%)]" />

            {/* Labels Layer */}
            <div className="absolute top-6 left-8 flex flex-col gap-1 z-20">
                <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em]">Live Ecosystem Map</span>
                <span className="text-[8px] font-mono text-neutral-500 uppercase tracking-widest italic">Visualizing territorial needs density</span>
            </div>

            {/* Simulated Map Outline (Abstract SVG) */}
            <svg className="absolute inset-0 w-full h-full opacity-30" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path
                    d="M10,20 Q30,5 50,20 T90,30 T80,70 T40,90 T10,60 Z"
                    fill="none"
                    stroke="white"
                    strokeWidth="0.1"
                    strokeDasharray="1 2"
                />
            </svg>

            {/* Interaction Points */}
            {points.map((point) => (
                <motion.div
                    key={point.id}
                    className="absolute group z-10"
                    style={{ left: `${point.x}%`, top: `${point.y}%` }}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: Math.random() * 0.5 }}
                >
                    {/* Pulsing Aura */}
                    <motion.div
                        className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full blur-xl pointer-events-none ${point.intensity > 0.7 ? 'bg-red-500' : point.intensity > 0.4 ? 'bg-blue-500' : 'bg-emerald-500'
                            }`}
                        animate={{
                            scale: [1, 1.5, 1],
                            opacity: [0.1, 0.3, 0.1]
                        }}
                        transition={{
                            duration: 3 + Math.random() * 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        style={{ width: `${30 + point.intensity * 100}px`, height: `${30 + point.intensity * 100}px` }}
                    />

                    {/* Core Point */}
                    <div className={`relative -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full border-2 border-white shadow-lg transition-all duration-300 group-hover:scale-150 ${point.intensity > 0.7 ? 'bg-red-500' : point.intensity > 0.4 ? 'bg-blue-500' : 'bg-emerald-500'
                        }`} />

                    {/* Tooltip on Hover */}
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
                        <div className="bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-xl whitespace-nowrap">
                            <p className="text-[10px] font-black text-white uppercase tracking-tight">{point.label}</p>
                            <p className="text-[8px] font-bold text-neutral-400 uppercase tracking-widest mt-0.5">{point.category}</p>
                        </div>
                    </div>
                </motion.div>
            ))}

            {/* Bottom Legend */}
            <div className="absolute bottom-6 right-8 flex gap-6 z-20">
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                    <span className="text-[8px] font-black text-neutral-400 uppercase tracking-widest">Urgenza Critica</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                    <span className="text-[8px] font-black text-neutral-400 uppercase tracking-widest">Monitoraggio</span>
                </div>
            </div>
        </div>
    );
}
