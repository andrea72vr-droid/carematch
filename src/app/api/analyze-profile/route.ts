import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase Admin client to bypass RLS when updating profiles if needed,
// or use the user's session.
// Ideally, we use the user's session to respect RLS.
// BUT, Next.js API routes with Supabase usually require a server client.

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || "");

export async function POST(req: NextRequest) {
    try {
        const { role, profile_id } = await req.json();

        if (!role || !profile_id) {
            return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
        }

        // 1. Fetch Profile Data
        // We need to create a Supabase client.
        // For simplicity in this MVP, we assume the API key is server-side and valid.
        // We'll use the service role key if available for updates, OR regular client.
        // Let's use the standard client with env vars (which might be anon).
        // If RLS is set to "Users can update own profile", we need the user's auth context.
        // So we should strictly pass the access token from the request headers to Supabase.

        // For this MVP step, let's create a client using the ANON key, 
        // but typically we'd need the user's session.
        // A simpler way for this demo: use the SERVICE_ROLE key if available in env, 
        // or just rely on the fact that we might be running locally.

        // Wait, the user only provided ANON key in .env.local.
        // If I use createClient(url, anon_key), I can't update data unless I have the user's session.
        // So I need to forward the auth header.

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

        // Create a client that inherits the user's JWT
        const authHeader = req.headers.get('Authorization');
        const supabase = createClient(supabaseUrl, supabaseAnonKey, {
            global: { headers: { Authorization: authHeader || '' } },
        });

        const table = role === "disabled" ? "disabled_profiles" : "caregiver_profiles";

        const { data: profile, error: fetchError } = await supabase
            .from(table)
            .select("*")
            .eq("id", profile_id)
            .single();

        if (fetchError || !profile) {
            return NextResponse.json({ error: "Profile not found or permission denied" }, { status: 404 });
        }

        // 2. Prepare Prompt
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        let prompt = "";
        if (role === "disabled") {
            prompt = `
        Analizza questo profilo STRUTTURATO di una persona con disabilità che cerca un assistente/badante.
        I dati sono forniti in formato JSON per ogni sezione.

        Dati Strutturati:
        - Info Persona (Età, Condizioni, Autonomia): ${JSON.stringify(profile.raw_contexto_vita)}
        - Bisogni quotidiani (Mobilità, Igiene, Farmaci, ecc.): ${JSON.stringify(profile.raw_bisogni_assistenziali)}
        - Aspetti Relazionali (Personalità, Comunicazione): ${JSON.stringify(profile.raw_stile_relazionale)}
        - Logistica (Impegno, Notte, Convivenza): ${JSON.stringify(profile.raw_ritmo_quotidiano)}
        - Preferenze Caregiver: ${JSON.stringify(profile.raw_valori_convivenza)}

        Genera un'analisi umana ed empatica focalizzata sulla compatibilità relazionale.
        Genera un JSON con questi campi:
        {
          "ai_stile_comunicativo": "Breve descrizione dello stile comunicativo preferito (es. Diretto, Caldo, Discreto)",
          "ai_bisogno_struttura": "Basso/Medio/Alto con breve spiegazione basata sulle necessità quotidiane",
          "ai_tolleranza_conflitto": "Bassa/Media/Alta con spiegazione basata sulla personalità",
          "ai_ritmo_vita": "Descrizione del ritmo (Lento/Attivo/Variabile) basata sulla logistica e bisogni",
          "ai_livello_empatia_richiesta": "Descrizione del tipo di supporto emotivo e umano desiderato",
          "ai_profile_summary": "Un riassunto discorsivo di 3 righe, molto umano ed empatico, che cattura l'essenza della persona e di chi cerca. Evita termini tecnici."
        }
        Rispondi SOLO con il JSON valido.
      `;
        } else {
            prompt = `
        Analizza questo profilo di un caregiver/badante.
        Dati grezzi:
        - Esperienza: ${JSON.stringify(profile.raw_competenze_esperienze)}
        - Approccio: ${JSON.stringify(profile.raw_approccio_cura)}
        - Stile Relazionale: ${JSON.stringify(profile.raw_stile_relazionale)}
        - Stress: ${JSON.stringify(profile.raw_gestione_stress)}
        - Valori: ${JSON.stringify(profile.raw_valori_personali)}
        - Disponibilità: ${JSON.stringify(profile.raw_disponibilita)}

        Genera un JSON con questi campi:
        {
          "ai_stile_comunicativo": "Descrizione dello stile comunicativo",
          "ai_bisogno_struttura": "Preferenza per ambienti strutturati o flessibili",
          "ai_tolleranza_conflitto": "Capacità di gestire conflitti",
          "ai_ritmo_vita": "Ritmo di lavoro preferito",
          "ai_livello_empatia_offerta": "Tipo di empatia (Pratica/Emotiva/Distaccata)",
          "ai_profile_summary": "Un riassunto discorsivo di 3 righe che descrive il professionista e il suo stile umano e professionale."
        }
        Rispondi SOLO con il JSON valido.
      `;
        }

        // 3. Generate Content
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Clean code fences if present
        const cleanedText = text.replace(/```json/g, "").replace(/```/g, "").trim();
        const analysis = JSON.parse(cleanedText);

        // 4. Update Profile
        // 4. Update Profile (only if we have an ID)
        if (profile_id) {
            const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
            const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
            const authHeader = req.headers.get('Authorization');
            const supabase = createClient(supabaseUrl, supabaseAnonKey, {
                global: { headers: { Authorization: authHeader || '' } },
            });

            const table = role === "disabled" ? "disabled_profiles" : "caregiver_profiles";

            const { error: updateError } = await supabase
                .from(table)
                .update(analysis)
                .eq("id", profile_id);

            if (updateError) {
                console.error("Update error", updateError);
            }
        }

        return NextResponse.json({ success: true, analysis });

    } catch (err: any) {
        console.error("API Error", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
