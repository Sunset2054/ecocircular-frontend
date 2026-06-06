import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'
import { Modal, Box, TextField, Button } from '@mui/material' // O cualquier librería de UI
import { getToken } from '../api'
import { useCurrentUser } from '../hooks/useCurrentUser'

// Colores fijos para materiales (se puede mapear dinámicamente)
const MATERIAL_COLORS = ['#2E7D52', '#D4872B', '#1A3D2B', '#4CAF80', '#8FB89F', '#C4A35A']

// Helper para formatear fechas
const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })
}

const API = 'http://localhost:8080'

export default function MunicipalidadDashboard() {


  const [operatorModalOpen, setOperatorModalOpen] = useState(false)
  const openOperatorModal = () => setOperatorModalOpen(true)

  const navigate = useNavigate()
  const [deliveries, setDeliveries] = useState([])
  const [greenPoints, setGreenPoints] = useState([])
  const [materials, setMaterials] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Estados para modales
  const [gpModalOpen, setGpModalOpen] = useState(false)
  const [matModalOpen, setMatModalOpen] = useState(false)
  const [editingGP, setEditingGP] = useState(null)   // null = crear, objeto = editar
  const [editingMat, setEditingMat] = useState(null)

  // Token de autenticación (ajusta según tu estrategia)
  const token = getToken() || ''
  
  const { user, loading: userLoading, error: userError } = useCurrentUser();


  // Fetch de todos los datos al montar
  useEffect(() => {
    const fetchData = async () => {
      try {
        const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }

        const [delRes, gpRes, matRes] = await Promise.all([
          fetch(API + '/api/deliveries', { headers }),
          fetch(API + '/api/green-points', { headers }),
          fetch(API +'/api/materials', { headers })
        ])

        if (!delRes.ok || !gpRes.ok || !matRes.ok) throw new Error('Error al cargar datos')

        const deliveriesData = await delRes.json()
        const greenPointsData = await gpRes.json()
        const materialsData = await matRes.json()

        setDeliveries(Array.isArray(deliveriesData) ? deliveriesData : deliveriesData.content ?? [])
        setGreenPoints(greenPointsData)
        setMaterials(materialsData)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [token, user?.activeTenantId])

  if (userLoading) return <div>Cargando sesión...</div>;
  if (userError) return <div>Error: {userError}</div>;
  const tenantId = user?.activeTenantId; // asumiendo que el DTO lo incluye

  // Cálculo de estadísticas
  const stats = calculateStats(deliveries, greenPoints, materials)

  // Funciones para abrir/cerrar modales
  const openCreateGP = () => { setEditingGP(null); setGpModalOpen(true) }
  const openEditGP = (gp) => { setEditingGP(gp); setGpModalOpen(true) }
  const openCreateMat = () => { setEditingMat(null); setMatModalOpen(true) }
  const openEditMat = (mat) => { setEditingMat(mat); setMatModalOpen(true) }

  if (loading) return <div style={{ padding: 40 }}>Cargando...</div>
  if (error) return <div style={{ padding: 40 }}>Error: {error}</div>

  return (
    <div style={{ minHeight: '100vh', background: '#F4F7F5', fontFamily: 'Syne, sans-serif' }}>
      {/* Topbar (sin cambios) */}
      <div style={{
        background: '#1A3D2B', padding: '16px 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <button onClick={() => navigate('/')} style={{
          background: 'none', border: 'none', color: '#4CAF80',
          cursor: 'pointer', fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6,
        }}>
          ← EcoCircular
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{
              width: 8, height: 8, borderRadius: '50%', background: '#4CAF80',
              display: 'inline-block', animation: 'pulse-dot 1.5s infinite',
            }} />
            <span style={{ fontSize: 12, color: '#4CAF80', fontFamily: 'JetBrains Mono, monospace' }}>EN VIVO</span>
          </div>
          <div style={{
            background: 'rgba(255,255,255,0.1)', borderRadius: 8,
            padding: '4px 12px', fontSize: 13, color: '#E8F5EE', fontWeight: 600,
          }}>
            Municipalidad
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '28px 16px' }}>
        {/* Título */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#1A3D2B', marginBottom: 4 }}>
            Panel de Control
          </h1>
          <p style={{ fontSize: 14, color: '#6B8C78' }}>Datos actualizados en tiempo real</p>
        </div>

        {/* KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(190px,1fr))', gap: 16, marginBottom: 28 }}>
          {stats.kpis.map((k, i) => (
            <motion.div key={k.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              style={{
                background: k.bg,
                border: `1px solid ${k.color}22`,
                borderRadius: 18, padding: '24px 20px',
              }}
            >
              <div style={{ fontSize: 28, marginBottom: 10 }}>{k.icon}</div>
              <div style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 'clamp(1.6rem,4vw,2.2rem)',
                fontWeight: 600, color: k.color, lineHeight: 1, marginBottom: 4,
              }}>
                {k.value}
                {k.unit && <span style={{ fontSize: 13, marginLeft: 4, opacity: 0.65 }}>{k.unit}</span>}
              </div>
              <p style={{ fontSize: 12, color: '#6B8C78', marginBottom: 6 }}>{k.label}</p>
              <span style={{
                background: '#E8F5EE', color: '#2E7D52',
                borderRadius: 20, padding: '2px 8px', fontSize: 11, fontWeight: 700,
              }}>{k.delta}</span>
            </motion.div>
          ))}
        </div>

        {/* Gestión de puntos verdes y materiales */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 28 }}>
          <button onClick={openCreateGP} style={actionButtonStyle}>+ Añadir Punto Verde</button>
          <button onClick={openCreateMat} style={actionButtonStyle}>+ Añadir Material</button>
          <button onClick={openOperatorModal} style={actionButtonStyle}>+ Asignar Operador</button>
        </div>

        {/* Gráficos */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
          {/* Line chart */}
          <div style={{
            background: '#fff', borderRadius: 20, padding: '24px 20px',
            border: '1px solid #E0EDE6', gridColumn: 'span 2',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontWeight: 700, fontSize: 16, color: '#1A3D2B' }}>Evolución Semanal</h3>
              <div style={{ display: 'flex', gap: 16 }}>
                {[{ color: '#2E7D52', label: 'kg' }, { color: '#D4872B', label: 'Entregas' }].map(l => (
                  <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 12, height: 3, background: l.color, borderRadius: 2 }} />
                    <span style={{ fontSize: 12, color: '#6B8C78' }}>{l.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={stats.weekly}>
                <XAxis dataKey="dia" tick={{ fontSize: 12, fill: '#8A9E92', fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#8A9E92', fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: '#1A3D2B', border: 'none', borderRadius: 10, color: '#E8F5EE', fontFamily: 'Syne' }}
                  labelStyle={{ color: '#4CAF80' }}
                />
                <Line type="monotone" dataKey="kg" stroke="#2E7D52" strokeWidth={2.5} dot={{ fill: '#2E7D52', r: 4 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="entregas" stroke="#D4872B" strokeWidth={2} dot={{ fill: '#D4872B', r: 3 }} strokeDasharray="5 5" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Pie chart */}
          <div style={{ background: '#fff', borderRadius: 20, padding: '24px 20px', border: '1px solid #E0EDE6' }}>
            <h3 style={{ fontWeight: 700, fontSize: 16, color: '#1A3D2B', marginBottom: 16 }}>Por Material</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={stats.materialsPie} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                  {stats.materialsPie.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={MATERIAL_COLORS[index % MATERIAL_COLORS.length]} />
                  ))}
                </Pie>
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, fontFamily: 'Syne' }} />
                <Tooltip formatter={(v) => `${v}%`} contentStyle={{ background: '#1A3D2B', border: 'none', borderRadius: 8, color: '#E8F5EE' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Barras de materiales */}
          <div style={{ background: '#fff', borderRadius: 20, padding: '24px 20px', border: '1px solid #E0EDE6' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontWeight: 700, fontSize: 16, color: '#1A3D2B' }}>Distribución</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {stats.materialsBars.map((m, index) => (
                <div key={m.name}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                    <span style={{ fontSize: 13, color: '#3A5C47', fontWeight: 600 }}>{m.name}</span>
                    <button onClick={() => openEditMat(m)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4CAF80', fontSize: 12 }}>
                      ✎
                    </button>
                    <span style={{ fontSize: 13, color: '#6B8C78', fontFamily: 'JetBrains Mono, monospace' }}>{m.value}%</span>
                  </div>
                  <div style={{ background: '#EEF2F0', borderRadius: 6, height: 8 }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${m.progress * 100}%` }}
                      transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
                      style={{ height: '100%', background: MATERIAL_COLORS[index % MATERIAL_COLORS.length], borderRadius: 6 }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Puntos Verdes */}
        <div style={{ background: '#fff', borderRadius: 20, padding: '24px 20px', border: '1px solid #E0EDE6' }}>
          <h3 style={{ fontWeight: 700, fontSize: 16, color: '#1A3D2B', marginBottom: 16 }}>🏆 Top Puntos Verdes</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {stats.topGreenPoints.map((p, i) => (
              <motion.div key={p.rank}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                style={{ display: 'flex', alignItems: 'center', gap: 16 }}
              >
                <div style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: ['linear-gradient(135deg,#F0A84A,#D4872B)','linear-gradient(135deg,#C0C0C0,#A0A0A0)','linear-gradient(135deg,#CD9B6B,#9B6432)'][i],
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14, fontWeight: 800, color: '#fff', flexShrink: 0,
                }}>
                  {p.rank}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, alignItems: 'center' }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#1A3D2B' }}>{p.name}</span>
                    <button onClick={() => openEditGP(p)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4CAF80', fontSize: 12 }}>
                      ✎
                    </button>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, color: '#2E7D52', fontWeight: 600 }}>
                      {p.kg.toLocaleString()} kg
                    </span>
                  </div>
                  <div style={{ background: '#EEF2F0', borderRadius: 6, height: 6 }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${p.pct}%` }}
                      transition={{ duration: 0.9, delay: 0.4 + i * 0.1, ease: 'easeOut' }}
                      style={{
                        height: '100%', borderRadius: 6,
                        background: ['#D4872B','#2E7D52','#4CAF80'][i],
                      }}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal Punto Verde */}
      <Modal open={gpModalOpen} onClose={() => setGpModalOpen(false)}>
        <Box sx={{ ...modalStyle }}>
          <h2>{editingGP ? 'Editar Punto Verde' : 'Nuevo Punto Verde'}</h2>
          <GreenPointForm
            initialData={editingGP}
            onSaved={() => { setGpModalOpen(false); /* refrescar datos */ }}
            token={token}
          />
        </Box>
      </Modal>

      {/* Modal Material */}
      <Modal open={matModalOpen} onClose={() => setMatModalOpen(false)}>
        <Box sx={{ ...modalStyle }}>
          <h2>{editingMat ? 'Editar Material' : 'Nuevo Material'}</h2>
          <MaterialForm
            initialData={editingMat}
            onSaved={() => { setMatModalOpen(false); /* refrescar datos */ }}
            token={token}
          />
        </Box>
      </Modal>

      {/* Modal Asignar/crear Operador */}
      <Modal open={operatorModalOpen} onClose={() => setOperatorModalOpen(false)}>
        <Box sx={{ ...modalStyle }}>
          <h2>Asignar o Crear Operador</h2>
          <OperatorForm
            onSuccess={() => {
              setOperatorModalOpen(false)
              // Opcional: refrescar datos si se necesita
            }}
            token={token}
            tenantId={tenantId}   
          />
        </Box>
      </Modal>
    </div>
  )
}

// Estilos auxiliares
const actionButtonStyle = {
  background: '#2E7D52',
  color: 'white',
  border: 'none',
  borderRadius: 8,
  padding: '8px 16px',
  fontWeight: 600,
  cursor: 'pointer',
  fontSize: 14,
}

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  borderRadius: 4,
  boxShadow: 24,
  p: 4,
}

/* ========== FUNCIONES DE CÁLCULO ========== */
function calculateStats(deliveries, greenPoints, materials) {
  // KPIs básicos
  const totalKg = deliveries.reduce((sum, d) =>
    sum + d.details.reduce((s, det) => s + (det.quantity || 0), 0), 0
  )
  const uniqueUsers = new Set(deliveries.map(d => d.user?.id)).size
  const totalCO2 = deliveries.reduce((sum, d) =>
    sum + d.details.reduce((s, det) => s + (det.co2Estimated || 0), 0), 0
  )
  const activeGPs = greenPoints.filter(gp => gp.status === 'ACTIVE').length

  // Evolución semanal (últimos 7 días a partir de hoy)
  const daysOfWeek = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
  const today = new Date()
  const last7 = Array.from({length: 7}, (_, i) => {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    return d.toISOString().split('T')[0]
  }).reverse()

  const weeklyData = last7.map(dateStr => {
    const dayDeliveries = deliveries.filter(d => d.deliveredAt?.startsWith(dateStr))
    const kg = dayDeliveries.reduce((sum, d) =>
      sum + d.details.reduce((s, det) => s + (det.quantity || 0), 0), 0
    )
    const date = new Date(dateStr)
    return {
      dia: daysOfWeek[date.getDay()],
      kg: Math.round(kg),
      entregas: dayDeliveries.length
    }
  })

  // Distribución por material
  const materialMap = {}
  
  deliveries.forEach(d => {
    d.details.forEach(det => {
      const matId = det.materialId
      const matName = det.materialName || 'Desconocido'
      if (!materialMap[matId]) materialMap[matId] = { name: matName, kg: 0 }
      materialMap[matId].kg += det.quantity || 0
    })
  })
  const materialsArray = Object.values(materialMap)
  const totalMaterialKg = materialsArray.reduce((sum, m) => sum + m.kg, 0)
  const materialsPie = materialsArray.map(m => ({
    name: m.name,
    value: totalMaterialKg > 0 ? Math.round((m.kg / totalMaterialKg) * 100) : 0
  }))
  const materialsBars = materialsArray.map(m => ({
    name: m.name,
    value: totalMaterialKg > 0 ? Math.round((m.kg / totalMaterialKg) * 100) : 0,
    progress: totalMaterialKg > 0 ? m.kg / totalMaterialKg : 0,
    // Para editar, necesitamos el objeto completo; lo agregamos
    id: Object.keys(materialMap).find(key => materialMap[key].name === m.name)
  }))

  // Top puntos verdes
  const gpMap = {}
  deliveries.forEach(d => {
    const gpId = d.greenPointId
    const gpName = d.greenPointName || 'Sin nombre'
    if (!gpMap[gpId]) gpMap[gpId] = { name: gpName, kg: 0, id: gpId }
    gpMap[gpId].kg += d.details.reduce((sum, det) => sum + (det.quantity || 0), 0)
  })
  const sortedGPs = Object.values(gpMap).sort((a, b) => b.kg - a.kg).slice(0, 3)
  const maxKg = sortedGPs.length > 0 ? sortedGPs[0].kg : 1
  const topGreenPoints = sortedGPs.map((gp, idx) => ({
    rank: idx + 1,
    name: gp.name,
    kg: Math.round(gp.kg),
    pct: Math.round((gp.kg / maxKg) * 100),
    id: gp.id
  }))

  return {
    kpis: [
      { label: 'kg Totales', value: totalKg.toLocaleString(), unit: 'kg', icon: '♻️', color: '#2E7D52', bg: '#EEF7F1', delta: '' },
      { label: 'Ciudadanos Activos', value: uniqueUsers.toString(), unit: '', icon: '👥', color: '#1A3D2B', bg: '#E8F0EC', delta: '' },
      { label: 'CO₂ Evitado', value: totalCO2.toFixed(0).toLocaleString(), unit: 'kg', icon: '🌿', color: '#D4872B', bg: '#FBF3E8', delta: '' },
      { label: 'Puntos Verdes', value: activeGPs.toString(), unit: 'activos', icon: '📍', color: '#4CAF80', bg: '#F0FAF4', delta: '' },
    ],
    weekly: weeklyData,
    materialsPie,
    materialsBars,
    topGreenPoints,
  }
}

/* ========== FORMULARIOS (simplificados) ========== */
function GreenPointForm({ initialData, onSaved, token }) {
  const [form, setForm] = useState({
    name: initialData?.name || '',
    locationLat: initialData?.locationLat || '',
    locationLng: initialData?.locationLng || '',
    schedule: initialData?.schedule || '{}',
    capacity: initialData?.capacity || '{}',
    status: initialData?.status || 'ACTIVE',
    acceptedMaterialIds: initialData?.acceptedMaterials?.map(m => m.id) || [],
  })
  const [allMaterials, setAllMaterials] = useState([])

  useEffect(() => {
    fetch(API + '/api/materials', { headers: { 'Authorization': `Bearer ${token}` } })
      .then(res => res.json())
      .then(setAllMaterials)
  }, [token])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleMaterialsChange = (e) => {
    const options = [...e.target.selectedOptions].map(o => o.value)
    setForm({ ...form, acceptedMaterialIds: options })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const url = initialData ? `/api/green-points/${initialData.id}` : '/api/green-points'
    const method = initialData ? 'PUT' : 'POST'
    const body = {
      ...form,
      locationLat: parseFloat(form.locationLat),
      locationLng: parseFloat(form.locationLng),
    }
    const res = await fetch(API + url, {
      method,
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
    if (res.ok) onSaved()
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <TextField name="name" label="Nombre" value={form.name} onChange={handleChange} required />
      <TextField name="locationLat" label="Latitud" type="number" value={form.locationLat} onChange={handleChange} />
      <TextField name="locationLng" label="Longitud" type="number" value={form.locationLng} onChange={handleChange} />
      <label>Materiales aceptados</label>
      <select multiple value={form.acceptedMaterialIds} onChange={handleMaterialsChange} style={{ height: 100 }}>
        {allMaterials.map(m => (
          <option key={m.id} value={m.id}>{m.name}</option>
        ))}
      </select>
      <Button type="submit" variant="contained" color="primary">Guardar</Button>
    </form>
  )
}

function MaterialForm({ initialData, onSaved, token }) {
  const [form, setForm] = useState({
    name: initialData?.name || '',
    unit: initialData?.unit || 'kg',
    pointsPerUnit: initialData?.pointsPerKg || 10,
    co2Factor: initialData?.co2Factor || 1.5,
  })

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const url = initialData ? `/api/materials/${initialData.id}` : '/api/materials'
    const method = initialData ? 'PUT' : 'POST'
    const res = await fetch(API + url, {
      method,
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })
    if (res.ok) onSaved()
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <TextField name="name" label="Nombre" value={form.name} onChange={handleChange} required />
      <TextField name="unit" label="Unidad" value={form.unit} onChange={handleChange} />
      <TextField name="pointsPerKg" label="Puntos por kg" type="number" value={form.pointsPerUnit} onChange={handleChange} />
      <TextField name="co2Factor" label="Factor CO₂" type="number" value={form.co2Factor} onChange={handleChange} />
      <Button type="submit" variant="contained" color="primary">Guardar</Button>
    </form>
  )
}

function OperatorForm({ onSuccess, token, tenantId }) {
  const [mode, setMode] = useState('existing') // 'existing' o 'new'
  const [form, setForm] = useState({
    email: '',
    displayName: '',
    password: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
     const body = {
        email: form.email.trim(),
        role: 'GREEN_POINT_OPERATOR',
      };
      if (mode === 'new') {
          body.displayName = form.displayName;
          body.password = form.password;
      }
      const response = await fetch(`${API}/users/assign-role`, {
          method: 'POST',
          headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.message || 'Error al asignar el rol')
      }

      onSuccess()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Selector de modo */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
        <button
          type="button"
          onClick={() => setMode('existing')}
          style={{
            background: mode === 'existing' ? '#2E7D52' : '#E0EDE6',
            color: mode === 'existing' ? 'white' : '#1A3D2B',
            border: 'none',
            borderRadius: 6,
            padding: '6px 12px',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: 13,
          }}
        >
          Usuario existente
        </button>
        <button
          type="button"
          onClick={() => setMode('new')}
          style={{
            background: mode === 'new' ? '#2E7D52' : '#E0EDE6',
            color: mode === 'new' ? 'white' : '#1A3D2B',
            border: 'none',
            borderRadius: 6,
            padding: '6px 12px',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: 13,
          }}
        >
          Nuevo usuario
        </button>
      </div>

      {/* Campos del formulario */}
      <TextField
        name="email"
        label="Correo electrónico"
        value={form.email}
        onChange={handleChange}
        required
        type="email"
      />

      {mode === 'new' && (
        <>
          <TextField
            name="displayName"
            label="Nombre visible"
            value={form.displayName}
            onChange={handleChange}
            required
          />
          <TextField
            name="password"
            label="Contraseña"
            type="password"
            value={form.password}
            onChange={handleChange}
            required
            inputProps={{ minLength: 8 }}
          />
        </>
      )}

      {error && <div style={{ color: 'red', fontSize: 14 }}>{error}</div>}

      <Button type="submit" variant="contained" color="primary" disabled={loading}>
        {loading ? 'Procesando...' : mode === 'existing' ? 'Asignar rol' : 'Crear y asignar'}
      </Button>
    </form>
  )
}