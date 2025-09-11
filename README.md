## Invio CSV via email (Serverless)

Ogni invio del form genera un CSV e lo spedisce via email tramite una Vercel Function (`api/send-lead.ts`) utilizzando Resend.

### Setup
1. Installare dipendenze:
   - `npm install resend @vercel/node`
2. Configurare variabili d'ambiente su Vercel (Project Settings → Environment Variables):
   - `RESEND_API_KEY`: chiave API Resend
   - `LEAD_TO_EMAIL`: destinatario principale
   - `LEAD_BCC_EMAIL` (opzionale): BCC
3. Deploy su Vercel. Il mittente è `lorenzo.picchi@euroansa.it`.

### Struttura CSV
- UTF-8 con BOM, separatore `;`, CRLF, valori sempre tra virgolette.
- Header: `form_id;created_at;source_page;utm_source;utm_medium;utm_campaign;language;user_agent;email_cliente;nome_cognome_cliente;cellulare_cliente;importo_mutuo;valore_immobile;preferenza_contatto;consulente_euroansa;nome_cognome_consulente_autorizzato;email_consulente_autorizzato;note;marketing;privacy_consent;honeypot_passed`

### Note privacy
- I dati vengono inviati via email e non vengono persi su server persistenti.
- Se necessario, impostare una retention policy lato provider email.
# hora-consulenza-mutuo

Sito a 2 pagine per "Piattaforma di Richiesta Consulenza Mutuo" (Hora Immobiliare).

## Stack
- React + Vite (TypeScript)
- TailwindCSS
- React Router v6
- ESLint

## Comandi
```bash
npm install
npm run dev    # sviluppo
npm run build  # produzione
```

## Struttura
- `src/pages/Landing.tsx` → home con CTA
- `src/pages/Consulenza.tsx` → form consulenza
- `src/components/ui/*` → Header, Footer, Field, Button
- `src/lib/api.ts` → `postLead(payload)` stub (POST `/api/lead`)
- `src/lib/validators.ts` → validazioni basiche
- `src/styles/globals.css` → Tailwind base + componenti

## Endpoint /api/lead
L'endpoint è uno stub. In assenza di backend, `postLead` simula un `ok` dopo 600ms. Per collegare un backend reale, modificare `src/lib/api.ts` indicando l'URL reale ed eventuale autenticazione.

## Privacy/Consensi
Il form include consenso privacy obbligatorio e marketing opzionale. Aggiornare link privacy in `src/config/site.ts`.

## A11y
- Skip-link, labels associate, `aria-live` per messaggi invio
- Contrasto bottoni con testo scuro su oro brand (#E7D28F)

## Note brand
Logo in `public/logo-hora.svg` (segnaposto). Palette definita in `tailwind.config.js`.
