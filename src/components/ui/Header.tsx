import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import logo from '../../img/logo/logo.png'
import immobiliBg from '/src/img/immobili/visualelectric-1757496320358.png'

export default function Header() {
  const location = useLocation()
  const isConsulenza = location.pathname === '/consulenza'
  const [open, setOpen] = useState(false)
  return (
    <header className="z-50 bg-white/90 backdrop-blur border-b overflow-hidden py-20">
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none opacity-55 -z-10"
        style={{ backgroundImage: `url(${immobiliBg})`, backgroundSize: 'cover', backgroundPosition: 'left 60px top 750px' }}
      />
      <div className="container flex items-center justify-between py-3">
        <Link to="/" className="flex items-center gap-3">
          <img src={logo} alt="Hora Immobiliare" className="h-15" />
          <span className="sr-only">Hora Immobiliare</span>
        </Link>
        <nav aria-label="Primary" className="hidden sm:flex items-center gap-6">
          {!isConsulenza && (
            <Link to="/consulenza" className="btn">Richiedi la consulenza</Link>
          )}
        </nav>
        <button aria-label="Apri menu" className="sm:hidden btn px-3 py-2" aria-expanded={open} onClick={() => setOpen(!open)}>☰</button>
      </div>
      {open && (
        <div className="sm:hidden border-t">
          <div className="container py-2">
            {!isConsulenza && (
              <Link to="/consulenza" className="btn w-full" onClick={() => setOpen(false)}>Richiedi la consulenza</Link>
            )}
          </div>
        </div>
      )}
    </header>
  )
}

/*
CLAUDE_TODO: Verificare contrasto del bottone su sfondo bianco, focus order e aria-expanded su hamburger.
*/

