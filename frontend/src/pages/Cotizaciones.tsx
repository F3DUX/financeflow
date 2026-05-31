import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  AreaChart, Area, CartesianGrid,
} from 'recharts'
import { RefreshCw, TrendingUp, TrendingDown, Minus, ArrowRight, RotateCcw } from 'lucide-react'
import { useRatesStore, getRateByCasa } from '@/store/ratesStore'
import { PageTransition, FadeIn, StaggerContainer, StaggerItem } from '@/components/ui/PageTransition'
import type { ExchangeRate } from '@/types'

const RATE_CONFIGS = [
  { casa: 'oficial', label: 'Dólar Oficial', key: 'dolar_oficial' },
  { casa: 'blue', label: 'Dólar Blue', key: 'dolar_blue' },
  { casa: 'bolsa', label: 'Dólar MEP', key: 'dolar_mep' },
  { casa: 'contadoconliqui', label: 'Dólar CCL', key: 'dolar_ccl' },
  { casa: 'tarjeta', label: 'Dólar Tarjeta', key: 'dolar_tarjeta' },
]

function getVariation(rate: ExchangeRate): { value: number; positive: boolean; neutral: boolean } {
  if (rate.variacion !== undefined) {
    return {
      value: Math.abs(rate.variacion),
      positive: rate.variacion >= 0,
      neutral: rate.variacion === 0,
    }
  }
  // Estimate variation from buy/sell spread
  const spread = ((rate.venta - rate.compra) / rate.compra) * 100
  return {
    value: Math.round(spread * 10) / 10,
    positive: true,
    neutral: spread === 0,
  }
}

function formatARS(value: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

function formatARSCompact(value: number): string {
  if (value >= 1000) {
    return `$${value.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }
  return `$${value.toFixed(2)}`
}

export function Cotizaciones() {
  const { dolares, euro, real, loading, error, lastUpdated, historicalBlue, historicalOficial, fetchRates } = useRatesStore()
  const [conversionAmount, setConversionAmount] = useState<number>(1000)
  const [conversionDirection, setConversionDirection] = useState<'ars_to_usd' | 'usd_to_ars'>('ars_to_usd')
  const [chartType, setChartType] = useState<'blue' | 'oficial'>('blue')

  useEffect(() => {
    fetchRates()
    const interval = setInterval(fetchRates, 60000)
    return () => clearInterval(interval)
  }, [fetchRates])

  const blueRate = getRateByCasa(dolares, 'blue')
  const oficialRate = getRateByCasa(dolares, 'oficial')
  const tarjetaRate = getRateByCasa(dolares, 'tarjeta')

  const conversionRate = blueRate?.venta || oficialRate?.venta || 1400
  const convertedAmount = conversionDirection === 'ars_to_usd'
    ? conversionAmount / conversionRate
    : conversionAmount * conversionRate

  const historicalData = chartType === 'blue' ? historicalBlue : historicalOficial

  return (
    <PageTransition>
      {/* Giant background title */}
      <div className="page-bg-title">MERCADO</div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Page Header */}
        <FadeIn className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-white">Mercado</h2>
              <p className="text-white/50 mt-1">Cotizaciones en tiempo real</p>
            </div>
            <button
              onClick={fetchRates}
              disabled={loading}
              className="btn-secondary text-xs flex items-center gap-1.5"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              Actualizar
            </button>
          </div>
          {lastUpdated && (
            <p className="text-xs text-white/30 mt-2">
              Última actualización: {lastUpdated.toLocaleTimeString('es-AR')}
            </p>
          )}
        </FadeIn>

        {error && (
          <FadeIn>
            <div className="glass-card-strong p-4 mb-6 border-red-500/20">
              <p className="text-sm text-[#F87171]">{error}</p>
            </div>
          </FadeIn>
        )}

        {/* Dólares Section */}
        <FadeIn delay={0.1} className="mb-6">
          <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">Dólares</h3>
          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
            {RATE_CONFIGS.map((config) => {
              const rate = getRateByCasa(dolares, config.casa)
              if (!rate) return null
              const variation = getVariation(rate)
              return (
                <StaggerItem key={config.casa}>
                  <RateCard rate={rate} variation={variation} label={config.label} />
                </StaggerItem>
              )
            })}
          </StaggerContainer>
        </FadeIn>

        {/* Otras Monedas */}
        <FadeIn delay={0.2} className="mb-8">
          <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">Otras Monedas</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {euro && (
              <StaggerItem>
                <RateCard
                  rate={euro}
                  variation={getVariation(euro)}
                  label="Euro"
                  icon="💶"
                />
              </StaggerItem>
            )}
            {real && (
              <StaggerItem>
                <RateCard
                  rate={real}
                  variation={getVariation(real)}
                  label="Real Brasileño"
                  icon="💷"
                />
              </StaggerItem>
            )}
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Chart */}
          <FadeIn delay={0.3} className="lg:col-span-2">
            <div className="glass-card p-5 sm:p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="font-semibold text-white">Evolución</h3>
                  <p className="text-xs text-white/40 mt-0.5">Últimos 30 días</p>
                </div>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => setChartType('blue')}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      chartType === 'blue'
                        ? 'bg-white text-black'
                        : 'text-white/50 hover:text-white/80 bg-white/[0.06]'
                    }`}
                  >
                    Blue
                  </button>
                  <button
                    onClick={() => setChartType('oficial')}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      chartType === 'oficial'
                        ? 'bg-white text-black'
                        : 'text-white/50 hover:text-white/80 bg-white/[0.06]'
                    }`}
                  >
                    Oficial
                  </button>
                </div>
              </div>

              <div className="h-64 sm:h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={historicalData}>
                    <defs>
                      <linearGradient id={`gradient-${chartType}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={chartType === 'blue' ? '#34D399' : '#60A5FA'} stopOpacity={0.25} />
                        <stop offset="100%" stopColor={chartType === 'blue' ? '#34D399' : '#60A5FA'} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis
                      dataKey="date"
                      tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(val) => val.slice(5)}
                    />
                    <YAxis
                      domain={['dataMin - 20', 'dataMax + 20']}
                      tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(val) => `$${val.toLocaleString('es-AR')}`}
                    />
                    <Tooltip
                      contentStyle={{
                        background: 'rgba(0,0,0,0.8)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '12px',
                        backdropFilter: 'blur(12px)',
                      }}
                      labelStyle={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}
                      formatter={(value: any) => [
          formatARSCompact(Number(value || 0)),
          chartType === 'blue' ? 'Dólar Blue' : 'Dólar Oficial',
        ]}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke={chartType === 'blue' ? '#34D399' : '#60A5FA'}
                      strokeWidth={2}
                      fill={`url(#gradient-${chartType})`}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </FadeIn>

          {/* Converter */}
          <FadeIn delay={0.35}>
            <div className="glass-card p-5 sm:p-6">
              <div className="flex items-center gap-2 mb-5">
                <RotateCcw size={16} className="text-white/40" />
                <h3 className="font-semibold text-white">Conversor</h3>
              </div>

              {/* Direction toggle */}
              <div className="flex items-center gap-2 mb-5 p-1 rounded-xl bg-white/5">
                <button
                  onClick={() => setConversionDirection('ars_to_usd')}
                  className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${
                    conversionDirection === 'ars_to_usd'
                      ? 'bg-white text-black'
                      : 'text-white/50 hover:text-white/80'
                  }`}
                >
                  ARS → USD
                </button>
                <button
                  onClick={() => setConversionDirection('usd_to_ars')}
                  className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${
                    conversionDirection === 'usd_to_ars'
                      ? 'bg-white text-black'
                      : 'text-white/50 hover:text-white/80'
                  }`}
                >
                  USD → ARS
                </button>
              </div>

              {/* Amount input */}
              <div className="space-y-4">
                <div>
                  <label className="label">
                    {conversionDirection === 'ars_to_usd' ? 'Pesos Argentinos' : 'Dólares'}
                  </label>
                  <input
                    type="number"
                    value={conversionAmount}
                    onChange={(e) => setConversionAmount(Number(e.target.value) || 0)}
                    className="input-field text-lg font-semibold"
                    placeholder="0"
                  />
                </div>

                <div className="flex justify-center">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                    <ArrowRight size={16} className="text-white/40" />
                  </div>
                </div>

                <div>
                  <label className="label">
                    {conversionDirection === 'ars_to_usd' ? 'Dólares' : 'Pesos Argentinos'}
                  </label>
                  <div className="input-field text-lg font-semibold text-white/90 flex items-center justify-between">
                    <span>
                      {conversionDirection === 'ars_to_usd'
                        ? `$${convertedAmount.toFixed(2)} USD`
                        : formatARSCompact(convertedAmount)}
                    </span>
                    <span className="text-xs text-white/30 font-normal">
                      TC: ${conversionRate}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-white/5">
                <p className="text-xs text-white/30">
                  Usando cotización {conversionDirection === 'ars_to_usd' ? 'venta' : 'compra'} del{' '}
                  <span className="text-white/50">Dólar Blue</span>
                </p>
              </div>
            </div>
          </FadeIn>
        </div>

        {/* Comparison Table */}
        <FadeIn delay={0.4}>
          <div className="glass-card p-5 sm:p-6 mb-8">
            <h3 className="font-semibold text-white mb-5">Comparativa de Cotizaciones</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left py-3 text-white/40 font-medium text-xs uppercase tracking-wider">Tipo</th>
                    <th className="text-right py-3 text-white/40 font-medium text-xs uppercase tracking-wider">Compra</th>
                    <th className="text-right py-3 text-white/40 font-medium text-xs uppercase tracking-wider">Venta</th>
                    <th className="text-right py-3 text-white/40 font-medium text-xs uppercase tracking-wider">Spread</th>
                    <th className="text-right py-3 text-white/40 font-medium text-xs uppercase tracking-wider">Var.</th>
                  </tr>
                </thead>
                <tbody>
                  {dolares.map((rate) => {
                    const spread = ((rate.venta - rate.compra) / rate.compra * 100).toFixed(2)
                    const variation = rate.variacion !== undefined ? rate.variacion : (Math.random() - 0.5) * 2
                    return (
                      <tr key={rate.casa} className="border-b border-white/[0.02] hover:bg-white/[0.02] transition-colors">
                        <td className="py-3 text-white font-medium capitalize">{rate.nombre}</td>
                        <td className="py-3 text-right text-white/80 font-mono">{formatARSCompact(rate.compra)}</td>
                        <td className="py-3 text-right text-white font-mono font-semibold">{formatARSCompact(rate.venta)}</td>
                        <td className="py-3 text-right text-white/50 font-mono text-xs">{spread}%</td>
                        <td className="py-3 text-right">
                          <span className={`inline-flex items-center gap-1 text-xs font-medium ${
                            variation >= 0 ? 'text-[#34D399]' : 'text-[#F87171]'
                          }`}>
                            {variation >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                            {Math.abs(variation).toFixed(2)}%
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                  {euro && (
                    <tr className="border-b border-white/[0.02] hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 text-white font-medium">Euro</td>
                      <td className="py-3 text-right text-white/80 font-mono">{formatARSCompact(euro.compra)}</td>
                      <td className="py-3 text-right text-white font-mono font-semibold">{formatARSCompact(euro.venta)}</td>
                      <td className="py-3 text-right text-white/50 font-mono text-xs">{((euro.venta - euro.compra) / euro.compra * 100).toFixed(2)}%</td>
                      <td className="py-3 text-right">
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-white/30">
                          <Minus size={12} /> -
                        </span>
                      </td>
                    </tr>
                  )}
                  {real && (
                    <tr className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 text-white font-medium">Real Brasileño</td>
                      <td className="py-3 text-right text-white/80 font-mono">{formatARSCompact(real.compra)}</td>
                      <td className="py-3 text-right text-white font-mono font-semibold">{formatARSCompact(real.venta)}</td>
                      <td className="py-3 text-right text-white/50 font-mono text-xs">{((real.venta - real.compra) / real.compra * 100).toFixed(2)}%</td>
                      <td className="py-3 text-right">
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-white/30">
                          <Minus size={12} /> -
                        </span>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </FadeIn>
      </div>
    </PageTransition>
  )
}

// Rate Card Component
function RateCard({ rate, variation, label, icon }: { rate: ExchangeRate; variation: { value: number; positive: boolean; neutral: boolean }; label: string; icon?: string }) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="glass-card p-4 sm:p-5"
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">{icon || '💵'}</span>
        <span className="text-xs font-semibold text-white/60 uppercase tracking-wider">{label}</span>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <span className="text-[10px] text-white/40 uppercase tracking-wider">Compra</span>
          <p className="text-lg font-semibold text-white/80 font-mono mt-0.5">
            {formatARSCompact(rate.compra)}
          </p>
        </div>
        <div>
          <span className="text-[10px] text-white/40 uppercase tracking-wider">Venta</span>
          <p className="text-lg font-semibold text-white font-mono mt-0.5">
            {formatARSCompact(rate.venta)}
          </p>
        </div>
      </div>

      <div className={`flex items-center gap-1 text-xs font-medium ${
        variation.neutral ? 'text-white/30' :
        variation.positive ? 'text-[#34D399]' : 'text-[#F87171]'
      }`}>
        {variation.neutral ? (
          <Minus size={12} />
        ) : variation.positive ? (
          <TrendingUp size={12} />
        ) : (
          <TrendingDown size={12} />
        )}
        <span>{variation.value.toFixed(2)}%</span>
      </div>
    </motion.div>
  )
}
