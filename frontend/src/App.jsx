import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Wizard from './pages/Wizard'
import Dashboard from './pages/Dashboard'
import LeaderDashboard from './pages/LeaderDashboard'

function PrivateRoute({ children }) {
  const token = localStorage.getItem('pdp_token')
  return token ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/wizard" element={<PrivateRoute><Wizard /></PrivateRoute>} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/leader" element={<PrivateRoute><LeaderDashboard /></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
