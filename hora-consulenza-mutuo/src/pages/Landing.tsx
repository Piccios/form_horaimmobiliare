import Header from '../components/ui/Header'
import Footer from '../components/ui/Footer'
import { Link } from 'react-router-dom'

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main id="main" className="container py-10 sm:py-16 px-4 sm:px-6 lg:px-8 flex-1">
        <section className="text-center py-16">
          <h1 className="text-2xl sm:text-5xl font-bold tracking-tight">PIATTAFORMA DI RICHIESTA CONSULENZA MUTUO</h1>
          <h2 className="mt-2 text-lg sm:text-2xl text-gray-700">Hora Immobiliare</h2>
          <p className="mt-4 text-sm text-gray-600">Utilizzabile esclusivamente dai Consulenti Hora Immobiliare</p>
          <div className="mt-8">
            <Link to="/consulenza" className="btn">Richiedi la consulenza</Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}

