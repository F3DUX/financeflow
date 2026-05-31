import { create } from 'zustand'
import type { User } from '@/types'
import { useAppStore } from './appStore'

const API_URL = import.meta.env.VITE_API_URL || 'https://financeflow-backendd.onrender.com/api/'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  loading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name: string) => Promise<void>
  logout: () => void
  checkAuth: () => Promise<void>
  updateProfile: (name: string, email: string) => Promise<void>
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>
  clearError: () => void
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: localStorage.getItem('ff_token'),
  isAuthenticated: !!localStorage.getItem('ff_token'),
  loading: false,
  error: null,

  login: async (email: string, password: string) => {
    set({ loading: true, error: null })
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Error al iniciar sesión')
      }

      localStorage.setItem('ff_token', data.token)
      set({
        user: data.user,
        token: data.token,
        isAuthenticated: true,
        loading: false,
        error: null,
      })
    } catch (err) {
      set({
        loading: false,
        error: err instanceof Error ? err.message : 'Error del servidor',
      })
      throw err
    }
  },

  register: async (email: string, password: string, name: string) => {
    set({ loading: true, error: null })
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Error al registrarse')
      }

      localStorage.setItem('ff_token', data.token)
      set({
        user: data.user,
        token: data.token,
        isAuthenticated: true,
        loading: false,
        error: null,
      })
    } catch (err) {
      set({
        loading: false,
        error: err instanceof Error ? err.message : 'Error del servidor',
      })
      throw err
    }
  },

  logout: () => {
    localStorage.removeItem('ff_token')
    useAppStore.getState().clearAll()
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      error: null,
    })
  },

  checkAuth: async () => {
    const token = get().token
    if (!token) {
      set({ isAuthenticated: false, user: null })
      return
    }

    try {
      const res = await fetch(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!res.ok) {
        throw new Error('Token inválido')
      }

      const data = await res.json()
      set({ user: data.user, isAuthenticated: true })
    } catch {
      localStorage.removeItem('ff_token')
      set({ user: null, token: null, isAuthenticated: false })
    }
  },

  updateProfile: async (name: string, email: string) => {
    const token = get().token
    if (!token) throw new Error('No autenticado')

    const res = await fetch(`${API_URL}/auth/me`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name, email }),
    })

    const data = await res.json()
    if (!res.ok) {
      throw new Error(data.error || 'Error al actualizar perfil')
    }

    set({ user: data.user })
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    const token = get().token
    if (!token) throw new Error('No autenticado')

    const res = await fetch(`${API_URL}/auth/password`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ currentPassword, newPassword }),
    })

    const data = await res.json()
    if (!res.ok) {
      throw new Error(data.error || 'Error al cambiar contraseña')
    }
  },

  clearError: () => set({ error: null }),
}))
