import { NextResponse } from "next/server";
import { analyzeTerritorialNeed } from "@/lib/territorialAnalysis";
import { supabaseBrowserClient } from "@/lib/supabaseClient";

export async function POST(req: Request) {
    try {
        const { id, title, text } = await req.json();

        if (!id || !text) {
            return NextResponse.json({ error: "Missing ID or text" }, { status: 400 });
        }

        const analysis = await analyzeTerritorialNeed(title || "Segnalazione", text);

        // Opzionale: salva l'analisi nel campo metadata del bisogno
        // Per ora la restituiamo solo al frontend per la visualizzazione live

        return NextResponse.json({ analysis });

    } catch (error) {
        console.error("Analysis error:", error);
        return NextResponse.json({ error: "Failed to analyze need" }, { status: 500 });
    }
}
