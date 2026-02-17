import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

/**
 * Analizza un bisogno territoriale espresso da un'associazione/ente.
 * L'obiettivo è estrarre informazioni strategiche per la progettazione territoriale.
 */
export async function analyzeTerritorialNeed(title: string, description: string) {
    const prompt = `
    Sei un esperto di analisi delle politiche sociali e progettazione territoriale. 
    Ricevi una segnalazione di un "bisogno di cura" da parte di un'associazione o ente territoriale.
    
    TITOLO: ${title}
    DESCRIZIONE: ${description}
    
    Analizza questo bisogno e restituisci un oggetto JSON con questi campi:
    1. category: (string) una categoria tecnica del bisogno (es: Disabilità Motoria, Supporto Familiare, Barriere Architettoniche)
    2. impact_assessment: (string) una breve valutazione dell'impatto sociale se questo bisogno venisse soddisfatto.
    3. strategic_advice: (string) un suggerimento per un possibile bando istituzionale o progetto di rete.
    4. keywords: (string[]) lista di 3-5 parole chiave tecniche.
    5. priority_score: (number 1-10) quanto è urgente intervenire in una scala da 1 a 10.
    
    Restituisci SOLO il JSON puro, senza commenti o markdown.
    `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        return JSON.parse(text.replace(/```json|```/g, ""));
    } catch (error) {
        console.error("Errore analisi AI:", error);
        return {
            category: "Da classificare",
            impact_assessment: "Valutazione non disponibile al momento.",
            strategic_advice: "Si consiglia una revisione manuale dell'operatore.",
            keywords: [],
            priority_score: 5
        };
    }
}
