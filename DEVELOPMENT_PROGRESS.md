## Stato progetto

- Inizializzazione Vite React (TS) completata.
- Tailwind configurato con palette brand e container.
- Router impostato con due pagine: `/` e `/consulenza`.
- Componenti base: `Header`, `Footer`, `Button`, `Field`.
- Pagine: `Landing`, `Consulenza` (form completo, validazioni base, honeypot, aria-live).
- Lib: `validators`, `api` (stub `postLead`).
- SEO/meta in `index.html`, skip-link.

### Prossimi passi
- QA a11y e copy (Claude) → inserire eventuali FIX.
- Misure performance (o3) → Lighthouse, ottimizzazioni minor.
- Completare README con istruzioni e note privacy.

### Integrazione CSV + Email (Serverless)
- Implementata function Vercel `api/send-lead.ts` che invoca un endpoint HTTP esterno per l'invio email.
- Generazione CSV in memoria (UTF-8 BOM; separatore `;`; CRLF).
- Allegato CSV inviato a destinatari configurati via env.
- Frontend: `postLead` chiama `/api/send-lead` con payload arricchito (created_at, source_page, language).
- Modificata `Consulenza.tsx` per usare `postLead` e gestione messaggi UI.

### Variabili d'ambiente richieste (Vercel)
- `MAIL_ENDPOINT_URL`: URL endpoint per invio email con allegato.
- `MAIL_API_KEY` (opzionale): token Bearer per l'endpoint.
- `LEADS_TO_EMAIL`: destinatario principale.
- `LEADS_BCC_EMAIL` (opzionale): BCC per copia interna.
- `LEADS_FROM_EMAIL` (opzionale).


