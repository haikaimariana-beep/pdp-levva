const BASE = '/api'

function headers() {
  const token = localStorage.getItem('pdp_token')
  return { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }
}

export async function login(email, name) {
  const res = await fetch(`${BASE}/auth/login`, { method: 'POST', headers: headers(), body: JSON.stringify({ email, name }) })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error)
  return data
}

export async function getPillars() {
  const res = await fetch(`${BASE}/pillars`, { headers: headers() })
  return res.json()
}

export async function getEvaluations() {
  const res = await fetch(`${BASE}/evaluations`, { headers: headers() })
  return res.json()
}

export async function saveEvaluation(pillar_id, score, evidence, goal) {
  const res = await fetch(`${BASE}/evaluations`, {
    method: 'POST', headers: headers(),
    body: JSON.stringify({ pillar_id, score, evidence, goal })
  })
  return res.json()
}

export async function getDashboard() {
  const res = await fetch(`${BASE}/dashboard`, { headers: headers() })
  return res.json()
}

export async function getLeaderUsers() {
  const res = await fetch(`${BASE}/leader/users`, { headers: headers() })
  return res.json()
}

export async function getLeaderUser(userId) {
  const res = await fetch(`${BASE}/leader/user/${userId}`, { headers: headers() })
  return res.json()
}

export async function getLeaderTeam() {
  const res = await fetch(`${BASE}/leader/team`, { headers: headers() })
  return res.json()
}
