import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

const MATERIALS = [
  { name: 'Plástico PET', icon: '🧴', accepted: true },
  { name: 'Cartón', icon: '📦', accepted: true },
  { name: 'Vidrio', icon: '🍾', accepted: true },
  { name: 'Metal / Latas', icon: '🥫', accepted: true },
  { name: 'Papel', icon: '📄', accepted: true },
  { name: 'Unicel', icon: '❌', accepted: false },
]

const RECENT = [
  { time: '14:32', name: 'Ana P.', material: 'Plástico', kg: 3.2, code: 'ECO-2025-AP-4421' },
  { time: '14:15', name: 'Luis M.', material: 'Cartón', kg: 7.5, code: 'ECO-2025-LM-8834' },
  { time: '13:58', name: 'Sofía V.', material: 'Vidrio', kg: 4.1, code: 'ECO-2025-SV-2291' },
  { time: '13:40', name: 'Pedro A.', material: 'Metal', kg: 1.8, code: 'ECO-2025-PA-6673' },
]

function Confetti({ active }) {
  if (!active) return null
  const pieces = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: 20 + Math.random() * 60,
    color: ['#2E7D52','#D4872B','#4CAF80','#F0A84A','#1A3D2B'][i % 5],
    delay: Math.random() * 0.5,
    duration: 0.8 + Math.random() * 0.6,
  }))
  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', overflow: 'hidden' }}>
      {pieces.map(p => (
        <motion.div key={p.id}
          initial={{ y: -10, x: `${p.x}%`, opacity: 1, rotate: 0 }}
          animate={{ y: 140, opacity: 0, rotate: 720 }}
          transition={{ duration: p.duration, delay: p.delay, ease: 'easeIn' }}
          style={{
            position: 'absolute', width: 8, height: 8,
            background: p.color, borderRadius: 2,
          }}
        />
      ))}
    </div>
  )
}

export default function OperadorDashboard() {
  const navigate = useNavigate()
  const [code, setCode] = useState('')
  const [scanning, setScanning] = useState(false)
  const [validated, setValidated] = useState(null)
  const [confetti, setConfetti] = useState(false)
  const [scanLine, setScanLine] = useState(0)

  useEffect(() => {
    if (!scanning) return
    const interval = setInterval(() => {
      setScanLine(l => (l + 2) % 100)
    }, 20)
    const timeout = setTimeout(() => {
      setScanning(false)
      handleValidate('ECO-2025-JP-7734')
    }, 3000)
    return () => { clearInterval(interval); clearTimeout(timeout) }
  }, [scanning])

  function handleValidate(c = code) {
    if (!c.trim()) return
    const result = {
      code: c,
      name: 'Juan Pérez',
      material: 'Plástico PET',
      kg: 2.4,
      level: 7,
      pts: 120,
    }
    setValidated(result)
    setConfetti(true)
    setTimeout(() => setConfetti(false), 2000)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0F1F17',
      fontFamily: 'Syne, sans-serif',
      color: '#E8F5EE',
    }}>
      {/* Topbar */}
      <div style={{
        background: 'rgba(26,61,43,0.9)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(46,125,82,0.2)',
        padding: '16px 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <button onClick={() => navigate('/')} style={{
          background: 'none', border: 'none', color: '#4CAF80',
          cursor: 'pointer', fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6,
        }}>
          ← EcoCircular
        </button>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: 'rgba(46,125,82,0.15)',
          border: '1px solid rgba(46,125,82,0.3)',
          borderRadius: 20, padding: '6px 14px',
        }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#4CAF80', display: 'inline-block',
            animation: 'pulse-dot 2s infinite' }} />
          <span style={{ fontSize: 12, color: '#4CAF80', fontFamily: 'JetBrains Mono, monospace' }}>PUNTO VERDE SUR · EN VIVO</span>
        </div>
      </div>

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '24px 16px' }}>
        {/* Day stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 28 }}>
          {[
            { label: 'Entregas hoy', value: '34', icon: '📥' },
            { label: 'kg recibidos', value: '127.4', icon: '⚖️' },
            { label: 'Ciudadanos', value: '28', icon: '👥' },
          ].map(s => (
            <div key={s.label} style={{
              background: 'rgba(22,43,31,0.8)',
              border: '1px solid rgba(46,125,82,0.2)',
              borderRadius: 16, padding: '18px 16px', textAlign: 'center',
            }}>
              <div style={{ fontSize: 24, marginBottom: 6 }}>{s.icon}</div>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 22, fontWeight: 600, color: '#4CAF80' }}>{s.value}</div>
              <div style={{ fontSize: 11, color: '#5A7D6A', marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Scanner section */}
        <div style={{
          background: 'rgba(22,43,31,0.8)',
          border: '1px solid rgba(46,125,82,0.2)',
          borderRadius: 20, padding: 28, marginBottom: 20,
          position: 'relative', overflow: 'hidden',
        }}>
          <Confetti active={confetti} />

          <h3 style={{ fontWeight: 700, fontSize: 17, color: '#E8F5EE', marginBottom: 20 }}>
            📷 Validar Entrega
          </h3>

          {/* QR scanner box */}
          <div style={{ position: 'relative', marginBottom: 20 }}>
            <div
              onClick={() => { if (!scanning) setScanning(true) }}
              style={{
                background: '#0A1710',
                border: `2px solid ${scanning ? '#4CAF80' : 'rgba(46,125,82,0.3)'}`,
                borderRadius: 16, height: 180,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                cursor: scanning ? 'default' : 'pointer',
                position: 'relative', overflow: 'hidden',
                transition: 'border-color 0.3s',
              }}
            >
              {/* Corner brackets */}
              {[{top:12,left:12},{top:12,right:12},{bottom:12,left:12},{bottom:12,right:12}].map((pos,i) => (
                <div key={i} style={{
                  position: 'absolute', ...pos,
                  width: 24, height: 24,
                  borderTop: i < 2 ? '3px solid #4CAF80' : 'none',
                  borderBottom: i >= 2 ? '3px solid #4CAF80' : 'none',
                  borderLeft: (i===0||i===2) ? '3px solid #4CAF80' : 'none',
                  borderRight: (i===1||i===3) ? '3px solid #4CAF80' : 'none',
                }} />
              ))}

              {/* Scan line */}
              {scanning && (
                <div style={{
                  position: 'absolute', left: 0, right: 0, height: 2,
                  background: 'linear-gradient(90deg,transparent,#4CAF80,transparent)',
                  top: `${scanLine}%`, transition: 'none',
                  boxShadow: '0 0 8px rgba(76,175,128,0.6)',
                }} />
              )}

              {scanning ? (
                <p style={{ color: '#4CAF80', fontSize: 14, fontFamily: 'JetBrains Mono, monospace', zIndex: 1 }}>
                  Escaneando...
                </p>
              ) : (
                <p style={{ color: '#5A7D6A', fontSize: 13, textAlign: 'center', lineHeight: 1.6 }}>
                  Tap para simular<br />escaneo QR
                </p>
              )}
            </div>
          </div>

          {/* Manual input */}
          <div style={{ display: 'flex', gap: 10 }}>
            <input
              value={code}
              onChange={e => setCode(e.target.value)}
              placeholder="ECO-2025-XX-0000"
              style={{
                flex: 1, background: '#0A1710',
                border: '1px solid rgba(46,125,82,0.3)',
                borderRadius: 10, padding: '12px 16px',
                color: '#E8F5EE', fontSize: 14,
                fontFamily: 'JetBrains Mono, monospace',
                outline: 'none',
              }}
            />
            <button onClick={() => handleValidate()} style={{
              background: 'linear-gradient(135deg,#2E7D52,#4CAF80)',
              border: 'none', borderRadius: 10, padding: '12px 20px',
              color: '#fff', fontFamily: 'Syne, sans-serif', fontWeight: 700,
              cursor: 'pointer', fontSize: 14,
            }}>
              Validar
            </button>
          </div>

          {/* Validated result */}
          <AnimatePresence>
            {validated && (
              <motion.div
                initial={{ opacity: 0, y: 12, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0 }}
                style={{
                  marginTop: 16,
                  background: 'rgba(46,125,82,0.15)',
                  border: '1px solid rgba(76,175,128,0.4)',
                  borderRadius: 14, padding: '16px 20px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ fontWeight: 700, color: '#4CAF80', marginBottom: 4 }}>✓ Entrega Validada</p>
                    <p style={{ fontSize: 13, color: '#8FB89F' }}>{validated.name} · Nivel {validated.level}</p>
                    <p style={{ fontSize: 13, color: '#8FB89F' }}>{validated.material} · {validated.kg} kg</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 22, fontWeight: 600, color: '#D4872B' }}>+{validated.pts}</p>
                    <p style={{ fontSize: 11, color: '#5A7D6A' }}>puntos</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Materials accepted */}
        <div style={{
          background: 'rgba(22,43,31,0.8)',
          border: '1px solid rgba(46,125,82,0.2)',
          borderRadius: 20, padding: '24px 20px', marginBottom: 20,
        }}>
          <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 16 }}>Materiales Aceptados</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10 }}>
            {MATERIALS.map(m => (
              <div key={m.name} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                background: m.accepted ? 'rgba(46,125,82,0.1)' : 'rgba(255,80,80,0.07)',
                border: `1px solid ${m.accepted ? 'rgba(46,125,82,0.2)' : 'rgba(255,80,80,0.15)'}`,
                borderRadius: 10, padding: '10px 14px',
              }}>
                <span style={{ fontSize: 20 }}>{m.icon}</span>
                <span style={{ fontSize: 13, color: m.accepted ? '#8FB89F' : '#A06060' }}>{m.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent validations */}
        <div style={{
          background: 'rgba(22,43,31,0.8)',
          border: '1px solid rgba(46,125,82,0.2)',
          borderRadius: 20, padding: '24px 20px',
        }}>
          <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 16 }}>Validaciones Recientes</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {RECENT.map((r, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.07 }}
                style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '12px 0', borderBottom: i < RECENT.length - 1 ? '1px solid rgba(46,125,82,0.15)' : 'none',
                }}
              >
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#5A7D6A', minWidth: 40 }}>{r.time}</span>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 600, color: '#E8F5EE' }}>{r.name}</p>
                    <p style={{ fontSize: 12, color: '#5A7D6A' }}>{r.material}</p>
                  </div>
                </div>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 15, fontWeight: 600, color: '#4CAF80' }}>{r.kg} kg</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
