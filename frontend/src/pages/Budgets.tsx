import { useState } from 'react'
import { useAppStore } from '@/store/appStore'
import { PageTransition, FadeIn, StaggerContainer, StaggerItem } from '@/components/ui/PageTransition'
import { Modal } from '@/components/ui/Modal'
import { formatCurrency, calculateProgress } from '@/lib/utils'
import { EXPENSE_CATEGORIES } from '@/types'
import type { ExpenseCategory } from '@/types'
import { Plus } from 'lucide-react'
import { motion } from 'framer-motion'

export function Budgets() {
  const { budgets, addBudget } = useAppStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [form, setForm] = useState({
    category: 'food' as ExpenseCategory,
    amount: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const existing = budgets.find(b => b.category === form.category)
    if (existing) return
    addBudget({
      category: form.category,
      amount: Number(form.amount),
      spent: 0,
      month: new Date().toISOString().slice(0, 7),
    })
    setForm({ category: 'food', amount: '' })
    setIsModalOpen(false)
  }

  const totalBudget = budgets.reduce((s, b) => s + b.amount, 0)
  const totalSpent = budgets.reduce((s, b) => s + b.spent, 0)

  return (
    <PageTransition>
      {/* Giant background title */}
      <div className="page-bg-title">PRESUPUESTOS</div>

      <div className="relative z-10 max-w-4xl mx-auto">
        <FadeIn className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-white">Presupuestos</h2>
            <p className="text-white/50 mt-1">Establece límites de gasto por categoría</p>
          </div>
          <button onClick={() => setIsModalOpen(true)} className="btn-primary">
            <Plus size={18} />
            Nuevo Presupuesto
          </button>
        </FadeIn>

        <FadeIn delay={0.1} className="mb-6">
          <div className="glass-card p-5 sm:p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-white/50">Presupuesto General</span>
              <span className="text-sm font-medium text-white">
                {formatCurrency(totalSpent)} / {formatCurrency(totalBudget)}
              </span>
            </div>
            <div className="progress-bar h-3">
              <motion.div
                className="progress-fill bg-gradient-to-r from-white/40 to-white/10"
                initial={{ width: 0 }}
                animate={{ width: `${calculateProgress(totalSpent, totalBudget)}%` }}
                transition={{ duration: 1, ease: [0.4, 0, 0.2, 1] }}
              />
            </div>
          </div>
        </FadeIn>

        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {budgets.map((budget) => {
            const cat = EXPENSE_CATEGORIES.find(c => c.value === budget.category)
            const progress = calculateProgress(budget.spent, budget.amount)
            const isOver = budget.spent > budget.amount
            return (
              <StaggerItem key={budget.id}>
                <motion.div whileHover={{ y: -2 }} className="glass-card p-5 sm:p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg bg-white/[0.04]">
                      {cat?.emoji || '📦'}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-white capitalize">{budget.category}</h3>
                      <p className="text-xs text-white/40">Límite mensual</p>
                    </div>
                    <span className={`text-sm font-semibold ${isOver ? 'text-[#F87171]' : 'text-white'}`}>
                      {formatCurrency(budget.amount)}
                    </span>
                  </div>
                  <div className="progress-bar mb-2">
                    <motion.div
                      className={`progress-fill ${isOver ? 'bg-gradient-to-r from-[#F87171] to-[#EF4444]' : 'bg-gradient-to-r from-white/40 to-white/10'}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(progress, 100)}%` }}
                      transition={{ duration: 1, delay: 0.2, ease: [0.4, 0, 0.2, 1] }}
                    />
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className={isOver ? 'text-[#F87171] font-medium' : 'text-white/40'}>
                      {formatCurrency(budget.spent)} usado
                    </span>
                    <span className="text-white/30">{progress}%</span>
                    <span className="text-white/40">
                      {formatCurrency(Math.max(budget.amount - budget.spent, 0))} restante
                    </span>
                  </div>
                </motion.div>
              </StaggerItem>
            )
          })}
        </StaggerContainer>

        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Nuevo Presupuesto">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Categoría</label>
              <select className="input-field" value={form.category}
                onChange={e => setForm({ ...form, category: e.target.value as ExpenseCategory })}>
                {EXPENSE_CATEGORIES.map(c => (
                  <option key={c.value} value={c.value}>{c.emoji} {c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Monto del Presupuesto</label>
              <input type="number" className="input-field" placeholder="0"
                value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} required min={1} />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Cancelar</button>
              <button type="submit" className="btn-primary">Crear Presupuesto</button>
            </div>
          </form>
        </Modal>
      </div>
    </PageTransition>
  )
}
