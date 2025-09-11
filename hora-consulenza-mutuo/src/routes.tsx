import { Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import Consulenza from './pages/Consulenza'

export default function RoutesConfig() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/consulenza" element={<Consulenza />} />
    </Routes>
  )
}


