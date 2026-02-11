"use client";

import React, { useRef, useState, useEffect } from "react";

interface SpotlightCardProps {
    children: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
    gridOpacity?: number;
}

export const SpotlightCard: React.FC<SpotlightCardProps> = ({
    children,
    className = "",
    style = {},
    gridOpacity = 0.04
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState({ x: -1000, y: -1000 });
    const [opacity, setOpacity] = useState(0);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        setPosition({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        });
    };

    const handleMouseEnter = () => setOpacity(1);
    const handleMouseLeave = () => setOpacity(0);

    return (
        <div
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            style={style}
            className={`relative overflow-hidden border border-neutral-200 bg-white shadow-sm rounded-2xl ${className}`}
        >
            {/* Grid Pattern - Light */}
            <div
                className="absolute inset-0 pointer-events-none opacity-[0.4]"
                style={{
                    backgroundImage: `linear-gradient(to right, #f5f5f5 1px, transparent 1px), linear-gradient(to bottom, #f5f5f5 1px, transparent 1px)`,
                    backgroundSize: '40px 40px'
                }}
            />

            {/* Spotlight Effect - Light */}
            {opacity > 0 && (
                <div
                    className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-500"
                    style={{
                        opacity,
                        background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(0, 0, 0, 0.03), transparent 40%)`,
                    }}
                />
            )}

            <div className="relative z-10 h-full w-full">
                {children}
            </div>
        </div>
    );
};
