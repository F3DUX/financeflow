import { useState } from 'react'
import { useAppStore } from '@/store/appStore'
import { PageTransition, FadeIn, StaggerContainer, StaggerItem } from '@/components/ui/PageTransition'
import { Modal } from '@/components/ui/Modal'
import { formatCurrency, formatDate } from '@/lib/utils'
import { EXPENSE_CATEGORIES, PRIORITY_LABELS } from '@/types'
import type { Expense, ExpenseCategory, ExpensePriority } from '@/types'
import { Plus, Trash2, Edit, ArrowUpRight, Search } from 'lucide-react'
import { motion } from 'framer-motion'

export function Expenses() {
  const { expenses, addExpense, updateExpense, deleteExpense } = useAppStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [form, setForm] = useState({
    amount: '',
    category: 'food' as ExpenseCategory,
    priority: 'medium' as ExpensePriority,
    date: new Date().toISOString().split('T')[0],
    description: '',
    tags: '',
  })

  const filtered = expenses.filter(e =>
    e.description.toLowerCase().includes(search.toLowerCase()) ||
    e.category.toLowerCase().includes(search.toLowerCase())
  )

  const resetForm = () => {
    setForm({ amount: '', category: 'food', priority: 'medium', date: new Date().toISOString().split('T')[0], description: '', tags: '' })
    setEditingId(null)
  }

  const openEdit = (expense: Expense) => {
    setForm({
      amount: String(expense.amount),
      category: expense.category,
      priority: expense.priority,
      date: expense.date,
      description: expense.description,
      tags: expense.tags.join(', '),
    })
    setEditingId(expense.id)
    setIsModalOpen(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const data = {
      amount: Number(form.amount),
      category: form.category,
      priority: form.priority,
      date: form.date,
      description: form.description,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
    }
    if (editingId) {
      updateExpense(editingId, data)
    } else {
      addExpense(data)
    }
    resetForm()
    setIsModalOpen(false)
  }

  return (
    <PageTransition>
      {/* Giant background title */}
      <div className="page-bg-title">GASTOS</div>

      <div className="relative z-10 max-w-5xl mx-auto">
        <FadeIn className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-white">Gastos</h2>
            <p className="text-white/50 mt-1">Controla y administra tus gastos</p>
          </div>
          <button onClick={() => { resetForm(); setIsModalOpen(true) }} className="btn-primary">
            <Plus size={18} />
            Nuevo Gasto
          </button>
        </FadeIn>

        {/* Search */}
        <FadeIn delay={0.1} className="mb-6">
          <div className="relative max-w-md">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              type="text"
              placeholder="Buscar gastos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-10"
            />
          </div>
        </FadeIn>

        {/* Total */}
        <FadeIn delay={0.15} className="mb-6">
          <div className="glass-card p-4 sm:p-5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#F87171]/10 text-[#F87171]">
              <ArrowUpRight size={18} />
            </div>
            <div>
              <p className="text-sm text-white/50">Total Gastos</p>
              <p className="text-xl font-semibold text-white">
                {formatCurrency(filtered.reduce((s, e) => s + e.amount, 0))}
              </p>
            </div>
          </div>
        </FadeIn>

        {/* Expense List */}
        <StaggerContainer className="space-y-2">
          {filtered.map((expense) => {
            const cat = EXPENSE_CATEGORIES.find(c => c.value === expense.category)
            return (
              <StaggerItem key={expense.id}>
                <motion.div
                  whileHover={{ scale: 1.002 }}
                  className="glass-card p-4 sm:p-5 flex items-center gap-4"
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg bg-white/[0.04]">
                    {cat?.emoji || '📦'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {expense.description}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-white/40 capitalize">{expense.category}</span>
                      <span className="text-white/20">•</span>
                      <span className="text-xs text-white/40">{formatDate(expense.date)}</span>
                      <span className={`badge ${
                        expense.priority === 'high' ? 'badge-danger' :
                        expense.priority === 'medium' ? 'badge-warning' : 'badge-success'
                      }`}>
                        {PRIORITY_LABELS[expense.priority]}
                      </span>
                    </div>
                    {expense.tags.length > 0 && (
                      <div className="flex gap-1.5 mt-1.5">
                        {expense.tags.map(tag => (
                          <span key={tag} className="tag text-[10px]">{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-white">
                      -{formatCurrency(expense.amount)}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(expense)} className="w-8 h-8 rounded-lg flex items-center justify-center text-white/30 hover:text-white/60 hover:bg-white/5 transition-all">
                      <Edit size={14} />
                    </button>
                    <button onClick={() => deleteExpense(expense.id)} className="w-8 h-8 rounded-lg flex items-center justify-center text-white/30 hover:text-[#F87171] hover:bg-[#F87171]/10 transition-all">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </motion.div>
              </StaggerItem>
            )
          })}
          {filtered.length === 0 && (
            <p className="text-sm text-white/30 text-center py-12">No se encontraron gastos</p>
          )}
        </StaggerContainer>

        {/* Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => { setIsModalOpen(false); resetForm() }}
          title={editingId ? 'Editar Gasto' : 'Nuevo Gasto'}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Descripción</label>
              <input type="text" className="input-field" placeholder="ej. Compras semanales"
                value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Monto</label>
                <input type="number" className="input-field" placeholder="0"
                  value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} required min={1} />
              </div>
              <div>
                <label className="label">Fecha</label>
                <input type="date" className="input-field"
                  value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Categoría</label>
                <select className="input-field" value={form.category} onChange={e => setForm({ ...form, category: e.target.value as ExpenseCategory })}>
                  {EXPENSE_CATEGORIES.map(c => (
                    <option key={c.value} value={c.value}>{c.emoji} {c.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Prioridad</label>
                <select className="input-field" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value as ExpensePriority })}>
                  <option value="high">Alta</option>
                  <option value="medium">Media</option>
                  <option value="low">Baja</option>
                </select>
              </div>
            </div>
            <div>
              <label className="label">Etiquetas (separadas por coma)</label>
              <input type="text" className="input-field" placeholder="ej. supermercado, esencial"
                value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => { setIsModalOpen(false); resetForm() }} className="btn-secondary">Cancelar</button>
              <button type="submit" className="btn-primary">
                {editingId ? 'Actualizar' : 'Agregar Gasto'}
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </PageTransition>
  )
}
