export type ExpensePriority = 'high' | 'medium' | 'low'
export type ExpenseCategory =
  | 'food'
  | 'transport'
  | 'housing'
  | 'utilities'
  | 'entertainment'
  | 'health'
  | 'education'
  | 'shopping'
  | 'other'

export type IncomeCategory =
  | 'salary'
  | 'freelance'
  | 'investment'
  | 'business'
  | 'rental'
  | 'gift'
  | 'other'

export type ServiceCategory =
  | 'internet'
  | 'electricity'
  | 'gas'
  | 'water'
  | 'rent'
  | 'netflix'
  | 'spotify'
  | 'disney'
  | 'insurance'
  | 'gym'
  | 'phone'
  | 'other'

export type ServiceFrequency = 'monthly' | 'bimonthly' | 'quarterly' | 'biannual' | 'annual'
export type ServiceStatus = 'active' | 'paused' | 'cancelled'

export interface Expense {
  id: string
  amount: number
  category: ExpenseCategory
  priority: ExpensePriority
  date: string
  description: string
  tags: string[]
  createdAt: string
}

export interface Income {
  id: string
  amount: number
  date: string
  category: IncomeCategory
  description: string
  createdAt: string
}

export interface Service {
  id: string
  name: string
  category: ServiceCategory
  amount: number
  dueDate: number
  frequency: ServiceFrequency
  status: ServiceStatus
  createdAt: string
}

export interface Budget {
  id: string
  category: ExpenseCategory
  amount: number
  spent: number
  month: string
}

export interface SavingsGoal {
  id: string
  name: string
  targetAmount: number
  currentAmount: number
  deadline?: string
  createdAt: string
  icon: string
}

export interface CalendarEvent {
  id: string
  title: string
  date: string
  type: 'due' | 'payment' | 'collection' | 'reminder'
  amount?: number
}

export interface Transaction {
  id: string
  type: 'expense' | 'income'
  amount: number
  category: string
  description: string
  date: string
  tags?: string[]
}

export interface User {
  id: string
  email: string
  name: string
}

export const EXPENSE_CATEGORIES: { value: ExpenseCategory; label: string; emoji: string }[] = [
  { value: 'food', label: 'Comida', emoji: '🍽️' },
  { value: 'transport', label: 'Transporte', emoji: '🚗' },
  { value: 'housing', label: 'Vivienda', emoji: '🏠' },
  { value: 'utilities', label: 'Servicios', emoji: '💡' },
  { value: 'entertainment', label: 'Entretención', emoji: '🎬' },
  { value: 'health', label: 'Salud', emoji: '🏥' },
  { value: 'education', label: 'Educación', emoji: '📚' },
  { value: 'shopping', label: 'Compras', emoji: '🛍️' },
  { value: 'other', label: 'Otro', emoji: '📦' },
]

export const INCOME_CATEGORIES: { value: IncomeCategory; label: string; emoji: string }[] = [
  { value: 'salary', label: 'Sueldo', emoji: '💰' },
  { value: 'freelance', label: 'Freelance', emoji: '💻' },
  { value: 'investment', label: 'Inversiones', emoji: '📈' },
  { value: 'business', label: 'Negocio', emoji: '🏢' },
  { value: 'rental', label: 'Arriendo', emoji: '🏘️' },
  { value: 'gift', label: 'Regalo', emoji: '🎁' },
  { value: 'other', label: 'Otro', emoji: '📦' },
]

export const SERVICE_CATEGORIES: { value: ServiceCategory; label: string; emoji: string }[] = [
  { value: 'internet', label: 'Internet', emoji: '🌐' },
  { value: 'electricity', label: 'Luz', emoji: '⚡' },
  { value: 'gas', label: 'Gas', emoji: '🔥' },
  { value: 'water', label: 'Agua', emoji: '💧' },
  { value: 'rent', label: 'Arriendo', emoji: '🏠' },
  { value: 'netflix', label: 'Netflix', emoji: '📺' },
  { value: 'spotify', label: 'Spotify', emoji: '🎵' },
  { value: 'disney', label: 'Disney+', emoji: '✨' },
  { value: 'insurance', label: 'Seguro', emoji: '🛡️' },
  { value: 'gym', label: 'Gimnasio', emoji: '💪' },
  { value: 'phone', label: 'Teléfono', emoji: '📱' },
  { value: 'other', label: 'Otro', emoji: '📦' },
]

export const PRIORITY_LABELS: Record<ExpensePriority, string> = {
  high: 'Alta',
  medium: 'Media',
  low: 'Baja',
}

export const FREQUENCY_LABELS: Record<ServiceFrequency, string> = {
  monthly: 'Mensual',
  bimonthly: 'Bimestral',
  quarterly: 'Trimestral',
  biannual: 'Semestral',
  annual: 'Anual',
}

export const STATUS_LABELS: Record<ServiceStatus, string> = {
  active: 'Activo',
  paused: 'Pausado',
  cancelled: 'Cancelado',
}

// Exchange Rates (DolarApi.com)
export interface ExchangeRate {
  moneda: string
  casa: string
  nombre: string
  compra: number
  venta: number
  fechaActualizacion: string
  variacion?: number
}

export type RateType = 
  | 'dolar_oficial'
  | 'dolar_blue'
  | 'dolar_mep'
  | 'dolar_ccl'
  | 'dolar_tarjeta'
  | 'euro'
  | 'real'

export interface HistoricalDataPoint {
  date: string
  value: number
}

export const RATE_DISPLAY: Record<string, { label: string; icon: string; color: string }> = {
  'dolar_oficial': { label: 'Dólar Oficial', icon: '💵', color: '#60A5FA' },
  'dolar_blue': { label: 'Dólar Blue', icon: '💵', color: '#34D399' },
  'dolar_mep': { label: 'Dólar MEP', icon: '💱', color: '#FBBF24' },
  'dolar_ccl': { label: 'Dólar CCL', icon: '💱', color: '#F87171' },
  'dolar_tarjeta': { label: 'Dólar Tarjeta', icon: '💳', color: '#A78BFA' },
  'euro': { label: 'Euro', icon: '💶', color: '#60A5FA' },
  'real': { label: 'Real Brasileño', icon: '💷', color: '#34D399' },
}
