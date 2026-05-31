import { motion } from 'framer-motion'
import { calculateProgress, formatCurrency } from '@/lib/utils'

interface ProgressCardProps {
  label: string
  current: number
  target: number
  icon?: string
  variant?: 'default' | 'success' | 'warning'
  className?: string
}

export function ProgressCard({ label, current, target, icon, variant = 'default', className = '' }: ProgressCardProps) {
  const progress = calculateProgress(current, target)
  const remaining = Math.max(target - current, 0)

  const gradientMap = {
    default: 'from-white/40 to-white/10',
    success: 'from-[#34D399] to-[#60A5FA]',
    warning: 'from-[#FBBF24] to-[#F87171]',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      className={`glass-card p-5 sm:p-6 ${className}`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {icon && <span className="text-lg">{icon}</span>}
          <span className="font-medium text-sm text-white/80">{label}</span>
        </div>
        <span className="text-sm font-semibold text-white">{progress}%</span>
      </div>
      <div className="progress-bar mb-2">
        <motion.div
          className={`progress-fill bg-gradient-to-r ${gradientMap[variant]}`}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1, ease: [0.4, 0, 0.2, 1], delay: 0.2 }}
        />
      </div>
      <div className="flex justify-between text-xs text-white/40">
        <span>{formatCurrency(current)}</span>
        <span>{formatCurrency(remaining)} restante</span>
      </div>
    </motion.div>
  )
}
