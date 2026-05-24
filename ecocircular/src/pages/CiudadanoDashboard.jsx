import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

const ACHIEVEMENTS = [
  { id: 1, icon: '🌱', title: 'Primer Reciclaje', desc: 'Completaste tu primera entrega', earned: true },
  { id: 2, icon: '⚡', title: 'Racha de 7 días', desc: '7 días consecutivos reciclando', earned: true },
  { id: 3, icon: '🏆', title: 'Top 10 Ciudad', desc: 'Entraste al ranking top 10', earned: true },
  { id: 4, icon: '🔥', title: '100 kg Reciclados', desc: 'Superaste los 100 kg totales', earned: false },
]

const HISTORY = [
  { date: '20 Jun', material: 'Plástico PET', kg: 2.4, puntos: 120, punto: 'Punto Verde Sur' },
  { date: '18 Jun', material: 'Cartón', kg: 5.1, puntos: 204, punto: 'Punto Verde Centro' },
  { date: '15 Jun', material: 'Vidrio', kg: 3.8, puntos: 152, punto: 'Punto Verde Norte' },
  { date: '12 Jun', material: 'Metal', kg: 1.2, puntos: 96, punto: 'Punto Verde Sur' },
  { date: '10 Jun', material: 'Plástico PET', kg: 4.0, puntos: 200, punto: 'Punto Verde Este' },
]

const RANKING = [
  { pos: 1, name: 'María G.', pts: 8420 },
  { pos: 2, name: 'Carlos R.', pts: 7890 },
  { pos: 3, name: 'Ana P.', pts: 7234 },
  { pos: 4, name: 'Luis M.', pts: 6780 },
  { pos: 5, name: 'Tú 🔥', pts: 6540, me: true },
  { pos: 6, name: 'Sofía V.', pts: 6200 },
  { pos: 7, name: 'Pedro A.', pts: 5980 },
]

const TABS = ['Inicio', 'Historial', 'Logros', 'Ranking', 'Mi QR']

export default function CiudadanoDashboard() {
  const [tab, setTab] = useState(0)
  const navigate = useNavigate()
  const progress = 6540 / 7000

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
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            background: 'rgba(212,135,43,0.2)', border: '1px solid #D4872B',
            borderRadius: 20, padding: '4px 12px',
            fontSize: 12, color: '#D4872B', fontFamily: 'JetBrains Mono, monospace',
          }}>
            NIVEL 7 · ECO-GUARDIÁN
          </div>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'linear-gradient(135deg, #2E7D52, #4CAF80)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16,
          }}>👤</div>
        </div>
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
                    <h2 style={{ fontSize: 24, fontWeight: 800 }}>Juan Pérez</h2>
                    <p style={{ fontSize: 13, opacity: 0.65, marginTop: 4 }}>Eco-Guardián · Ranking #5 ciudad</p>
                  </div>
                  <div style={{
                    background: 'rgba(255,255,255,0.12)', borderRadius: 14,
                    padding: '10px 16px', textAlign: 'center',
                  }}>
                    <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 28, fontWeight: 600 }}>7</p>
                    <p style={{ fontSize: 11, opacity: 0.7 }}>NIVEL</p>
                  </div>
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 12, opacity: 0.7 }}>Progreso al nivel 8</span>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}>6,540 / 7,000 pts</span>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 8, height: 8 }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress * 100}%` }}
                      transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
                      style={{ height: '100%', background: '#D4872B', borderRadius: 8 }}
                    />
                  </div>
                </div>
              </div>

              {/* Big metrics */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                {[
                  { label: 'kg Reciclados', value: '87.4', unit: 'kg', icon: '♻️', color: '#2E7D52', bg: '#F0FAF4' },
                  { label: 'CO₂ Evitado', value: '124.6', unit: 'kg', icon: '🌿', color: '#D4872B', bg: '#FDF6ED' },
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
                  { label: 'Entregas', value: '34', color: '#2E7D52' },
                  { label: 'Racha', value: '12d', color: '#D4872B' },
                  { label: 'Puntos', value: '6.5k', color: '#1A3D2B' },
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
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {HISTORY.map((h, i) => (
                  <motion.div key={i}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    style={{
                      background: '#fff', borderRadius: 14, padding: '16px 20px',
                      border: '1px solid #E0EDE6', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    }}
                  >
                    <div>
                      <p style={{ fontWeight: 700, fontSize: 15, color: '#1A3D2B' }}>{h.material}</p>
                      <p style={{ fontSize: 12, color: '#8A9E92', marginTop: 2 }}>{h.punto} · {h.date}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 18, fontWeight: 600, color: '#2E7D52' }}>{h.kg} kg</p>
                      <p style={{ fontSize: 12, color: '#D4872B', fontWeight: 600 }}>+{h.puntos} pts</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {tab === 2 && (
            <motion.div key="logros"
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h3 style={{ fontWeight: 700, fontSize: 18, color: '#1A3D2B', marginBottom: 16 }}>Logros</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 16 }}>
                {ACHIEVEMENTS.map((a, i) => (
                  <motion.div key={a.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    style={{
                      background: a.earned ? '#fff' : '#F7F7F7',
                      borderRadius: 16, padding: '24px 20px',
                      border: a.earned ? '1px solid #B8DEC8' : '1px dashed #D0D0D0',
                      opacity: a.earned ? 1 : 0.5, textAlign: 'center',
                      boxShadow: a.earned ? '0 4px 16px rgba(46,125,82,0.1)' : 'none',
                    }}
                  >
                    <div style={{ fontSize: 36, marginBottom: 12,
                      filter: a.earned ? 'none' : 'grayscale(1)' }}>{a.icon}</div>
                    <p style={{ fontWeight: 700, fontSize: 14, color: '#1A3D2B', marginBottom: 6 }}>{a.title}</p>
                    <p style={{ fontSize: 12, color: '#8A9E92', lineHeight: 1.5 }}>{a.desc}</p>
                    {a.earned && (
                      <div style={{
                        marginTop: 12, display: 'inline-block',
                        background: '#E8F5EE', color: '#2E7D52',
                        borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 600,
                      }}>✓ Obtenido</div>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {tab === 3 && (
            <motion.div key="ranking"
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h3 style={{ fontWeight: 700, fontSize: 18, color: '#1A3D2B', marginBottom: 16 }}>Ranking Global</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {RANKING.map((r, i) => (
                  <motion.div key={r.pos}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.07 }}
                    style={{
                      background: r.me ? 'linear-gradient(90deg,#1A3D2B,#2E7D52)' : '#fff',
                      borderRadius: 14, padding: '14px 20px',
                      display: 'flex', alignItems: 'center', gap: 16,
                      border: r.me ? 'none' : '1px solid #E0EDE6',
                      boxShadow: r.me ? '0 4px 20px rgba(46,125,82,0.3)' : 'none',
                    }}
                  >
                    <span style={{
                      fontFamily: 'JetBrains Mono, monospace', fontSize: 18, fontWeight: 600,
                      color: r.me ? '#D4872B' : (r.pos <= 3 ? ['#F0A84A','#B0B0B0','#CD7F32'][r.pos-1] : '#8A9E92'),
                      width: 28, textAlign: 'center',
                    }}>{r.pos}</span>
                    <span style={{ flex: 1, fontWeight: 700, fontSize: 15, color: r.me ? '#fff' : '#1A3D2B' }}>{r.name}</span>
                    <span style={{
                      fontFamily: 'JetBrains Mono, monospace', fontSize: 14, fontWeight: 600,
                      color: r.me ? '#D4872B' : '#2E7D52',
                    }}>{r.pts.toLocaleString()} pts</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {tab === 4 && (
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
                borderRadius: 24, padding: 32,
                boxShadow: '0 8px 40px rgba(46,125,82,0.15)',
                border: '2px solid #B8DEC8',
              }}>
                {/* QR simulation */}
                <svg width="180" height="180" viewBox="0 0 9 9" style={{ display: 'block', imageRendering: 'pixelated' }}>
                  {[
                    [1,1,1,1,1,1,1,0,1],[1,0,0,0,0,0,1,0,0],[1,0,1,1,1,0,1,0,1],
                    [1,0,1,1,1,0,1,0,0],[1,0,1,1,1,0,1,0,1],[1,0,0,0,0,0,1,0,0],
                    [1,1,1,1,1,1,1,0,1],[0,0,0,0,0,0,0,0,0],[1,0,1,0,1,1,1,0,1],
                  ].map((row, y) =>
                    row.map((cell, x) =>
                      cell ? <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill="#1A3D2B" /> : null
                    )
                  )}
                </svg>
              </div>
              <div style={{ marginTop: 20 }}>
                <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, color: '#2E7D52', fontWeight: 600 }}>
                  ECO-2025-JP-7734
                </p>
                <p style={{ fontSize: 12, color: '#8A9E92', marginTop: 4 }}>ID único · Juan Pérez · Nivel 7</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
