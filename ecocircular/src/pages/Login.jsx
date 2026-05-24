import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

const ROLE_CONFIG = {
  ciudadano: {
    label: 'Ciudadano',
    icon: '♻️',
    color: '#2E7D52',
    glow: 'rgba(46,125,82,0.4)',
    accent: '#4CAF80',
    dest: '/ciudadano',
    badge: 'ECO-GUARDIÁN',
  },
  operador: {
    label: 'Operador de Punto Verde',
    icon: '📍',
    color: '#D4872B',
    glow: 'rgba(212,135,43,0.4)',
    accent: '#F0A84A',
    dest: '/operador',
    badge: 'OPERADOR VERIFICADO',
  },
  municipalidad: {
    label: 'Municipalidad',
    icon: '🏛️',
    color: '#4CAF80',
    glow: 'rgba(76,175,128,0.35)',
    accent: '#5DBA8A',
    dest: '/municipalidad',
    badge: 'ACCESO INSTITUCIONAL',
  },
}

export default function Login() {
  const { role } = useParams()
  const navigate = useNavigate()
  const cfg = ROLE_CONFIG[role] || ROLE_CONFIG.ciudadano

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [focused, setFocused] = useState(null)

  function handleSubmit(e) {
    e.preventDefault()
    if (!email || !password) { setError('Completa todos los campos'); return }
    setError('')
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      navigate(cfg.dest)
    }, 1400)
  }

  return (
    <div
      className="hex-bg"
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Ambient orbs */}
      <motion.div
        animate={{ y: [0, -24, 0], scale: [1, 1.08, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute', top: '5%', left: '5%',
          width: 360, height: 360, borderRadius: '50%',
          background: `radial-gradient(circle, ${cfg.glow} 0%, transparent 70%)`,
          pointerEvents: 'none',
        }}
      />
      <motion.div
        animate={{ x: [0, 16, -10, 0], y: [0, -10, 12, 0] }}
        transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute', bottom: '8%', right: '6%',
          width: 260, height: 260, borderRadius: '50%',
          background: `radial-gradient(circle, ${cfg.glow} 0%, transparent 70%)`,
          pointerEvents: 'none',
        }}
      />

      {/* Back button */}
      <motion.button
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => navigate('/')}
        style={{
          position: 'absolute', top: 24, left: 24,
          background: 'rgba(46,125,82,0.12)',
          border: '1px solid rgba(46,125,82,0.25)',
          borderRadius: 10, padding: '8px 16px',
          color: '#4CAF80', cursor: 'pointer',
          fontSize: 13, fontFamily: 'Syne, sans-serif', fontWeight: 600,
          display: 'flex', alignItems: 'center', gap: 6,
        }}
      >
        ← Volver
      </motion.button>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 32, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        style={{
          width: '100%', maxWidth: 420,
          background: 'rgba(15,31,23,0.85)',
          border: `1px solid ${cfg.color}33`,
          borderRadius: 24,
          backdropFilter: 'blur(24px)',
          boxShadow: `0 0 60px ${cfg.glow}, 0 24px 64px rgba(0,0,0,0.5)`,
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* Top accent line */}
        <div style={{
          height: 3,
          background: `linear-gradient(90deg, transparent, ${cfg.color}, transparent)`,
        }} />

        <div style={{ padding: '36px 36px 40px' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              style={{ fontSize: 48, marginBottom: 16 }}
            >
              {cfg.icon}
            </motion.div>

            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: `${cfg.color}1A`,
              border: `1px solid ${cfg.color}44`,
              borderRadius: 100, padding: '4px 14px', marginBottom: 14,
            }}>
              <span style={{
                width: 6, height: 6, borderRadius: '50%',
                background: cfg.accent, display: 'inline-block',
                animation: 'pulse-dot 2s infinite',
              }} />
              <span style={{
                fontSize: 11, color: cfg.accent,
                fontFamily: 'JetBrains Mono, monospace', letterSpacing: 1.5,
              }}>
                {cfg.badge}
              </span>
            </div>

            <h1 style={{
              fontFamily: 'Syne, sans-serif', fontWeight: 800,
              fontSize: 22, color: '#E8F5EE', marginBottom: 6,
            }}>
              Iniciar Sesión
            </h1>
            <p style={{ fontSize: 13, color: 'rgba(232,245,238,0.45)', lineHeight: 1.5 }}>
              {cfg.label}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Email */}
            <div>
              <label style={{
                display: 'block', fontSize: 12, fontWeight: 600,
                color: 'rgba(232,245,238,0.5)', marginBottom: 8,
                fontFamily: 'JetBrains Mono, monospace', letterSpacing: 1,
              }}>
                CORREO ELECTRÓNICO
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{
                  position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                  fontSize: 15, opacity: 0.4,
                }}>✉️</span>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onFocus={() => setFocused('email')}
                  onBlur={() => setFocused(null)}
                  placeholder="tu@correo.com"
                  style={{
                    width: '100%', background: 'rgba(255,255,255,0.04)',
                    border: `1px solid ${focused === 'email' ? cfg.color : 'rgba(232,245,238,0.1)'}`,
                    borderRadius: 12, padding: '13px 14px 13px 42px',
                    color: '#E8F5EE', fontSize: 14,
                    fontFamily: 'Syne, sans-serif', outline: 'none',
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                    boxShadow: focused === 'email' ? `0 0 0 3px ${cfg.color}22` : 'none',
                  }}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label style={{
                display: 'block', fontSize: 12, fontWeight: 600,
                color: 'rgba(232,245,238,0.5)', marginBottom: 8,
                fontFamily: 'JetBrains Mono, monospace', letterSpacing: 1,
              }}>
                CONTRASEÑA
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{
                  position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                  fontSize: 15, opacity: 0.4,
                }}>🔒</span>
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onFocus={() => setFocused('pass')}
                  onBlur={() => setFocused(null)}
                  placeholder="••••••••"
                  style={{
                    width: '100%', background: 'rgba(255,255,255,0.04)',
                    border: `1px solid ${focused === 'pass' ? cfg.color : 'rgba(232,245,238,0.1)'}`,
                    borderRadius: 12, padding: '13px 44px 13px 42px',
                    color: '#E8F5EE', fontSize: 14,
                    fontFamily: 'Syne, sans-serif', outline: 'none',
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                    boxShadow: focused === 'pass' ? `0 0 0 3px ${cfg.color}22` : 'none',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(s => !s)}
                  style={{
                    position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    fontSize: 15, opacity: 0.4, padding: 0,
                  }}
                >
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {/* Forgot password */}
            <div style={{ textAlign: 'right', marginTop: -8 }}>
              <button type="button" style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: 12, color: cfg.accent, fontFamily: 'Syne, sans-serif',
              }}>
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  style={{
                    background: 'rgba(220,60,60,0.12)',
                    border: '1px solid rgba(220,60,60,0.3)',
                    borderRadius: 10, padding: '10px 14px',
                    fontSize: 13, color: '#F08080', textAlign: 'center',
                  }}
                >
                  ⚠️ {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit */}
            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading}
              style={{
                background: loading
                  ? 'rgba(46,125,82,0.4)'
                  : `linear-gradient(135deg, ${cfg.color}, ${cfg.accent})`,
                border: 'none', borderRadius: 14,
                padding: '15px', color: '#fff',
                fontFamily: 'Syne, sans-serif', fontWeight: 700,
                fontSize: 15, cursor: loading ? 'default' : 'pointer',
                marginTop: 4,
                boxShadow: loading ? 'none' : `0 4px 24px ${cfg.glow}`,
                transition: 'all 0.3s',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}
            >
              {loading ? (
                <>
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                    style={{ display: 'inline-block', fontSize: 16 }}
                  >
                    ⟳
                  </motion.span>
                  Verificando...
                </>
              ) : (
                <>Ingresar →</>
              )}
            </motion.button>
          </form>

          {/* Divider */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12, margin: '24px 0 20px',
          }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(232,245,238,0.08)' }} />
            <span style={{ fontSize: 12, color: 'rgba(232,245,238,0.25)', fontFamily: 'JetBrains Mono, monospace' }}>
              ¿NUEVO?
            </span>
            <div style={{ flex: 1, height: 1, background: 'rgba(232,245,238,0.08)' }} />
          </div>

          <button
            type="button"
            style={{
              width: '100%', background: 'transparent',
              border: `1px solid ${cfg.color}44`,
              borderRadius: 14, padding: '13px',
              color: cfg.accent, fontFamily: 'Syne, sans-serif',
              fontWeight: 600, fontSize: 14, cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = cfg.color + '99'}
            onMouseLeave={e => e.currentTarget.style.borderColor = cfg.color + '44'}
          >
            Crear una cuenta
          </button>
        </div>
      </motion.div>

      {/* Footer */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        style={{
          marginTop: 28, fontSize: 11,
          color: 'rgba(232,245,238,0.2)',
          fontFamily: 'JetBrains Mono, monospace',
        }}
      >
        EcoCircular AI · Acceso seguro cifrado
      </motion.p>
    </div>
  )
}
