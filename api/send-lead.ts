// Minimal request/response interfaces to avoid external type deps here
interface ApiRequest {
  method?: string
  body?: unknown
  headers: Record<string, unknown>
}

interface ApiResponse {
  setHeader(name: string, value: string): void
  status(code: number): ApiResponse
  json(payload: unknown): void
}

// Minimal Node globals to avoid pulling full @types/node in this file
declare const process: { env: Record<string, string | undefined> }
declare const Buffer: {
  from(input: string, encoding: string): { toString(encoding: string): string }
}

type MailResponse = { id?: string; messageId?: string }
// removed Resend import

// CSV config
const CSV_SEPARATOR = ';'
const NEWLINE = '\r\n'

function sanitizeValue(value: unknown): string {
  if (value === null || value === undefined) return ''
  let str = String(value)
  // Replace newlines to keep one-line per record
  str = str.replace(/[\r\n]+/g, ' ').trim()
  return str
}

function quoteCsv(value: string): string {
  // Always quote to be safe with Excel
  const escaped = value.replace(/"/g, '""')
  return `"${escaped}"`
}

function buildCsv(headers: string[], row: Record<string, unknown>): string {
  const headerLine = headers.map(h => quoteCsv(h)).join(CSV_SEPARATOR)
  const values = headers.map((h) => {
    const v = sanitizeValue(row[h])
    return quoteCsv(v)
  }).join(CSV_SEPARATOR)

  const csvCore = `${headerLine}${NEWLINE}${values}${NEWLINE}`
  // Prepend UTF-8 BOM for Excel compatibility on Windows
  const BOM = '\uFEFF'
  return `${BOM}${csvCore}`
}

function normalizePayload(input: Record<string, unknown>, req: ApiRequest) {
  const nowIso = new Date().toISOString()
  const headers = [
    'form_id',
    'created_at',
    'source_page',
    'utm_source',
    'utm_medium',
    'utm_campaign',
    'language',
    'user_agent',
    'email_cliente',
    'nome_cognome_cliente',
    'cellulare_cliente',
    'importo_mutuo',
    'valore_immobile',
    'preferenza_contatto',
    'consulente_euroansa',
    'nome_cognome_consulente_autorizzato',
    'email_consulente_autorizzato',
    'note',
    'marketing',
    'privacy_consent',
    'honeypot_passed',
  ]

  // Convert checkbox marketing to boolean string
  const marketing = typeof input.marketing === 'string' ? 'true' : (input.marketing === true ? 'true' : 'false')
  // Normalize privacy consent from various truthy representations ("on", "true", true, "1")
  const privacyTruthy = ((): boolean => {
    const v = input.privacy_consent
    if (v === true) return true
    if (typeof v === 'string') {
      const lowered = v.toLowerCase().trim()
      return lowered === 'true' || lowered === 'on' || lowered === '1' || lowered === 'yes'
    }
    if (typeof v === 'number') return v === 1
    return false
  })()

  const normalized: Record<string, unknown> = {
    form_id: 'consulenza-mutuo',
    created_at: input.created_at || nowIso,
    source_page: input.source_page || '',
    utm_source: input.utm_source || input.utmSource || '',
    utm_medium: input.utm_medium || input.utmMedium || '',
    utm_campaign: input.utm_campaign || input.campaign || '',
    language: input.language || (req.headers['accept-language'] as string | undefined) || '',
    user_agent: (req.headers['user-agent'] as string | undefined) || '',
    email_cliente: input.email_cliente || '',
    nome_cognome_cliente: input.nome_cognome_cliente || '',
    cellulare_cliente: input.cellulare_cliente || '',
    importo_mutuo: input.importo_mutuo || '',
    valore_immobile: input.valore_immobile || '',
    preferenza_contatto: input.preferenza_contatto || '',
    consulente_euroansa: input.consulente_euroansa || '',
    nome_cognome_consulente_autorizzato: input.nome_cognome_consulente_autorizzato || '',
    email_consulente_autorizzato: input.email_consulente_autorizzato || '',
    note: input.note || '',
    marketing,
    privacy_consent: privacyTruthy ? 'true' : 'false',
    honeypot_passed: input.honeypot_passed === true ? 'true' : 'false',
  }

  return { headers, normalized }
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ ok: false, error: 'Method Not Allowed' })
  }

  try {
    const body = (typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {}) as Record<string, unknown>

    // Basic honeypot check
    if (body.website && String(body.website).trim().length > 0) {
      return res.status(400).json({ ok: false, error: 'Bot detected' })
    }

    // Basic validation of required fields
    const required = ['email_cliente','nome_cognome_cliente','cellulare_cliente','importo_mutuo']
    for (const field of required) {
      const value = body[field]
      if (!value || typeof value === 'object') {
        return res.status(400).json({ ok: false, error: `Campo mancante: ${field}` })
      }
    }

    // Enforce privacy consent
    const hasPrivacyConsent = (() => {
      const v = body.privacy_consent
      if (v === true) return true
      if (typeof v === 'string') {
        const lowered = v.toLowerCase().trim()
        return lowered === 'true' || lowered === 'on' || lowered === '1' || lowered === 'yes'
      }
      if (typeof v === 'number') return v === 1
      return false
    })()
    if (!hasPrivacyConsent) {
      return res.status(400).json({ ok: false, error: 'Consenso privacy obbligatorio' })
    }

    const { headers, normalized } = normalizePayload(body as Record<string, unknown>, req)
    const csv = buildCsv(headers, normalized)

    // Read configuration from environment variables (set these in Vercel):
    // MAIL_ENDPOINT_URL, MAIL_API_KEY, LEADS_TO_EMAIL, LEADS_BCC_EMAIL, LEADS_FROM_EMAIL
    // Preferisci variabile di ambiente; fallback al mail.php locale in produzione PHP
    let mailEndpointUrl = process.env.MAIL_ENDPOINT_URL
    const mailApiKey = process.env.MAIL_API_KEY
    const toEmail = process.env.LEADS_TO_EMAIL || 'lorenzo.picchi@euroansa.it'
    const bccEmail = process.env.LEADS_BCC_EMAIL || 'davide.acquafresca@euroansa.it'
    const fromEmail = process.env.LEADS_FROM_EMAIL || 'Consulenza Mutuo <noreply@horaimmobiliare.it>'

    if (!mailEndpointUrl) {
      // Fallback locale. Tenta vari percorsi noti
      const origins = [
        '/mail.php',
        '/form_horaimmobiliare/mail.php',
      ]
      // Scegli il primo; il client (edge) dovrà risolvere pieno URL lato frontend se necessario
      mailEndpointUrl = origins[0]
    }
    if (!toEmail) {
      return res.status(500).json({ ok: false, error: 'Missing recipient email' })
    }

    const filename = `lead-consulenza-${new Date().toISOString().replace(/[:.]/g, '')}.csv`
    const base64Content = Buffer.from(csv, 'utf8').toString('base64')

    const replyTo = typeof normalized.email_cliente === 'string' && normalized.email_cliente ? String(normalized.email_cliente) : undefined

    // Due payload diversi: provider JSON generico vs mail.php locale
    const isLocalPhp = /mail\.php$/i.test(mailEndpointUrl)
    const payload = isLocalPhp
      ? {
          to: toEmail,
          // mail.php supporta bcc singolo opzionale
          bcc: bccEmail || undefined,
          replyTo,
          subject: 'Nuova richiesta consulenza mutuo',
          message: 'In allegato il CSV con i dettagli della richiesta.',
          attachments: [
            {
              filename,
              content: base64Content,
              contentType: 'text/csv; charset=utf-8',
            },
          ],
        }
      : {
          from: fromEmail,
          to: [toEmail],
          bcc: bccEmail ? [bccEmail] : undefined,
          replyTo,
          subject: 'Nuova richiesta consulenza mutuo',
          text: 'In allegato il CSV con i dettagli della richiesta.',
          attachments: [
            {
              filename,
              content: base64Content,
              contentType: 'text/csv; charset=utf-8',
            },
          ],
        }

    const resp = await fetch(mailEndpointUrl, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        ...(mailApiKey ? { authorization: `Bearer ${mailApiKey}` } : {}),
      },
      body: JSON.stringify(payload),
    })

    let json: unknown = null
    try {
      json = await resp.json()
    } catch {
      // ignore JSON parse errors; may return empty body
    }

    if (!resp.ok) {
      console.error('Mail endpoint error', { status: resp.status, body: json })
      return res.status(502).json({ ok: false, error: 'Email provider error' })
    }

    const responseJson = (json ?? {}) as MailResponse
    return res.status(200).json({ ok: true, id: responseJson.id ?? responseJson.messageId ?? undefined })
  } catch (err) {
    console.error('send-lead error', err)
    return res.status(500).json({ ok: false, error: 'Internal Server Error' })
  }
}


