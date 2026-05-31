import { useState } from 'react'
import { useAppStore } from '@/store/appStore'
import { PageTransition, FadeIn, StaggerContainer, StaggerItem } from '@/components/ui/PageTransition'
import { Modal } from '@/components/ui/Modal'
import { formatCurrency } from '@/lib/utils'
import { SERVICE_CATEGORIES, FREQUENCY_LABELS, STATUS_LABELS } from '@/types'
import type { Service, ServiceCategory, ServiceFrequency, ServiceStatus } from '@/types'
import { Plus, Trash2, Edit, CreditCard, Search } from 'lucide-react'
import { motion } from 'framer-motion'

export function Services() {
  const { services, addService, updateService, deleteService } = useAppStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [form, setForm] = useState({
    name: '',
    category: 'other' as ServiceCategory,
    amount: '',
    dueDate: '1',
    frequency: 'monthly' as ServiceFrequency,
    status: 'active' as ServiceStatus,
  })

  const filtered = services.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.category.toLowerCase().includes(search.toLowerCase())
  )

  const resetForm = () => {
    setForm({ name: '', category: 'other', amount: '', dueDate: '1', frequency: 'monthly', status: 'active' })
    setEditingId(null)
  }

  const openEdit = (svc: Service) => {
    setForm({
      name: svc.name,
      category: svc.category,
      amount: String(svc.amount),
      dueDate: String(svc.dueDate),
      frequency: svc.frequency,
      status: svc.status,
    })
    setEditingId(svc.id)
    setIsModalOpen(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const data = {
      name: form.name,
      category: form.category,
      amount: Number(form.amount),
      dueDate: Number(form.dueDate),
      frequency: form.frequency,
      status: form.status,
    }
    if (editingId) {
      updateService(editingId, data)
    } else {
      addService(data)
    }
    resetForm()
    setIsModalOpen(false)
  }

  const monthlyTotal = filtered.filter(s => s.status === 'active').reduce((sum, s) => sum + s.amount, 0)

  return (
    <PageTransition>
      {/* Giant background title */}
      <div className="page-bg-title">SERVICIOS</div>

      <div className="relative z-10 max-w-5xl mx-auto">
        <FadeIn className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-white">Servicios</h2>
            <p className="text-white/50 mt-1">Administra suscripciones y cuentas</p>
          </div>
          <button onClick={() => { resetForm(); setIsModalOpen(true) }} className="btn-primary">
            <Plus size={18} />
            Nuevo Servicio
          </button>
        </FadeIn>

        <FadeIn delay={0.1} className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
            <input type="text" placeholder="Buscar servicios..." value={search}
              onChange={(e) => setSearch(e.target.value)} className="input-field pl-10" />
          </div>
          <div className="glass-card p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#60A5FA]/10 text-[#60A5FA]">
              <CreditCard size={18} />
            </div>
            <div>
              <p className="text-xs text-white/40">Total mensual</p>
              <p className="text-lg font-semibold text-white">{formatCurrency(monthlyTotal)}</p>
            </div>
          </div>
        </FadeIn>

        <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((svc) => {
            const cat = SERVICE_CATEGORIES.find(c => c.value === svc.category)
            return (
              <StaggerItem key={svc.id}>
                <motion.div whileHover={{ y: -2 }} className="glass-card p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg bg-white/[0.04]">
                      {cat?.emoji || '📦'}
                    </div>
                    <span className={`badge text-xs ${
                      svc.status === 'active' ? 'badge-success' :
                      svc.status === 'paused' ? 'badge-warning' : 'badge-danger'
                    }`}>
                      {STATUS_LABELS[svc.status]}
                    </span>
                  </div>
                  <h3 className="font-semibold text-white mb-1">{svc.name}</h3>
                  <p className="text-2xl font-semibold text-white mb-2">{formatCurrency(svc.amount)}</p>
                  <div className="flex items-center gap-2 text-xs text-white/40">
                    <span>Día {svc.dueDate}</span>
                    <span className="text-white/20">•</span>
                    <span>{FREQUENCY_LABELS[svc.frequency]}</span>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button onClick={() => openEdit(svc)} className="btn-ghost text-xs flex-1 justify-center">Editar</button>
                    <button onClick={() => deleteService(svc.id)} className="btn-ghost text-xs flex-1 justify-center text-[#F87171] hover:text-[#EF4444]">Eliminar</button>
                  </div>
                </motion.div>
              </StaggerItem>
            )
          })}
          {filtered.length === 0 && (
            <div className="col-span-full">
              <p className="text-sm text-white/30 text-center py-12">Sin servicios registrados</p>
            </div>
          )}
        </StaggerContainer>

        <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); resetForm() }} title={editingId ? 'Editar Servicio' : 'Nuevo Servicio'}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Nombre</label>
                <input type="text" className="input-field" placeholder="ej. Netflix"
                  value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div>
                <label className="label">Categoría</label>
                <select className="input-field" value={form.category} onChange={e => setForm({ ...form, category: e.target.value as ServiceCategory })}>
                  {SERVICE_CATEGORIES.map(c => (
                    <option key={c.value} value={c.value}>{c.emoji} {c.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Monto</label>
                <input type="number" className="input-field" placeholder="0"
                  value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} required min={1} />
              </div>
              <div>
                <label className="label">Día de Vencimiento</label>
                <input type="number" className="input-field" min={1} max={31}
                  value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Frecuencia</label>
                <select className="input-field" value={form.frequency} onChange={e => setForm({ ...form, frequency: e.target.value as ServiceFrequency })}>
                  {Object.entries(FREQUENCY_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Estado</label>
                <select className="input-field" value={form.status} onChange={e => setForm({ ...form, status: e.target.value as ServiceStatus })}>
                  {Object.entries(STATUS_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => { setIsModalOpen(false); resetForm() }} className="btn-secondary">Cancelar</button>
              <button type="submit" className="btn-primary">{editingId ? 'Actualizar' : 'Agregar Servicio'}</button>
            </div>
          </form>
        </Modal>
      </div>
    </PageTransition>
  )
}
