import axios from 'axios'

const BASE    = 'http://localhost:8080'
const API_URL = `${BASE}/api/deliveries`

function authHeader() {
  const token = localStorage.getItem('eco_token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

// ── Crear entrega ─────────────────────────────────────────────────────────────
export async function createDelivery(data) {
  const response = await axios.post(API_URL, data, { headers: authHeader() })
  return response.data
}

// ── Validar entrega ───────────────────────────────────────────────────────────
// FIX: era axios.patch, debe ser axios.post
export async function validateDelivery(id) {
  const response = await axios.post(`${API_URL}/${id}/validar`, {}, { headers: authHeader() })
  return response.data
}

// ── Todas las entregas del tenant (sin paginación) ────────────────────────────
async function fetchAll() {
  const response = await axios.get(API_URL, { headers: authHeader() })
  const data = response.data
  return Array.isArray(data) ? data : (data?.content ?? [])
}

// ── Entregas recientes (últimas N) ────────────────────────────────────────────
export async function getRecent(size = 10) {
  const all = await fetchAll()
  return all.slice(0, size)
}

// ── KPIs del día ──────────────────────────────────────────────────────────────
export async function getStats() {
  const deliveries = await fetchAll()

  const hoy = new Date().toISOString().slice(0, 10)
  const entregasHoy = deliveries.filter(d => {
    const fecha = d.createdAt ?? d.deliveredAt ?? ''
    return typeof fecha === 'string' && fecha.startsWith(hoy)
  })

  const kgRecibidos = entregasHoy.reduce((acc, d) => {
    return acc + (d.details ?? []).reduce((sum, det) => sum + (det.quantity ?? 0), 0)
  }, 0)

  const ciudadanos = new Set(
    entregasHoy.map(d => d.userId).filter(Boolean)
  ).size

  return {
    deliveriesToday: entregasHoy.length,
    kgReceived:      parseFloat(kgRecibidos.toFixed(1)),
    citizensToday:   ciudadanos,
  }
}