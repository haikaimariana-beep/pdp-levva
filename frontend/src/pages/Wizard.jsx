import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, LayoutDashboard, Check, FileText, Target, Lightbulb } from 'lucide-react'
import { getPillars, getEvaluations, saveEvaluation } from '../api'

const LEVELS = [
  { score: 1, label: 'Iniciante',      desc: 'Conhecimento inicial',      color: '#EF4444' },
  { score: 2, label: 'Básico',         desc: 'Aplica com apoio',          color: '#F97316' },
  { score: 3, label: 'Intermediário',  desc: 'Aplica com autonomia',      color: '#EAB308' },
  { score: 4, label: 'Avançado',       desc: 'Lidera e ensina',           color: '#22C55E' },
  { score: 5, label: 'Referência',     desc: 'Benchmark no mercado',      color: '#FACC15' },
]

function ScoreButton({ level, selected, onClick }) {
  const active = selected >= level.score
  const isSelected = selected === level.score

  return (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="flex-1 flex flex-col items-center gap-1.5 py-4 rounded-2xl border-2 transition-all duration-200 relative overflow-hidden"
      style={{
        background: isSelected ? level.color : active ? level.color + '15' : '#111111',
        borderColor: isSelected ? level.color : active ? level.color + '50' : '#2A2A2A',
      }}
    >
      <span
        className="text-2xl font-black"
        style={{ color: isSelected ? '#000' : active ? level.color : '#3A3A3A' }}
      >
        {level.score}
      </span>
      <span
        className="text-[11px] font-semibold leading-none"
        style={{ color: isSelected ? '#00000099' : active ? level.color + 'CC' : '#3A3A3A' }}
      >
        {level.label}
      </span>
    </motion.button>
  )
}

function PillarItem({ text, index }) {
  const clean = text.replace(/^[•\-]\s*/, '')
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.06 }}
      className="flex gap-4 p-4 rounded-xl bg-[#1C1C1C] border border-[#2A2A2A] hover:border-[#FACC15]/30 transition-colors group"
    >
      <div
        className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold mt-0.5 transition-colors"
        style={{ background: '#FACC15' + '18', color: '#FACC15' }}
      >
        {index + 1}
      </div>
      <p className="text-[#D4D4D4] text-sm leading-relaxed">{clean}</p>
    </motion.div>
  )
}

export default function Wizard() {
  const navigate = useNavigate()
  const [categories, setCategories] = useState([])
  const [evaluations, setEvaluations] = useState({})
  const [currentIdx, setCurrentIdx] = useState(0)
  const [form, setForm] = useState({ score: 0, evidence: '', goal: '' })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [direction, setDirection] = useState(1)
  const saveTimer = useRef(null)

  const allPillars = categories.flatMap(c => c.pillars)
  const total = allPillars.length
  const current = allPillars[currentIdx]
  const completedCount = Object.keys(evaluations).length
  const progress = total > 0 ? (completedCount / total) * 100 : 0

  useEffect(() => {
    async function load() {
      const [cats, evals] = await Promise.all([getPillars(), getEvaluations()])
      setCategories(cats)
      const evalMap = {}
      evals.forEach(e => { evalMap[e.pillar_id] = e })
      setEvaluations(evalMap)
    }
    load()
  }, [])

  useEffect(() => {
    if (!current) return
    const ev = evaluations[current.id]
    setForm({ score: ev?.score || 0, evidence: ev?.evidence || '', goal: ev?.goal || '' })
    setSaved(false)
  }, [currentIdx, current?.id])

  function scheduleAutoSave(newForm) {
    clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => doSave(newForm), 800)
  }

  async function doSave(f = form) {
    if (!current || !f.score) return
    setSaving(true)
    try {
      const ev = await saveEvaluation(current.id, f.score, f.evidence, f.goal)
      setEvaluations(prev => ({ ...prev, [current.id]: ev }))
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } finally {
      setSaving(false)
    }
  }

  function updateForm(key, value) {
    const next = { ...form, [key]: value }
    setForm(next)
    scheduleAutoSave(next)
  }

  function go(delta) {
    clearTimeout(saveTimer.current)
    doSave()
    setDirection(delta)
    setCurrentIdx(i => Math.max(0, Math.min(total - 1, i + delta)))
  }

  if (!current) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-[#FACC15] border-t-transparent animate-spin" />
          <p className="text-[#525252] text-sm">Carregando pilares...</p>
        </div>
      </div>
    )
  }

  const category = categories.find(c => c.pillars.some(p => p.id === current.id))
  const bullets = current.description.split('\n').filter(l => l.trim())
  const selectedLevel = LEVELS.find(l => l.score === form.score)
  const isEvaluated = !!evaluations[current.id]

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col">

      {/* Top bar */}
      <div className="sticky top-0 z-20 bg-[#0A0A0A]/90 backdrop-blur-sm border-b border-[#1C1C1C] px-6 py-3 flex items-center gap-4">
        <div className="w-8 h-8 rounded-lg bg-[#FACC15] flex items-center justify-center flex-shrink-0">
          <span className="text-black font-bold text-xs">PD</span>
        </div>

        {/* Progress */}
        <div className="flex-1 flex items-center gap-3">
          <div className="h-1.5 flex-1 bg-[#1C1C1C] rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-[#FACC15] rounded-full"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <span className="text-xs text-[#525252] flex-shrink-0 tabular-nums">
            {currentIdx + 1}<span className="text-[#333]">/</span>{total}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {saving && (
            <span className="text-xs text-[#525252]">Salvando...</span>
          )}
          {saved && !saving && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-1 text-xs text-[#22C55E]"
            >
              <Check size={11} /> Salvo
            </motion.span>
          )}
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-1.5 text-[#525252] hover:text-white text-xs transition-colors px-3 py-1.5 rounded-lg hover:bg-[#1C1C1C]"
          >
            <LayoutDashboard size={13} />
            <span className="hidden sm:inline">Dashboard</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center px-4 py-8 pb-28">
        <div className="w-full max-w-2xl">

          <AnimatePresence mode="wait">
            <motion.div
              key={currentIdx}
              initial={{ opacity: 0, x: direction * 32 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * -32 }}
              transition={{ duration: 0.22 }}
            >
              {/* Category + code chip */}
              <div className="flex items-center gap-2 mb-5">
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#FACC15]/10 text-[#FACC15] border border-[#FACC15]/20">
                  {category?.name}
                </span>
                <span className="text-xs text-[#404040] font-mono">{current.code}</span>
                {isEvaluated && (
                  <span className="ml-auto flex items-center gap-1 text-xs text-[#22C55E]">
                    <Check size={11} /> Avaliado
                  </span>
                )}
              </div>

              {/* Pillar name */}
              <h1 className="text-[1.65rem] font-bold text-white leading-tight mb-6 tracking-tight">
                {current.name}
              </h1>

              {/* Competências */}
              <div className="mb-7">
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb size={13} className="text-[#FACC15]" />
                  <span className="text-xs font-semibold text-[#A3A3A3] uppercase tracking-wider">
                    O que se espera
                  </span>
                </div>
                <div className="flex flex-col gap-2.5">
                  {bullets.map((b, i) => (
                    <PillarItem key={i} text={b} index={i} />
                  ))}
                </div>
              </div>

              {/* Score */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-white">Sua avaliação</span>
                  {selectedLevel && (
                    <motion.span
                      key={form.score}
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-xs font-semibold px-2.5 py-1 rounded-full"
                      style={{
                        background: selectedLevel.color + '20',
                        color: selectedLevel.color,
                        border: `1px solid ${selectedLevel.color}40`
                      }}
                    >
                      Nível {form.score} · {selectedLevel.label}
                    </motion.span>
                  )}
                </div>
                <div className="flex gap-2">
                  {LEVELS.map(level => (
                    <ScoreButton
                      key={level.score}
                      level={level}
                      selected={form.score}
                      onClick={() => updateForm('score', level.score)}
                    />
                  ))}
                </div>
              </div>

              {/* Evidence */}
              <div className="mb-4">
                <label className="flex items-center gap-2 mb-2">
                  <FileText size={13} className="text-[#525252]" />
                  <span className="text-sm font-semibold text-white">Evidências</span>
                  <span className="text-xs text-[#404040] ml-1">opcional</span>
                </label>
                <textarea
                  value={form.evidence}
                  onChange={e => updateForm('evidence', e.target.value)}
                  placeholder="Projetos, situações ou resultados que demonstram este nível..."
                  rows={3}
                  className="w-full bg-[#111111] text-white rounded-xl px-4 py-3 text-sm outline-none border border-[#262626] focus:border-[#FACC15]/60 transition-colors placeholder-[#333] resize-none"
                />
              </div>

              {/* Goal */}
              <div>
                <label className="flex items-center gap-2 mb-2">
                  <Target size={13} className="text-[#525252]" />
                  <span className="text-sm font-semibold text-white">Meta de evolução</span>
                  <span className="text-xs text-[#404040] ml-1">opcional</span>
                </label>
                <textarea
                  value={form.goal}
                  onChange={e => updateForm('goal', e.target.value)}
                  placeholder="O que você quer desenvolver neste pilar nos próximos meses?"
                  rows={2}
                  className="w-full bg-[#111111] text-white rounded-xl px-4 py-3 text-sm outline-none border border-[#262626] focus:border-[#FACC15]/60 transition-colors placeholder-[#333] resize-none"
                />
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Bottom nav — fixed */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#0A0A0A]/95 backdrop-blur-sm border-t border-[#1C1C1C] px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">

          {/* Pillar mini-map dots */}
          <div className="hidden sm:flex items-center gap-1 overflow-hidden max-w-[200px]">
            {allPillars.slice(Math.max(0, currentIdx - 4), currentIdx + 5).map((p, i) => {
              const realIdx = Math.max(0, currentIdx - 4) + i
              const isDone = !!evaluations[p.id]
              const isCurrent = realIdx === currentIdx
              return (
                <button
                  key={p.id}
                  onClick={() => { setDirection(realIdx > currentIdx ? 1 : -1); doSave(); setCurrentIdx(realIdx) }}
                  className="rounded-full transition-all duration-150 flex-shrink-0"
                  style={{
                    width: isCurrent ? 20 : 6,
                    height: 6,
                    background: isCurrent ? '#FACC15' : isDone ? '#FACC15' + '60' : '#262626',
                  }}
                />
              )
            })}
          </div>

          <div className="flex items-center gap-3 ml-auto">
            <button
              onClick={() => go(-1)}
              disabled={currentIdx === 0}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#262626] text-[#A3A3A3] hover:text-white hover:border-[#404040] transition-all disabled:opacity-25 disabled:cursor-not-allowed text-sm font-medium"
            >
              <ChevronLeft size={15} /> Anterior
            </button>

            {/* Botão Salvar explícito — sempre visível quando há nota */}
            {form.score > 0 && (
              <button
                onClick={() => doSave()}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all text-sm font-medium"
                style={{
                  borderColor: saved ? '#22C55E60' : '#262626',
                  color: saved ? '#22C55E' : '#A3A3A3',
                  background: saved ? '#22C55E10' : 'transparent',
                }}
              >
                {saving ? (
                  <span className="w-3.5 h-3.5 rounded-full border-2 border-[#525252] border-t-transparent animate-spin" />
                ) : (
                  <Check size={14} />
                )}
                {saved ? 'Salvo!' : 'Salvar'}
              </button>
            )}

            {currentIdx < total - 1 ? (
              <button
                onClick={() => go(1)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition-all text-sm"
                style={{
                  background: form.score > 0 ? '#FACC15' : '#1C1C1C',
                  color: form.score > 0 ? '#000' : '#525252',
                  border: form.score > 0 ? 'none' : '1px solid #262626'
                }}
              >
                Próximo <ChevronRight size={15} />
              </button>
            ) : (
              /* Último pilar: Editar + Salvar e Concluir */
              <>
                <button
                  onClick={() => { clearTimeout(saveTimer.current); setDirection(-1); setCurrentIdx(0) }}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#262626] text-[#A3A3A3] hover:text-white hover:border-[#404040] transition-all text-sm font-medium"
                >
                  <ChevronLeft size={15} /> Editar
                </button>
                <button
                  onClick={async () => { await doSave(); navigate('/dashboard') }}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#FACC15] text-black font-semibold hover:bg-yellow-400 transition-colors text-sm"
                >
                  <Check size={15} /> Salvar e Concluir
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
