import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LayoutDashboard, ArrowUpRight, ArrowDownLeft, CreditCard,
  PiggyBank, Target, Calendar, BarChart3, Settings, TrendingUp,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Panel' },
  { to: '/expenses', icon: ArrowUpRight, label: 'Gastos' },
  { to: '/income', icon: ArrowDownLeft, label: 'Ingresos' },
  { to: '/services', icon: CreditCard, label: 'Servicios' },
  { to: '/budgets', icon: PiggyBank, label: 'Presupuestos' },
  { to: '/goals', icon: Target, label: 'Metas' },
  { to: '/rates', icon: TrendingUp, label: 'Mercado' },
  { to: '/calendar', icon: Calendar, label: 'Calendario' },
  { to: '/statistics', icon: BarChart3, label: 'Estadísticas' },
  { to: '/settings', icon: Settings, label: 'Ajustes' },
]

export function Sidebar() {
  return (
    <>
      {/* Floating pill navigation */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        className="fixed top-4 left-1/2 -translate-x-1/2 z-50"
      >
        <div className="flex items-center gap-1 px-2 py-1.5 rounded-full backdrop-blur-2xl"
          style={{
            background: 'rgba(0, 0, 0, 0.6)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          {/* Logo */}
          <div className="flex items-center gap-2 px-3 mr-1">
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.12)', color: '#FFFFFF' }}>
              F
            </div>
            <span className="text-sm font-semibold tracking-tight text-white/80 hidden sm:block">
              FinanceFlow
            </span>
          </div>

          {/* Nav items */}
          <div className="flex items-center gap-0.5">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 whitespace-nowrap',
                    isActive
                      ? 'text-black'
                      : 'text-white/50 hover:text-white/80'
                  )
                }
                style={({ isActive }) =>
                  isActive ? { backgroundColor: '#FFFFFF', color: '#000000' } : {}
                }
              >
                <item.icon size={14} strokeWidth={1.5} />
                <span className="hidden sm:inline">{item.label}</span>
              </NavLink>
            ))}
          </div>
        </div>
      </motion.nav>
    </>
  )
}
