import { useState } from 'react'
import { useAppStore } from '@/store/appStore'
import { PageTransition, FadeIn, StaggerContainer, StaggerItem } from '@/components/ui/PageTransition'
import { Modal } from '@/components/ui/Modal'
import { formatCurrency, formatDate } from '@/lib/utils'
import { INCOME_CATEGORIES } from '@/types'
import type { Income as IncomeType, IncomeCategory } from '@/types'
import { Plus, Trash2, Edit, ArrowDownLeft, Search } from 'lucide-react'
import { motion } from 'framer-motion'

export function Income() {
  const { incomes, addIncome, updateIncome, deleteIncome } = useAppStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [form, setForm] = useState({
    amount: '',
    category: 'salary' as IncomeCategory,
    date: new Date().toISOString().split('T')[0],
    description: '',
  })

  const filtered = incomes.filter(i =>
    i.description.toLowerCase().includes(search.toLowerCase()) ||
    i.category.toLowerCase().includes(search.toLowerCase())
  )

  const resetForm = () => {
    setForm({ amount: '', category: 'salary', date: new Date().toISOString().split('T')[0], description: '' })
    setEditingId(null)
  }

  const openEdit = (income: IncomeType) => {
    setForm({
      amount: String(income.amount),
      category: income.category,
      date: income.date,
      description: income.description,
    })
    setEditingId(income.id)
    setIsModalOpen(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const data = {
      amount: Number(form.amount),
      category: form.category,
      date: form.date,
      description: form.description,
    }
    if (editingId) {
      updateIncome(editingId, data)
    } else {
      addIncome(data)
    }
    resetForm()
    setIsModalOpen(false)
  }

  return (
    <PageTransition>
      {/* Giant background title */}
      <div className="page-bg-title">INGRESOS</div>

      <div className="relative z-10 max-w-5xl mx-auto">
        <FadeIn className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-white">Ingresos</h2>
            <p className="text-white/50 mt-1">Registra tus ganancias</p>
          </div>
          <button onClick={() => { resetForm(); setIsModalOpen(true) }} className="btn-primary">
            <Plus size={18} />
            Nuevo Ingreso
          </button>
        </FadeIn>

        <FadeIn delay={0.1} className="mb-6">
          <div className="relative max-w-md">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
            <input type="text" placeholder="Buscar ingresos..." value={search}
              onChange={(e) => setSearch(e.target.value)} className="input-field pl-10" />
          </div>
        </FadeIn>

        <FadeIn delay={0.15} className="mb-6">
          <div className="glass-card p-4 sm:p-5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#34D399]/10 text-[#34D399]">
              <ArrowDownLeft size={18} />
            </div>
            <div>
              <p className="text-sm text-white/50">Total Ingresos</p>
              <p className="text-xl font-semibold text-white">
                {formatCurrency(filtered.reduce((s, i) => s + i.amount, 0))}
              </p>
            </div>
          </div>
        </FadeIn>

        <StaggerContainer className="space-y-2">
          {filtered.map((income) => {
            const cat = INCOME_CATEGORIES.find(c => c.value === income.category)
            return (
              <StaggerItem key={income.id}>
                <motion.div whileHover={{ scale: 1.002 }}
                  className="glass-card p-4 sm:p-5 flex items-center gap-4"
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg bg-white/[0.04]">
                    {cat?.emoji || '📦'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{income.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-white/40 capitalize">{income.category}</span>
                      <span className="text-white/20">•</span>
                      <span className="text-xs text-white/40">{formatDate(income.date)}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-[#34D399]">+{formatCurrency(income.amount)}</p>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(income)} className="w-8 h-8 rounded-lg flex items-center justify-center text-white/30 hover:text-white/60 hover:bg-white/5 transition-all">
                      <Edit size={14} />
                    </button>
                    <button onClick={() => deleteIncome(income.id)} className="w-8 h-8 rounded-lg flex items-center justify-center text-white/30 hover:text-[#F87171] hover:bg-[#F87171]/10 transition-all">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </motion.div>
              </StaggerItem>
            )
          })}
          {filtered.length === 0 && <p className="text-sm text-white/30 text-center py-12">Sin ingresos registrados</p>}
        </StaggerContainer>

        <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); resetForm() }} title={editingId ? 'Editar Ingreso' : 'Nuevo Ingreso'}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Descripción</label>
              <input type="text" className="input-field" placeholder="ej. Sueldo mensual"
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
            <div>
              <label className="label">Categoría</label>
              <select className="input-field" value={form.category} onChange={e => setForm({ ...form, category: e.target.value as IncomeCategory })}>
                {INCOME_CATEGORIES.map(c => (
                  <option key={c.value} value={c.value}>{c.emoji} {c.label}</option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => { setIsModalOpen(false); resetForm() }} className="btn-secondary">Cancelar</button>
              <button type="submit" className="btn-primary">{editingId ? 'Actualizar' : 'Agregar Ingreso'}</button>
            </div>
          </form>
        </Modal>
      </div>
    </PageTransition>
  )
}
