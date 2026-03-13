# Setup Vercel per Carematch

Guida passo-passo per deployare l'app su Vercel invece di localhost.

## Passo 1: Crea il repository GitHub

1. Vai su **GitHub.com** e crea un nuovo repository (es. `carematch`).
2. Nel terminale della cartella `carematch`, esegui:

```bash
git init
git add .
git commit -m "chore: initial commit - Carematch MVP"
git branch -M main
git remote add origin https://github.com/TUO-USERNAME/carematch.git
git push -u origin main
```

(Sostituisci `TUO-USERNAME` con il tuo username GitHub)

## Passo 2: Crea il progetto su Vercel

1. Vai su **https://vercel.com** e fai login (puoi usare GitHub).
2. Clicca su **"Add New Project"**.
3. Importa il repository `carematch` che hai appena creato.
4. Vercel rileva automaticamente che è un progetto Next.js.
5. **NON cliccare ancora "Deploy"**: prima devi aggiungere le variabili d'ambiente.

## Passo 3: Configura le variabili d'ambiente su Vercel

Prima di fare il deploy, aggiungi queste variabili nel pannello di Vercel:

1. Nel form di deploy, vai alla sezione **"Environment Variables"**.
2. Aggiungi queste 4 variabili (una alla volta):

   - **Nome**: `NEXT_PUBLIC_SUPABASE_URL`  
     **Valore**: `https://yotiwxsrgbsnaxtbotqd.supabase.co`  
     (o il tuo Project URL da Supabase)

   - **Nome**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`  
     **Valore**: `sb_publishable_JwWYFD3jRfHTG188XawRmw_uZ7ZR0nE`  
     (o la tua anon key da Supabase)

   - **Nome**: `SUPABASE_SERVICE_ROLE_KEY`  
     **Valore**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`  
     (o la tua service_role key da Supabase)

   - **Nome**: `GEMINI_API_KEY`  
     **Valore**: `YOUR_GEMINI_API_KEY`  
     (per ora puoi mettere un valore finto, lo useremo più avanti)

3. Assicurati che tutte siano selezionate per **Production**, **Preview** e **Development**.

## Passo 4: Fai il deploy

1. Clicca su **"Deploy"**.
2. Aspetta 1-2 minuti mentre Vercel compila e pubblica l'app.
3. Quando è finito, Vercel ti darà un URL tipo: `https://carematch-xxxxx.vercel.app`

**Salva questo URL**: ti servirà per configurare Supabase.

## Passo 5: Configura Supabase per usare l'URL di Vercel

1. Vai su **Supabase** → il tuo progetto → **Authentication** → **URL Configuration**.
2. In **"Site URL"**, metti l'URL di Vercel che hai appena ricevuto (es. `https://carematch-xxxxx.vercel.app`).
3. In **"Redirect URLs"**, aggiungi:
   - `https://carematch-xxxxx.vercel.app/auth/callback`
   - (e anche `http://localhost:3000/auth/callback` se vuoi testare anche in locale)

4. Salva.

## Passo 6: Prova l'app su Vercel

1. Apri l'URL di Vercel nel browser (es. `https://carematch-xxxxx.vercel.app`).
2. Vai su `/login`.
3. Inserisci la tua email e clicca "Mandami il link".
4. Apri l'email e clicca sul link magico.
5. Dovresti essere reindirizzato a `/dashboard` e vedere il tuo ruolo salvato.

## Aggiornamenti futuri

Ogni volta che fai `git push` sul branch `main`, Vercel farà automaticamente un nuovo deploy.

Se vuoi testare modifiche senza pubblicarle, crea un branch separato (es. `feature/nuova-funzione`) e Vercel creerà automaticamente un "Preview Deployment" con un URL temporaneo.
