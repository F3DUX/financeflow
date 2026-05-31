import { useEffect } from 'react'
import { useAppStore } from '@/store/appStore'
import { useRatesStore, getRateByCasa } from '@/store/ratesStore'
import { PageTransition, FadeIn, StaggerContainer, StaggerItem } from '@/components/ui/PageTransition'
import { StatCard } from '@/components/ui/StatCard'
import { AnimatedCounter } from '@/components/ui/AnimatedCounter'
import { ProgressCard } from '@/components/ui/ProgressCard'
import { formatCurrency, formatDateShort } from '@/lib/utils'
import { ArrowUpRight, ArrowDownLeft, TrendingUp, Wallet, TrendingDown } from 'lucide-react'
import { motion } from 'framer-motion'
import { useMemo } from 'react'
import type { Transaction } from '@/types'

export function Dashboard() {
  const { expenses, incomes, services, goals } = useAppStore()
  const { dolares, fetchRates } = useRatesStore()

  useEffect(() => {
    fetchRates()
  }, [fetchRates])

  const blueRate = getRateByCasa(dolares, 'blue')
  const oficialRate = getRateByCasa(dolares, 'oficial')

  const totalExpenses = useMemo(() =>
    expenses.reduce((sum, e) => sum + e.amount, 0), [expenses])

  const totalIncome = useMemo(() =>
    incomes.reduce((sum, i) => sum + i.amount, 0), [incomes])

  const totalServices = useMemo(() =>
    services.filter(s => s.status === 'active').reduce((sum, s) => sum + s.amount, 0), [services])

  const available = totalIncome - totalExpenses - totalServices
  const savings = totalIncome > 0 ? Math.round((Math.max(available, 0) / totalIncome) * 100) : 0

  const recentTransactions: Transaction[] = useMemo(() => {
    const txns: Transaction[] = [
      ...expenses.map(e => ({ id: e.id, type: 'expense' as const, amount: e.amount, category: e.category, description: e.description, date: e.date, tags: e.tags })),
      ...incomes.map(i => ({ id: i.id, type: 'income' as const, amount: i.amount, category: i.category, description: i.description, date: i.date })),
    ]
    return txns.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5)
  }, [expenses, incomes])

  const upcomingPayments = useMemo(() =>
    services.filter(s => s.status === 'active').slice(0, 5), [services])

  const activeGoals = useMemo(() =>
    goals.slice(0, 2), [goals])

  return (
    <PageTransition>
      {/* Giant background title */}
      <div className="page-bg-title">PANEL</div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Page Header */}
        <FadeIn className="mb-8">
          <h2 className="text-3xl font-bold text-white">Panel</h2>
          <p className="text-white/50 mt-1">Resumen financiero</p>
        </FadeIn>

        {/* Stats Grid */}
        <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StaggerItem>
            <StatCard
              label="Saldo Disponible"
              value={<AnimatedCounter value={available} formatFn={formatCurrency} />}
              icon={<Wallet size={18} />}
              trend={{ value: 12, positive: true }}
            />
          </StaggerItem>
          <StaggerItem>
            <StatCard
              label="Ingresos del Mes"
              value={<AnimatedCounter value={totalIncome} formatFn={formatCurrency} />}
              icon={<ArrowDownLeft size={18} />}
              trend={{ value: 8, positive: true }}
            />
          </StaggerItem>
          <StaggerItem>
            <StatCard
              label="Gastos del Mes"
              value={<AnimatedCounter value={totalExpenses + totalServices} formatFn={formatCurrency} />}
              icon={<ArrowUpRight size={18} />}
              trend={{ value: 3, positive: false }}
            />
          </StaggerItem>
          <StaggerItem>
            <StatCard
              label="Tasa de Ahorro"
              value={<AnimatedCounter value={savings} formatFn={(v) => `${v}%`} />}
              icon={<TrendingUp size={18} />}
              trend={{ value: 5, positive: true }}
            />
          </StaggerItem>
        </StaggerContainer>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Transactions */}
          <FadeIn className="lg:col-span-2" delay={0.2}>
            <div className="glass-card p-5 sm:p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-semibold text-white">Últimos Movimientos</h3>
                <span className="text-xs text-white/30">Hoy</span>
              </div>
              <div className="space-y-1">
                {recentTransactions.map((txn, i) => (
                  <motion.div
                    key={txn.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.3 }}
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/[0.03] transition-colors"
                  >
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm ${
                      txn.type === 'income'
                        ? 'bg-[#34D399]/10 text-[#34D399]'
                        : 'bg-[#F87171]/10 text-[#F87171]'
                    }`}>
                      {txn.type === 'income' ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{txn.description}</p>
                      <p className="text-xs text-white/40 capitalize">{txn.category} • {formatDateShort(txn.date)}</p>
                    </div>
                    <span className={`text-sm font-semibold ${
                      txn.type === 'income' ? 'text-[#34D399]' : 'text-white'
                    }`}>
                      {txn.type === 'income' ? '+' : '-'}{formatCurrency(txn.amount)}
                    </span>
                  </motion.div>
                ))}
                {recentTransactions.length === 0 && (
                  <p className="text-sm text-white/30 text-center py-8">Sin movimientos aún</p>
                )}
              </div>
            </div>
          </FadeIn>

          {/* Side Widgets */}
          <div className="space-y-4">
            {/* Dollar Rates Widget */}
            <FadeIn delay={0.25}>
              <div className="glass-card p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <TrendingUp size={15} className="text-white/40" />
                    <h3 className="text-sm font-semibold text-white">Dólar Hoy</h3>
                  </div>
                  {blueRate && oficialRate && (
                    <span className="text-[10px] text-white/30">En vivo</span>
                  )}
                </div>
                <div className="space-y-2.5">
                  {/* Blue */}
                  {blueRate ? (
                    <div className="flex items-center justify-between py-1.5 px-2.5 rounded-xl bg-white/[0.03]">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">💵</span>
                        <span className="text-xs text-white/60">Blue</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-white/70">${blueRate.compra.toLocaleString('es-AR')}</span>
                        <span className="text-sm font-semibold font-mono text-white">${blueRate.venta.toLocaleString('es-AR')}</span>
                        {blueRate.variacion !== undefined && (
                          <span className={`flex items-center gap-0.5 text-[10px] font-medium ${
                            blueRate.variacion >= 0 ? 'text-[#34D399]' : 'text-[#F87171]'
                          }`}>
                            {blueRate.variacion >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                            {Math.abs(blueRate.variacion).toFixed(1)}%
                          </span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="py-2 text-center text-xs text-white/30">Cargando...</div>
                  )}

                  {/* Oficial */}
                  {oficialRate ? (
                    <div className="flex items-center justify-between py-1.5 px-2.5 rounded-xl bg-white/[0.03]">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">🏦</span>
                        <span className="text-xs text-white/60">Oficial</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-white/70">${oficialRate.compra.toLocaleString('es-AR')}</span>
                        <span className="text-sm font-semibold font-mono text-white">${oficialRate.venta.toLocaleString('es-AR')}</span>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            </FadeIn>

            {/* Upcoming Payments */}
            <FadeIn delay={0.3}>
              <div className="glass-card p-5 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-white">Próximos</h3>
                  <span className="badge-warning text-xs">{upcomingPayments.length} activos</span>
                </div>
                <div className="space-y-2.5">
                  {upcomingPayments.slice(0, 4).map((svc) => (
                    <div key={svc.id} className="flex items-center justify-between py-1">
                      <span className="text-sm text-white/70">{svc.name}</span>
                      <span className="text-sm font-medium text-white">
                        {formatCurrency(svc.amount)}
                      </span>
                    </div>
                  ))}
                  {upcomingPayments.length === 0 && (
                    <p className="text-sm text-white/30 text-center py-4">Sin servicios activos</p>
                  )}
                </div>
              </div>
            </FadeIn>

            {/* Active Goals */}
            {activeGoals.map((goal, i) => (
              <FadeIn key={goal.id} delay={0.35 + i * 0.05}>
                <ProgressCard
                  label={goal.name}
                  current={goal.currentAmount}
                  target={goal.targetAmount}
                  icon={goal.icon}
                />
              </FadeIn>
            ))}
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
