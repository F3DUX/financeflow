import type { Expense, Income, Service, Budget, SavingsGoal } from '@/types'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'

function getToken(): string | null {
  return localStorage.getItem('ff_token')
}

function authHeaders(): Record<string, string> {
  const token = getToken()
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || `Error ${res.status}`)
  }
  return res.json()
}

// ── Expense transforms ──────────────────────────────────────
function transformExpense(e: any): Expense {
  return {
    ...e,
    date: typeof e.date === 'string' ? e.date.slice(0, 10) : new Date(e.date).toISOString().slice(0, 10),
    createdAt: typeof e.createdAt === 'string' ? e.createdAt : new Date(e.createdAt).toISOString(),
    tags: typeof e.tags === 'string' ? JSON.parse(e.tags) : (e.tags || []),
  }
}

function transformIncome(e: any): Income {
  return {
    ...e,
    date: typeof e.date === 'string' ? e.date.slice(0, 10) : new Date(e.date).toISOString().slice(0, 10),
    createdAt: typeof e.createdAt === 'string' ? e.createdAt : new Date(e.createdAt).toISOString(),
  }
}

function transformService(e: any): Service {
  return {
    ...e,
    createdAt: typeof e.createdAt === 'string' ? e.createdAt : new Date(e.createdAt).toISOString(),
  }
}

function transformGoal(e: any): SavingsGoal {
  return {
    ...e,
    deadline: e.deadline ? (typeof e.deadline === 'string' ? e.deadline : new Date(e.deadline).toISOString()) : undefined,
    createdAt: typeof e.createdAt === 'string' ? e.createdAt : new Date(e.createdAt).toISOString(),
  }
}

// ── Expenses ────────────────────────────────────────────────
export async function fetchExpenses(): Promise<Expense[]> {
  const res = await fetch(`${API_URL}/expenses`, { headers: authHeaders() })
  const data = await handleResponse<any[]>(res)
  return data.map(transformExpense)
}

export async function createExpense(data: Omit<Expense, 'id' | 'createdAt'>): Promise<Expense> {
  const res = await fetch(`${API_URL}/expenses`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data),
  })
  return transformExpense(await handleResponse(res))
}

export async function updateExpense(id: string, data: Partial<Expense>): Promise<void> {
  const res = await fetch(`${API_URL}/expenses/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(data),
  })
  await handleResponse(res)
}

export async function deleteExpense(id: string): Promise<void> {
  const res = await fetch(`${API_URL}/expenses/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  })
  await handleResponse(res)
}

// ── Incomes ─────────────────────────────────────────────────
export async function fetchIncomes(): Promise<Income[]> {
  const res = await fetch(`${API_URL}/incomes`, { headers: authHeaders() })
  const data = await handleResponse<any[]>(res)
  return data.map(transformIncome)
}

export async function createIncome(data: Omit<Income, 'id' | 'createdAt'>): Promise<Income> {
  const res = await fetch(`${API_URL}/incomes`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data),
  })
  return transformIncome(await handleResponse(res))
}

export async function updateIncome(id: string, data: Partial<Income>): Promise<void> {
  const res = await fetch(`${API_URL}/incomes/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(data),
  })
  await handleResponse(res)
}

export async function deleteIncome(id: string): Promise<void> {
  const res = await fetch(`${API_URL}/incomes/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  })
  await handleResponse(res)
}

// ── Services ────────────────────────────────────────────────
export async function fetchServices(): Promise<Service[]> {
  const res = await fetch(`${API_URL}/services`, { headers: authHeaders() })
  const data = await handleResponse<any[]>(res)
  return data.map(transformService)
}

export async function createService(data: Omit<Service, 'id' | 'createdAt'>): Promise<Service> {
  const res = await fetch(`${API_URL}/services`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data),
  })
  return transformService(await handleResponse(res))
}

export async function updateService(id: string, data: Partial<Service>): Promise<void> {
  const res = await fetch(`${API_URL}/services/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(data),
  })
  await handleResponse(res)
}

export async function deleteService(id: string): Promise<void> {
  const res = await fetch(`${API_URL}/services/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  })
  await handleResponse(res)
}

// ── Budgets ─────────────────────────────────────────────────
export async function fetchBudgets(): Promise<Budget[]> {
  const res = await fetch(`${API_URL}/budgets`, { headers: authHeaders() })
  return handleResponse(res)
}

export async function createBudget(data: Omit<Budget, 'id'>): Promise<Budget> {
  const res = await fetch(`${API_URL}/budgets`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data),
  })
  return handleResponse(res)
}

export async function updateBudget(id: string, data: Partial<Budget>): Promise<void> {
  const res = await fetch(`${API_URL}/budgets/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(data),
  })
  await handleResponse(res)
}

// ── Goals ───────────────────────────────────────────────────
export async function fetchGoals(): Promise<SavingsGoal[]> {
  const res = await fetch(`${API_URL}/goals`, { headers: authHeaders() })
  const data = await handleResponse<any[]>(res)
  return data.map(transformGoal)
}

export async function createGoal(data: Omit<SavingsGoal, 'id' | 'createdAt'>): Promise<SavingsGoal> {
  const res = await fetch(`${API_URL}/goals`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data),
  })
  return transformGoal(await handleResponse(res))
}

export async function updateGoal(id: string, data: Partial<SavingsGoal>): Promise<void> {
  const res = await fetch(`${API_URL}/goals/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(data),
  })
  await handleResponse(res)
}

export async function deleteGoal(id: string): Promise<void> {
  const res = await fetch(`${API_URL}/goals/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  })
  await handleResponse(res)
}

// ── Bulk fetch ──────────────────────────────────────────────
export async function fetchAllData(): Promise<{
  expenses: Expense[]
  incomes: Income[]
  services: Service[]
  budgets: Budget[]
  goals: SavingsGoal[]
}> {
  const [expenses, incomes, services, budgets, goals] = await Promise.all([
    fetchExpenses(),
    fetchIncomes(),
    fetchServices(),
    fetchBudgets(),
    fetchGoals(),
  ])
  return { expenses, incomes, services, budgets, goals }
}
