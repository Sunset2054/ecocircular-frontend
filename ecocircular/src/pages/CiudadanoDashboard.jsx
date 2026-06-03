import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { QRCodeSVG } from 'qrcode.react'
import { getUser, getToken } from '../api'

const BASE = 'http://localhost:8080'

function authHeader() {
  const token = getToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function apiFetch(path) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { ...authHeader(), 'Content-Type': 'application/json' },
  })
  if (!res.ok) throw new Error(`Error ${res.status}`)
  return res.json()
}

const TABS = ['Inicio', 'Historial', 'Logros', 'Ranking', 'Mi QR']

const ACHIEVEMENTS_DEF = [
  { id: 'first',   icon: '🌱', title: 'Primer Reciclaje',  desc: 'Completaste tu primera entrega',  check: (imp) => imp.totalDeliveries >= 1  },
  { id: 'ten',     icon: '⚡', title: '10 Entregas',       desc: '10 entregas completadas',          check: (imp) => imp.totalDeliveries >= 10 },
  { id: 'fifty',   icon: '🔥', title: '50 kg Reciclados',  desc: 'Superaste los 50 kg totales',      check: (imp) => imp.totalKg >= 50         },
  { id: 'hundred', icon: '🏆', title: '100 kg Reciclados', desc: 'Superaste los 100 kg totales',     check: (imp) => imp.totalKg >= 100        },
]

// ── Skeleton loader ───────────────────────────────────────────────────────────
function Skeleton({ w = '100%', h = 20, radius = 8, mb = 0 }) {
  return (
    <div style={{
      width: w, height: h, borderRadius: radius,
      background: 'linear-gradient(90deg, #e0ede6 25%, #f0faf4 50%, #e0ede6 75%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.4s infinite',
      marginBottom: mb,
    }} />
  )
}

function SkeletonCard() {
  return (
    <div style={{ background: '#fff', borderRadius: 16, padding: 24, border: '1px solid #E0EDE6' }}>
      <Skeleton h={14} w="40%" mb={12} />
      <Skeleton h={36} w="60%" mb={8} />
      <Skeleton h={12} w="30%" />
    </div>
  )
}

export default function CiudadanoDashboard() {
  const [tab, setTab]         = useState(0)
  const navigate              = useNavigate()

  const user                  = getUser()
  const userId                = user?.user_id
  const email                 = user?.sub

  const [impact, setImpact]   = useState(null)
  const [history, setHistory] = useState([])
  const [ranking, setRanking] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        setError(null)
        const [imp, hist, rank] = await Promise.all([
          apiFetch('/api/citizens/my/impact'),
          apiFetch('/api/citizens/my/history'),
          apiFetch('/api/citizens/ranking'),
        ])
        setImpact(imp)
        setHistory(hist)
        setRanking(rank)
      } catch (err) {
        console.error('Error cargando datos ciudadano:', err)
        setError('No se pudieron cargar los datos. Intenta de nuevo.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const myRankPos    = ranking.findIndex(r => r.userId === userId) + 1
  const myRankEntry  = ranking.find(r => r.userId === userId)

  const achievements = ACHIEVEMENTS_DEF.map(a => ({
    ...a,
    earned: impact ? a.check(impact) : false,
  }))

  const totalPoints   = impact?.totalPoints ?? 0
  const level         = Math.floor(totalPoints / 1000) + 1
  const pointsInLevel = totalPoints % 1000
  const progress      = pointsInLevel / 1000

  return (
    <div style={{ minHeight: '100vh', background: '#F4F7F5', fontFamily: 'Syne, sans-serif' }}>

      {/* shimmer keyframe */}
      <style>{`@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>

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
            NIVEL {level}
          </div>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'linear-gradient(135deg,#2E7D52,#4CAF80)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
          }}>👤</div>
        </div>
      </div>

      {/* Tabs */}
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

      {/* Error banner */}
      {error && (
        <div style={{
          background: '#FEF2F2', border: '1px solid #FECACA',
          color: '#B91C1C', fontSize: 13, padding: '10px 20px', textAlign: 'center',
        }}>
          ⚠️ {error}
        </div>
      )}

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '24px 16px' }}>
        <AnimatePresence mode="wait">

          {/* ── INICIO ── */}
          {tab === 0 && (
            <motion.div key="inicio"
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Profile card */}
              <div style={{
                background: 'linear-gradient(135deg,#1A3D2B,#2E7D52)',
                borderRadius: 20, padding: 28, marginBottom: 20, color: '#fff',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                  <div>
                    <p style={{ fontSize: 13, opacity: 0.7, marginBottom: 4 }}>Bienvenido de vuelta</p>
                    <h2 style={{ fontSize: 24, fontWeight: 800 }}>
                      {loading ? '...' : (myRankEntry?.displayName ?? email ?? 'Ciudadano')}
                    </h2>
                    <p style={{ fontSize: 13, opacity: 0.65, marginTop: 4 }}>
                      {myRankPos > 0 ? `Ranking #${myRankPos}` : 'Sin entregas aún'}
                    </p>
                  </div>
                  <div style={{
                    background: 'rgba(255,255,255,0.12)', borderRadius: 14,
                    padding: '10px 16px', textAlign: 'center',
                  }}>
                    <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 28, fontWeight: 600 }}>{level}</p>
                    <p style={{ fontSize: 11, opacity: 0.7 }}>NIVEL</p>
                  </div>
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 12, opacity: 0.7 }}>Progreso al nivel {level + 1}</span>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}>
                      {pointsInLevel.toLocaleString()} / 1,000 pts
                    </span>
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

              {/* Métricas */}
              {loading ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                  <SkeletonCard /><SkeletonCard />
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                  {[
                    { label: 'kg Reciclados', value: impact?.totalKg?.toFixed(1) ?? '—',  unit: 'kg', icon: '♻️', color: '#2E7D52', bg: '#F0FAF4' },
                    { label: 'CO₂ Evitado',   value: impact?.totalCo2?.toFixed(1) ?? '—', unit: 'kg', icon: '🌿', color: '#D4872B', bg: '#FDF6ED' },
                  ].map(m => (
                    <div key={m.label} style={{
                      background: m.bg, borderRadius: 16, padding: '24px 20px',
                      border: `1px solid ${m.color}22`,
                    }}>
                      <div style={{ fontSize: 28, marginBottom: 8 }}>{m.icon}</div>
                      <div style={{
                        fontFamily: 'JetBrains Mono, monospace',
                        fontSize: 'clamp(2rem,6vw,2.8rem)',
                        fontWeight: 600, color: m.color, lineHeight: 1,
                      }}>
                        {m.value}<span style={{ fontSize: 16, marginLeft: 4, opacity: 0.7 }}>{m.unit}</span>
                      </div>
                      <p style={{ fontSize: 12, color: '#6B8C78', marginTop: 6 }}>{m.label}</p>
                    </div>
                  ))}
                </div>
              )}

              {loading ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
                  <SkeletonCard /><SkeletonCard /><SkeletonCard />
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
                  {[
                    { label: 'Entregas', value: impact?.totalDeliveries ?? '—', color: '#2E7D52' },
                    { label: 'Ranking',  value: myRankPos > 0 ? `#${myRankPos}` : '—', color: '#D4872B' },
                    { label: 'Puntos',   value: totalPoints > 999 ? `${(totalPoints/1000).toFixed(1)}k` : totalPoints, color: '#1A3D2B' },
                  ].map(s => (
                    <div key={s.label} style={{
                      background: '#fff', borderRadius: 14, padding: '18px 14px', textAlign: 'center',
                      border: '1px solid #E0EDE6',
                    }}>
                      <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 24, fontWeight: 600, color: s.color }}>
                        {s.value}
                      </div>
                      <div style={{ fontSize: 11, color: '#8A9E92', marginTop: 4 }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* ── HISTORIAL ── */}
          {tab === 1 && (
            <motion.div key="historial"
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h3 style={{ fontWeight: 700, fontSize: 18, color: '#1A3D2B', marginBottom: 16 }}>Historial de Entregas</h3>

              {loading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {[1,2,3].map(i => <SkeletonCard key={i} />)}
                </div>
              ) : history.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px 0', color: '#8A9E92' }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>📦</div>
                  <p style={{ fontSize: 14 }}>No hay entregas registradas aún.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {history.map((h, i) => {
                    const kg     = (h.details ?? []).reduce((s, d) => s + d.quantity, 0)
                    const puntos = (h.details ?? []).reduce((s, d) => s + d.pointsEarned, 0)
                    const mat    = (h.details ?? [])[0]?.materialName ?? '—'
                    const fecha  = h.deliveredAt
                      ? new Date(h.deliveredAt).toLocaleDateString('es-BO', { day: '2-digit', month: 'short' })
                      : '—'
                    return (
                      <motion.div key={h.id}
                        initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.06 }}
                        style={{
                          background: '#fff', borderRadius: 14, padding: '16px 20px',
                          border: '1px solid #E0EDE6',
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        }}
                      >
                        <div>
                          <p style={{ fontWeight: 700, fontSize: 15, color: '#1A3D2B' }}>{mat}</p>
                          <p style={{ fontSize: 12, color: '#8A9E92', marginTop: 2 }}>
                            {h.greenPointName} · {fecha}
                          </p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 18, fontWeight: 600, color: '#2E7D52' }}>
                            {kg.toFixed(1)} kg
                          </p>
                          <p style={{ fontSize: 12, color: '#D4872B', fontWeight: 600 }}>+{puntos} pts</p>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </motion.div>
          )}

          {/* ── LOGROS ── */}
          {tab === 2 && (
            <motion.div key="logros"
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h3 style={{ fontWeight: 700, fontSize: 18, color: '#1A3D2B', marginBottom: 16 }}>Logros</h3>

              {loading ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 16 }}>
                  {[1,2,3,4].map(i => <SkeletonCard key={i} />)}
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 16 }}>
                  {achievements.map((a, i) => (
                    <motion.div key={a.id}
                      initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.1 }}
                      style={{
                        background: a.earned ? '#fff' : '#F7F7F7',
                        borderRadius: 16, padding: '24px 20px',
                        border: a.earned ? '1px solid #B8DEC8' : '1px dashed #D0D0D0',
                        opacity: a.earned ? 1 : 0.5, textAlign: 'center',
                        boxShadow: a.earned ? '0 4px 16px rgba(46,125,82,0.1)' : 'none',
                      }}
                    >
                      <div style={{ fontSize: 36, marginBottom: 12, filter: a.earned ? 'none' : 'grayscale(1)' }}>
                        {a.icon}
                      </div>
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
              )}
            </motion.div>
          )}

          {/* ── RANKING ── */}
          {tab === 3 && (
            <motion.div key="ranking"
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h3 style={{ fontWeight: 700, fontSize: 18, color: '#1A3D2B', marginBottom: 16 }}>Ranking Global</h3>

              {loading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[1,2,3,4,5].map(i => <SkeletonCard key={i} />)}
                </div>
              ) : ranking.length === 0 ? (
                <p style={{ color: '#8A9E92', fontSize: 14 }}>No hay datos de ranking aún.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {ranking.map((r, i) => {
                    const isMe = r.userId === userId
                    const medalColors = ['#F0A84A', '#B0B0B0', '#CD7F32']
                    return (
                      <motion.div key={r.userId}
                        initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.07 }}
                        style={{
                          background: isMe ? 'linear-gradient(90deg,#1A3D2B,#2E7D52)' : '#fff',
                          borderRadius: 14, padding: '14px 20px',
                          display: 'flex', alignItems: 'center', gap: 16,
                          border: isMe ? 'none' : '1px solid #E0EDE6',
                          boxShadow: isMe ? '0 4px 20px rgba(46,125,82,0.3)' : 'none',
                        }}
                      >
                        <span style={{
                          fontFamily: 'JetBrains Mono, monospace', fontSize: 18, fontWeight: 600,
                          color: isMe ? '#D4872B' : (r.position <= 3 ? medalColors[r.position - 1] : '#8A9E92'),
                          width: 28, textAlign: 'center',
                        }}>
                          {r.position}
                        </span>
                        <span style={{ flex: 1, fontWeight: 700, fontSize: 15, color: isMe ? '#fff' : '#1A3D2B' }}>
                          {r.displayName}{isMe ? ' 🔥' : ''}
                        </span>
                        <div style={{ textAlign: 'right' }}>
                          <p style={{
                            fontFamily: 'JetBrains Mono, monospace', fontSize: 14, fontWeight: 600,
                            color: isMe ? '#D4872B' : '#2E7D52',
                          }}>
                            {r.totalPoints.toLocaleString()} pts
                          </p>
                          <p style={{ fontSize: 11, color: isMe ? 'rgba(255,255,255,0.6)' : '#8A9E92', marginTop: 2 }}>
                            {r.totalKg.toFixed(1)} kg
                          </p>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </motion.div>
          )}

          {/* ── MI QR ── */}
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
                {userId ? (
                  <QRCodeSVG
                    value={userId}
                    size={180}
                    bgColor="#ffffff"
                    fgColor="#1A3D2B"
                    level="M"
                  />
                ) : (
                  <p style={{ color: '#8A9E92', fontSize: 13, width: 180, textAlign: 'center' }}>
                    No se pudo obtener tu ID
                  </p>
                )}
              </div>
              <div style={{ marginTop: 20 }}>
                <p style={{
                  fontFamily: 'JetBrains Mono, monospace', fontSize: 12,
                  color: '#2E7D52', fontWeight: 600,
                  wordBreak: 'break-all', maxWidth: 280, margin: '0 auto',
                }}>
                  {userId}
                </p>
                <p style={{ fontSize: 12, color: '#8A9E92', marginTop: 6 }}>
                  {myRankEntry?.displayName ?? email} · Nivel {level}
                </p>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  )
}