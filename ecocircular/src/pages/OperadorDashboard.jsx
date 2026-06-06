import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  createDelivery,
  validateDelivery,
  getStats,
  getRecent,
} from '../services/deliveryService'
import QRScanner from '../components/QRCode'
import axios from 'axios'

const BASE = 'http://localhost:8080'

function authHeader() {
  const token = localStorage.getItem('eco_token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

const CATEGORY_ICON = {
  PLASTICO: '🧴',
  PAPEL:    '📦',
  VIDRIO:   '🍾',
  METAL:    '🥫',
  ORGANICO: '🌱',
}

export default function OperadorDashboard() {

  const [userId, setUserId]         = useState('')
  const [materialId, setMaterialId] = useState('')
  const [quantityKg, setQuantityKg] = useState('')
  const [loading, setLoading]       = useState(false)
  const [delivery, setDelivery]     = useState(null)
  const [error, setError]           = useState('')

  const [stats, setStats]             = useState(null)
  const [recent, setRecent]           = useState([])
  const [materials, setMaterials]     = useState([])
  const [greenPoints, setGreenPoints] = useState([])
  const [greenPointId, setGreenPointId] = useState('')

  useEffect(() => {
    async function loadCatalogs() {
      try {
        const [matRes, gpRes] = await Promise.all([
          axios.get(`${BASE}/api/materials`,    { headers: authHeader() }),
          axios.get(`${BASE}/api/green-points`, { headers: authHeader() }),
        ])
        setMaterials(matRes.data ?? [])
        const gps = gpRes.data ?? []
        setGreenPoints(gps)
        if (gps.length === 1) setGreenPointId(gps[0].id)
      } catch (err) {
        console.error('Error cargando catálogos:', err)
      }
    }
    loadCatalogs()
  }, [])

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [statsData, recentData] = await Promise.all([getStats(), getRecent()])
        setStats(statsData)
        setRecent(recentData)
      } catch (err) {
        console.error(err)
      }
    }
    loadDashboard()
  }, [])

  async function handleSubmit() {
    try {
      setLoading(true)
      setError('')

      const payload = {
        userId,
        greenPointId,
        details: [{
          materialId,
          quantity: parseFloat(quantityKg),
        }],
      }

      const created   = await createDelivery(payload)
      const validated = await validateDelivery(created.id)

      setDelivery(validated)

      const [statsData, recentData] = await Promise.all([getStats(), getRecent()])
      setStats(statsData)
      setRecent(recentData)

      setUserId('')
      setMaterialId('')
      setQuantityKg('')

    } catch (err) {
      console.error('Error detalle:', JSON.stringify(err.response?.data))
      setError(err.response?.data?.detail ?? 'No se pudo registrar la entrega')
    } finally {
      setLoading(false)
    }
  }

  const formInvalid = loading || !userId || !materialId || !quantityKg || !greenPointId

  return (
    <div style={{ minHeight: '100vh', background: '#0F1F17', color: '#E8F5EE', fontFamily: 'Syne, sans-serif', padding: '32px 16px' }}>
      <div style={{ maxWidth: 760, margin: '0 auto' }}>

        {/* HEADER */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8 }}>Operador Punto Verde</h1>
          <p style={{ color: '#8FB89F', fontSize: 14 }}>Recepción y validación de materiales reciclables</p>
        </div>

        {/* STATS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 24 }}>
          {[
            { label: 'Entregas hoy', value: stats?.deliveriesToday || 0, icon: '📥' },
            { label: 'kg recibidos', value: stats?.kgReceived || 0,      icon: '⚖️' },
            { label: 'Ciudadanos',   value: stats?.citizensToday || 0,   icon: '👥' },
          ].map(s => (
            <div key={s.label} style={{ background: 'rgba(22,43,31,0.92)', border: '1px solid rgba(76,175,128,0.15)', borderRadius: 18, padding: '20px 16px', textAlign: 'center' }}>
              <div style={{ fontSize: 28, marginBottom: 10 }}>{s.icon}</div>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 24, fontWeight: 700, color: '#4CAF80' }}>{s.value}</div>
              <div style={{ marginTop: 6, fontSize: 12, color: '#8FB89F' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* FORMULARIO */}
        <div style={{ background: 'rgba(22,43,31,0.92)', border: '1px solid rgba(76,175,128,0.2)', borderRadius: 24, padding: 28, marginBottom: 24 }}>
          <h2 style={{ fontSize: 18, marginBottom: 24 }}>Registrar entrega</h2>

          {/* UUID CIUDADANO + ESCÁNER QR */}
          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>UUID ciudadano / QR</label>
            <input
              value={userId}
              onChange={e => setUserId(e.target.value)}
              placeholder="UUID del ciudadano"
              style={{ ...inputStyle, marginBottom: 10 }}
            />
            {/* ✅ Escáner QR — al leer rellena userId automáticamente */}
            <QRScanner onScan={(uuid) => setUserId(uuid)} />
          </div>

          {/* PUNTO VERDE — solo si hay más de uno */}
          {greenPoints.length > 1 && (
            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Punto Verde</label>
              <select value={greenPointId} onChange={e => setGreenPointId(e.target.value)} style={{ ...inputStyle, appearance: 'none' }}>
                <option value="">Seleccionar punto verde...</option>
                {greenPoints.map(gp => (
                  <option key={gp.id} value={gp.id}>{gp.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* MATERIALES */}
          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>Material reciclable</label>
            {materials.length === 0 ? (
              <p style={{ color: '#8FB89F', fontSize: 13, marginTop: 8 }}>Cargando materiales...</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12, marginTop: 12 }}>
                {materials.map(m => (
                  <button key={m.id} onClick={() => setMaterialId(m.id)} style={{
                    background: materialId === m.id ? 'rgba(76,175,128,0.15)' : '#13241B',
                    border: materialId === m.id ? '2px solid #4CAF80' : '1px solid rgba(76,175,128,0.1)',
                    borderRadius: 14, padding: '18px 14px', cursor: 'pointer', color: '#E8F5EE',
                  }}>
                    <div style={{ fontSize: 24, marginBottom: 6 }}>{CATEGORY_ICON[m.category] ?? '♻️'}</div>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>{m.name}</div>
                    <div style={{ fontSize: 11, color: '#8FB89F', marginTop: 4 }}>{m.pointsPerUnit} pts/{m.unit}</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* CANTIDAD */}
          <div style={{ marginBottom: 26 }}>
            <label style={labelStyle}>Cantidad recibida (kg)</label>
            <input type="number" step="0.1" value={quantityKg} onChange={e => setQuantityKg(e.target.value)} placeholder="Ejemplo: 2.5" style={inputStyle} />
          </div>

          {/* BOTÓN */}
          <button onClick={handleSubmit} disabled={formInvalid} style={{
            width: '100%', padding: '16px 18px', borderRadius: 14, border: 'none',
            background: 'linear-gradient(135deg,#2E7D52,#4CAF80)', color: '#fff',
            fontWeight: 700, fontSize: 15, cursor: formInvalid ? 'not-allowed' : 'pointer',
            opacity: formInvalid ? 0.6 : 1,
          }}>
            {loading ? 'Registrando entrega...' : 'Registrar entrega'}
          </button>

          {error && (
            <div style={{ marginTop: 18, padding: 14, borderRadius: 12, background: 'rgba(255,0,0,0.1)', border: '1px solid rgba(255,0,0,0.2)', color: '#FFB0B0' }}>
              {error}
            </div>
          )}
        </div>

        {/* ENTREGA EXITOSA */}
        <AnimatePresence>
          {delivery && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{ background: 'rgba(46,125,82,0.15)', border: '1px solid rgba(76,175,128,0.3)', borderRadius: 22, padding: 24, marginBottom: 24 }}>
              <h3 style={{ color: '#4CAF80', marginBottom: 18 }}>✓ Entrega validada</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <InfoCard title="Ciudadano"   value={delivery.userDisplayName} />
                <InfoCard title="Estado"      value={delivery.status} />
                <InfoCard title="Punto Verde" value={delivery.greenPointName} />
                <InfoCard title="Fecha"       value={new Date(delivery.deliveredAt).toLocaleString()} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ENTREGAS RECIENTES */}
        <div style={{ background: 'rgba(22,43,31,0.92)', border: '1px solid rgba(76,175,128,0.15)', borderRadius: 24, padding: 24 }}>
          <h2 style={{ marginBottom: 20 }}>Entregas recientes</h2>
          {recent.length === 0 ? (
            <p style={{ color: '#8FB89F', fontSize: 13 }}>No hay entregas registradas aún.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {recent.map((r, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: i < recent.length - 1 ? '1px solid rgba(76,175,128,0.08)' : 'none' }}>
                  <div>
                    <div style={{ fontWeight: 700, marginBottom: 4 }}>{r.userDisplayName}</div>
                    <div style={{ fontSize: 12, color: '#8FB89F' }}>{r.status}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: '#4CAF80', fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}>
                      {(r.details ?? []).reduce((s, d) => s + (d.quantity ?? 0), 0).toFixed(1)} kg
                    </div>
                    <div style={{ fontSize: 12, color: '#8FB89F' }}>
                      {r.deliveredAt ? new Date(r.deliveredAt).toLocaleTimeString() : ''}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}

function InfoCard({ title, value }) {
  return (
    <div style={{ background: 'rgba(0,0,0,0.12)', borderRadius: 14, padding: 16 }}>
      <div style={{ fontSize: 11, color: '#8FB89F', marginBottom: 6, textTransform: 'uppercase' }}>{title}</div>
      <div style={{ fontWeight: 700 }}>{value}</div>
    </div>
  )
}

const labelStyle = { display: 'block', marginBottom: 8, fontSize: 13, color: '#8FB89F' }
const inputStyle = { width: '100%', padding: '14px 16px', borderRadius: 12, border: '1px solid rgba(76,175,128,0.15)', background: '#0A1710', color: '#fff', outline: 'none', fontSize: 14, boxSizing: 'border-box' }