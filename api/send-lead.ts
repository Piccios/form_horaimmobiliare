import { google } from 'googleapis'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

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
declare const __dirname: string


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

async function appendToGoogleSheet(data: Record<string, unknown>): Promise<boolean> {
  try {
    console.log('🔍 Starting Google Sheets append process...')
    console.log('📊 Data to append:', JSON.stringify(data, null, 2))
    
    // Read credentials from the JSON file
    let credentials
    try {
      const credentialsPath = join(__dirname, '..', 'storage', 'google-service-account.json')
      console.log('📁 Looking for credentials at:', credentialsPath)
      console.log('📁 File exists?', existsSync(credentialsPath))
      console.log('📁 __dirname is:', __dirname)
      
      const credentialsFile = readFileSync(credentialsPath, 'utf8')
      credentials = JSON.parse(credentialsFile)
      console.log('✅ Credentials loaded successfully')
      console.log('🔑 Service account email:', credentials.client_email)
    } catch (error) {
      console.error('❌ Error reading credentials file:', error)
      console.error('❌ Credentials path attempted:', join(__dirname, '..', 'storage', 'google-service-account.json'))
      console.error('❌ File exists check:', existsSync(join(__dirname, '..', 'storage', 'google-service-account.json')))
      return false
    }

    const auth = new google.auth.GoogleAuth({
      credentials: credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    })
    console.log('🔐 Google Auth initialized')

    const sheets = google.sheets({ version: 'v4', auth })
    console.log('📋 Google Sheets API initialized')
    
    // Get Google Sheet ID from environment
    const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID
    console.log('🆔 Google Sheet ID from env:', SPREADSHEET_ID)
    if (!SPREADSHEET_ID) {
      console.error('❌ GOOGLE_SHEET_ID environment variable not set')
      return false
    }
    
    // Map data to Google Sheet columns in the correct order
    // Data | Email cliente | Nome cliente | Telefono cliente | Importo mutuo | Valore immobile | Preferenza contatto | Consulente Euroansa | Email consulente Euroansa | Consulente esterno | NOTE | Email consulente esterno | Consenso marketing | Status | MASSIMO FINANZIABILE | NOTE EUROANSA
    const values = [
      data.created_at || '', // Data
      data.email_cliente || '', // Email cliente
      data.nome_cognome_cliente || '', // Nome cliente
      data.cellulare_cliente || '', // Telefono cliente
      data.importo_mutuo || '', // Importo mutuo
      data.valore_immobile || '', // Valore immobile
      data.preferenza_contatto || '', // Preferenza contatto
      data.consulente_euroansa || '', // Consulente Euroansa
      data.email_consulente_autorizzato || '', // Email consulente Euroansa
      data.nome_cognome_consulente_autorizzato || '', // Consulente esterno
      data.note || '', // NOTE
      '', // Email consulente esterno (non presente nel form)
      data.marketing === 'true' ? 'Sì' : 'No', // Consenso marketing
      'Nuovo', // Status (valore fisso)
      '', // MASSIMO FINANZIABILE (non presente nel form)
      '' // NOTE EUROANSA (non presente nel form)
    ]

    console.log('📝 Values prepared for Google Sheet:', JSON.stringify(values, null, 2))
    console.log('🎯 Target range: Sheet1!A:P')
    console.log('📊 Spreadsheet ID:', SPREADSHEET_ID)

    const appendResult = await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Sheet1!A:P', // 16 colonne (A-P)
      valueInputOption: 'RAW',
      requestBody: {
        values: [values]
      }
    })

    console.log('✅ Row added to Google Sheet successfully')
    console.log('📈 Append result:', JSON.stringify(appendResult.data, null, 2))
    return true
  } catch (error) {
    console.error('❌ Error adding row to Google Sheet:', error)
    console.error('❌ Error details:', JSON.stringify(error, null, 2))
    if (error instanceof Error) {
      console.error('❌ Error message:', error.message)
      console.error('❌ Error stack:', error.stack)
    }
    return false
  }
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

    const { normalized } = normalizePayload(body as Record<string, unknown>, req)

    // Append to Google Sheet
    console.log('🚀 Starting Google Sheets append process...')
    const sheetSuccess = await appendToGoogleSheet(normalized)
    if (!sheetSuccess) {
      console.error('❌ Failed to append to Google Sheet - but continuing with success response')
      // Still return success to user, but log the error
    } else {
      console.log('✅ Google Sheets append completed successfully')
    }

    return res.status(200).json({ ok: true })
  } catch (err) {
    console.error('send-lead error', err)
    return res.status(500).json({ ok: false, error: 'Internal Server Error' })
  }
}


