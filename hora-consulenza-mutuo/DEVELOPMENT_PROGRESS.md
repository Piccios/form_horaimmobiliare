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
- Implementata function Vercel `api/send-lead.ts` con Resend.
- Generazione CSV in memoria (UTF-8 BOM; separatore `;`; CRLF).
- Allegato CSV inviato a destinatari configurati via env.
- Frontend: `postLead` chiama `/api/send-lead` con payload arricchito (created_at, source_page, language).
- Modificata `Consulenza.tsx` per usare `postLead` e gestione messaggi UI.

### Variabili d'ambiente richieste (Vercel)
- `RESEND_API_KEY`: chiave API Resend.
- `LEAD_TO_EMAIL`: destinatario principale.
- `LEAD_BCC_EMAIL` (opzionale): BCC per copia interna.
Mittente fisso: `lorenzo.picchi@euroansa.it`.


