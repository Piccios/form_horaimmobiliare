import logo from '../../img/logo/logo.png'

export default function Footer() {
  return (
    <footer role="contentinfo" className="mt-16">
      <div className="bg-brand-footer text-gray-200">
        <div className="container py-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <img src={logo} alt="Hora Immobiliare" className="h-8 w-auto mb-3" />
            <h3 className="text-lg font-semibold text-white">Hora Immobiliare</h3>
            <p className="mt-2 text-sm opacity-90">Piattaforma di Richiesta Consulenza Mutuo.</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Scopri</h3>
            <ul className="mt-2 space-y-1 text-sm opacity-90">
              <li><a className="underline text-brand-gold hover:opacity-90" href="https://horaimmobiliare.it/vendita/">Vendita</a></li>
              <li><a className="underline text-brand-gold hover:opacity-90" href="https://horaimmobiliare.it/affitto/">Affitto</a></li>
              <li><a className="underline text-brand-gold hover:opacity-90" href="https://horaimmobiliare.it/chi-siamo/">Chi Siamo</a></li>
              <li><a className="underline text-brand-gold hover:opacity-90" href="https://horaimmobiliare.it/valuta-la-tua-casa/">Valuta la Tua Casa</a></li>
              <li><a className="underline text-brand-gold hover:opacity-90" href="https://horaimmobiliare.it/unisciti-al-team-hora/">Unisciti al Team Hora</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Contatti</h3>
            <ul className="mt-2 space-y-1 text-sm opacity-90">
              <li><a className="underline text-brand-gold hover:opacity-90" href="tel:+390550030384">Tel. 055 0030384</a></li>
              <li><a className="underline text-brand-gold hover:opacity-90" href="mailto:info@horaimmobiliare.it">info@horaimmobiliare.it</a></li>
              <li className="opacity-80">Firenze</li>
              <li className="opacity-80">Viale Spartaco Lavagnini, 38</li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Seguici</h3>
            <ul className="mt-2 space-y-1 text-sm opacity-90">
              <li><a className="underline text-brand-gold hover:opacity-90" href="#" aria-label="Tiktok">Tiktok</a></li>
              <li><a className="underline text-brand-gold hover:opacity-90" href="https://www.instagram.com/hora_immobiliare" aria-label="Instagram">Instagram</a></li>
              <li><a className="underline text-brand-gold hover:opacity-90" href="https://www.linkedin.com/company/hora-immobiliare/" aria-label="LinkedIn">Linkedin</a></li>
              <li><a className="underline text-brand-gold hover:opacity-90" href="https://www.facebook.com/profile.php?id=61576244751477&rdid=fbqwOoI3Mtx19xQ8&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F15WRpLm9ic%2F" aria-label="Facebook">Facebook</a></li>
              <li><a className="underline text-brand-gold hover:opacity-90" href="https://www.youtube.com/@Hora_immobiliare" aria-label="YouTube">Youtube</a></li>
            </ul>
          </div>
        </div>
      </div>
      <div className="bg-brand-legal text-gray-300 text-sm">
        <div className="container py-3 space-y-2 text-center">
          <div>© {new Date().getFullYear()} Horaimmobiliare Srl - Via Spartaco Lavagnini, 38 - 50132 Firenze - P.IVA 07135130487 - Reg. Imprese di Firenze n. 07135130487 - REA 682145 - Cap. Soc. 10.500,00 € i.v.</div>
          <div>
            <a className="underline text-brand-gold hover:opacity-90" href="https://horaimmobiliare.it/cookie-policy/">Cookies Policy</a>
            <span className="mx-2" aria-hidden="true">·</span>
            <a className="underline text-brand-gold hover:opacity-90" href="https://horaimmobiliare.it/privacy-policy/">Privacy Policy</a>
          </div>
        </div>
      </div>
    </footer>
  )
}


