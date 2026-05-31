import { Bell, LogOut } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuthStore } from '@/store/authStore'
import { useNavigate } from 'react-router-dom'

export function Header() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/auth', { replace: true })
  }

  return (
    <motion.header
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="fixed top-4 right-4 z-50 flex items-center gap-2"
    >
      {/* User name */}
      {user && (
        <span className="hidden sm:block text-xs text-white/40 mr-1">
          {user.name}
        </span>
      )}

      {/* Notifications */}
      <button className="relative w-8 h-8 rounded-full flex items-center justify-center text-white/40 hover:text-white/80 hover:bg-white/5 transition-all backdrop-blur-2xl"
        style={{ border: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <Bell size={14} strokeWidth={1.5} />
        <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 rounded-full bg-[#D6B98C]" />
      </button>

      {/* Avatar with initial */}
      <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold cursor-default"
        style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', color: '#FFFFFF' }}>
        {user ? user.name.charAt(0).toUpperCase() : 'U'}
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="w-8 h-8 rounded-full flex items-center justify-center text-white/30 hover:text-white/80 hover:bg-white/5 transition-all"
        title="Cerrar sesión"
      >
        <LogOut size={14} strokeWidth={1.5} />
      </button>
    </motion.header>
  )
}
