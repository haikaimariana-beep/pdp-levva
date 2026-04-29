const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

// ─── Token helpers ────────────────────────────────────────────────────────────
function getToken() {
  return localStorage.getItem('pdp_token')
}

function authHeaders() {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${getToken()}`,
  }
}

async function handleResponse(res) {
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Erro desconhecido' }))
    throw new Error(err.error || `HTTP ${res.status}`)
  }
  return res.json()
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
export async function login(email, name) {
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, name }),
  })
  const data = await handleResponse(res)
  localStorage.setItem('pdp_token', data.token)
  localStorage.setItem('pdp_user', JSON.stringify(data.user))
  return data
}

export function logout() {
  localStorage.removeItem('pdp_token')
  localStorage.removeItem('pdp_user')
}

export function getCurrentUser() {
  const u = localStorage.getItem('pdp_user')
  return u ? JSON.parse(u) : null
}

// ─── Pillars ──────────────────────────────────────────────────────────────────
export async function getPillars() {
  const res = await fetch(`${BASE_URL}/api/pillars`, { headers: authHeaders() })
  return handleResponse(res)
}

// ─── Evaluations ─────────────────────────────────────────────────────────────
export async function getEvaluations() {
  const res = await fetch(`${BASE_URL}/api/evaluations`, { headers: authHeaders() })
  return handleResponse(res)
}

export async function saveEvaluation(pillar_id, score, evidence, goal) {
  const res = await fetch(`${BASE_URL}/api/evaluations`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ pillar_id, score, evidence, goal }),
  })
  return handleResponse(res)
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
export async function getDashboard() {
  const res = await fetch(`${BASE_URL}/api/dashboard`, { headers: authHeaders() })
  return handleResponse(res)
}

// ─── Leader ───────────────────────────────────────────────────────────────────
export async function getLeaderUsers() {
  const res = await fetch(`${BASE_URL}/api/leader/users`, { headers: authHeaders() })
  return handleResponse(res)
}

export async function getLeaderUser(userId) {
  const res = await fetch(`${BASE_URL}/api/leader/user/${userId}`, { headers: authHeaders() })
  return handleResponse(res)
}

export async function getLeaderTeam() {
  const res = await fetch(`${BASE_URL}/api/leader/team`, { headers: authHeaders() })
  return handleResponse(res)
}
