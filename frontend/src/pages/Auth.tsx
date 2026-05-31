import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '@/store/authStore'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

export function Auth() {
  const { login, register, isAuthenticated, loading, error, clearError } = useAuthStore()
  const navigate = useNavigate()

  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true })
    }
  }, [isAuthenticated, navigate])

  const validate = (): boolean => {
    const errors: Record<string, string> = {}

    if (!email.trim()) {
      errors.email = 'El correo es requerido'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Correo inválido'
    }

    if (!password) {
      errors.password = 'La contraseña es requerida'
    } else if (!isLogin && password.length < 8) {
      errors.password = 'Mínimo 8 caracteres'
    }

    if (!isLogin && !name.trim()) {
      errors.name = 'El nombre es requerido'
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()
    if (!validate()) return

    try {
      if (isLogin) {
        await login(email, password)
      } else {
        await register(email, password, name)
      }
      // Navigation happens via useEffect watching isAuthenticated
    } catch {
      // Error is already set in the store
    }
  }

  const switchMode = (loginMode: boolean) => {
    setIsLogin(loginMode)
    clearError()
    setFieldErrors({})
  }

  return (
    <div className="min-h-screen bg-[#000000] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Giant background text */}
      <div className="page-bg-title">ACCEDER</div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        className="w-full max-w-md relative z-10"
      >
        <div className="glass-card-strong p-8 sm:p-10 shadow-2xl">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-5"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
              <span className="text-white">FF</span>
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">FinanceFlow</h1>
            <p className="text-sm text-white/40 mt-1.5">Gestión financiera premium</p>
          </div>

          {/* Tabs */}
          <div className="flex bg-white/[0.06] rounded-full p-1 mb-6">
            <button
              type="button"
              onClick={() => switchMode(true)}
              className={`flex-1 py-2.5 text-sm font-medium rounded-full transition-all duration-200 ${
                isLogin ? 'bg-white text-black shadow-sm' : 'text-white/50 hover:text-white/80'
              }`}
            >
              Iniciar Sesión
            </button>
            <button
              type="button"
              onClick={() => switchMode(false)}
              className={`flex-1 py-2.5 text-sm font-medium rounded-full transition-all duration-200 ${
                !isLogin ? 'bg-white text-black shadow-sm' : 'text-white/50 hover:text-white/80'
              }`}
            >
              Registrarse
            </button>
          </div>

          {/* Global Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -8, height: 0 }}
                className="mb-4 p-3 rounded-xl bg-[#F87171]/10 border border-[#F87171]/20"
              >
                <p className="text-xs text-[#F87171] font-medium">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <AnimatePresence mode="wait">
            <motion.form
              key={isLogin ? 'login' : 'register'}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              {!isLogin && (
                <div>
                  <label className="label">Nombre</label>
                  <input
                    type="text"
                    className={`input-field ${fieldErrors.name ? 'border-[#F87171]/50' : ''}`}
                    placeholder="Tu nombre"
                    value={name}
                    onChange={e => { setName(e.target.value); setFieldErrors(prev => ({ ...prev, name: '' })) }}
                    disabled={loading}
                  />
                  {fieldErrors.name && (
                    <p className="text-[10px] text-[#F87171] mt-1 ml-1">{fieldErrors.name}</p>
                  )}
                </div>
              )}

              <div>
                <label className="label">Correo Electrónico</label>
                <input
                  type="email"
                  className={`input-field ${fieldErrors.email ? 'border-[#F87171]/50' : ''}`}
                  placeholder="tu@ejemplo.com"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setFieldErrors(prev => ({ ...prev, email: '' })) }}
                  disabled={loading}
                  autoComplete="email"
                />
                {fieldErrors.email && (
                  <p className="text-[10px] text-[#F87171] mt-1 ml-1">{fieldErrors.email}</p>
                )}
              </div>

              <div>
                <label className="label">Contraseña</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className={`input-field pr-10 ${fieldErrors.password ? 'border-[#F87171]/50' : ''}`}
                    placeholder="••••••••"
                    value={password}
                    onChange={e => { setPassword(e.target.value); setFieldErrors(prev => ({ ...prev, password: '' })) }}
                    disabled={loading}
                    autoComplete={isLogin ? 'current-password' : 'new-password'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {fieldErrors.password ? (
                  <p className="text-[10px] text-[#F87171] mt-1 ml-1">{fieldErrors.password}</p>
                ) : (
                  !isLogin && (
                    <p className="text-[10px] text-white/30 mt-1 ml-1">Mínimo 8 caracteres</p>
                  )
                )}
              </div>

              <motion.button
                type="submit"
                disabled={loading}
                whileHover={loading ? {} : { y: -1 }}
                whileTap={loading ? {} : { y: 0 }}
                className="btn-primary w-full py-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 size={16} className="animate-spin" />
                    {isLogin ? 'Ingresando...' : 'Creando cuenta...'}
                  </span>
                ) : (
                  isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'
                )}
              </motion.button>
            </motion.form>
          </AnimatePresence>

          <p className="text-xs text-white/20 text-center mt-6">
            Al continuar, aceptas los Términos del Servicio
          </p>
        </div>
      </motion.div>
    </div>
  )
}
