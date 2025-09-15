## Hora Immobiliare – Richiesta Consulenza Mutuo

Sito semplice per raccogliere richieste di consulenza mutuo. Il form invia i dati a un'API serverless che genera un CSV e completa con successo la richiesta. L'invio email è stato disattivato e verrà sostituito da un'integrazione con Google Sheets.

### Come avviare
```bash
npm install
npm run dev
```

### Stato attuale dell'API (`api/send-lead.ts`)
- Genera un CSV con i dati normalizzati.
- Verifica honeypot, campi obbligatori e consenso privacy.
- Restituisce `{ ok: true }` senza inviare email.

### Prossimi passi: integrazione Google Sheets
- L'invio email verrà sostituito dall'aggiornamento di un Google Sheet.
- Il punto di integrazione è già pronto nel codice (TODO in `api/send-lead.ts`) e può utilizzare i dati `normalized` o il `csv` generato.

### Privacy
Il consenso privacy è obbligatorio; marketing è facoltativo.
