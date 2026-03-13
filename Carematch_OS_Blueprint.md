# Blueprint Progetto: Carematch OS
**Analisi Tecnica, Funzionale e Strategica per lo Sviluppo e il Marketing**

---

## 1. Visione e Obiettivo del Prodotto
Carematch OS non è un semplice database di badanti, ma un'architettura software progettata per umanizzare l'incontro tra chi ha bisogno di cura e chi la offre. Utilizza l'intelligenza artificiale per superare il concetto di "matching per competenze" e approdare al "matching per affinità relazionale".

---

## 2. Architettura Tecnica (Lo Stack)
Il tool è costruito con tecnologie allo stato dell'arte per garantire velocità, scalabilità e sicurezza:

*   **Frontend**: Next.js 14 (App Router) - Il framework React più moderno per prestazioni SEO e velocità di caricamento.
*   **Design**: Tailwind CSS - Per un'interfaccia "Technical Precision" ultra-veloce e responsive.
*   **Database & Auth**: Supabase - Gestione sicura degli utenti e database relazionale in tempo reale.
*   **Intelligenza Artificiale**: Google Gemini AI - Motore di analisi semantica dei profili.
*   **Linguaggio**: TypeScript - Per un codice robusto e privo di errori logici.

---

## 3. Analisi delle Funzionalità Core

### A. Gateway di Accesso (Auth & Demo Mode)
*   **Autenticazione**: Sistema di Login/Registrazione sicuro.
*   **Modalità Demo**: Funzionalità cruciale per il marketing. Permette di testare l'intera piattaforma con un solo click senza creare un account, abbattendo le barriere all'entrata per i potenziali clienti.

### B. Profiling Intelligente (Wizards)
Invece di lunghi moduli a scelta multipla, utilizziamo "Wizards" (procedure guidate) testuali:
*   **Caregiver**: Raccolta di esperienze, approccio alla cura, stile relazionale e valori.
*   **Disabile/Famiglia**: Analisi del contesto abitativo, bisogni reali, ritmi quotidiani e regole della casa.
*   **Analisi AI**: Ogni testo inserito viene analizzato da Gemini per estrarre uno "Human Profile" che va oltre i dati anagrafici.

### C. Algoritmo di Matching Semantico
*   **Richiesta API**: Il backend confronta i profili non solo per "parole chiave", ma per "concetti".
*   **Output**: Genera un report di affinità (0-100%) spiegando i punti di forza e le possibili criticità del rapporto.

---

## 4. User Flow (Percorso Utente)

1.  **Landing Page**: Presentazione del valore e interazione "vibrant".
2.  **Login/Gateway**: Ingresso rapido (Demo o Account).
3.  **Dashboard (Command Center)**: Visione d'insieme, stato dei profili e accesso rapido alle azioni.
4.  **Profiling**: Compilazione delle 5 domande chiave (Umanizzazione del dato).
5.  **Matrix Match (Risultati)**: Visualizzazione dei migliori caregiver con score di affinità.

---

## 5. Design System: "Carematch OS"
Il design è il vantaggio competitivo principale ("WOW Effect"):

*   **Estetica**: "Technical Precision" - Un look pulito, bianco, professionale che trasmette fiducia e cura.
*   **Interattività (Spotlight)**: Le card dei profili reagiscono al mouse, creando un senso di profondità e attenzione al dettaglio.
*   **Micro-animazioni**: "Shiny Buttons" e griglie millimetrate che danno la sensazione di un tool ad alta tecnologia.
*   **Tipografia**: Mix tra *Inter* (leggibilità) e *JetBrains Mono* (precisione tecnica).

---

## 6. Perché è utile alle persone? (Valore di Marketing)

1.  **Stop alla Ricerca Cieca**: Riduce il turnover (il cambio continuo di badanti) trovando chi è davvero compatibile caratterialmente.
2.  **Facilità d'Uso**: L'interfaccia OS-like è intuitiva anche per chi non è un esperto digitale.
3.  **Trasparenza**: Le spiegazioni dell'IA sul "perché" un match funziona aiutano a prendere decisioni serene.

---

## 7. Roadmap Consigliata (Dev & Marketing)

*   **Fase 1 (Dati)**: Importazione dei profili fittizi (bulk import) per dimostrare la potenza dell'algoritmo.
*   **Fase 2 (UX)**: Ottimizzazione dei moduli di profilazione (i Wizard) per renderli ancora più veloci.
*   **Fase 3 (Social/Trust)**: Integrazione di recensioni verificate caricate direttamente sulla blockchain di Supabase.

---

## 8. Struttura delle Pagine e Guida al Test (Step-by-Step)

Questa sezione descrive tecnicamente e funzionalmente cosa "tocca" l'utente in ogni fase, il problema che risolve e come verificare che tutto funzioni correttamente.

### 🏠 Pagina 1: Home Page (La Vetrina Tecnologica)
*   **Cosa vedi**: Un'interfaccia pulita con una griglia millimetrata di sottofondo. Un grande titolo d'impatto e un "Shiny Button" (bottone lucido) centrale con un bordo animato.
*   **Interazione**: Muovi il mouse sulle tre card dei servizi in basso. Noterai un effetto "Spotlight" (una luce circolare) che segue il cursore.
*   **Azione di Test**: Clicca sul tasto centrale **"Explore Dashboard"** o su **"Accedi"** in alto a destra.
*   **Soluzione**: Trasmette immediatamente professionalità e alta tecnologia, differenziandosi dai siti di assistenza tradizionali che appaiono spesso datati.

### 🔐 Pagina 2: Login & Gateway (L'Ingresso Rapido)
*   **Cosa vedi**: Un box centrale minimalista. Due tab: "Accedi" e "Registrati". Un tasto distintivo in basso: **"Passa alla Modalità Demo"**.
*   **Interazione**: Puoi inserire email e password, oppure testare il sistema istantaneamente.
*   **Azione di Test**: Clicca su **"Passa alla Modalità Demo"**. Questo bypassa il database reale e ti proietta nel sistema con un profilo pre-caricato.
*   **Soluzione**: Abbattimento totale della "friction". L'utente può vedere il valore del tool in 2 secondi senza compilare moduli infiniti.

### 📊 Pagina 3: Dashboard (Il Centro di Controllo)
*   **Cosa vedi**: Una barra laterale fissa a sinistra (stile OS) e un pannello centrale con i tuoi dati. Vedi lo stato del tuo profilo e le sezioni "Threads Attivi" e "I Tuoi Ruoli".
*   **Interazione**: La dashboard riconosce se sei un Caregiver o una Famiglia e adatta i contenuti.
*   **Azione di Test**: Seleziona il ruolo (es. Caregiver) cliccando sulla card dedicata. Verrai indirizzato al Profiling.
*   **Soluzione**: Organizzazione chiara. Non ci si perde; ogni percorso è guidato e monitorato.

### 📝 Pagina 4: Profiling Wizard (Il Cuore dell'IA)
*   **Cosa vedi**: Una procedura guidata in 5 step. Invece di crocette, ci sono campi di testo ampi.
*   **Interazione**: Scrivi le tue risposte alle 5 domande fondamentali. Il sistema salva i progressi e ti guida con una barra di avanzamento in alto.
*   **Azione di Test**: Completa i 5 step e clicca su **"Analoga Profilo"**. In modalità Demo, vedrai apparire un'analisi immediata generata dall'IA sulla tua personalità.
*   **Soluzione**: Trasforma dati freddi in un profilo psicologico e relazionale. L'IA "legge tra le righe" dei tuoi testi.

### 🔬 Pagina 5: Matrix Match (Risultati e Report)
*   **Cosa vedi**: Una lista di profili compatibili presentati come "Report Tecnici". Ogni profilo ha una percentuale di score (es. 92%) dentro un cerchio animato.
*   **Interazione**: Ogni riga di match mostra chiaramente i **Punti di Forza** e i **Punti di Debolezza** della possibile unione.
*   **Azione di Test**: Scorri i 100 profili fittizi importati. Nota come lo score cambia in base alla logica di affinità. Clicca su "Analizza Profilo" per entrare nei dettagli.
*   **Soluzione**: Elimina l'incertezza. Non scegli una persona perché "è vicina", ma perché l'algoritmo ha calcolato che i vostri stili di vita sono compatibili al 90%.

---
*Documento creato da Antigravity per il Team Carematch.*
