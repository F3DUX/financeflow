import { useState } from 'react'
import { motion } from 'framer-motion'
import { User, Shield, LogOut, Check, X, Eye, EyeOff, Loader2, Save } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useNavigate } from 'react-router-dom'
import { PageTransition, FadeIn } from '@/components/ui/PageTransition'

export function Settings() {
  const { user, logout, updateProfile, changePassword } = useAuthStore()
  const navigate = useNavigate()

  // Profile edit state
  const [editingProfile, setEditingProfile] = useState(false)
  const [profileName, setProfileName] = useState(user?.name || '')
  const [profileEmail, setProfileEmail] = useState(user?.email || '')
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileSuccess, setProfileSuccess] = useState(false)
  const [profileError, setProfileError] = useState<string | null>(null)

  // Password change state
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurPwd, setShowCurPwd] = useState(false)
  const [showNewPwd, setShowNewPwd] = useState(false)
  const [showConfirmPwd, setShowConfirmPwd] = useState(false)
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [passwordError, setPasswordError] = useState<string | null>(null)

  const handleLogout = () => {
    logout()
    navigate('/auth', { replace: true })
  }

  const handleSaveProfile = async () => {
    setProfileError(null)
    setProfileSuccess(false)

    if (!profileName.trim()) {
      setProfileError('El nombre es requerido')
      return
    }
    if (!profileEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileEmail)) {
      setProfileError('Correo electrónico inválido')
      return
    }

    setProfileSaving(true)
    try {
      await updateProfile(profileName.trim(), profileEmail.trim().toLowerCase())
      setProfileSuccess(true)
      setEditingProfile(false)
      setTimeout(() => setProfileSuccess(false), 3000)
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : 'Error al guardar')
    } finally {
      setProfileSaving(false)
    }
  }

  const handleCancelEdit = () => {
    setProfileName(user?.name || '')
    setProfileEmail(user?.email || '')
    setEditingProfile(false)
    setProfileError(null)
  }

  const handleChangePassword = async () => {
    setPasswordError(null)
    setPasswordSuccess(false)

    if (!currentPassword) {
      setPasswordError('Ingresa tu contraseña actual')
      return
    }
    if (newPassword.length < 8) {
      setPasswordError('La nueva contraseña debe tener al menos 8 caracteres')
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Las contraseñas no coinciden')
      return
    }

    setPasswordSaving(true)
    try {
      await changePassword(currentPassword, newPassword)
      setPasswordSuccess(true)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setTimeout(() => {
        setPasswordSuccess(false)
        setShowPasswordForm(false)
      }, 2000)
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : 'Error al cambiar contraseña')
    } finally {
      setPasswordSaving(false)
    }
  }

  const sections = [
    {
      title: 'Cuenta',
      items: [
        {
          icon: <User size={18} />,
          label: 'Perfil',
          description: 'Nombre y correo electrónico',
          content: editingProfile ? (
            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-xs text-white/40 mb-1">Nombre</label>
                <input
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/30 focus:bg-white/[0.06] transition-all"
                  placeholder="Tu nombre"
                />
              </div>
              <div>
                <label className="block text-xs text-white/40 mb-1">Correo electrónico</label>
                <input
                  type="email"
                  value={profileEmail}
                  onChange={(e) => setProfileEmail(e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/30 focus:bg-white/[0.06] transition-all"
                  placeholder="tu@email.com"
                />
              </div>

              {profileError && (
                <p className="text-xs text-[#F87171]">{profileError}</p>
              )}

              <div className="flex gap-2 pt-1">
                <button
                  onClick={handleSaveProfile}
                  disabled={profileSaving}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white text-black text-xs font-semibold hover:bg-white/90 transition-all disabled:opacity-50"
                >
                  {profileSaving ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Save size={14} />
                  )}
                  Guardar
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white/[0.06] text-white/60 text-xs hover:bg-white/[0.1] transition-all"
                >
                  <X size={14} />
                  Cancelar
                </button>
              </div>

              {profileSuccess && (
                <p className="text-xs text-[#34D399] flex items-center gap-1">
                  <Check size={12} />
                  Perfil actualizado correctamente
                </p>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold bg-white/[0.08] text-white/80">
                {(user?.name || 'U').charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user?.name || '—'}</p>
                <p className="text-xs text-white/40 truncate">{user?.email || '—'}</p>
              </div>
              <button
                onClick={() => {
                  setProfileName(user?.name || '')
                  setProfileEmail(user?.email || '')
                  setEditingProfile(true)
                  setProfileError(null)
                  setProfileSuccess(false)
                }}
                className="text-xs text-white/50 hover:text-white/80 transition-colors"
              >
                Editar
              </button>
            </div>
          ),
        },
        {
          icon: <Shield size={18} />,
          label: 'Seguridad',
          description: 'Cambiar contraseña',
          content: showPasswordForm ? (
            <div className="space-y-3 pt-2">
              <div className="relative">
                <label className="block text-xs text-white/40 mb-1">Contraseña actual</label>
                <input
                  type={showCurPwd ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/30 focus:bg-white/[0.06] transition-all pr-9"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowCurPwd(!showCurPwd)}
                  className="absolute right-2.5 bottom-2.5 text-white/30 hover:text-white/60 transition-colors"
                >
                  {showCurPwd ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              <div className="relative">
                <label className="block text-xs text-white/40 mb-1">Nueva contraseña</label>
                <input
                  type={showNewPwd ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/30 focus:bg-white/[0.06] transition-all pr-9"
                  placeholder="Mín. 8 caracteres"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPwd(!showNewPwd)}
                  className="absolute right-2.5 bottom-2.5 text-white/30 hover:text-white/60 transition-colors"
                >
                  {showNewPwd ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              <div className="relative">
                <label className="block text-xs text-white/40 mb-1">Confirmar nueva contraseña</label>
                <input
                  type={showConfirmPwd ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/30 focus:bg-white/[0.06] transition-all pr-9"
                  placeholder="Repite la nueva contraseña"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPwd(!showConfirmPwd)}
                  className="absolute right-2.5 bottom-2.5 text-white/30 hover:text-white/60 transition-colors"
                >
                  {showConfirmPwd ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>

              {passwordError && (
                <p className="text-xs text-[#F87171]">{passwordError}</p>
              )}

              <div className="flex gap-2 pt-1">
                <button
                  onClick={handleChangePassword}
                  disabled={passwordSaving}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white text-black text-xs font-semibold hover:bg-white/90 transition-all disabled:opacity-50"
                >
                  {passwordSaving ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Save size={14} />
                  )}
                  Cambiar contraseña
                </button>
                <button
                  onClick={() => {
                    setShowPasswordForm(false)
                    setPasswordError(null)
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white/[0.06] text-white/60 text-xs hover:bg-white/[0.1] transition-all"
                >
                  <X size={14} />
                  Cancelar
                </button>
              </div>

              {passwordSuccess && (
                <p className="text-xs text-[#34D399] flex items-center gap-1">
                  <Check size={12} />
                  Contraseña actualizada correctamente
                </p>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/30">•••••••••••</span>
              <button
                onClick={() => {
                  setShowPasswordForm(true)
                  setPasswordError(null)
                  setPasswordSuccess(false)
                }}
                className="text-xs text-white/50 hover:text-white/80 transition-colors"
              >
                Cambiar
              </button>
            </div>
          ),
        },
      ],
    },
  ]

  return (
    <PageTransition>
      {/* Giant background title */}
      <div className="page-bg-title">AJUSTES</div>

      <div className="relative z-10 max-w-3xl mx-auto">
        <FadeIn className="mb-8">
          <h2 className="text-3xl font-bold text-white">Ajustes</h2>
          <p className="text-white/50 mt-1">Personaliza tu experiencia</p>
        </FadeIn>

        <div className="space-y-6">
          {sections.map((section, si) => (
            <FadeIn key={section.title} delay={0.1 + si * 0.05}>
              <div className="glass-card overflow-hidden">
                <div className="px-6 py-4 border-b border-white/[0.06]">
                  <h3 className="font-semibold text-white text-sm">{section.title}</h3>
                </div>
                <div className="divide-y divide-white/[0.06]">
                  {section.items.map((item, ii) => (
                    <motion.div
                      key={ii}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + ii * 0.05 }}
                      className="flex items-start gap-4 px-6 py-4"
                    >
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white/40 bg-white/[0.04] shrink-0 mt-0.5">
                        {item.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white">{item.label}</p>
                        <p className="text-xs text-white/40 mb-1">{item.description}</p>
                        {item.content}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </FadeIn>
          ))}
        </div>

        <FadeIn delay={0.4} className="mt-8">
          <button
            onClick={handleLogout}
            className="btn-ghost text-[#F87171] hover:text-[#EF4444] hover:bg-[#F87171]/10 w-full justify-center rounded-xl py-3"
          >
            <LogOut size={18} />
            Cerrar Sesión
          </button>
        </FadeIn>
      </div>
    </PageTransition>
  )
}
