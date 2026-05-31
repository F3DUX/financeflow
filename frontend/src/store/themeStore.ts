import { create } from 'zustand'

interface ThemeState {
  isDark: boolean
  toggle: () => void
}

function getInitialTheme(): boolean {
  return localStorage.getItem('theme') === 'dark'
}

export const useThemeStore = create<ThemeState>((set) => ({
  isDark: getInitialTheme(),
  toggle: () =>
    set((state) => {
      const newDark = !state.isDark
      if (newDark) {
        document.documentElement.classList.add('dark')
        localStorage.setItem('theme', 'dark')
      } else {
        document.documentElement.classList.remove('dark')
        localStorage.setItem('theme', 'light')
      }
      return { isDark: newDark }
    }),
}))
