import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Wizard from './pages/Wizard'
import Dashboard from './pages/Dashboard'
import LeaderDashboard from './pages/LeaderDashboard'

// Prefixos (antes do @) que têm acesso à visão de liderança
const LEADER_PREFIXES = ['caio.lider', 'greg.lider', 'mariana']

export function isLeader(email = '') {
  const local = email.split('@')[0].toLowerCase()
  return LEADER_PREFIXES.some(prefix => local === prefix)
}

function PrivateRoute({ children }) {
  const token = localStorage.getItem('pdp_token')
  return token ? children : <Navigate to="/login" replace />
}

function LeaderRoute({ children }) {
  const token = localStorage.getItem('pdp_token')
  if (!token) return <Navigate to="/login" replace />
  const user = JSON.parse(localStorage.getItem('pdp_user') || '{}')
  if (!isLeader(user.email)) return <Navigate to="/dashboard" replace />
  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/wizard" element={<PrivateRoute><Wizard /></PrivateRoute>} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/leader" element={<LeaderRoute><LeaderDashboard /></LeaderRoute>} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
