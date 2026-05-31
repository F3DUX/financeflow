import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Layout } from '@/components/layout/Layout'
import { Dashboard } from '@/pages/Dashboard'
import { Expenses } from '@/pages/Expenses'
import { Income } from '@/pages/Income'
import { Services } from '@/pages/Services'
import { Budgets } from '@/pages/Budgets'
import { Goals } from '@/pages/Goals'
import { CalendarPage } from '@/pages/CalendarPage'
import { Statistics } from '@/pages/Statistics'
import { Settings } from '@/pages/Settings'
import { Cotizaciones } from '@/pages/Cotizaciones'
import { Auth } from '@/pages/Auth'
import { useAuthStore } from '@/store/authStore'
import { useAppStore } from '@/store/appStore'

const queryClient = new QueryClient()

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()
  if (!isAuthenticated) return <Navigate to="/auth" replace />
  return <>{children}</>
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()
  if (isAuthenticated) return <Navigate to="/" replace />
  return <>{children}</>
}

function AppRoutes() {
  const { isAuthenticated, checkAuth } = useAuthStore()
  const fetchAll = useAppStore((s) => s.fetchAll)

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  // Fetch all data from backend when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchAll()
    }
  }, [isAuthenticated, fetchAll])

  return (
    <Routes>
      {/* Public: Auth page */}
      <Route
        path="/auth"
        element={
          <PublicRoute>
            <Auth />
          </PublicRoute>
        }
      />

      {/* Private: App routes inside Layout */}
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Dashboard />} />
        <Route path="/expenses" element={<Expenses />} />
        <Route path="/income" element={<Income />} />
        <Route path="/services" element={<Services />} />
        <Route path="/budgets" element={<Budgets />} />
        <Route path="/rates" element={<Cotizaciones />} />
        <Route path="/goals" element={<Goals />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/statistics" element={<Statistics />} />
        <Route path="/settings" element={<Settings />} />
      </Route>

      {/* Catch-all: redirect based on auth */}
      <Route path="*" element={<Navigate to={isAuthenticated ? '/' : '/auth'} replace />} />
    </Routes>
  )
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
