export default function Footer() {
  return (
    <footer role="contentinfo" className="mt-16">
      <div className="bg-brand-footer text-gray-200">
        <div className="container py-10 text-center">
          <p className="text-sm sm:text-base leading-relaxed opacity-90">
            <strong>Euroansa e Hora Immobiliare sono due aziende distinte non obbligate tra loro.
            Operano, non in esclusiva reciproca, con la sola finalità di un supporto comune al cliente.</strong>
          </p>
          <div>© Copyright Euroansa - Tutti i diritti riservati</div>
        </div>
      </div>
      <div className="bg-brand-footer text-gray-300 text-sm">
        <div className="container py-4 space-y-2 text-center">
          <div>
            <a
              className="underline text-brand-gold hover:opacity-90"
              href="https://horaimmobiliare.it/privacy-policy/"
            >
              Privacy Policy e modalità di Trattamento dei Dati Personali
            </a>
          </div>
          <div>
            <span className="opacity-90">Assistenza: </span>
            <a className="underline text-brand-gold hover:opacity-90" href="mailto:info@horaimmobiliare.it">
              info@horaimmobiliare.it
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}


