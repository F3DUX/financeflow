import { useState } from 'react'
import { useAppStore } from '@/store/appStore'
import { PageTransition, FadeIn, StaggerContainer, StaggerItem } from '@/components/ui/PageTransition'
import { Modal } from '@/components/ui/Modal'
import { formatCurrency } from '@/lib/utils'
import type { SavingsGoal } from '@/types'
import { Plus, Trash2, Target } from 'lucide-react'
import { motion } from 'framer-motion'

const goalIcons = ['💻', '✈️', '🏠', '🚗', '🎓', '🛡️', '🎮', '🏥', '💍', '🎯']

export function Goals() {
  const { goals, addGoal, updateGoal, deleteGoal } = useAppStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isAddFundsOpen, setIsAddFundsOpen] = useState(false)
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null)
  const [addAmount, setAddAmount] = useState('')
  const [form, setForm] = useState({
    name: '',
    targetAmount: '',
    icon: '🎯',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    addGoal({
      name: form.name,
      targetAmount: Number(form.targetAmount),
      currentAmount: 0,
      icon: form.icon,
    })
    setForm({ name: '', targetAmount: '', icon: '🎯' })
    setIsModalOpen(false)
  }

  const handleAddFunds = (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedGoal) {
      const goal = goals.find(g => g.id === selectedGoal)
      if (goal) {
        updateGoal(selectedGoal, {
          currentAmount: goal.currentAmount + Number(addAmount),
        })
      }
    }
    setAddAmount('')
    setSelectedGoal(null)
    setIsAddFundsOpen(false)
  }

  const totalTarget = goals.reduce((s, g) => s + g.targetAmount, 0)
  const totalCurrent = goals.reduce((s, g) => s + g.currentAmount, 0)

  return (
    <PageTransition>
      {/* Giant background title */}
      <div className="page-bg-title">METAS</div>

      <div className="relative z-10 max-w-5xl mx-auto">
        <FadeIn className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-white">Metas de Ahorro</h2>
            <p className="text-white/50 mt-1">Alcanza tus objetivos financieros</p>
          </div>
          <button onClick={() => setIsModalOpen(true)} className="btn-primary">
            <Plus size={18} />
            Nueva Meta
          </button>
        </FadeIn>

        <FadeIn delay={0.1} className="mb-6">
          <div className="glass-card p-5 sm:p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#34D399]/10 text-[#34D399]">
                <Target size={18} />
              </div>
              <div>
                <p className="text-sm text-white/50">Progreso Total</p>
                <p className="text-xl font-semibold text-white">
                  {formatCurrency(totalCurrent)} / {formatCurrency(totalTarget)}
                </p>
              </div>
            </div>
          </div>
        </FadeIn>

        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {goals.map((goal, i) => {
            const progress = Math.round((goal.currentAmount / goal.targetAmount) * 100)
            return (
              <StaggerItem key={goal.id}>
                <motion.div whileHover={{ y: -2 }} className="glass-card p-5 sm:p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl bg-white/[0.04]">
                        {goal.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">{goal.name}</h3>
                        <p className="text-xs text-white/40">{formatCurrency(goal.targetAmount)} meta</p>
                      </div>
                    </div>
                    <button onClick={() => deleteGoal(goal.id)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-white/30 hover:text-[#F87171] hover:bg-[#F87171]/10 transition-all">
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <div className="progress-bar mb-2">
                    <motion.div
                      className="progress-fill bg-gradient-to-r from-white/40 to-white/10"
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(progress, 100)}%` }}
                      transition={{ duration: 1, delay: i * 0.1, ease: [0.4, 0, 0.2, 1] }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-white/40 mb-4">
                    <span>{formatCurrency(goal.currentAmount)} ahorrado</span>
                    <span>{progress}%</span>
                    <span>{formatCurrency(Math.max(goal.targetAmount - goal.currentAmount, 0))} restante</span>
                  </div>
                  <button onClick={() => { setSelectedGoal(goal.id); setIsAddFundsOpen(true) }}
                    className="btn-secondary w-full text-xs justify-center">
                    Agregar Fondos
                  </button>
                </motion.div>
              </StaggerItem>
            )
          })}
          {goals.length === 0 && (
            <div className="col-span-full">
              <p className="text-sm text-white/30 text-center py-12">Sin metas de ahorro aún</p>
            </div>
          )}
        </StaggerContainer>

        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Nueva Meta de Ahorro">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Nombre de la Meta</label>
              <input type="text" className="input-field" placeholder="ej. Computadora nueva"
                value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div>
              <label className="label">Monto Objetivo</label>
              <input type="number" className="input-field" placeholder="0"
                value={form.targetAmount} onChange={e => setForm({ ...form, targetAmount: e.target.value })} required min={1} />
            </div>
            <div>
              <label className="label">Icono</label>
              <div className="flex gap-2 flex-wrap">
                {goalIcons.map(icon => (
                  <button key={icon} type="button" onClick={() => setForm({ ...form, icon })}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-all ${
                      form.icon === icon ? 'ring-2 ring-white/40 bg-white/10' : 'bg-white/[0.04] hover:bg-white/[0.08]'
                    }`}>
                    {icon}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Cancelar</button>
              <button type="submit" className="btn-primary">Crear Meta</button>
            </div>
          </form>
        </Modal>

        <Modal isOpen={isAddFundsOpen} onClose={() => { setIsAddFundsOpen(false); setSelectedGoal(null) }} title="Agregar Fondos">
          <form onSubmit={handleAddFunds} className="space-y-4">
            <div>
              <label className="label">Monto a agregar</label>
              <input type="number" className="input-field" placeholder="0"
                value={addAmount} onChange={e => setAddAmount(e.target.value)} required min={1} />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => { setIsAddFundsOpen(false); setSelectedGoal(null) }} className="btn-secondary">Cancelar</button>
              <button type="submit" className="btn-primary">Agregar Fondos</button>
            </div>
          </form>
        </Modal>
      </div>
    </PageTransition>
  )
}
