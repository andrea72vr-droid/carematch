# Roadmap Evolutiva: CareMatch Ecosistema Sociale

Questo documento delinea i passi per la trasformazione di CareMatch da marketplace di caregiver a piattaforma di coordinamento e rappresentanza dei bisogni.

## 🎯 Obiettivi Chiave
1.  **Spostare il focus**: Da transazione commerciale a rappresentazione del bisogno.
2.  **Validazione Istituzionale**: Coinvolgere associazioni (FISH, Consulte) come validatori di fiducia.
3.  **Dati Politici**: Generare insight per la progettazione sociale territoriale.

---

## 🏗️ Roadmap Incrementale

### Fase 1: Fondamenta e Rappresentanza (In Corso)
- [x] **Database Schema**: Implementazione tabelle `organizzazioni` e `bisogni_espressi`.
- [x] **Ruoli Utente**: Aggiunta del ruolo `associazione`.
- [x] **Interfaccia Segnalazione**: Modulo per l'espressione semantica dei bisogni (Rappresentanza).
- [ ] **Onboarding Organizzazioni**: Flusso di registrazione specifico per associazioni e consulte.

### Fase 2: Validazione e Community Dashboard (Prossimo Step)
- [ ] **Pannello Validazione**: Interfaccia per le associazioni per validare/commentare i bisogni ricevuti.
- [ ] **Mappa del Bisogno**: Visualizzazione geografica (stile heat-map) dei bisogni espressi (anonymized).
- [ ] **Certificazione Caregiver**: Possibilità per le associazioni di certificare profili di caregiver territoriali.

### Fase 3: Matching Ecosistemico & AI Insights
- [ ] **Algoritmo Evoluto**: L'AI suggerisce non solo un caregiver, ma anche un'associazione locale o un bando/bonus compatibile col bisogno espresso.
- [ ] **Report Stakeholder**: Generazione automatica di PDF per Consulte comunali con l'aggregato dei bisogni insoddisfatti nel territorio.

---

## ⚖️ Differenze con le App Tradizionali

| Caratteristica | App Caregiver Tradizionali | CareMatch Ecosistema |
| :--- | :--- | :--- |
| **Punto di Partenza** | Disponibilità di budget per un servizio. | Espressione di un bisogno di cura e vita. |
| **Ruolo dell'Utente** | Consumatore/Cliente. | Cittadino/Sensore di bisogni reali. |
| **Trust Model** | Recensioni anonime degli utenti. | Validazione da Associazioni di Categoria. |
| **Output Finale** | Un contratto di lavoro. | Una risposta coordinata (Lavoro + Supporto + Diritti). |
| **Impatto** | Risoluzione di un problema individuale. | Generazione di dati per politiche pubbliche. |

---

## 🛠️ Note Tecniche per il Team
- **Supabase RLS**: Le nuove policy garantiscono che solo le associazioni autorizzate possano vedere le segnalazioni del proprio territorio.
- **Gemini AI**: Il campo `descrizione_semantica` sarà processato per estrarre parole chiave utili alla classificazione automatica dei bisogni.
- **Next.js Routing**: Mantiene la compatibilità con le pagine esistenti, aggiungendo la directory `/dashboard/associazione`.

*CareMatch Transformation - Verso un'assistenza integrata e politica.*
