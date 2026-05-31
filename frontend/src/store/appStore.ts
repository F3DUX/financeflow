import { create } from 'zustand'
import type { Expense, Income, Service, Budget, SavingsGoal } from '@/types'
import { getCurrentMonth } from '@/lib/utils'
import * as api from '@/lib/api'

interface AppState {
  expenses: Expense[]
  incomes: Income[]
  services: Service[]
  budgets: Budget[]
  goals: SavingsGoal[]
  loading: boolean
  error: string | null

  fetchAll: () => Promise<void>
  clearAll: () => void

  addExpense: (expense: Omit<Expense, 'id' | 'createdAt'>) => Promise<void>
  updateExpense: (id: string, data: Partial<Expense>) => Promise<void>
  deleteExpense: (id: string) => Promise<void>

  addIncome: (income: Omit<Income, 'id' | 'createdAt'>) => Promise<void>
  updateIncome: (id: string, data: Partial<Income>) => Promise<void>
  deleteIncome: (id: string) => Promise<void>

  addService: (svc: Omit<Service, 'id' | 'createdAt'>) => Promise<void>
  updateService: (id: string, data: Partial<Service>) => Promise<void>
  deleteService: (id: string) => Promise<void>

  addBudget: (budget: Omit<Budget, 'id'>) => Promise<void>
  updateBudget: (id: string, data: Partial<Budget>) => Promise<void>

  addGoal: (goal: Omit<SavingsGoal, 'id' | 'createdAt'>) => Promise<void>
  updateGoal: (id: string, data: Partial<SavingsGoal>) => Promise<void>
  deleteGoal: (id: string) => Promise<void>

  getMonthlyExpenses: (month?: string) => number
  getMonthlyIncome: (month?: string) => number
}

export const useAppStore = create<AppState>((set, get) => ({
  expenses: [],
  incomes: [],
  services: [],
  budgets: [],
  goals: [],
  loading: false,
  error: null,

  fetchAll: async () => {
    const token = localStorage.getItem('ff_token')
    if (!token) return

    set({ loading: true, error: null })
    try {
      const data = await api.fetchAllData()
      set({
        expenses: data.expenses,
        incomes: data.incomes,
        services: data.services,
        budgets: data.budgets,
        goals: data.goals,
        loading: false,
      })
    } catch (err) {
      set({
        loading: false,
        error: err instanceof Error ? err.message : 'Error al cargar datos',
      })
    }
  },

  clearAll: () => {
    set({
      expenses: [],
      incomes: [],
      services: [],
      budgets: [],
      goals: [],
      error: null,
    })
  },

  // ── Expenses ──────────────────────────────────────────────
  addExpense: async (expense) => {
    try {
      const created = await api.createExpense(expense)
      set((state) => ({ expenses: [created, ...state.expenses] }))
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Error al crear gasto' })
    }
  },

  updateExpense: async (id, data) => {
    try {
      await api.updateExpense(id, data)
      set((state) => ({
        expenses: state.expenses.map((e) => (e.id === id ? { ...e, ...data } : e)),
      }))
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Error al actualizar gasto' })
    }
  },

  deleteExpense: async (id) => {
    try {
      await api.deleteExpense(id)
      set((state) => ({ expenses: state.expenses.filter((e) => e.id !== id) }))
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Error al eliminar gasto' })
    }
  },

  // ── Incomes ───────────────────────────────────────────────
  addIncome: async (income) => {
    try {
      const created = await api.createIncome(income)
      set((state) => ({ incomes: [created, ...state.incomes] }))
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Error al crear ingreso' })
    }
  },

  updateIncome: async (id, data) => {
    try {
      await api.updateIncome(id, data)
      set((state) => ({
        incomes: state.incomes.map((i) => (i.id === id ? { ...i, ...data } : i)),
      }))
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Error al actualizar ingreso' })
    }
  },

  deleteIncome: async (id) => {
    try {
      await api.deleteIncome(id)
      set((state) => ({ incomes: state.incomes.filter((i) => i.id !== id) }))
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Error al eliminar ingreso' })
    }
  },

  // ── Services ──────────────────────────────────────────────
  addService: async (svc) => {
    try {
      const created = await api.createService(svc)
      set((state) => ({ services: [...state.services, created] }))
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Error al crear servicio' })
    }
  },

  updateService: async (id, data) => {
    try {
      await api.updateService(id, data)
      set((state) => ({
        services: state.services.map((s) => (s.id === id ? { ...s, ...data } : s)),
      }))
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Error al actualizar servicio' })
    }
  },

  deleteService: async (id) => {
    try {
      await api.deleteService(id)
      set((state) => ({ services: state.services.filter((s) => s.id !== id) }))
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Error al eliminar servicio' })
    }
  },

  // ── Budgets ───────────────────────────────────────────────
  addBudget: async (budget) => {
    try {
      const created = await api.createBudget(budget)
      set((state) => ({ budgets: [...state.budgets, created] }))
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Error al crear presupuesto' })
    }
  },

  updateBudget: async (id, data) => {
    try {
      await api.updateBudget(id, data)
      set((state) => ({
        budgets: state.budgets.map((b) => (b.id === id ? { ...b, ...data } : b)),
      }))
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Error al actualizar presupuesto' })
    }
  },

  // ── Goals ─────────────────────────────────────────────────
  addGoal: async (goal) => {
    try {
      const created = await api.createGoal(goal)
      set((state) => ({ goals: [...state.goals, created] }))
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Error al crear meta' })
    }
  },

  updateGoal: async (id, data) => {
    try {
      await api.updateGoal(id, data)
      set((state) => ({
        goals: state.goals.map((g) => (g.id === id ? { ...g, ...data } : g)),
      }))
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Error al actualizar meta' })
    }
  },

  deleteGoal: async (id) => {
    try {
      await api.deleteGoal(id)
      set((state) => ({ goals: state.goals.filter((g) => g.id !== id) }))
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Error al eliminar meta' })
    }
  },

  // ── Helpers ───────────────────────────────────────────────
  getMonthlyExpenses: (month) => {
    const state = get()
    const targetMonth = month || getCurrentMonth()
    return state.expenses
      .filter((e) => e.date.startsWith(targetMonth))
      .reduce((sum, e) => sum + e.amount, 0)
  },

  getMonthlyIncome: (month) => {
    const state = get()
    const targetMonth = month || getCurrentMonth()
    return state.incomes
      .filter((i) => i.date.startsWith(targetMonth))
      .reduce((sum, i) => sum + i.amount, 0)
  },
}))
