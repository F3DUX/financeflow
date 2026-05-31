import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

interface StatCardProps {
  label: string
  value: ReactNode
  icon: ReactNode
  trend?: { value: number; positive: boolean }
  className?: string
  delay?: number
}

export function StatCard({ label, value, icon, trend, className = '', delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.4, 0, 0.2, 1] }}
      className={`glass-card p-5 sm:p-6 ${className}`}
    >
      <div className="flex items-start justify-between mb-3">
        <span className="text-sm font-medium text-white/50">{label}</span>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.06)' }}>
          <span className="text-white/60">{icon}</span>
        </div>
      </div>
      <div className="text-[1.75rem] font-semibold tracking-tight text-white mb-1">{value}</div>
      {trend && (
        <div className={`flex items-center gap-1 text-xs ${trend.positive ? 'text-[#34D399]' : 'text-[#F87171]'}`}>
          <span>{trend.positive ? '↑' : '↓'}</span>
          <span>{Math.abs(trend.value)}% vs mes anterior</span>
        </div>
      )}
    </motion.div>
  )
}
