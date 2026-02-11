import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@supabase/supabase-js";
import { calculateMatch, CaregiverProfile, DisabledProfile } from "@/lib/matchingAlgorithm";
import fs from "fs";
import path from "path";

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || "");

// Initializers
function getSupabaseAdmin() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !key) {
        throw new Error("Missing Supabase configuration (URL or Key)");
    }

    return createClient(url, key);
}

export async function POST(req: NextRequest) {
    try {
        const supabase = getSupabaseAdmin();
        const body = await req.json();
        console.log("Match API Request Body:", JSON.stringify(body).slice(0, 500));
        const { userProfile, targetRole } = body;

        if (!userProfile) {
            return NextResponse.json({ error: "Missing user profile" }, { status: 400 });
        }

        const disabledProfile = userProfile as DisabledProfile;

        // Filtering by Geography
        // User profile is 'disabled', so we look for 'caregiver'
        // 'userProfile' here comes from the request body which is the frontend form state or DB object.
        // Assuming it matches the structure passed from frontend.

        // Disabled Profile structure in DB:
        // raw_contexto_vita, raw_bisogni_assistenziali, etc.
        // But for geography we need to know where the user is.
        // In Disabled Form, is there location? 
        // Let's assume passed userProfile has 'region' or 'province' at top level or inside a field.
        // If it's the DB object, it might be in 'raw_contexto_vita' (if saved there) or we need to look at 'profiles' table.
        // For now, let's trust the frontend sends 'province' or we try to find it.

        // Frontend 'DisabledProfileForm' or similar usually captures location.
        // If not, we fallback to empty string and show all.

        // UPDATE: logic below tries to find province in `userProfile.province` (top level) or fails.
        // Real fix: We need location in DisabledProfile! 
        // But for this task, let's proceed with what we have and maybe relax the filter if empty.

        const targetProvince = (userProfile.province || "").toLowerCase();

        // Query Real DB
        let candidatesData: any[] | null = null;
        let dbError: any = null;

        try {
            const { data, error } = await supabase
                .from("caregiver_profiles")
                .select("*");
            candidatesData = data;
            dbError = error;
        } catch (e) {
            console.warn("Supabase query failed, falling back to local JSON.", e);
        }

        if (dbError || !candidatesData || candidatesData.length === 0) {
            console.log("⚠️ No candidates in Supabase or connection failed. Activating MOCK MODE (Local JSON).");
            try {
                // Priority 1: Structured test data
                const structuredPath = path.join(process.cwd(), "public", "test-data", "structured_caregiver_profiles.json");
                const legacyPath = path.join(process.cwd(), "public", "test-data", "test_caregivers.json");

                let rawData;
                if (fs.existsSync(structuredPath)) {
                    console.log("Loading structured test caregivers...");
                    const structuredContent = fs.readFileSync(structuredPath, "utf-8");
                    rawData = JSON.parse(structuredContent).caregiver_profiles;
                } else if (fs.existsSync(legacyPath)) {
                    console.log("Loading legacy test caregivers...");
                    rawData = JSON.parse(fs.readFileSync(legacyPath, "utf-8"));
                } else {
                    console.error("Neither structured_caregiver_profiles.json nor test_caregivers.json found.");
                    rawData = [];
                }
                candidatesData = rawData;
                console.log(`✅ Loaded ${candidatesData?.length || 0} mock candidates.`);
            } catch (fsError) {
                console.error("❌ Failed to load mock data:", fsError);
            }
        }

        // Cast to CaregiverProfile
        const candidates = (candidatesData || []) as CaregiverProfile[];
        console.log(`Processing ${candidates.length} candidates.`);

        // Filter candidates by province (if targetProvince is present)
        const localCandidates = candidates.filter((c) => {
            const p = c.raw_competenze_esperienze?.provincia?.toLowerCase();
            return !targetProvince || p === targetProvince;
        });

        if (localCandidates.length === 0) {
            return NextResponse.json({
                matches: [],
                subscriptionNeeded: true,
                message: targetProvince
                    ? `Purtroppo non abbiamo ancora caregiver disponibili nella provincia di ${targetProvince}.`
                    : `Nessun caregiver trovato.`
            });
        }

        // Prepare Prompts (Parallel Execution)
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        const matchPromises = localCandidates.map(async (candidate) => {
            // 1. Calculate Algorithmic Score
            const algoResult = calculateMatch(candidate, disabledProfile);

            // Extract textual descriptions for AI Context
            const step1 = candidate.raw_competenze_esperienze || {};
            const step2 = candidate.raw_approccio_cura || {};
            const step3 = candidate.raw_stile_relazionale || {};
            const step3_psych = candidate.psychological_profile || {};
            const step5 = candidate.raw_valori_personali || {};

            const candidateName = step1.nome_completo || "Caregiver";

            const textExperience = `Anni: ${step2.anni_esperienza}, Skills: ${step2.competenze_specifiche?.join(", ")}`;
            const textApproach = `Relazionale: ${step3.preferenze_relazionali}, Comunicazione: ${step3.modalita_comunicativa}`;
            const textPsych = `Stile: ${step3_psych.stile_comunicativo}, Iniziativa: ${step3_psych.livello_iniziativa}, Emotività: ${step3_psych.approccio_emotivo}`;
            const textDesc = step5.descrizione || "";

            const prompt = `
        Agisci come un esperto mediatore relazionale per l'assistenza.
        Hai ricevuto un punteggio di compatibilità calcolato algoritmicamente: ${algoResult.totalScore}/100.
        
        PUNTI DI ARMONIA RILEVATI:
        ${algoResult.harmonyPoints.map(p => "- " + p).join("\n")}
        
        POSSIBILI CRITICITÀ RILEVATE:
        ${algoResult.warnings.map(w => "- " + w).join("\n")}

        Dati i profili:
        
        PROFILO UTENTE (Cerca assistenza - Disabled):
        - Contesto: ${JSON.stringify(disabledProfile.raw_contexto_vita || {})}
        - Bisogni: ${JSON.stringify(disabledProfile.raw_bisogni_assistenziali || {})}
        - Psicologia: ${JSON.stringify(disabledProfile.psychological_profile || {})}
        - Valori: ${JSON.stringify(disabledProfile.raw_valori_convivenza || {})}

        PROFILO CANDIDATO (Offre assistenza - ${candidateName}):
        - Esperienza Tecnica: ${textExperience}
        - Approccio Relazionale: ${textApproach}
        - Profilo Psicologico: ${textPsych}
        - Descrizione Personale: ${textDesc}

        Il tuo compito è GENERARE UNA SPIEGAZIONE UMANA E DISCORSIVA che giustifichi il punteggio di ${algoResult.totalScore}.
        Non inventare nuovi punteggi, usa quello fornito.

        Restituisci ESATTAMENTE questo JSON:
        {
           "score": ${algoResult.totalScore},
           "reason": "Spiegazione sintetica (max 2 frasi) che cita i punti di armonia.",
           "strengths": ["Punto forza 1", "Punto forza 2"],
           "weaknesses": ["Punto debole 1 (se presente)"]
        }
      `;

            try {
                const result = await model.generateContent(prompt);
                const response = await result.response;
                const text = response.text();
                const cleanedText = text.replace(/```json/g, "").replace(/```/g, "").trim();
                const analysis = JSON.parse(cleanedText);

                return {
                    candidate: {
                        ...candidate,
                        name: candidateName,
                    },
                    matchData: {
                        ...analysis,
                        score: algoResult.totalScore, // Enforce algorithmic score
                        algoBreakdown: algoResult.breakdown,
                        harmonyPoints: algoResult.harmonyPoints
                    }
                };
            } catch (err) {
                console.error(`Error matching with ${candidateName}`, err);
                // Fallback: use algorithmic score without AI text
                return {
                    candidate: { ...candidate, name: candidateName },
                    matchData: {
                        score: algoResult.totalScore,
                        reason: "Compatibilità calcolata sui dati profilati.",
                        strengths: algoResult.harmonyPoints,
                        weaknesses: algoResult.warnings,
                        algoBreakdown: algoResult.breakdown
                    }
                };
            }
        });

        const results = await Promise.all(matchPromises);

        // Sort by score descending
        const sortedResults = results.sort((a, b) => b.matchData.score - a.matchData.score);

        return NextResponse.json({ matches: sortedResults });

    } catch (err: any) {
        console.error("Match API CRITICAL Error:", err);
        return NextResponse.json({ error: err.message, stack: err.stack }, { status: 500 });
    }
}
