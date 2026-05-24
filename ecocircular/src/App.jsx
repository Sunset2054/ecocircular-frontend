import { BrowserRouter, Routes, Route } from 'react-router-dom'
import RoleSelection from './pages/RoleSelection'
import Login from './pages/Login'
import CiudadanoDashboard from './pages/CiudadanoDashboard'
import OperadorDashboard from './pages/OperadorDashboard'
import MunicipalidadDashboard from './pages/MunicipalidadDashboard'
import './index.css'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RoleSelection />} />
        <Route path="/login/:role" element={<Login />} />
        <Route path="/ciudadano" element={<CiudadanoDashboard />} />
        <Route path="/operador" element={<OperadorDashboard />} />
        <Route path="/municipalidad" element={<MunicipalidadDashboard />} />
      </Routes>
    </BrowserRouter>
  )
}