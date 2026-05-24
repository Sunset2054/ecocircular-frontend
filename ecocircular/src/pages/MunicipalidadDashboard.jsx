import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'

const WEEKLY = [
  { dia: 'Lun', kg: 340, entregas: 28 },
  { dia: 'Mar', kg: 520, entregas: 41 },
  { dia: 'Mié', kg: 410, entregas: 33 },
  { dia: 'Jue', kg: 680, entregas: 55 },
  { dia: 'Vie', kg: 890, entregas: 72 },
  { dia: 'Sáb', kg: 1240, entregas: 98 },
  { dia: 'Dom', kg: 780, entregas: 62 },
]

const MATERIALES = [
  { name: 'Plástico', value: 38, color: '#2E7D52', progress: 0.78 },
  { name: 'Cartón', value: 27, color: '#D4872B', progress: 0.55 },
  { name: 'Vidrio', value: 18, color: '#1A3D2B', progress: 0.37 },
  { name: 'Metal', value: 11, color: '#4CAF80', progress: 0.22 },
  { name: 'Papel', value: 6, color: '#8FB89F', progress: 0.12 },
]

const TOP_PUNTOS = [
  { rank: 1, name: 'Punto Verde Sur', kg: 2840, pct: 100 },
  { rank: 2, name: 'Punto Verde Centro', kg: 2310, pct: 81 },
  { rank: 3, name: 'Punto Verde Norte', kg: 1980, pct: 70 },
]

const KPIS = [
  { label: 'kg Totales', value: '12,480', unit: 'kg', icon: '♻️', color: '#2E7D52', bg: '#EEF7F1', delta: '+8.4%' },
  { label: 'Ciudadanos Activos', value: '1,247', unit: '', icon: '👥', color: '#1A3D2B', bg: '#E8F0EC', delta: '+12%' },
  { label: 'CO₂ Evitado', value: '17,840', unit: 'kg', icon: '🌿', color: '#D4872B', bg: '#FBF3E8', delta: '+6.2%' },
  { label: 'Puntos Verdes', value: '14', unit: 'activos', icon: '📍', color: '#4CAF80', bg: '#F0FAF4', delta: '+2' },
]

export default function MunicipalidadDashboard() {
  const navigate = useNavigate()

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
        {/* Title */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#1A3D2B', marginBottom: 4 }}>
            Panel de Control
          </h1>
          <p style={{ fontSize: 14, color: '#6B8C78' }}>Semana del 16 – 22 de junio, 2025</p>
        </div>

        {/* KPI cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(190px,1fr))', gap: 16, marginBottom: 28 }}>
          {KPIS.map((k, i) => (
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
              }}>{k.delta} esta semana</span>
            </motion.div>
          ))}
        </div>

        {/* Charts row */}
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
              <LineChart data={WEEKLY}>
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
                <Pie data={MATERIALES} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                  {MATERIALES.map((m, i) => <Cell key={i} fill={m.color} />)}
                </Pie>
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, fontFamily: 'Syne' }} />
                <Tooltip formatter={(v) => `${v}%`} contentStyle={{ background: '#1A3D2B', border: 'none', borderRadius: 8, color: '#E8F5EE' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Material bars */}
          <div style={{ background: '#fff', borderRadius: 20, padding: '24px 20px', border: '1px solid #E0EDE6' }}>
            <h3 style={{ fontWeight: 700, fontSize: 16, color: '#1A3D2B', marginBottom: 16 }}>Distribución</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {MATERIALES.map((m) => (
                <div key={m.name}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <span style={{ fontSize: 13, color: '#3A5C47', fontWeight: 600 }}>{m.name}</span>
                    <span style={{ fontSize: 13, color: '#6B8C78', fontFamily: 'JetBrains Mono, monospace' }}>{m.value}%</span>
                  </div>
                  <div style={{ background: '#EEF2F0', borderRadius: 6, height: 8 }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${m.progress * 100}%` }}
                      transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
                      style={{ height: '100%', background: m.color, borderRadius: 6 }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top puntos verdes */}
        <div style={{ background: '#fff', borderRadius: 20, padding: '24px 20px', border: '1px solid #E0EDE6' }}>
          <h3 style={{ fontWeight: 700, fontSize: 16, color: '#1A3D2B', marginBottom: 16 }}>🏆 Top Puntos Verdes</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {TOP_PUNTOS.map((p, i) => (
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
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#1A3D2B' }}>{p.name}</span>
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
    </div>
  )
}
