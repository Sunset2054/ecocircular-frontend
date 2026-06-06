import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

const roles = [
  {
    id: 'ciudadano',
    icon: '♻️',
    title: 'Ciudadano',
    desc: 'Registra tus reciclajes, acumula puntos y sube de nivel en la economía circular.',
    color: '#2E7D52',
    glow: 'rgba(46,125,82,0.35)',
    path: '/ciudadano',
  },
  {
    id: 'operador',
    icon: '📍',
    title: 'Operador de Punto Verde',
    desc: 'Valida entregas con QR, gestiona materiales y registra el impacto en tiempo real.',
    color: '#D4872B',
    glow: 'rgba(212,135,43,0.35)',
    path: '/operador',
  },
  {
    id: 'municipalidad',
    icon: '🏛️',
    title: 'Municipalidad',
    desc: 'Monitorea KPIs, analiza tendencias y optimiza la red de puntos verdes de tu ciudad.',
    color: '#1A3D2B',
    glow: 'rgba(26,61,43,0.4)',
    path: '/municipalidad',
  },
]

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
}
const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
}

export default function RoleSelection() {
  const navigate = useNavigate()

  return (
    <div
      className="hex-bg"
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Ambient orbs */}
      <motion.div
        animate={{ y: [0, -28, 0], scale: [1, 1.06, 1] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute', top: '8%', left: '10%',
          width: 320, height: 320, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(46,125,82,0.28) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />
      <motion.div
        animate={{ x: [0, 18, -12, 0], y: [0, -12, 10, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute', bottom: '12%', right: '8%',
          width: 280, height: 280, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(212,135,43,0.22) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />
      <motion.div
        animate={{ y: [0, 20, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        style={{
          position: 'absolute', top: '50%', right: '15%',
          width: 180, height: 180, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(93,186,138,0.15) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        style={{ textAlign: 'center', marginBottom: 56, position: 'relative', zIndex: 1 }}
      >
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'rgba(46,125,82,0.15)', border: '1px solid rgba(46,125,82,0.3)',
          borderRadius: 100, padding: '6px 16px', marginBottom: 20,
        }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#4CAF80', display: 'inline-block', animation: 'pulse-dot 2s infinite' }} />
          <span style={{ fontSize: 12, color: '#4CAF80', fontFamily: 'JetBrains Mono, monospace', letterSpacing: 2 }}>
            PLATAFORMA ACTIVA
          </span>
        </div>

        <h1 style={{
          fontFamily: 'Syne, sans-serif', fontWeight: 800,
          fontSize: 'clamp(2.2rem, 5vw, 3.8rem)',
          lineHeight: 1.1, marginBottom: 16,
          background: 'linear-gradient(135deg, #E8F5EE 30%, #5DBA8A)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>
          EcoCircular AI
        </h1>
        <p style={{ fontSize: 16, color: 'rgba(232,245,238,0.6)', maxWidth: 480, margin: '0 auto', lineHeight: 1.7 }}>
          Economía circular con inteligencia, gamificación y trazabilidad.<br />¿Cómo participas hoy?
        </p>
      </motion.div>

      {/* Role cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{
          display: 'flex', flexWrap: 'wrap', gap: 24,
          justifyContent: 'center', maxWidth: 960,
          position: 'relative', zIndex: 1,
        }}
      >
        {roles.map((role) => (
          <motion.div
            key={role.id}
            variants={cardVariants}
            whileHover={{ y: -8, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate(`/login/${role.id}`)}
            style={{
              width: 280, cursor: 'pointer',
              background: 'rgba(22,43,31,0.8)',
              border: `1px solid ${role.color}44`,
              borderRadius: 20, padding: '36px 28px',
              backdropFilter: 'blur(16px)',
              boxShadow: `0 0 40px ${role.glow}, 0 8px 32px rgba(0,0,0,0.4)`,
              transition: 'box-shadow 0.3s ease, border-color 0.3s ease',
              position: 'relative', overflow: 'hidden',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = role.color + '88'
              e.currentTarget.style.boxShadow = `0 0 60px ${role.glow}, 0 12px 40px rgba(0,0,0,0.5)`
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = role.color + '44'
              e.currentTarget.style.boxShadow = `0 0 40px ${role.glow}, 0 8px 32px rgba(0,0,0,0.4)`
            }}
          >
            {/* Card glow accent */}
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: 2,
              background: `linear-gradient(90deg, transparent, ${role.color}, transparent)`,
            }} />

            <div style={{ fontSize: 40, marginBottom: 20 }}>{role.icon}</div>
            <h2 style={{
              fontFamily: 'Syne, sans-serif', fontWeight: 700,
              fontSize: 20, color: '#E8F5EE', marginBottom: 12,
            }}>
              {role.title}
            </h2>
            <p style={{ fontSize: 14, color: 'rgba(232,245,238,0.55)', lineHeight: 1.7, marginBottom: 24 }}>
              {role.desc}
            </p>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              fontSize: 13, color: role.color === '#1A3D2B' ? '#4CAF80' : role.color,
              fontWeight: 600,
            }}>
              <span>Ingresar</span>
              <span style={{ fontSize: 16 }}>→</span>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Footer */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        style={{ marginTop: 56, fontSize: 12, color: 'rgba(232,245,238,0.25)', fontFamily: 'JetBrains Mono, monospace' }}
      >
        v1.0.0 · EcoCircular AI · 2025
      </motion.p>
    </div>
  )
}
