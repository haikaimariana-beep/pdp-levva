import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, Cell
} from 'recharts'
import {
  ArrowLeft, Users, User, ChevronDown, CheckCircle2, Circle,
  TrendingUp, TrendingDown, Minus, Award, AlertTriangle
} from 'lucide-react'
import { getLeaderUsers, getLeaderUser, getLeaderTeam } from '../api'

const LEVEL_COLORS = { 0: '#2A2A2A', 1: '#EF4444', 2: '#F97316', 3: '#EAB308', 4: '#22C55E', 5: '#FACC15' }
const LEVEL_LABELS = { 0: '—', 1: 'Iniciante', 2: 'Básico', 3: 'Intermediário', 4: 'Avançado', 5: 'Referência' }

function scoreColor(v) {
  if (!v) return '#2A2A2A'
  if (v >= 4.5) return '#FACC15'
  if (v >= 3.5) return '#22C55E'
  if (v >= 2.5) return '#EAB308'
  if (v >= 1.5) return '#F97316'
  return '#EF4444'
}

function ScoreCell({ value }) {
  const color = scoreColor(value)
  if (!value) return <span className="text-[#2A2A2A] text-xs">—</span>
  return (
    <span
      className="inline-flex items-center justify-center w-9 h-7 rounded-lg text-xs font-bold"
      style={{ background: color + '20', color }}
    >
      {value.toFixed(1)}
    </span>
  )
}

function Avatar({ name, size = 'md' }) {
  const initials = name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
  const sz = size === 'sm' ? 'w-8 h-8 text-xs' : 'w-10 h-10 text-sm'
  return (
    <div className={`${sz} rounded-full bg-[#FACC15]/15 border border-[#FACC15]/20 flex items-center justify-center font-bold text-[#FACC15] flex-shrink-0`}>
      {initials}
    </div>
  )
}

// ─── TEAM VIEW ──────────────────────────────────────────────────────────────

function TeamView({ teamData, onSelectDesigner }) {
  const { categories, designers, totalPillars } = teamData
  const [expandedCat, setExpandedCat] = useState(null)

  const teamAvg = designers.length
    ? designers.reduce((a, d) => a + d.globalAvg, 0) / designers.length
    : 0

  const radarData = categories.map(c => ({
    subject: c.name.split(' ')[0],
    fullName: c.name,
    score: c.avg,
    fullMark: 5,
  }))

  // Top / bottom 3 pillars across all categories
  const allPillars = categories.flatMap(c => c.pillars)
  const rankedPillars = [...allPillars].filter(p => p.avg > 0).sort((a, b) => b.avg - a.avg)
  const topPillars = rankedPillars.slice(0, 3)
  const bottomPillars = rankedPillars.slice(-3).reverse()

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload?.length) {
      const d = payload[0].payload
      return (
        <div className="bg-[#1C1C1C] border border-[#2A2A2A] rounded-xl px-3 py-2 text-xs shadow-xl">
          <p className="text-[#FACC15] font-semibold mb-0.5">{d.fullName}</p>
          <p className="text-white">{d.score > 0 ? `${d.score.toFixed(1)} / 5` : 'Sem dados'}</p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-6">

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Designers', value: designers.length, sub: 'responderam', icon: Users, color: '#FACC15' },
          { label: 'Média do Time', value: teamAvg > 0 ? teamAvg.toFixed(1) : '—', sub: LEVEL_LABELS[Math.round(teamAvg)] || '—', icon: TrendingUp, color: scoreColor(teamAvg) },
          { label: 'Ponto Forte', value: topPillars[0]?.avg.toFixed(1) || '—', sub: topPillars[0]?.name.split(' ')[0] || '—', icon: Award, color: '#22C55E' },
          { label: 'A Desenvolver', value: bottomPillars[0]?.avg.toFixed(1) || '—', sub: bottomPillars[0]?.name.split(' ')[0] || '—', icon: AlertTriangle, color: '#F97316' },
        ].map(({ label, value, sub, icon: Icon, color }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
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

      {/* Radar + Top/Bottom */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3 bg-[#111111] rounded-2xl border border-[#1E1E1E] p-6">
          <p className="text-white font-semibold text-sm mb-1">Radar do Time</p>
          <p className="text-[#3A3A3A] text-xs mb-5">Média de todos os designers por categoria</p>
          <ResponsiveContainer width="100%" height={260}>
            <RadarChart data={radarData} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
              <PolarGrid stroke="#1E1E1E" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#525252', fontSize: 11, fontFamily: 'Inter' }} />
              <Radar name="Time" dataKey="score" stroke="#FACC15" fill="#FACC15" fillOpacity={0.12} strokeWidth={2}
                dot={{ fill: '#FACC15', r: 3, strokeWidth: 0 }} />
              <Tooltip content={<CustomTooltip />} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="lg:col-span-2 flex flex-col gap-4">
          {/* Top pillars */}
          <div className="flex-1 bg-[#111111] rounded-2xl border border-[#1E1E1E] p-5">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={13} className="text-[#22C55E]" />
              <p className="text-white font-semibold text-sm">Pilares Fortes</p>
            </div>
            <div className="space-y-2.5">
              {topPillars.map((p, i) => (
                <div key={p.id} className="flex items-center gap-3">
                  <span className="text-[#3A3A3A] text-xs w-4 font-mono">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[#D4D4D4] text-xs truncate">{p.name}</p>
                    <p className="text-[#3A3A3A] text-[10px]">{p.respondents} avaliações</p>
                  </div>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-lg flex-shrink-0"
                    style={{ background: scoreColor(p.avg) + '20', color: scoreColor(p.avg) }}>
                    {p.avg.toFixed(1)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom pillars */}
          <div className="flex-1 bg-[#111111] rounded-2xl border border-[#1E1E1E] p-5">
            <div className="flex items-center gap-2 mb-4">
              <TrendingDown size={13} className="text-[#F97316]" />
              <p className="text-white font-semibold text-sm">A Desenvolver</p>
            </div>
            <div className="space-y-2.5">
              {bottomPillars.map((p, i) => (
                <div key={p.id} className="flex items-center gap-3">
                  <span className="text-[#3A3A3A] text-xs w-4 font-mono">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[#D4D4D4] text-xs truncate">{p.name}</p>
                    <p className="text-[#3A3A3A] text-[10px]">{p.respondents} avaliações</p>
                  </div>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-lg flex-shrink-0"
                    style={{ background: scoreColor(p.avg) + '20', color: scoreColor(p.avg) }}>
                    {p.avg.toFixed(1)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Comparison table */}
      <div className="bg-[#111111] rounded-2xl border border-[#1E1E1E] overflow-hidden">
        <div className="px-5 py-4 border-b border-[#1E1E1E]">
          <p className="text-white font-semibold text-sm">Comparativo do Time</p>
          <p className="text-[#3A3A3A] text-xs mt-0.5">Média por categoria · cada linha é um designer</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[#1E1E1E]">
                <th className="text-left px-5 py-3 text-[#525252] font-medium w-44 sticky left-0 bg-[#111111]">Designer</th>
                {categories.map(c => (
                  <th key={c.id} className="px-2 py-3 text-[#525252] font-medium text-center whitespace-nowrap">
                    {c.name.split(' ')[0]}
                  </th>
                ))}
                <th className="px-3 py-3 text-[#525252] font-medium text-center">Geral</th>
              </tr>
            </thead>
            <tbody>
              {designers.map((d, i) => (
                <tr
                  key={d.id}
                  className="border-b border-[#161616] hover:bg-[#141414] transition-colors cursor-pointer"
                  onClick={() => onSelectDesigner(d.id)}
                >
                  <td className="px-5 py-3 sticky left-0 bg-[#111111] hover:bg-[#141414]">
                    <div className="flex items-center gap-2.5">
                      <Avatar name={d.name} size="sm" />
                      <div className="min-w-0">
                        <p className="text-[#FACC15] font-medium truncate hover:underline">{d.name}</p>
                        <p className="text-[#3A3A3A] text-[10px]">{d.completed}/{d.total} pilares · clique para ver detalhes</p>
                      </div>
                    </div>
                  </td>
                  {d.catAvgs.map((avg, ci) => (
                    <td key={ci} className="px-2 py-3 text-center">
                      <ScoreCell value={avg} />
                    </td>
                  ))}
                  <td className="px-3 py-3 text-center">
                    <span className="text-sm font-bold" style={{ color: scoreColor(d.globalAvg) }}>
                      {d.globalAvg > 0 ? d.globalAvg.toFixed(1) : '—'}
                    </span>
                  </td>
                </tr>
              ))}
              {/* Team average row */}
              <tr className="bg-[#161616] border-t border-[#2A2A2A]">
                <td className="px-5 py-3 sticky left-0 bg-[#161616]">
                  <span className="text-[#FACC15] font-semibold text-xs">Média do Time</span>
                </td>
                {categories.map(c => (
                  <td key={c.id} className="px-2 py-3 text-center">
                    <ScoreCell value={c.avg || null} />
                  </td>
                ))}
                <td className="px-3 py-3 text-center">
                  <span className="text-sm font-bold" style={{ color: scoreColor(teamAvg) }}>
                    {teamAvg > 0 ? teamAvg.toFixed(1) : '—'}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Pillar heatmap by category */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 mb-1">
          <p className="text-white font-semibold">Heatmap de Pilares</p>
          <span className="text-xs text-[#3A3A3A] bg-[#1C1C1C] px-2 py-0.5 rounded-full">clique para expandir</span>
        </div>
        {categories.map(cat => (
          <div key={cat.id} className="bg-[#111111] rounded-2xl border border-[#1E1E1E] overflow-hidden">
            <button
              onClick={() => setExpandedCat(expandedCat === cat.id ? null : cat.id)}
              className="w-full flex items-center gap-4 px-5 py-4 hover:bg-[#161616] transition-colors"
            >
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: scoreColor(cat.avg) }} />
              <span className="text-white font-medium text-sm flex-1 text-left">{cat.name}</span>
              <span className="text-xs font-bold" style={{ color: scoreColor(cat.avg) }}>
                {cat.avg > 0 ? cat.avg.toFixed(1) : '—'}
              </span>
              <ChevronDown size={14} className="text-[#3A3A3A] transition-transform"
                style={{ transform: expandedCat === cat.id ? 'rotate(180deg)' : 'none' }} />
            </button>
            <AnimatePresence>
              {expandedCat === cat.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden border-t border-[#1E1E1E]"
                >
                  {cat.pillars.map(p => (
                    <div key={p.id} className="px-5 py-3 border-b border-[#161616] last:border-0">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-[#525252] font-mono text-xs">{p.code}</span>
                        <span className="text-[#D4D4D4] text-sm font-medium flex-1">{p.name}</span>
                        <span className="text-xs font-bold flex-shrink-0" style={{ color: scoreColor(p.avg) }}>
                          {p.avg > 0 ? `${p.avg.toFixed(1)} média` : 'sem dados'}
                        </span>
                      </div>
                      {/* Score distribution bar */}
                      {p.respondents > 0 && (
                        <div className="flex gap-1 h-5">
                          {p.dist.map((count, idx) => {
                            const pct = (count / p.respondents) * 100
                            const lvl = idx + 1
                            return count > 0 ? (
                              <div
                                key={lvl}
                                className="h-full rounded flex items-center justify-center text-[9px] font-bold relative group"
                                style={{ width: `${pct}%`, minWidth: pct > 0 ? 20 : 0, background: LEVEL_COLORS[lvl] + '30', color: LEVEL_COLORS[lvl] }}
                                title={`Nível ${lvl}: ${count} designer${count > 1 ? 's' : ''}`}
                              >
                                {count}
                              </div>
                            ) : null
                          })}
                        </div>
                      )}
                      {p.respondents === 0 && <p className="text-[#2A2A2A] text-xs">Nenhuma avaliação</p>}
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── INDIVIDUAL VIEW ─────────────────────────────────────────────────────────

function IndividualView({ users, initialId }) {
  const [selectedId, setSelectedId] = useState(null)
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [expandedCat, setExpandedCat] = useState(null)

  async function selectUser(id) {
    setSelectedId(id)
    setUserData(null)
    setExpandedCat(null)
    setLoading(true)
    const data = await getLeaderUser(id)
    setUserData(data)
    setLoading(false)
  }

  // Carrega automaticamente se vier de um clique na tabela do time
  useEffect(() => {
    if (initialId) selectUser(initialId)
  }, [])

  const radarData = userData?.categories.map(c => ({
    subject: c.name.split(' ')[0],
    fullName: c.name,
    score: c.avg,
    fullMark: 5,
  })) || []

  const selectedUser = users.find(u => u.id === selectedId)
  const overallAvg = userData
    ? userData.categories.filter(c => c.avg > 0).reduce((a, c, _, arr) => a + c.avg / arr.length, 0)
    : 0

  const allPillars = userData?.categories.flatMap(c => c.pillars.map(p => ({ ...p, catName: c.name }))) || []
  const topPillars = [...allPillars].filter(p => p.evaluation?.score).sort((a, b) => b.evaluation.score - a.evaluation.score).slice(0, 3)
  const bottomPillars = [...allPillars].filter(p => p.evaluation?.score).sort((a, b) => a.evaluation.score - b.evaluation.score).slice(0, 3)

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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">

      {/* Designer list */}
      <div className="lg:col-span-1">
        <p className="text-[#525252] text-xs font-medium uppercase tracking-wider mb-3">Designers</p>
        <div className="space-y-1.5">
          {users.map(u => (
            <button
              key={u.id}
              onClick={() => selectUser(u.id)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all"
              style={{
                background: selectedId === u.id ? '#FACC1512' : 'transparent',
                border: `1px solid ${selectedId === u.id ? '#FACC1530' : '#1E1E1E'}`,
              }}
            >
              <Avatar name={u.name} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{u.name}</p>
                <p className="text-[#3A3A3A] text-[10px]">{u.completed}/{u.total} pilares</p>
              </div>
              {u.avg > 0 && (
                <span className="text-xs font-bold flex-shrink-0" style={{ color: scoreColor(u.avg) }}>
                  {u.avg.toFixed(1)}
                </span>
              )}
            </button>
          ))}
          {users.length === 0 && (
            <p className="text-[#3A3A3A] text-sm text-center py-8">Nenhum designer avaliou ainda</p>
          )}
        </div>
      </div>

      {/* Detail panel */}
      <div className="lg:col-span-3">
        {!selectedId && (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <User size={32} className="text-[#2A2A2A] mb-3" />
            <p className="text-[#525252] text-sm">Selecione um designer para ver seu PDP</p>
          </div>
        )}

        {selectedId && loading && (
          <div className="flex flex-col items-center justify-center h-64">
            <div className="w-7 h-7 rounded-full border-2 border-[#FACC15] border-t-transparent animate-spin" />
          </div>
        )}

        {selectedId && userData && !loading && (
          <motion.div
            key={selectedId}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-5"
          >
            {/* Designer header */}
            <div className="flex items-center gap-4 bg-[#111111] rounded-2xl border border-[#1E1E1E] p-5">
              <Avatar name={selectedUser.name} />
              <div className="flex-1">
                <p className="text-white font-bold text-lg">{selectedUser.name}</p>
                <p className="text-[#3A3A3A] text-xs">{selectedUser.email}</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-black" style={{ color: scoreColor(overallAvg) }}>
                  {overallAvg > 0 ? overallAvg.toFixed(1) : '—'}
                </p>
                <p className="text-[#3A3A3A] text-xs">{LEVEL_LABELS[Math.round(overallAvg)] || 'Média geral'}</p>
              </div>
            </div>

            {/* Radar + Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
              <div className="sm:col-span-3 bg-[#111111] rounded-2xl border border-[#1E1E1E] p-5">
                <p className="text-white font-semibold text-sm mb-4">Radar de Competências</p>
                <ResponsiveContainer width="100%" height={220}>
                  <RadarChart data={radarData} margin={{ top: 8, right: 16, bottom: 8, left: 16 }}>
                    <PolarGrid stroke="#1E1E1E" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#525252', fontSize: 10, fontFamily: 'Inter' }} />
                    <Radar dataKey="score" stroke="#FACC15" fill="#FACC15" fillOpacity={0.12} strokeWidth={2}
                      dot={{ fill: '#FACC15', r: 3, strokeWidth: 0 }} />
                    <Tooltip content={<CustomTooltip />} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              <div className="sm:col-span-2 flex flex-col gap-3">
                <div className="flex-1 bg-[#111111] rounded-2xl border border-[#1E1E1E] p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp size={12} className="text-[#22C55E]" />
                    <p className="text-white text-xs font-semibold">Destaques</p>
                  </div>
                  {topPillars.map((p, i) => (
                    <div key={p.id} className="flex items-center gap-2 mb-2 last:mb-0">
                      <span className="text-[#3A3A3A] text-[10px] w-3 font-mono">{i + 1}</span>
                      <p className="text-[#A3A3A3] text-xs flex-1 truncate">{p.name}</p>
                      <span className="text-[10px] font-bold" style={{ color: scoreColor(p.evaluation.score) }}>
                        {p.evaluation.score}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex-1 bg-[#111111] rounded-2xl border border-[#1E1E1E] p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingDown size={12} className="text-[#F97316]" />
                    <p className="text-white text-xs font-semibold">A Desenvolver</p>
                  </div>
                  {bottomPillars.map((p, i) => (
                    <div key={p.id} className="flex items-center gap-2 mb-2 last:mb-0">
                      <span className="text-[#3A3A3A] text-[10px] w-3 font-mono">{i + 1}</span>
                      <p className="text-[#A3A3A3] text-xs flex-1 truncate">{p.name}</p>
                      <span className="text-[10px] font-bold" style={{ color: scoreColor(p.evaluation.score) }}>
                        {p.evaluation.score}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Category breakdown */}
            <div className="space-y-2">
              {userData.categories.map(cat => (
                <div key={cat.id} className="bg-[#111111] rounded-2xl border border-[#1E1E1E] overflow-hidden">
                  <button
                    onClick={() => setExpandedCat(expandedCat === cat.id ? null : cat.id)}
                    className="w-full flex items-center gap-4 px-5 py-4 hover:bg-[#161616] transition-colors"
                  >
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: scoreColor(cat.avg) }} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-white font-medium text-sm">{cat.name}</span>
                        <span className="text-[#3A3A3A] text-xs">{cat.completed}/{cat.total}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-[#1C1C1C] rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all"
                            style={{ width: `${(cat.avg / 5) * 100}%`, background: scoreColor(cat.avg) }} />
                        </div>
                        <span className="text-xs font-bold w-6 text-right flex-shrink-0" style={{ color: scoreColor(cat.avg) }}>
                          {cat.avg > 0 ? cat.avg.toFixed(1) : '—'}
                        </span>
                      </div>
                    </div>
                    <ChevronDown size={14} className="text-[#3A3A3A] transition-transform flex-shrink-0"
                      style={{ transform: expandedCat === cat.id ? 'rotate(180deg)' : 'none' }} />
                  </button>

                  <AnimatePresence>
                    {expandedCat === cat.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.18 }}
                        className="overflow-hidden border-t border-[#1E1E1E]"
                      >
                        {cat.pillars.map(p => (
                          <div key={p.id} className="px-5 py-3 border-b border-[#161616] last:border-0 hover:bg-[#141414] transition-colors">
                            <div className="flex items-start gap-3">
                              {p.evaluation?.score
                                ? <CheckCircle2 size={13} className="mt-0.5 flex-shrink-0" style={{ color: LEVEL_COLORS[p.evaluation.score] }} />
                                : <Circle size={13} className="mt-0.5 flex-shrink-0 text-[#2A2A2A]" />
                              }
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                  <span className="text-[#525252] text-xs font-mono">{p.code}</span>
                                  <span className="text-[#D4D4D4] text-sm font-medium">{p.name}</span>
                                </div>
                                {p.evaluation?.evidence && (
                                  <p className="text-[#525252] text-xs italic mb-0.5">"{p.evaluation.evidence}"</p>
                                )}
                                {p.evaluation?.goal && (
                                  <p className="text-[#FACC15]/50 text-xs">→ {p.evaluation.goal}</p>
                                )}
                              </div>
                              {p.evaluation?.score && (
                                <span className="text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
                                  style={{ background: LEVEL_COLORS[p.evaluation.score] + '20', color: LEVEL_COLORS[p.evaluation.score] }}>
                                  {p.evaluation.score} · {LEVEL_LABELS[p.evaluation.score]}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

export default function LeaderDashboard() {
  const navigate = useNavigate()
  const [tab, setTab] = useState('team')
  const [users, setUsers] = useState([])
  const [teamData, setTeamData] = useState(null)
  const [loading, setLoading] = useState(true)

  const [selectedUserId, setSelectedUserId] = useState(null)

  useEffect(() => {
    async function load() {
      const [u, t] = await Promise.all([getLeaderUsers(), getLeaderTeam()])
      setUsers(u)
      setTeamData(t)
      setLoading(false)
    }
    load()
  }, [])

  function handleSelectDesigner(id) {
    setSelectedUserId(id)
    setTab('individual')
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-[#0A0A0A]/90 backdrop-blur-sm border-b border-[#1C1C1C] px-6 py-3.5">
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 rounded-xl text-[#525252] hover:text-white hover:bg-[#1C1C1C] transition-colors"
          >
            <ArrowLeft size={16} />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#FACC15] flex items-center justify-center">
              <span className="text-black font-bold text-xs">PD</span>
            </div>
            <div>
              <p className="text-white font-semibold text-sm leading-none">Visão do Líder</p>
              <p className="text-[#3A3A3A] text-xs mt-0.5">{users.length} designer{users.length !== 1 ? 's' : ''} avaliado{users.length !== 1 ? 's' : ''}</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="ml-auto flex items-center gap-1 bg-[#111111] rounded-xl p-1 border border-[#1E1E1E]">
            {[
              { key: 'team', label: 'Time', icon: Users },
              { key: 'individual', label: 'Individual', icon: User },
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
                style={{
                  background: tab === key ? '#FACC15' : 'transparent',
                  color: tab === key ? '#000' : '#525252',
                }}
              >
                <Icon size={13} />
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64">
            <div className="w-8 h-8 rounded-full border-2 border-[#FACC15] border-t-transparent animate-spin" />
            <p className="text-[#525252] text-sm mt-3">Carregando dados do time...</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {tab === 'team'
                ? <TeamView teamData={teamData} onSelectDesigner={handleSelectDesigner} />
                : <IndividualView users={users.filter(u => u.completed > 0)} initialId={selectedUserId} />
              }
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}
