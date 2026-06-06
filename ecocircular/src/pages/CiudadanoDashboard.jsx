import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { getToken } from '../api'

const TABS = ['Inicio', 'Historial', 'Mi QR']
const API = 'http://localhost:8080'

export default function CiudadanoDashboard() {
  const [tab, setTab] = useState(0)
  const navigate = useNavigate()
  const [deliveries, setDeliveries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Obtener datos del usuario desde localStorage
  const userId = localStorage.getItem('userId')
  const userName = localStorage.getItem('userName') 
  const token = getToken()

  useEffect(() => {
    const fetchDeliveries = async () => {
      try {
        const res = await fetch(API + '/api/deliveries/user/' + userId, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })
        if (!res.ok) throw new Error('Error al cargar entregas')
        const data = await res.json()
        setDeliveries(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchDeliveries()
  }, [token])

  // Cálculo de estadísticas
  const totalKg = deliveries.reduce((sum, d) =>
    sum + d.details.reduce((s, det) => s + det.quantity, 0), 0
  )
  const totalCO2 = deliveries.reduce((sum, d) =>
    sum + d.details.reduce((s, det) => s + (det.co2Estimated || 0), 0), 0
  )
  const totalPoints = deliveries.reduce((sum, d) =>
    sum + d.details.reduce((s, det) => s + det.pointsEarned, 0), 0
  )
  const totalDeliveries = deliveries.length
  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Cargando...</div>
  if (error) return <div style={{ padding: 40, textAlign: 'center' }}>Error: {error}</div>

  return (
    <div style={{ minHeight: '100vh', background: '#F4F7F5', fontFamily: 'Syne, sans-serif' }}>
      {/* Topbar */}
      <div style={{
        background: '#1A3D2B', padding: '16px 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <button onClick={() => navigate('/')} style={{
          background: 'none', border: 'none', color: '#4CAF80',
          cursor: 'pointer', fontSize: 20, display: 'flex', alignItems: 'center', gap: 6,
        }}>
          ← <span style={{ fontSize: 14, fontWeight: 600 }}>EcoCircular</span>
        </button>
        
      </div>

      {/* Tab navigation */}
      <div style={{
        background: '#fff', borderBottom: '1px solid #E0EDE6',
        display: 'flex', overflowX: 'auto', padding: '0 16px',
        position: 'sticky', top: 57, zIndex: 99,
      }}>
        {TABS.map((t, i) => (
          <button key={t} onClick={() => setTab(i)} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            padding: '14px 18px', fontSize: 14, fontFamily: 'Syne, sans-serif', fontWeight: 600,
            color: tab === i ? '#2E7D52' : '#8A9E92', whiteSpace: 'nowrap',
            borderBottom: tab === i ? '2px solid #2E7D52' : '2px solid transparent',
            transition: 'all 0.2s',
          }}>
            {t}
          </button>
        ))}
      </div>

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '24px 16px' }}>
        <AnimatePresence mode="wait">
          {tab === 0 && (
            <motion.div key="inicio"
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Profile card */}
              <div style={{
                background: 'linear-gradient(135deg, #1A3D2B, #2E7D52)',
                borderRadius: 20, padding: 28, marginBottom: 20, color: '#fff',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                  <div>
                    <p style={{ fontSize: 13, opacity: 0.7, marginBottom: 4 }}>Bienvenido de vuelta</p>
                    <h2 style={{ fontSize: 24, fontWeight: 800 }}>{userName}</h2>
                  </div>
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 50 }}>
                      {totalPoints.toLocaleString()} puntos
                    </span>
                  </div>
                </div>
              </div>

              {/* Big metrics */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                {[
                  { label: 'kg Reciclados', value: totalKg.toFixed(1), unit: 'kg', icon: '♻️', color: '#2E7D52', bg: '#F0FAF4' },
                  { label: 'CO₂ Evitado', value: totalCO2.toFixed(1), unit: 'kg', icon: '🌿', color: '#D4872B', bg: '#FDF6ED' },
                ].map((m) => (
                  <div key={m.label} style={{
                    background: m.bg, borderRadius: 16, padding: '24px 20px',
                    border: `1px solid ${m.color}22`,
                  }}>
                    <div style={{ fontSize: 28, marginBottom: 8 }}>{m.icon}</div>
                    <div style={{
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: 'clamp(2rem, 6vw, 2.8rem)',
                      fontWeight: 600, color: m.color, lineHeight: 1,
                    }}>
                      {m.value}<span style={{ fontSize: 16, marginLeft: 4, opacity: 0.7 }}>{m.unit}</span>
                    </div>
                    <p style={{ fontSize: 12, color: '#6B8C78', marginTop: 6 }}>{m.label}</p>
                  </div>
                ))}
              </div>

              {/* Quick stats */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
                {[
                  { label: 'Entregas', value: totalDeliveries.toString(), color: '#2E7D52' },
                  { label: 'Puntos', value: (totalPoints / 1000).toFixed(1) + 'k', color: '#1A3D2B' },
                ].map((s) => (
                  <div key={s.label} style={{
                    background: '#fff', borderRadius: 14, padding: '18px 14px', textAlign: 'center',
                    border: '1px solid #E0EDE6',
                  }}>
                    <div style={{
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: 24, fontWeight: 600, color: s.color,
                    }}>{s.value}</div>
                    <div style={{ fontSize: 11, color: '#8A9E92', marginTop: 4 }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {tab === 1 && (
            <motion.div key="historial"
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h3 style={{ fontWeight: 700, fontSize: 18, color: '#1A3D2B', marginBottom: 16 }}>Historial de Entregas</h3>
              {deliveries.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#8A9E92' }}>Aún no has realizado entregas.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {deliveries.map((d) => (
                    <motion.div key={d.id}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 }}
                      style={{
                        background: '#fff', borderRadius: 14, padding: '16px 20px',
                        border: '1px solid #E0EDE6', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      }}
                    >
                      <div>
                        <p style={{ fontWeight: 700, fontSize: 15, color: '#1A3D2B' }}>
                          {d.details.map(det => det.materialName).join(', ')}
                        </p>
                        <p style={{ fontSize: 12, color: '#8A9E92', marginTop: 2 }}>
                          {d.greenPointName} · {new Date(d.deliveredAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 18, fontWeight: 600, color: '#2E7D52' }}>
                          {d.details.reduce((s, det) => s + det.quantity, 0).toFixed(1)} kg
                        </p>
                        <p style={{ fontSize: 12, color: '#D4872B', fontWeight: 600 }}>
                          +{d.details.reduce((s, det) => s + det.pointsEarned, 0)} pts
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {tab === 2 && (
            <motion.div key="qr"
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              style={{ textAlign: 'center' }}
            >
              <h3 style={{ fontWeight: 700, fontSize: 18, color: '#1A3D2B', marginBottom: 8 }}>Tu Código QR</h3>
              <p style={{ fontSize: 14, color: '#6B8C78', marginBottom: 28 }}>
                Muéstralo en el Punto Verde para validar tu entrega
              </p>
              <div style={{
                display: 'inline-block', background: '#fff',
                borderRadius: 24, padding: 24,
                boxShadow: '0 8px 40px rgba(46,125,82,0.15)',
                border: '2px solid #B8DEC8',
              }}>
                {/* QR real usando API externa */}
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(userId)}`}
                  alt="QR"
                  width={180}
                  height={180}
                  style={{ display: 'block' }}
                />
              </div>
              <div style={{ marginTop: 20 }}>
                <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, color: '#2E7D52', fontWeight: 600 }}>
                  {userId}
                </p>
                <p style={{ fontSize: 12, color: '#8A9E92', marginTop: 4 }}>ID único · {userName} · Nivel 7</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}