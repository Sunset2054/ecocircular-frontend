// src/api.js
// Conexión con el backend Spring Boot de EcoCircular

const BASE_URL = 'http://localhost:8080'

// ─── Token helpers ────────────────────────────────────────────────────────────
export function getToken() {
  return localStorage.getItem('eco_token')
}
function setToken(token) {
  localStorage.setItem('eco_token', token)
}
export function clearToken() {
  localStorage.removeItem('eco_token')
  localStorage.removeItem('eco_user')
}
export function getUser() {
  try { return JSON.parse(localStorage.getItem('eco_user')) } catch { return null }
}
function setUser(user) {
  localStorage.setItem('eco_user', JSON.stringify(user))
}

// ─── Base fetch con token automático ─────────────────────────────────────────
async function apiFetch(path, options = {}) {
  const token = getToken()
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  }
  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers })

  if (res.status === 401) {
    clearToken()
    window.location.href = '/'
    return
  }

  if (!res.ok) {
    const errorText = await res.text()
    throw new Error(errorText || `Error ${res.status}`)
  }

  // 204 No Content no tiene body
  if (res.status === 204) return null
  return res.json()
}

// ─────────────────────────────────────────────────────────────────────────────
// AUTH  →  POST /auth/login
// ─────────────────────────────────────────────────────────────────────────────
export async function login({ email, password, tenantId }) {
  const data = await apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password, tenantId }),
  })
  // Guarda el token y decodifica el usuario del JWT
  setToken(data.token)
  const payload = parseJwt(data.token)
  setUser(payload)
  return { token: data.token, user: payload }
}

function parseJwt(token) {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    return JSON.parse(atob(base64))
  } catch {
    return {}
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// USERS  →  /users
// ─────────────────────────────────────────────────────────────────────────────

// Registrar usuario nuevo
export async function registerUser({ name, email, password, role, tenantId }) {
  return apiFetch('/users/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password, role, tenantId }),
  })
}

// Obtener usuario por ID
export async function getUserById(id) {
  return apiFetch(`/users/${id}`)
}

// Listar todos los usuarios (con paginación)
export async function listUsers(page = 0, size = 20) {
  return apiFetch(`/users?page=${page}&size=${size}`)
}

// Actualizar usuario
export async function updateUser(id, { name, email, role }) {
  return apiFetch(`/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ name, email, role }),
  })
}

// Eliminar usuario
export async function deleteUser(id) {
  return apiFetch(`/users/${id}`, { method: 'DELETE' })
}

// ─────────────────────────────────────────────────────────────────────────────
// GREEN POINTS  →  /api/green-points
// ─────────────────────────────────────────────────────────────────────────────

// Listar todos los puntos verdes del tenant
export async function listGreenPoints() {
  return apiFetch('/api/green-points')
}

// Crear punto verde (requiere MANAGE_GREEN_POINTS)
export async function createGreenPoint({ name, locationLat, locationLng, schedule, capacity, acceptedMaterials, status }) {
  return apiFetch('/api/green-points', {
    method: 'POST',
    body: JSON.stringify({ name, locationLat, locationLng, schedule, capacity, acceptedMaterials, status }),
  })
}

// Actualizar punto verde
export async function updateGreenPoint(id, data) {
  return apiFetch(`/api/green-points/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

// Deshabilitar punto verde
export async function disableGreenPoint(id) {
  return apiFetch(`/api/green-points/${id}/disable`, { method: 'PATCH' })
}

// ─────────────────────────────────────────────────────────────────────────────
// MATERIALS  →  /api/materials
// ─────────────────────────────────────────────────────────────────────────────

// Listar materiales del tenant
export async function listMaterials() {
  return apiFetch('/api/materials')
}

// Crear material (requiere MANAGE_GREEN_POINTS)
export async function createMaterial({ name, description, pointsPerKg, status }) {
  return apiFetch('/api/materials', {
    method: 'POST',
    body: JSON.stringify({ name, description, pointsPerKg, status }),
  })
}

// Actualizar material
export async function updateMaterial(id, data) {
  return apiFetch(`/api/materials/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

// Desactivar material
export async function deactivateMaterial(id) {
  return apiFetch(`/api/materials/${id}`, { method: 'DELETE' })
}