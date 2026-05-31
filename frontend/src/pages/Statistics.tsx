import { useState, useMemo } from 'react'
import { useAppStore } from '@/store/appStore'
import { PageTransition, FadeIn } from '@/components/ui/PageTransition'
import { formatCurrency } from '@/lib/utils'
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '@/types'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, CartesianGrid, Rectangle,
} from 'recharts'
import type { RectangleProps } from 'recharts'
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react'

const COLORS = ['#D6B98C', '#A8C5DA', '#34D399', '#F87171', '#FBBF24', '#60A5FA', '#A78BFA', '#F472B6', '#2DD4BF']

interface CustomBarProps extends RectangleProps {
  dataKey?: string
  isHovered?: boolean
  barType?: 'income' | 'expense'
}

// Custom bar shape with neon bloom glow on hover
function NeonBar(props: CustomBarProps) {
  const { x, y, width, height, fill, isHovered, barType } = props
  if (!x || !y || !width || !height || Number(height) <= 0) return null

  const isIncome = barType === 'income'
  const baseColor = isIncome ? '#34D399' : '#F87171'
  const glowColor = isIncome ? '#34D399' : '#F87171'
  const displayColor = isHovered ? (isIncome ? '#34D399' : '#F87171') : fill || baseColor
  const opacity = isHovered ? 1 : 0.8

  return (
    <g>
      {/* Neon glow filter is defined in the SVG defs */}
      {/* Glowing bar — apply SVG filter directly on the filled bar */}
      <Rectangle
        x={x}
        y={y}
        width={width}
        height={height}
        fill={displayColor}
        opacity={opacity}
        rx={6}
        ry={6}
        style={isHovered ? {
          filter: `url(#glow-${isIncome ? 'green' : 'coral'})`,
        } : undefined}
      />
      {/* Expand glow aura around the bar on hover */}
      {isHovered && (
        <Rectangle
          x={Number(x) - 8}
          y={Number(y) - 8}
          width={Number(width) + 16}
          height={Number(height) + 16}
          fill={displayColor}
          opacity={0.12}
          rx={10}
          ry={10}
          style={{
            filter: `url(#glow-${isIncome ? 'green' : 'coral'}) blur(6px)`,
          }}
        />
      )}
    </g>
  )
}

export function Statistics() {
  const { expenses, incomes } = useAppStore()
  const [hoveredBar, setHoveredBar] = useState<string | null>(null)

  const expenseByCategory = useMemo(() => {
    const map: Record<string, number> = {}
    expenses.forEach(e => {
      map[e.category] = (map[e.category] || 0) + e.amount
    })
    return EXPENSE_CATEGORIES.map(c => ({
      name: c.label,
      value: map[c.value] || 0,
      emoji: c.emoji,
    })).filter(d => d.value > 0)
  }, [expenses])

  const incomeByCategory = useMemo(() => {
    const map: Record<string, number> = {}
    incomes.forEach(i => {
      map[i.category] = (map[i.category] || 0) + i.amount
    })
    return INCOME_CATEGORIES.map(c => ({
      name: c.label,
      value: map[c.value] || 0,
      emoji: c.emoji,
    })).filter(d => d.value > 0)
  }, [incomes])

  const monthlyData = useMemo(() => {
    const map: Record<string, { income: number; expense: number }> = {}
    const addMonth = (date: string, isIncome: boolean, amount: number) => {
      const key = date.slice(0, 7)
      if (!map[key]) map[key] = { income: 0, expense: 0 }
      if (isIncome) map[key].income += amount
      else map[key].expense += amount
    }
    incomes.forEach(i => addMonth(i.date, true, i.amount))
    expenses.forEach(e => addMonth(e.date, false, e.amount))
    return Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, data]) => ({ month, ...data }))
  }, [expenses, incomes])

  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0)
  const totalIncome = incomes.reduce((s, i) => s + i.amount, 0)

  const handleMouseEnter = (data: any, index: number) => {
    setHoveredBar(`${index}`)
  }

  const handleMouseLeave = () => {
    setHoveredBar(null)
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload?.length) {
      return (
        <div
          className="px-4 py-3 text-xs shadow-2xl"
          style={{
            background: 'rgba(10, 10, 10, 0.85)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '12px',
          }}
        >
          <p className="text-xs font-medium text-white/70 mb-2">{label}</p>
          {payload.map((p: any, i: number) => (
            <div key={i} className="flex items-center justify-between gap-4 py-0.5">
              <div className="flex items-center gap-2">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: p.color }}
                />
                <span className="text-white/50">{p.name}</span>
              </div>
              <span
                className="font-semibold"
                style={{ color: p.color }}
              >
                {formatCurrency(p.value)}
              </span>
            </div>
          ))}
        </div>
      )
    }
    return null
  }

  const PieTooltip = ({ active, payload }: any) => {
    if (active && payload?.length) {
      return (
        <div
          className="px-3 py-2 text-xs shadow-2xl"
          style={{
            background: 'rgba(10, 10, 10, 0.85)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '12px',
          }}
        >
          <p className="font-medium text-white">{payload[0].payload.emoji} {payload[0].name}</p>
          <p className="text-white/60 mt-0.5">{formatCurrency(payload[0].value)}</p>
        </div>
      )
    }
    return null
  }

  return (
    <PageTransition>
      {/* Giant background title */}
      <div className="page-bg-title">ESTADÍSTICAS</div>

      <div className="relative z-10 max-w-6xl mx-auto">
        <FadeIn className="mb-8">
          <h2 className="text-3xl font-bold text-white">Estadísticas</h2>
          <p className="text-white/50 mt-1">Información visual de tus finanzas</p>
        </FadeIn>

        {/* Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <FadeIn delay={0.1}>
            <div className="glass-card p-5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#34D399]/10 text-[#34D399]">
                <TrendingUp size={18} />
              </div>
              <div>
                <p className="text-xs text-white/40">Total Ingresos</p>
                <p className="text-lg font-semibold text-white">{formatCurrency(totalIncome)}</p>
              </div>
            </div>
          </FadeIn>
          <FadeIn delay={0.15}>
            <div className="glass-card p-5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#F87171]/10 text-[#F87171]">
                <TrendingDown size={18} />
              </div>
              <div>
                <p className="text-xs text-white/40">Total Gastos</p>
                <p className="text-lg font-semibold text-white">{formatCurrency(totalExpenses)}</p>
              </div>
            </div>
          </FadeIn>
          <FadeIn delay={0.2}>
            <div className="glass-card p-5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#60A5FA]/10 text-[#60A5FA]">
                <DollarSign size={18} />
              </div>
              <div>
                <p className="text-xs text-white/40">Balance</p>
                <p className="text-lg font-semibold text-white">{formatCurrency(totalIncome - totalExpenses)}</p>
              </div>
            </div>
          </FadeIn>
        </div>

        {/* Monthly Trend — Neon Bloom Chart */}
        <FadeIn delay={0.25} className="mb-8">
          <div className="glass-card p-5 sm:p-6 overflow-hidden">
            <h3 className="font-semibold text-white mb-4">Tendencia Mensual</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={monthlyData}
                  barGap={4}
                  barCategoryGap="24%"
                  onMouseLeave={handleMouseLeave}
                >
                  <defs>
                    {/* Green neon glow filter */}
                    <filter id="glow-green" x="-50%" y="-50%" width="200%" height="200%">
                      <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur1" />
                      <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur2" />
                      <feGaussianBlur in="SourceGraphic" stdDeviation="12" result="blur3" />
                      <feMerge>
                        <feMergeNode in="blur3" />
                        <feMergeNode in="blur2" />
                        <feMergeNode in="blur1" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                    {/* Coral neon glow filter */}
                    <filter id="glow-coral" x="-50%" y="-50%" width="200%" height="200%">
                      <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur1" />
                      <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur2" />
                      <feGaussianBlur in="SourceGraphic" stdDeviation="12" result="blur3" />
                      <feMerge>
                        <feMergeNode in="blur3" />
                        <feMergeNode in="blur2" />
                        <feMergeNode in="blur1" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                    {/* Subtle light gray background for plot area */}
                    <linearGradient id="plot-bg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="rgba(200, 200, 200, 0.08)" />
                      <stop offset="100%" stopColor="rgba(200, 200, 200, 0.03)" />
                    </linearGradient>
                  </defs>

                  {/* Chart plot area background */}
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.06)"
                    fill="url(#plot-bg)"
                    fillOpacity={1}
                    vertical={false}
                  />

                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.35)', fontFamily: 'Inter, sans-serif' }}
                    axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
                    tickLine={false}
                    tickFormatter={(val) => {
                      const [y, m] = val.split('-')
                      const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
                      return `${months[parseInt(m) - 1]} ${y}`
                    }}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.3)', fontFamily: 'Inter, sans-serif' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(val) =>
                      val >= 1000000
                        ? `${(val / 1000000).toFixed(1)}M`
                        : val >= 1000
                          ? `${(val / 1000).toFixed(0)}k`
                          : val.toString()
                    }
                  />
                  <Tooltip content={<CustomTooltip />} cursor={false} />

                  {/* Income bars */}
                  <Bar
                    dataKey="income"
                    name="Ingresos"
                    fill="#34D399"
                    opacity={0.85}
                    maxBarSize={36}
                    shape={(props: any) => {
                      const { x, y, width, height, index } = props
                      if (Number(height) <= 0) return null
                      return (
                        <g
                          onMouseEnter={() => handleMouseEnter(props, index)}
                          onMouseLeave={handleMouseLeave}
                          style={{ cursor: 'pointer' }}
                        >
                          <NeonBar
                            {...props}
                            x={x}
                            y={y}
                            width={width}
                            height={height}
                            fill="#34D399"
                            isHovered={hoveredBar === `${index}`}
                            barType="income"
                          />
                        </g>
                      )
                    }}
                  />

                  {/* Expense bars */}
                  <Bar
                    dataKey="expense"
                    name="Gastos"
                    fill="#F87171"
                    opacity={0.85}
                    maxBarSize={36}
                    shape={(props: any) => {
                      const { x, y, width, height, index } = props
                      if (Number(height) <= 0) return null
                      return (
                        <g
                          onMouseEnter={() => handleMouseEnter(props, index)}
                          onMouseLeave={handleMouseLeave}
                          style={{ cursor: 'pointer' }}
                        >
                          <NeonBar
                            {...props}
                            x={x}
                            y={y}
                            width={width}
                            height={height}
                            fill="#F87171"
                            isHovered={hoveredBar === `${index}`}
                            barType="expense"
                          />
                        </g>
                      )
                    }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </FadeIn>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Expenses by Category */}
          <FadeIn delay={0.3}>
            <div className="glass-card p-5 sm:p-6">
              <h3 className="font-semibold text-white mb-4">Gastos por Categoría</h3>
              {expenseByCategory.length > 0 ? (
                <>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={expenseByCategory}
                          cx="50%" cy="50%"
                          innerRadius={55}
                          outerRadius={80}
                          paddingAngle={3}
                          dataKey="value"
                          stroke="none"
                        >
                          {expenseByCategory.map((_, i) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip content={<PieTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-4">
                    {expenseByCategory.map((d, i) => (
                      <div key={d.name} className="flex items-center gap-2 text-xs">
                        <div className="w-2.5 h-2.5 rounded" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                        <span className="text-white/50">{d.emoji} {d.name}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-sm text-white/30 text-center py-12">Sin datos de gastos</p>
              )}
            </div>
          </FadeIn>

          {/* Income by Category */}
          <FadeIn delay={0.35}>
            <div className="glass-card p-5 sm:p-6">
              <h3 className="font-semibold text-white mb-4">Ingresos por Categoría</h3>
              {incomeByCategory.length > 0 ? (
                <>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={incomeByCategory}
                          cx="50%" cy="50%"
                          innerRadius={55}
                          outerRadius={80}
                          paddingAngle={3}
                          dataKey="value"
                          stroke="none"
                        >
                          {incomeByCategory.map((_, i) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip content={<PieTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-4">
                    {incomeByCategory.map((d, i) => (
                      <div key={d.name} className="flex items-center gap-2 text-xs">
                        <div className="w-2.5 h-2.5 rounded" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                        <span className="text-white/50">{d.emoji} {d.name}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-sm text-white/30 text-center py-12">Sin datos de ingresos</p>
              )}
            </div>
          </FadeIn>
        </div>
      </div>
    </PageTransition>
  )
}
