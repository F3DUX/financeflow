import { create } from 'zustand'
import type { ExchangeRate, HistoricalDataPoint } from '@/types'

interface RatesState {
  dolares: ExchangeRate[]
  euro: ExchangeRate | null
  real: ExchangeRate | null
  loading: boolean
  error: string | null
  lastUpdated: Date | null
  historicalBlue: HistoricalDataPoint[]
  historicalOficial: HistoricalDataPoint[]
  fetchRates: () => Promise<void>
}

function generateHistoricalData(baseValue: number, days: number = 30): HistoricalDataPoint[] {
  const data: HistoricalDataPoint[] = []
  let current = baseValue * 0.92 // start ~8% lower

  for (let i = days; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const noise = (Math.random() - 0.5) * baseValue * 0.02
    current += noise + baseValue * 0.002 // slight upward trend
    data.push({
      date: date.toISOString().slice(0, 10),
      value: Math.round(current * 100) / 100,
    })
  }
  return data
}

export const useRatesStore = create<RatesState>((set) => ({
  dolares: [],
  euro: null,
  real: null,
  loading: false,
  error: null,
  lastUpdated: null,
  historicalBlue: [],
  historicalOficial: [],

  fetchRates: async () => {
    set({ loading: true, error: null })
    try {
      const [dolaresRes, euroRes, realRes] = await Promise.all([
        fetch('https://dolarapi.com/v1/dolares'),
        fetch('https://dolarapi.com/v1/cotizaciones/eur'),
        fetch('https://dolarapi.com/v1/cotizaciones/brl'),
      ])

      if (!dolaresRes.ok || !euroRes.ok || !realRes.ok) {
        throw new Error('Error al obtener cotizaciones')
      }

      const dolares: ExchangeRate[] = await dolaresRes.json()
      const euro: ExchangeRate = await euroRes.json()
      const real: ExchangeRate = await realRes.json()

      const blueRate = dolares.find((d) => d.casa === 'blue')?.venta || 1400
      const oficialRate = dolares.find((d) => d.casa === 'oficial')?.venta || 1400

      set({
        dolares,
        euro,
        real,
        loading: false,
        lastUpdated: new Date(),
        historicalBlue: generateHistoricalData(blueRate, 30),
        historicalOficial: generateHistoricalData(oficialRate, 30),
      })
    } catch (err) {
      set({
        loading: false,
        error: err instanceof Error ? err.message : 'Error desconocido',
      })
    }
  },
}))

// Helper to get a specific rate by casa name
export function getRateByCasa(
  dolares: ExchangeRate[],
  casa: string
): ExchangeRate | undefined {
  return dolares.find((d) => d.casa === casa)
}
