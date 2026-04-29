import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  ResponsiveContainer, Tooltip
} from 'recharts'
import { Pencil, LogOut, ChevronDown, CheckCircle2, Circle, TrendingUp, Target, LayoutGrid, Users } from 'lucide-react'
import { getDashboard } from '../api'
import { isLeader } from '../App'

const LEVEL_COLORS = { 1: '#EF4444', 2: '#F97316', 3: '#EAB308', 4: '#22C55E', 5: '#FACC15' }
const LEVEL_LABELS = { 0: '—', 1: 'Iniciante', 2: 'Básico', 3: 'Intermediário', 4: 'Avançado', 5: 'Referência' }

function ScorePill({ score }) {
  if (!score) return <span className="text-[#3A3A3A] text-xs">Não avaliado</span>
  return (
    <span
      className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
      style={{ background: LEVEL_COLORS[score] + '20', color: LEVEL_COLORS[score] }}
    >
      {score} · {LEVEL_LABELS[score]}
    </span>
  )
}

function ScoreBar({ value, max = 5 }) {
  const color = value >= 4 ? '#22C55E' : value >= 3 ? '#EAB308' : value > 0 ? '#F97316' : '#2A2A2A'
  return (
    <div className="flex-1 h-1.5 bg-[#1C1C1C] rounded-full overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${(value / max) * 100}%` }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="h-full rounded-full"
        style={{ background: color }}
      />
    </div>
  )
}

function CategoryCard({ category, index }) {
  const [open, setOpen] = useState(false)
  const color = category.avg >= 4 ? '#22C55E' : category.avg >= 3 ? '#EAB308' : category.avg > 0 ? '#F97316' : '#3A3A3A'
  const pct = Math.round((category.completed / category.total) * 100)

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className="bg-[#111111] rounded-2xl border border-[#1E1E1E] overflow-hidden"
    >
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-4 px-5 py-4 hover:bg-[#161616] transition-colors text-left"
      >
        {/* Color dot */}
        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: color }} />

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-white font-semibold text-sm truncate">{category.name}</span>
            <span className="text-[#3A3A3A] text-xs flex-shrink-0">{category.completed}/{category.total}</span>
          </div>
          <div className="flex items-center gap-2">
            <ScoreBar value={category.avg} />
            <span className="text-xs font-bold flex-shrink-0 w-6 text-right" style={{ color }}>
              {category.avg > 0 ? category.avg.toFixed(1) : '—'}
            </span>
          </div>
        </div>

        {/* Progress ring */}
        <div className="flex-shrink-0 relative w-9 h-9">
          <svg viewBox="0 0 36 36" className="w-9 h-9 -rotate-90">
            <circle cx="18" cy="18" r="15" fill="none" stroke="#1E1E1E" strokeWidth="3" />
            <motion.circle
              cx="18" cy="18" r="15" fill="none"
              stroke={pct === 100 ? '#FACC15' : '#FACC1550'}
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 15}`}
              initial={{ strokeDashoffset: 2 * Math.PI * 15 }}
              animate={{ strokeDashoffset: 2 * Math.PI * 15 * (1 - pct / 100) }}
              transition={{ duration: 0.8, ease: 'easeOut', delay: index * 0.06 }}
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold" style={{ color: pct === 100 ? '#FACC15' : '#525252' }}>
            {pct}%
          </span>
        </div>

        <ChevronDown
          size={15}
          className="text-[#3A3A3A] flex-shrink-0 transition-transform"
          style={{ transform: open ? 'rotate(180deg)' : 'none' }}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-[#1E1E1E]"
          >
            {category.pillars.map((pillar, i) => (
              <div
                key={pillar.id}
                className="flex items-start gap-3 px-5 py-3 border-b border-[#161616] last:border-0 hover:bg-[#141414] transition-colors"
              >
                <div className="flex-shrink-0 mt-0.5">
                  {pillar.evaluation?.score
                    ? <CheckCircle2 size={14} style={{ color: LEVEL_COLORS[pillar.evaluation.score] }} />
                    : <Circle size={14} className="text-[#2A2A2A]" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[#525252] text-xs font-mono">{pillar.code}</span>
                    <span className="text-[#D4D4D4] text-sm font-medium truncate">{pillar.name}</span>
                  </div>
                  {pillar.evaluation?.evidence && (
                    <p className="text-[#525252] text-xs mt-1 line-clamp-1 italic">
                      "{pillar.evaluation.evidence}"
                    </p>
                  )}
                  {pillar.evaluation?.goal && (
                    <p className="text-[#FACC15]/60 text-xs mt-0.5 line-clamp-1">
                      → {pillar.evaluation.goal}
                    </p>
                  )}
                </div>
                <div className="flex-shrink-0">
                  <ScorePill score={pillar.evaluation?.score} />
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

const CustomTooltip = ({ active, payload }) => {
  if (active && payload?.length) {
    const d = payload[0].payload
    return (
      <div className="bg-[#1C1C1C] border border-[#2A2A2A] rounded-xl px-3 py-2 text-xs shadow-xl">
        <p className="text-[#FACC15] font-semibold mb-0.5">{d.fullName}</p>
        <p className="text-white">{d.score > 0 ? `${d.score.toFixed(1)} / 5` : 'Sem avaliação'}</p>
      </div>
    )
  }
  return null
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const user = JSON.parse(localStorage.getItem('pdp_user') || '{}')

  useEffect(() => { getDashboard().then(setData) }, [])

  function logout() {
    localStorage.removeItem('pdp_token')
    localStorage.removeItem('pdp_user')
    navigate('/login')
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-[#FACC15] border-t-transparent animate-spin" />
          <p className="text-[#525252] text-sm">Carregando dashboard...</p>
        </div>
      </div>
    )
  }

  const radarData = data.categories.map(c => ({
    subject: c.name.split(' ')[0],
    fullName: c.name,
    score: c.avg,
    fullMark: 5
  }))

  const evaluatedCats = data.categories.filter(c => c.avg > 0)
  const overallAvg = evaluatedCats.length
    ? evaluatedCats.reduce((a, c) => a + c.avg, 0) / evaluatedCats.length
    : 0
  const completionPct = Math.round((data.completedPillars / data.totalPillars) * 100)
  const topCategory = [...data.categories].sort((a, b) => b.avg - a.avg).find(c => c.avg > 0)

  return (
    <div className="min-h-screen bg-[#0A0A0A]">

      {/* Header */}
      <div className="sticky top-0 z-20 bg-[#0A0A0A]/90 backdrop-blur-sm border-b border-[#1C1C1C] px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#FACC15] flex items-center justify-center flex-shrink-0">
            <span className="text-black font-bold text-xs">PD</span>
          </div>
          <div>
            <p className="text-white font-semibold text-sm leading-none">{user.name}</p>
            <p className="text-[#3A3A3A] text-xs mt-0.5">{user.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isLeader(user.email) && (
            <button
              onClick={() => navigate('/leader')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[#2A2A2A] text-[#A3A3A3] hover:text-white hover:border-[#404040] text-sm font-medium transition-colors"
            >
              <Users size={13} />
              <span className="hidden sm:inline">Visão do Líder</span>
            </button>
          )}
          <button
            onClick={() => navigate('/wizard')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FACC15] text-black font-semibold text-sm hover:bg-yellow-400 transition-colors"
          >
            <Pencil size={13} />
            <span className="hidden sm:inline">Avaliar Pilares</span>
            <span className="sm:hidden">Avaliar</span>
          </button>
          <button
            onClick={logout}
            className="p-2 rounded-xl text-[#3A3A3A] hover:text-white hover:bg-[#1C1C1C] transition-colors"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            {
              icon: CheckCircle2,
              label: 'Progresso',
              value: `${completionPct}%`,
              sub: `${data.completedPillars} de ${data.totalPillars} pilares`,
              color: completionPct === 100 ? '#FACC15' : '#22C55E'
            },
            {
              icon: TrendingUp,
              label: 'Média Geral',
              value: overallAvg > 0 ? overallAvg.toFixed(1) : '—',
              sub: LEVEL_LABELS[Math.round(overallAvg)] || 'Sem dados',
              color: overallAvg > 0 ? LEVEL_COLORS[Math.round(overallAvg)] : '#3A3A3A'
            },
            {
              icon: Target,
              label: 'Destaque',
              value: topCategory ? topCategory.name.split(' ')[0] : '—',
              sub: topCategory ? `Média ${topCategory.avg.toFixed(1)}` : 'Sem dados',
              color: '#FACC15'
            },
          ].map(({ icon: Icon, label, value, sub, color }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="bg-[#111111] rounded-2xl p-4 border border-[#1E1E1E]"
            >
              <div className="flex items-center gap-2 mb-3">
                <Icon size={13} style={{ color }} />
                <span className="text-[#525252] text-xs font-medium">{label}</span>
              </div>
              <p className="text-xl font-bold text-white truncate">{value}</p>
              <p className="text-[#3A3A3A] text-xs mt-1 truncate">{sub}</p>
            </motion.div>
          ))}
        </div>

        {/* Radar + Bars */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

          {/* Radar */}
          <div className="lg:col-span-3 bg-[#111111] rounded-2xl border border-[#1E1E1E] p-6">
            <div className="flex items-center gap-2 mb-1">
              <LayoutGrid size={13} className="text-[#525252]" />
              <h3 className="text-white font-semibold text-sm">Visão por Competência</h3>
            </div>
            <p className="text-[#3A3A3A] text-xs mb-5">Radar das médias por categoria</p>
            <ResponsiveContainer width="100%" height={260}>
              <RadarChart data={radarData} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
                <PolarGrid stroke="#1E1E1E" />
                <PolarAngleAxis
                  dataKey="subject"
                  tick={{ fill: '#525252', fontSize: 11, fontFamily: 'Inter' }}
                />
                <Radar
                  name="Score"
                  dataKey="score"
                  stroke="#FACC15"
                  fill="#FACC15"
                  fillOpacity={0.12}
                  strokeWidth={2}
                  dot={{ fill: '#FACC15', r: 3, strokeWidth: 0 }}
                />
                <Tooltip content={<CustomTooltip />} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Bars */}
          <div className="lg:col-span-2 bg-[#111111] rounded-2xl border border-[#1E1E1E] p-6">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp size={13} className="text-[#525252]" />
              <h3 className="text-white font-semibold text-sm">Médias</h3>
            </div>
            <p className="text-[#3A3A3A] text-xs mb-5">Score médio por categoria</p>
            <div className="space-y-4">
              {data.categories.map((cat, i) => {
                const color = cat.avg >= 4 ? '#22C55E' : cat.avg >= 3 ? '#EAB308' : cat.avg > 0 ? '#F97316' : '#2A2A2A'
                return (
                  <div key={cat.id} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[#A3A3A3] truncate pr-2">{cat.name}</span>
                      <span className="text-xs font-bold flex-shrink-0" style={{ color }}>
                        {cat.avg > 0 ? cat.avg.toFixed(1) : '—'}
                      </span>
                    </div>
                    <div className="h-1.5 bg-[#1C1C1C] rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(cat.avg / 5) * 100}%` }}
                        transition={{ duration: 0.7, delay: i * 0.07, ease: 'easeOut' }}
                        className="h-full rounded-full"
                        style={{ background: color }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Category cards */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <h3 className="text-white font-semibold">Detalhamento por Categoria</h3>
            <span className="text-xs text-[#3A3A3A] bg-[#1C1C1C] px-2 py-0.5 rounded-full">
              {data.categories.length} categorias
            </span>
          </div>
          <div className="space-y-2">
            {data.categories.map((cat, i) => (
              <CategoryCard key={cat.id} category={cat} index={i} />
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
