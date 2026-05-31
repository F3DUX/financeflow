import { useState, useMemo } from 'react'
import { useAppStore } from '@/store/appStore'
import { PageTransition, FadeIn } from '@/components/ui/PageTransition'
import { formatCurrency, getDaysInMonth, getFirstDayOfMonth } from '@/lib/utils'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { motion } from 'framer-motion'

const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
const DAY_NAMES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

export function CalendarPage() {
  const { services, expenses, incomes } = useAppStore()
  const [currentDate, setCurrentDate] = useState(new Date())

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfMonth(year, month)
  const monthName = MONTHS[month]

  const events = useMemo(() => {
    const evts: Record<number, { title: string; amount: number; type: 'due' | 'payment' | 'collection' }[]> = {}

    services.filter(s => s.status === 'active').forEach(s => {
      const day = s.dueDate
      if (!evts[day]) evts[day] = []
      evts[day].push({ title: s.name, amount: s.amount, type: 'due' })
    })

    expenses.forEach(e => {
      const d = new Date(e.date)
      if (d.getMonth() === month && d.getFullYear() === year) {
        const day = d.getDate()
        if (!evts[day]) evts[day] = []
        evts[day].push({ title: e.description, amount: e.amount, type: 'payment' })
      }
    })

    incomes.forEach(i => {
      const d = new Date(i.date)
      if (d.getMonth() === month && d.getFullYear() === year) {
        const day = d.getDate()
        if (!evts[day]) evts[day] = []
        evts[day].push({ title: i.description, amount: i.amount, type: 'collection' })
      }
    })

    return evts
  }, [services, expenses, incomes, month, year])

  const prevMonth = () => setCurrentDate(new Date(year, month - 1))
  const nextMonth = () => setCurrentDate(new Date(year, month + 1))

  return (
    <PageTransition>
      {/* Giant background title */}
      <div className="page-bg-title">CALENDARIO</div>

      <div className="relative z-10 max-w-5xl mx-auto">
        <FadeIn className="mb-8">
          <h2 className="text-3xl font-bold text-white">Calendario</h2>
          <p className="text-white/50 mt-1">Eventos financieros y fechas de vencimiento</p>
        </FadeIn>

        <FadeIn delay={0.1}>
          <div className="glass-card p-5 sm:p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <button onClick={prevMonth} className="w-9 h-9 rounded-xl flex items-center justify-center text-white/30 hover:text-white/60 hover:bg-white/5 transition-all">
                <ChevronLeft size={18} />
              </button>
              <h3 className="text-lg font-semibold text-white">{monthName} {year}</h3>
              <button onClick={nextMonth} className="w-9 h-9 rounded-xl flex items-center justify-center text-white/30 hover:text-white/60 hover:bg-white/5 transition-all">
                <ChevronRight size={18} />
              </button>
            </div>

            {/* Day names */}
            <div className="grid grid-cols-7 mb-2">
              {DAY_NAMES.map(day => (
                <div key={day} className="text-center text-xs font-medium text-white/30 py-2">{day}</div>
              ))}
            </div>

            {/* Days */}
            <div className="grid grid-cols-7">
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square p-1" />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1
                const dayEvents = events[day] || []
                const isToday =
                  new Date().getDate() === day &&
                  new Date().getMonth() === month &&
                  new Date().getFullYear() === year

                return (
                  <motion.div
                    key={day}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.005, duration: 0.2 }}
                    className={`aspect-square p-1 border border-transparent rounded-xl hover:border-white/10 transition-colors ${
                      isToday ? 'border-white/30 bg-white/5' : ''
                    }`}
                  >
                    <div className={`text-xs font-medium mb-0.5 ${isToday ? 'text-white' : 'text-white/50'}`}>
                      {day}
                    </div>
                    <div className="space-y-0.5">
                      {dayEvents.slice(0, 3).map((evt, j) => (
                        <div key={j} className={`text-[9px] leading-tight px-1 py-0.5 rounded ${
                          evt.type === 'due' ? 'bg-[#F87171]/15 text-[#F87171]' :
                          evt.type === 'payment' ? 'bg-[#FBBF24]/15 text-[#FBBF24]' :
                          'bg-[#34D399]/15 text-[#34D399]'
                        }`}>
                          <span className="truncate block">{evt.title}</span>
                        </div>
                      ))}
                      {dayEvents.length > 3 && (
                        <div className="text-[9px] text-white/30 px-1">+{dayEvents.length - 3} más</div>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </FadeIn>

        {/* Legend */}
        <FadeIn delay={0.2} className="mt-6 flex flex-wrap gap-4 text-xs text-white/40">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded bg-[#F87171]" />
            <span>Vencimientos</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded bg-[#FBBF24]" />
            <span>Pagos</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded bg-[#34D399]" />
            <span>Cobros</span>
          </div>
        </FadeIn>
      </div>
    </PageTransition>
  )
}
