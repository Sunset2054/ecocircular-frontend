import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  getToken,
  getGamificationSummary,
  getUserBadges,
  getUserMissions,
  getRanking,
} from '../api'

// ─── Constantes de diseño ────────────────────────────────────────────────────
const C = {
  bgDark:    '#0F1F17',
  bgCard:    '#162B1F',
  bgSurface: '#1E3828',
  green:     '#2E7D52',
  greenLight:'#4CAF80',
  amber:     '#D4872B',
  textPri:   '#E8F5EE',
  textSec:   '#8FB89F',
  textMuted: '#5A7D6A',
  border:    'rgba(46,125,82,0.2)',
}

const BADGE_ICONS = {
  RECYCLE_1:   '🌱',
  RECYCLE_10:  '♻️',
  EARTH_50KG:  '🌍',
  CO2_25KG:    '💨',
  MATERIALS_3: '🔬',
  GOLD_LEVEL:  '🥇',
}

const LEVEL_COLORS = {
  BRONCE:  { color: '#CD9B6B', bg: 'rgba(205,155,107,0.12)', label: 'Bronce' },
  PLATA:   { color: '#C0C0C0', bg: 'rgba(192,192,192,0.12)', label: 'Plata' },
  ORO:     { color: '#F0A84A', bg: 'rgba(240,168,74,0.12)',  label: 'Oro' },
  PLATINO: { color: '#5DBA8A', bg: 'rgba(93,186,138,0.12)', label: 'Platino' },
}

const TABS = [
  { id: 'inicio',    label: 'Inicio',    icon: '◈' },
  { id: 'insignias', label: 'Insignias', icon: '🏅' },
  { id: 'misiones',  label: 'Misiones',  icon: '🎯' },
  { id: 'ranking',   label: 'Ranking',   icon: '🏆' },
  { id: 'historial', label: 'Historial', icon: '📋' },
  { id: 'qr',        label: 'Mi QR',     icon: '⬛' },
]

const API = 'http://localhost:8080'

// ─── Componente principal ────────────────────────────────────────────────────
export default function CiudadanoDashboard() {
  const navigate = useNavigate()
  const [tab, setTab] = useState('inicio')

  const userId   = localStorage.getItem('userId')
  const userName = localStorage.getItem('userName')
  const token    = getToken()

  // Estado de datos
  const [deliveries,    setDeliveries]    = useState([])
  const [gamification,  setGamification]  = useState(null)
  const [badges,        setBadges]        = useState([])
  const [missions,      setMissions]      = useState([])
  const [ranking,       setRanking]       = useState(null)
  const [loading,       setLoading]       = useState(true)
  const [gamLoading,    setGamLoading]    = useState(true)
  const [error,         setError]         = useState(null)

  // Fetch entregas
  useEffect(() => {
    if (!userId || !token) return
    fetch(`${API}/api/deliveries/user/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => { if (!r.ok) throw new Error('Error al cargar entregas'); return r.json() })
      .then(data => setDeliveries(Array.isArray(data) ? data : data.content ?? []))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [userId, token])

  // Fetch gamification (con delay para el evento asíncrono del backend)
  useEffect(() => {
    if (!userId || !token) return
    const t = setTimeout(async () => {
      try {
        const [sum, bdg, mis, rnk] = await Promise.all([
          getGamificationSummary(userId),
          getUserBadges(userId),
          getUserMissions(userId),
          getRanking('GLOBAL'),
        ])
        setGamification(sum)
        setBadges(Array.isArray(bdg) ? bdg : [])
        setMissions(Array.isArray(mis) ? mis : [])
        setRanking(rnk)
      } catch (e) {
        console.warn('Gamification no disponible:', e.message)
      } finally {
        setGamLoading(false)
      }
    }, 800)
    return () => clearTimeout(t)
  }, [userId, token])

  // Stats calculados localmente como fallback
  const totalKg     = deliveries.reduce((s, d) => s + d.details.reduce((ss, det) => ss + (det.quantity || 0), 0), 0)
  const totalCO2    = deliveries.reduce((s, d) => s + d.details.reduce((ss, det) => ss + (det.co2Estimated || 0), 0), 0)
  const totalPoints = deliveries.reduce((s, d) => s + d.details.reduce((ss, det) => ss + (det.pointsEarned || 0), 0), 0)

  const levelKey  = gamification?.level ?? 'BRONCE'
  const levelCfg  = LEVEL_COLORS[levelKey] ?? LEVEL_COLORS.BRONCE

  if (loading) return <LoadingScreen />
  if (error)   return <ErrorScreen message={error} onBack={() => navigate('/')} />

  return (
    <div style={{ minHeight: '100vh', background: C.bgDark, fontFamily: 'Syne, sans-serif', color: C.textPri }}>

      {/* ── Topbar ── */}
      <header style={{
        background: 'rgba(15,31,23,0.95)',
        borderBottom: `1px solid ${C.border}`,
        padding: '0 20px',
        position: 'sticky', top: 0, zIndex: 100,
        backdropFilter: 'blur(12px)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: 56,
      }}>
        <button onClick={() => navigate('/')} style={{
          background: 'none', border: 'none', color: C.greenLight,
          cursor: 'pointer', fontSize: 13, fontWeight: 700,
          display: 'flex', alignItems: 'center', gap: 6,
          fontFamily: 'Syne, sans-serif',
        }}>
          ← EcoCircular
        </button>

        {/* Nivel en topbar */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: levelCfg.bg,
          border: `1px solid ${levelCfg.color}44`,
          borderRadius: 20, padding: '4px 12px',
        }}>
          <span style={{ fontSize: 11, fontFamily: 'JetBrains Mono, monospace', color: levelCfg.color, fontWeight: 600 }}>
            {gamification?.levelDisplayName?.split(' - ')[0] ?? 'BRONCE'}
          </span>
        </div>
      </header>

      {/* ── Tab bar ── */}
      <nav style={{
        background: 'rgba(22,43,31,0.9)',
        borderBottom: `1px solid ${C.border}`,
        display: 'flex', overflowX: 'auto',
        padding: '0 8px',
        position: 'sticky', top: 56, zIndex: 99,
        backdropFilter: 'blur(12px)',
        scrollbarWidth: 'none',
        WebkitOverflowScrolling: 'touch',
      }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            padding: '12px 14px', fontSize: 13, fontFamily: 'Syne, sans-serif',
            fontWeight: 600, whiteSpace: 'nowrap',
            color: tab === t.id ? C.greenLight : C.textMuted,
            borderBottom: `2px solid ${tab === t.id ? C.greenLight : 'transparent'}`,
            transition: 'all 0.18s',
            display: 'flex', alignItems: 'center', gap: 5,
          }}>
            <span style={{ fontSize: 12 }}>{t.icon}</span>
            {t.label}
          </button>
        ))}
      </nav>

      {/* ── Contenido ── */}
      <main style={{ maxWidth: 720, margin: '0 auto', padding: '24px 16px' }}>
        <AnimatePresence mode="wait">

          {/* ══════════ TAB INICIO ══════════ */}
          {tab === 'inicio' && (
            <TabView key="inicio">
              {/* Hero card */}
              <div style={{
                background: `linear-gradient(135deg, ${C.bgCard}, ${C.bgSurface})`,
                border: `1px solid ${C.border}`,
                borderRadius: 20, padding: '28px 24px',
                marginBottom: 20, position: 'relative', overflow: 'hidden',
              }}>
                {/* Glow de fondo */}
                <div style={{
                  position: 'absolute', top: -40, right: -40,
                  width: 180, height: 180, borderRadius: '50%',
                  background: `radial-gradient(circle, ${levelCfg.color}22 0%, transparent 70%)`,
                  pointerEvents: 'none',
                }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                  <div>
                    <p style={{ fontSize: 12, color: C.textMuted, marginBottom: 4, fontFamily: 'JetBrains Mono, monospace', letterSpacing: 1 }}>
                      BIENVENIDO
                    </p>
                    <h2 style={{ fontSize: 22, fontWeight: 800, color: C.textPri }}>{userName}</h2>
                  </div>
                  <div style={{
                    background: levelCfg.bg,
                    border: `1px solid ${levelCfg.color}55`,
                    borderRadius: 12, padding: '6px 12px', textAlign: 'center',
                  }}>
                    <p style={{ fontSize: 10, color: levelCfg.color, fontFamily: 'JetBrains Mono, monospace', marginBottom: 2 }}>NIVEL</p>
                    <p style={{ fontSize: 14, fontWeight: 800, color: levelCfg.color }}>{levelCfg.label}</p>
                  </div>
                </div>

                {/* Puntos grandes */}
                <div style={{ marginBottom: 20 }}>
                  <p style={{ fontSize: 11, color: C.textMuted, fontFamily: 'JetBrains Mono, monospace', marginBottom: 4 }}>
                    PUNTOS TOTALES
                  </p>
                  <p style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: 'clamp(2.2rem, 8vw, 3rem)',
                    fontWeight: 600, color: C.textPri, lineHeight: 1,
                  }}>
                    {(gamification?.totalPoints ?? totalPoints).toLocaleString()}
                  </p>
                </div>

                {/* Barra de progreso al siguiente nivel */}
                {gamification && gamification.pointsToNextLevel > 0 && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: 11, color: C.textMuted, fontFamily: 'JetBrains Mono, monospace' }}>
                        Próximo nivel
                      </span>
                      <span style={{ fontSize: 11, color: levelCfg.color, fontFamily: 'JetBrains Mono, monospace' }}>
                        {gamification.pointsToNextLevel} pts restantes
                      </span>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 6, height: 6 }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, (gamification.totalPoints / (gamification.totalPoints + gamification.pointsToNextLevel)) * 100)}%` }}
                        transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
                        style={{ height: '100%', borderRadius: 6, background: `linear-gradient(90deg, ${C.green}, ${levelCfg.color})` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Métricas 2x2 */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
                {[
                  {
                    label: 'kg Reciclados',
                    value: (gamification?.totalKgRecycled ?? totalKg).toFixed(1),
                    unit: 'kg', icon: '♻️',
                    color: C.green, bg: 'rgba(46,125,82,0.08)',
                  },
                  {
                    label: 'CO₂ Evitado',
                    value: (gamification?.totalCo2AvoidedKg ?? totalCO2).toFixed(1),
                    unit: 'kg', icon: '🌿',
                    color: C.amber, bg: 'rgba(212,135,43,0.08)',
                  },
                  {
                    label: 'Entregas',
                    value: (gamification?.totalDeliveries ?? deliveries.length).toString(),
                    unit: '', icon: '📦',
                    color: C.greenLight, bg: 'rgba(76,175,128,0.08)',
                  },
                  {
                    label: 'Insignias',
                    value: (gamification?.badgesEarned ?? badges.length).toString(),
                    unit: '', icon: '🏅',
                    color: '#F0A84A', bg: 'rgba(240,168,74,0.08)',
                  },
                ].map(m => (
                  <div key={m.label} style={{
                    background: m.bg,
                    border: `1px solid ${m.color}22`,
                    borderRadius: 16, padding: '20px 16px',
                  }}>
                    <div style={{ fontSize: 24, marginBottom: 10 }}>{m.icon}</div>
                    <div style={{
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: 'clamp(1.6rem, 5vw, 2rem)',
                      fontWeight: 600, color: m.color, lineHeight: 1,
                    }}>
                      {m.value}
                      {m.unit && <span style={{ fontSize: 13, marginLeft: 4, opacity: 0.7 }}>{m.unit}</span>}
                    </div>
                    <p style={{ fontSize: 12, color: C.textSec, marginTop: 6 }}>{m.label}</p>
                  </div>
                ))}
              </div>

              {/* Misiones activas — resumen rápido */}
              {!gamLoading && missions.filter(m => m.status === 'EN_PROGRESO').length > 0 && (
                <div style={{
                  background: C.bgCard, border: `1px solid ${C.border}`,
                  borderRadius: 16, padding: '20px',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                    <p style={{ fontWeight: 700, fontSize: 14, color: C.textPri }}>🎯 Misiones activas</p>
                    <button onClick={() => setTab('misiones')} style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      fontSize: 12, color: C.greenLight, fontFamily: 'Syne, sans-serif', fontWeight: 600,
                    }}>
                      Ver todas →
                    </button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {missions.filter(m => m.status === 'EN_PROGRESO').slice(0, 2).map(m => (
                      <div key={m.missionId}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                          <span style={{ fontSize: 13, color: C.textPri, fontWeight: 600 }}>{m.name}</span>
                          <span style={{ fontSize: 12, color: C.amber, fontFamily: 'JetBrains Mono, monospace' }}>
                            {m.progressPercent}%
                          </span>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 4, height: 5 }}>
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${m.progressPercent}%` }}
                            transition={{ duration: 0.9, ease: 'easeOut' }}
                            style={{ height: '100%', borderRadius: 4, background: C.green }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </TabView>
          )}

          {/* ══════════ TAB INSIGNIAS ══════════ */}
          {tab === 'insignias' && (
            <TabView key="insignias">
              <SectionHeader title="Mis Insignias" subtitle={`${badges.length} obtenidas`} />

              {gamLoading ? (
                <SkeletonGrid />
              ) : badges.length === 0 ? (
                <EmptyState
                  icon="🌱"
                  title="Aún sin insignias"
                  desc="Completa tu primera entrega de reciclaje para ganar la primera."
                  action={{ label: 'Ver historial', onClick: () => setTab('historial') }}
                />
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 14 }}>
                  {badges.map((b, i) => (
                    <motion.div
                      key={b.badgeId}
                      initial={{ opacity: 0, y: 16, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ delay: i * 0.07 }}
                      style={{
                        background: C.bgCard,
                        border: `1px solid ${C.border}`,
                        borderRadius: 18, padding: '22px 16px',
                        textAlign: 'center', position: 'relative', overflow: 'hidden',
                      }}
                    >
                      {/* Glow */}
                      <div style={{
                        position: 'absolute', top: 0, left: 0, right: 0, height: 3,
                        background: `linear-gradient(90deg, transparent, ${C.greenLight}88, transparent)`,
                      }} />
                      <div style={{ fontSize: 38, marginBottom: 10 }}>
                        {BADGE_ICONS[b.iconCode] ?? '🏅'}
                      </div>
                      <p style={{ fontWeight: 700, fontSize: 13, color: C.textPri, marginBottom: 4 }}>{b.name}</p>
                      <p style={{ fontSize: 11, color: C.textSec, lineHeight: 1.4, marginBottom: 10 }}>{b.description}</p>
                      <p style={{
                        fontSize: 10, color: C.greenLight,
                        fontFamily: 'JetBrains Mono, monospace',
                        background: 'rgba(76,175,128,0.1)',
                        borderRadius: 20, padding: '3px 10px',
                        display: 'inline-block',
                      }}>
                        {new Date(b.earnedAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </motion.div>
                  ))}
                </div>
              )}
            </TabView>
          )}

          {/* ══════════ TAB MISIONES ══════════ */}
          {tab === 'misiones' && (
            <TabView key="misiones">
              <SectionHeader
                title="Misiones"
                subtitle={`${missions.filter(m => m.status === 'EN_PROGRESO').length} activas`}
              />

              {gamLoading ? (
                <SkeletonList />
              ) : missions.length === 0 ? (
                <EmptyState
                  icon="🎯"
                  title="Sin misiones disponibles"
                  desc="Las misiones se cargan cuando realizas entregas."
                />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {/* Primero las activas, luego completadas, luego expiradas */}
                  {[...missions]
                    .sort((a, b) => {
                      const ord = { EN_PROGRESO: 0, COMPLETADA: 1, EXPIRADA: 2 }
                      return (ord[a.status] ?? 3) - (ord[b.status] ?? 3)
                    })
                    .map((m, i) => {
                      const statusCfg = {
                        EN_PROGRESO: { color: C.amber,      bg: 'rgba(212,135,43,0.1)',  label: 'En progreso' },
                        COMPLETADA:  { color: C.greenLight, bg: 'rgba(76,175,128,0.1)',  label: 'Completada'  },
                        EXPIRADA:    { color: '#C0392B',    bg: 'rgba(192,57,43,0.1)',   label: 'Expirada'    },
                      }[m.status] ?? { color: C.textMuted, bg: 'transparent', label: m.status }

                      return (
                        <motion.div
                          key={m.missionId}
                          initial={{ opacity: 0, x: -12 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          style={{
                            background: C.bgCard,
                            border: `1px solid ${m.status === 'COMPLETADA' ? C.greenLight + '44' : C.border}`,
                            borderRadius: 16, padding: '18px 20px',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                            <p style={{ fontWeight: 700, fontSize: 15, color: C.textPri, flex: 1, marginRight: 10 }}>
                              {m.name}
                            </p>
                            <span style={{
                              fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
                              background: statusCfg.bg, color: statusCfg.color,
                              fontFamily: 'JetBrains Mono, monospace', whiteSpace: 'nowrap',
                            }}>
                              {statusCfg.label.toUpperCase()}
                            </span>
                          </div>

                          <p style={{ fontSize: 12, color: C.textSec, marginBottom: 14, lineHeight: 1.5 }}>
                            {m.description}
                          </p>

                          {/* Barra de progreso */}
                          <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 6, height: 7, marginBottom: 8 }}>
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${m.progressPercent}%` }}
                              transition={{ duration: 1, ease: 'easeOut', delay: 0.1 }}
                              style={{
                                height: '100%', borderRadius: 6,
                                background: m.status === 'COMPLETADA'
                                  ? `linear-gradient(90deg, ${C.green}, ${C.greenLight})`
                                  : C.green,
                              }}
                            />
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: 12, color: C.textMuted, fontFamily: 'JetBrains Mono, monospace' }}>
                              {m.currentValue.toFixed(1)} / {m.targetValue} · {m.progressPercent}%
                            </span>
                            <span style={{ fontSize: 12, color: C.amber, fontWeight: 700 }}>
                              +{m.rewardPoints} pts
                            </span>
                          </div>

                          {m.deadline && (
                            <p style={{ fontSize: 11, color: C.textMuted, marginTop: 6, fontFamily: 'JetBrains Mono, monospace' }}>
                              Límite: {new Date(m.deadline).toLocaleDateString('es-ES')}
                            </p>
                          )}
                        </motion.div>
                      )
                    })}
                </div>
              )}
            </TabView>
          )}

          {/* ══════════ TAB RANKING ══════════ */}
          {tab === 'ranking' && (
            <TabView key="ranking">
              <SectionHeader
                title="Ranking"
                subtitle={ranking ? `${ranking.totalParticipants ?? 0} participantes` : ''}
              />

              {gamLoading ? (
                <SkeletonList />
              ) : !ranking?.entries?.length ? (
                <EmptyState icon="🏆" title="Ranking vacío" desc="Valida entregas para aparecer en el ranking." />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {ranking.entries.map((e, i) => {
                    const isMe = e.userId === userId
                    const medalBg = ['linear-gradient(135deg,#F0A84A,#D4872B)', 'linear-gradient(135deg,#C0C0C0,#9A9A9A)', 'linear-gradient(135deg,#CD9B6B,#9B6432)']

                    return (
                      <motion.div
                        key={e.userId}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04 }}
                        style={{
                          background: isMe ? 'rgba(46,125,82,0.12)' : C.bgCard,
                          border: `1px solid ${isMe ? C.greenLight + '55' : C.border}`,
                          borderRadius: 14, padding: '14px 16px',
                          display: 'flex', alignItems: 'center', gap: 14,
                        }}
                      >
                        {/* Posición */}
                        <div style={{
                          width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                          background: i < 3 ? medalBg[i] : 'rgba(255,255,255,0.06)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontFamily: 'JetBrains Mono, monospace',
                          fontWeight: 800, fontSize: 14,
                          color: i < 3 ? '#fff' : C.textMuted,
                        }}>
                          {e.rank}
                        </div>

                        {/* Info */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{
                            fontWeight: 700, fontSize: 14, color: isMe ? C.greenLight : C.textPri,
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                          }}>
                            {e.displayName} {isMe && <span style={{ fontSize: 11, color: C.textMuted }}>(Tú)</span>}
                          </p>
                          <p style={{ fontSize: 11, color: C.textMuted, fontFamily: 'JetBrains Mono, monospace' }}>
                            {e.level}
                          </p>
                        </div>

                        {/* Score */}
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <p style={{
                            fontFamily: 'JetBrains Mono, monospace',
                            fontSize: 17, fontWeight: 600, color: C.greenLight,
                          }}>
                            {e.score.toLocaleString()}
                          </p>
                          <p style={{ fontSize: 10, color: C.textMuted }}>pts</p>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </TabView>
          )}

          {/* ══════════ TAB HISTORIAL ══════════ */}
          {tab === 'historial' && (
            <TabView key="historial">
              <SectionHeader title="Historial" subtitle={`${deliveries.length} entregas`} />

              {deliveries.length === 0 ? (
                <EmptyState
                  icon="📦"
                  title="Sin entregas aún"
                  desc="Cuando hagas tu primera entrega en un Punto Verde, aparecerá aquí."
                />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[...deliveries]
                    .sort((a, b) => new Date(b.deliveredAt) - new Date(a.deliveredAt))
                    .map((d, i) => {
                      const kg = d.details.reduce((s, det) => s + (det.quantity || 0), 0)
                      const pts = d.details.reduce((s, det) => s + (det.pointsEarned || 0), 0)

                      return (
                        <motion.div
                          key={d.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.04 }}
                          style={{
                            background: C.bgCard,
                            border: `1px solid ${C.border}`,
                            borderRadius: 14, padding: '16px 18px',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12,
                          }}
                        >
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{
                              fontWeight: 700, fontSize: 14, color: C.textPri, marginBottom: 3,
                              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                            }}>
                              {d.details.map(det => det.materialName).join(', ')}
                            </p>
                            <p style={{ fontSize: 11, color: C.textMuted }}>
                              {d.greenPointName} · {d.deliveredAt
                                ? new Date(d.deliveredAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
                                : '—'}
                            </p>
                            <span style={{
                              display: 'inline-block', marginTop: 6,
                              fontSize: 10, padding: '2px 8px', borderRadius: 20,
                              fontFamily: 'JetBrains Mono, monospace', fontWeight: 600,
                              background: d.status === 'VALIDATED' ? 'rgba(76,175,128,0.1)' : 'rgba(212,135,43,0.1)',
                              color: d.status === 'VALIDATED' ? C.greenLight : C.amber,
                            }}>
                              {d.status}
                            </span>
                          </div>
                          <div style={{ textAlign: 'right', flexShrink: 0 }}>
                            <p style={{
                              fontFamily: 'JetBrains Mono, monospace',
                              fontSize: 18, fontWeight: 600, color: C.green, marginBottom: 2,
                            }}>
                              {kg.toFixed(1)}<span style={{ fontSize: 12, marginLeft: 2, opacity: 0.7 }}>kg</span>
                            </p>
                            <p style={{ fontSize: 12, color: C.amber, fontWeight: 600 }}>+{pts} pts</p>
                          </div>
                        </motion.div>
                      )
                    })}
                </div>
              )}
            </TabView>
          )}

          {/* ══════════ TAB QR ══════════ */}
          {tab === 'qr' && (
            <TabView key="qr">
              <SectionHeader title="Mi Código QR" subtitle="Muéstralo en el Punto Verde" />

              <div style={{ textAlign: 'center' }}>
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 180 }}
                  style={{
                    display: 'inline-block',
                    background: '#fff',
                    borderRadius: 24, padding: 24,
                    boxShadow: `0 0 60px ${C.green}44`,
                    border: `2px solid ${C.green}66`,
                    position: 'relative', marginBottom: 24,
                  }}
                >
                  {/* Línea de escaneo animada */}
                  <motion.div
                    animate={{ top: ['5%', '95%', '5%'] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
                    style={{
                      position: 'absolute', left: 16, right: 16, height: 2,
                      background: `linear-gradient(90deg, transparent, ${C.greenLight}, transparent)`,
                      pointerEvents: 'none',
                    }}
                  />
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(userId)}`}
                    alt="QR de usuario"
                    width={200} height={200}
                    style={{ display: 'block' }}
                  />
                </motion.div>

                {/* Info */}
                <div style={{
                  background: C.bgCard, border: `1px solid ${C.border}`,
                  borderRadius: 16, padding: '18px 20px', display: 'inline-block', minWidth: 260,
                }}>
                  <p style={{
                    fontFamily: 'JetBrains Mono, monospace', fontSize: 13,
                    color: C.greenLight, fontWeight: 600, marginBottom: 6,
                  }}>
                    {userName}
                  </p>
                  <p style={{ fontSize: 11, color: C.textMuted, fontFamily: 'JetBrains Mono, monospace', marginBottom: 8 }}>
                    {userId?.slice(0, 8)}...{userId?.slice(-4)}
                  </p>
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    background: levelCfg.bg, border: `1px solid ${levelCfg.color}44`,
                    borderRadius: 20, padding: '4px 12px',
                  }}>
                    <span style={{ fontSize: 12, color: levelCfg.color, fontWeight: 700 }}>
                      {gamification?.levelDisplayName ?? 'Bronce'}
                    </span>
                  </div>
                </div>

                <p style={{ fontSize: 12, color: C.textMuted, marginTop: 20, lineHeight: 1.6 }}>
                  El operador escanea este código<br />para registrar tu entrega.
                </p>
              </div>
            </TabView>
          )}

        </AnimatePresence>
      </main>
    </div>
  )
}

// ─── Componentes auxiliares ──────────────────────────────────────────────────

function TabView({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.22 }}
    >
      {children}
    </motion.div>
  )
}

function SectionHeader({ title, subtitle }) {
  return (
    <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
      <h3 style={{ fontSize: 18, fontWeight: 800, color: '#E8F5EE' }}>{title}</h3>
      {subtitle && (
        <span style={{ fontSize: 12, color: '#5A7D6A', fontFamily: 'JetBrains Mono, monospace' }}>
          {subtitle}
        </span>
      )}
    </div>
  )
}

function EmptyState({ icon, title, desc, action }) {
  return (
    <div style={{ textAlign: 'center', padding: '48px 20px' }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>{icon}</div>
      <p style={{ fontWeight: 700, fontSize: 16, color: '#E8F5EE', marginBottom: 8 }}>{title}</p>
      <p style={{ fontSize: 13, color: '#5A7D6A', lineHeight: 1.6, marginBottom: action ? 20 : 0 }}>{desc}</p>
      {action && (
        <button onClick={action.onClick} style={{
          background: 'rgba(46,125,82,0.15)', border: '1px solid rgba(46,125,82,0.3)',
          borderRadius: 10, padding: '8px 20px', color: '#4CAF80',
          cursor: 'pointer', fontSize: 13, fontFamily: 'Syne, sans-serif', fontWeight: 600,
        }}>
          {action.label}
        </button>
      )}
    </div>
  )
}

function SkeletonBlock({ h = 80, mb = 12 }) {
  return (
    <div style={{
      height: h, borderRadius: 14, marginBottom: mb,
      background: 'rgba(46,125,82,0.06)',
      animation: 'pulse-dot 1.5s ease infinite',
    }} />
  )
}

function SkeletonGrid() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
      {[1,2,3,4].map(i => <SkeletonBlock key={i} h={130} mb={0} />)}
    </div>
  )
}

function SkeletonList() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {[1,2,3].map(i => <SkeletonBlock key={i} h={90} mb={0} />)}
    </div>
  )
}

function LoadingScreen() {
  return (
    <div style={{
      minHeight: '100vh', background: '#0F1F17',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      gap: 16, fontFamily: 'Syne, sans-serif',
    }}>
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
        style={{ fontSize: 36 }}>
        ♻️
      </motion.div>
      <p style={{ color: '#8FB89F', fontSize: 14 }}>Cargando tu perfil...</p>
    </div>
  )
}

function ErrorScreen({ message, onBack }) {
  return (
    <div style={{
      minHeight: '100vh', background: '#0F1F17',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      gap: 16, fontFamily: 'Syne, sans-serif', padding: 24,
    }}>
      <div style={{ fontSize: 36 }}>⚠️</div>
      <p style={{ color: '#E8F5EE', fontWeight: 700, fontSize: 16 }}>Algo salió mal</p>
      <p style={{ color: '#8FB89F', fontSize: 13, textAlign: 'center' }}>{message}</p>
      <button onClick={onBack} style={{
        background: 'rgba(46,125,82,0.15)', border: '1px solid rgba(46,125,82,0.3)',
        borderRadius: 10, padding: '10px 24px', color: '#4CAF80',
        cursor: 'pointer', fontSize: 14, fontFamily: 'Syne, sans-serif', fontWeight: 600,
      }}>
        Volver al inicio
      </button>
    </div>
  )
}
