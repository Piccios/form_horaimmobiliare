import type { FormEvent } from 'react'
import { useMemo, useRef, useState } from 'react'
import Header from '../components/ui/Header'
import Footer from '../components/ui/Footer'
import Field from '../components/ui/Field'
import Button from '../components/ui/Button'
import { isPhoneValid, isPositiveNumber } from '../lib/validators'
import { postLead } from '../lib/api'

export default function Consulenza() {
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string>('')
  const formRef = useRef<HTMLFormElement>(null)
  useMemo(() => null, [])

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const data = new FormData(form)

    // honeypot
    if ((data.get('website') as string)?.trim()) {
      setMessage('Invio non riuscito. Riprova.')
      return
    }

    const nextErrors: Record<string, string> = {}

    const requiredFields = ['email_cliente','nome_cognome_cliente','cellulare_cliente','importo_mutuo']
    for (const name of requiredFields) {
      const val = data.get(name)
      if (!val || (val instanceof File)) nextErrors[name] = 'Campo obbligatorio'
    }

    const telefono = String(data.get('cellulare_cliente') || '')
    if (telefono && !isPhoneValid(telefono)) nextErrors['telefono'] = 'Telefono non valido'

    const importoMutuo = Number(data.get('importo_mutuo') || 0)
    if (!isPositiveNumber(importoMutuo) || importoMutuo < 10000) nextErrors['importo_mutuo'] = 'Importo non valido'

    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) {
      // scroll to first error
      const firstName = Object.keys(nextErrors)[0]
      const el = form.querySelector(`[name="${firstName}"]`) as HTMLElement | null
      el?.focus()
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }

    setLoading(true)
    setMessage('Invio in corso…')
    try {
      const payload = Object.fromEntries(data.entries())
      Object.assign(payload, { source: 'website', utm_campaign: 'consulenza-mutuo', agency_code: 'HORA' })
      await postLead(payload)
      setMessage('Richiesta inviata. Verrai ricontattato al più presto.')
      form.reset()
    } catch {
      setMessage('Invio non riuscito. Riprova.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <Header />
      <main id="main" className="container py-8 sm:py-12 px-4 sm:px-6 lg:px-50">
        <h1 className="text-2xl sm:text-3xl font-semibold">Richiedi la consulenza mutuo</h1>
        <p className="mt-2 text-gray-700">Compila i campi per essere ricontattato da un consulente.</p>

        <form ref={formRef} onSubmit={handleSubmit} className="mt-8 grid gap-6" aria-live="polite">
          <input type="text" name="website" className="hidden" tabIndex={-1} aria-hidden="true" />

          <fieldset className="grid gap-4">
            <legend className="text-lg font-medium">Richiesta</legend>
            <Field id="email_cliente" label="Mail ( cliente Hora Immobiliare )" required error={errors['email_cliente']}>
              <input id="email_cliente" name="email_cliente" type="email" required className="w-full border rounded-md px-3 py-2" />
            </Field>
            <Field id="nome_cognome_cliente" label="Nome e Cognome ( Cliente Hora Immobiliare )" required error={errors['nome_cognome_cliente']}>
              <input id="nome_cognome_cliente" name="nome_cognome_cliente" required className="w-full border rounded-md px-3 py-2" />
            </Field>
            <Field id="cellulare_cliente" label="Cellulare ( Cliente Hora Immobiliare )" required error={errors['cellulare_cliente']}>
              <input id="cellulare_cliente" name="cellulare_cliente" type="tel" required pattern="^[0-9+().\\s-]{7,}$" className="w-full border rounded-md px-3 py-2" />
            </Field>
            <Field id="importo_mutuo" label="Importo Mutuo ( Desiderato )" required error={errors['importo_mutuo']}>
              <input id="importo_mutuo" name="importo_mutuo" type="number" min={10000} step={1000} required className="w-full border rounded-md px-3 py-2" />
            </Field>
            <Field id="valore_immobile" label="Valore Immobile Interessato">
              <input id="valore_immobile" name="valore_immobile" type="number" step={1000} className="w-full border rounded-md px-3 py-2" />
            </Field>
            <Field id="preferenza_contatto" label="Preferenza Contatto">
              <select id="preferenza_contatto" name="preferenza_contatto" className="w-full border rounded-md px-3 py-2">
                <option value="">Seleziona…</option>
                <option>Telefono</option>
                <option>Email</option>
                <option>WhatsApp</option>
                <option>Indifferente</option>
              </select>
            </Field>
            <Field id="consulente_euroansa" label="Consulente Mutuo Euroansa">
              <input id="consulente_euroansa" name="consulente_euroansa" className="w-full border rounded-md px-3 py-2">
                              </input>
            </Field>
            <Field id="nome_cognome_consulente_autorizzato" label="Nome e Cognome Consulente Immobiliare Autorizzato">
              <input id="nome_cognome_consulente_autorizzato" name="nome_cognome_consulente_autorizzato" className="w-full border rounded-md px-3 py-2" />
            </Field>
            <Field id="email_consulente_autorizzato" label="Mail Consulente Immobiliare Autorizzato">
              <input id="email_consulente_autorizzato" name="email_consulente_autorizzato" type="email" className="w-full border rounded-md px-3 py-2" />
            </Field>
            <Field id="note" label="Note">
              <textarea id="note" name="note" rows={4} className="w-full border rounded-md px-3 py-2"></textarea>
            </Field>
            <div className="flex items-center gap-2">
              <input id="marketing" name="marketing" type="checkbox" className="h-4 w-4" />
              <label htmlFor="marketing" className="text-sm">Acconsento a ricevere comunicazioni di marketing secondo la privacy policy presente nel sito</label>
            </div>
          </fieldset>

          <div className="flex items-center gap-4">
            <Button type="submit" loading={loading}>Invia richiesta (con autorizzazione al trattamento dei dati personali secondo la privacy policy del sito)</Button>
            {message && <p role="status" aria-live="polite" className="text-sm">{message}</p>}
          </div>
        </form>
      </main>
      <Footer />
    </div>
  )
}

/*
CLAUDE_TODO: Validare ordine dei fieldset/legend e aria-live; verificare tabindex del honeypot.
O3_TODO: Valutare lazy-loading chunk per pagina Consulenza e split del router.
*/


