# Carematch (MVP)

App Next.js 14 in TypeScript pensata come **mediatore relazionale** tra persone con disabilità e badanti.

## 🚀 Deploy su Vercel (consigliato)

**Vedi il file [VERCEL_SETUP.md](./VERCEL_SETUP.md) per istruzioni complete.**

In sintesi:
1. Crea un repository GitHub e fai push del codice.
2. Importa il progetto su Vercel.
3. Aggiungi le variabili d'ambiente (Supabase URL, chiavi, ecc.).
4. Configura Supabase con l'URL di Vercel.
5. Fai il deploy!

## 💻 Sviluppo locale (opzionale)

Se vuoi testare in locale prima di pubblicare:

1. Installa **Node.js** (versione LTS) da `https://nodejs.org`.
2. Copia `.env.local.example` in `.env.local` e inserisci le tue chiavi Supabase.
3. Installa le dipendenze:

   ```bash
   npm install
   ```

4. Avvia il server di sviluppo:

   ```bash
   npm run dev
   ```

5. Apri il browser su `http://localhost:3000`.

## 📋 Stato attuale

✅ **Completato:**
- Struttura Next.js 14 + TypeScript + Tailwind
- Schema database Supabase (tabelle, RLS)
- Login con magic link (Supabase Auth)
- Dashboard con selezione ruolo (disabled/caregiver/supervisor)

🔄 **In corso:**
- Moduli multi-step per profili (disabile / badante)

⏳ **Prossimi passi:**
- Integrazione Gemini per analisi profili
- Motore di matching ibrido (regole + similarità semantica)
- Dashboard supervisore
- Feedback loop e apprendimento

