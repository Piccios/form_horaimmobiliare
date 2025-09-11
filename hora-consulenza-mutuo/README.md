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
