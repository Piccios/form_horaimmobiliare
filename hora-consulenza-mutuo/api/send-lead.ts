import type { VercelRequest, VercelResponse } from '@vercel/node'
import { Resend } from 'resend'

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

function normalizePayload(input: Record<string, any>, req: VercelRequest) {
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
    privacy_consent: input.privacy_consent === true ? 'true' : 'false',
    honeypot_passed: input.honeypot_passed === true ? 'true' : 'false',
  }

  return { headers, normalized }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ ok: false, error: 'Method Not Allowed' })
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {}

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

    const { headers, normalized } = normalizePayload(body, req)
    const csv = buildCsv(headers, normalized)

    const resendApiKey = "re_CG7ijskG_6VYDuXMUMPAtirkyxTU5wX79"

    const toEmail = "lorenzo.picchi@euroansa.it"
    const bccEmail = "davide.acquafresca@euroansa.it"
    const fromEmail = 'lorenzo.picchi@euroansa.it'

    if (!resendApiKey || !toEmail) {
      return res.status(500).json({ ok: false, error: 'Missing email configuration' })
    }

    const resend = new Resend(resendApiKey)

    const filename = `lead-consulenza-${new Date().toISOString().replace(/[:.]/g, '')}.csv`
    const base64Content = Buffer.from(csv, 'utf8').toString('base64')

    await resend.emails.send({
      from: fromEmail,
      to: [toEmail],
      bcc: bccEmail ? [bccEmail] : undefined,
      subject: 'Nuova richiesta consulenza mutuo',
      text: 'In allegato il CSV con i dettagli della richiesta.',
      attachments: [
        {
          filename,
          content: base64Content,
        },
      ],
    })

    return res.status(200).json({ ok: true })
  } catch (err) {
    console.error('send-lead error', err)
    return res.status(500).json({ ok: false, error: 'Internal Server Error' })
  }
}


