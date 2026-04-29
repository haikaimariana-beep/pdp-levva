import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { login } from '../api'
import { isLeader } from '../App'

export default function Login() {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [step, setStep] = useState('email')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { token, user } = await login(email, name)
      localStorage.setItem('pdp_token', token)
      localStorage.setItem('pdp_user', JSON.stringify(user))
      navigate(isLeader(user.email) ? '/leader' : '/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo / Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#FACC15] mb-6">
            <span className="text-black font-bold text-xl">PD</span>
          </div>
          <h1 className="text-3xl font-bold text-white">Plano de Desenvolvimento</h1>
          <p className="text-[#A3A3A3] mt-2 text-sm">Levva Design · Avaliação de Pilares</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-[#171717] rounded-2xl p-8 border border-[#262626]">
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-[#A3A3A3] mb-2">Email profissional</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="w-full bg-[#262626] text-white rounded-xl px-4 py-3 text-sm outline-none border border-transparent focus:border-[#FACC15] transition-colors placeholder-[#525252]"
              />
            </div>

            <div>
              <label className="block text-sm text-[#A3A3A3] mb-2">Seu nome</label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Nome Sobrenome"
                className="w-full bg-[#262626] text-white rounded-xl px-4 py-3 text-sm outline-none border border-transparent focus:border-[#FACC15] transition-colors placeholder-[#525252]"
              />
            </div>

            {error && (
              <p className="text-red-400 text-sm bg-red-400/10 rounded-lg px-3 py-2">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#FACC15] text-black font-semibold rounded-xl py-3 mt-2 hover:bg-yellow-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </div>
        </form>

        <p className="text-center text-[#525252] text-xs mt-6">
          Seus dados são salvos automaticamente
        </p>
      </motion.div>
    </div>
  )
}
