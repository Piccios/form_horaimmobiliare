## Hora Immobiliare – Richiesta Consulenza Mutuo

Sito semplice per raccogliere richieste di consulenza mutuo. Il form invia i dati a un'API serverless che genera un CSV e lo inoltra via email ai referenti.

### Come avviare
```bash
npm install
npm run dev
```

### Deploy e configurazione (API `api/send-lead.ts`)
Impostare le variabili d'ambiente sulla piattaforma di deploy (es. Vercel):
- `MAIL_ENDPOINT_URL`: endpoint HTTP che invia l'email con allegato
- `MAIL_API_KEY` (opzionale): Bearer token per l'endpoint
- `LEADS_TO_EMAIL`: destinatario principale
- `LEADS_BCC_EMAIL` (opzionale): copia nascosta
- `LEADS_FROM_EMAIL` (opzionale): mittente; default `Consulenza Mutuo <noreply@horaimmobiliare.it>`

### Privacy
Il consenso privacy è obbligatorio; marketing è facoltativo. I dati non vengono salvati su storage persistente: vengono inoltrati via email come CSV.
