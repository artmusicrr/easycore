import React from 'react'
import { cn } from '@/utils/utils'
import { AlertCircle, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react'

interface RiskIndicatorProps {
  score: number
  level: 'baixo' | 'medio' | 'alto' | 'critico'
  className?: string
}

export function RiskIndicator({ score, level, className }: RiskIndicatorProps) {
  const configs = {
    baixo: { color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200', icon: ShieldCheck, label: 'Risco Baixo' },
    medio: { color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', icon: AlertTriangle, label: 'Risco Médio' },
    alto: { color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200', icon: AlertCircle, label: 'Risco Alto' },
    critico: { color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', icon: AlertCircle, label: 'Risco Crítico' },
  }

  const { color, bg, border, icon: Icon, label } = configs[level]

  return (
    <div className={cn('flex items-center space-x-3 rounded-xl border p-3', bg, border, className)}>
      <div className={cn('rounded-lg p-2 bg-white shadow-sm')}>
        <Icon className={cn('h-5 w-5', color)} />
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <span className={cn('text-xs font-bold uppercase tracking-wider', color)}>{label}</span>
          <span className="text-sm font-black text-secondary-900">{Math.round(score * 100)}%</span>
        </div>
        <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-secondary-200/50">
          <div 
            className={cn('h-full transition-all duration-500 ease-out', 
              level === 'baixo' ? 'bg-green-500' : 
              level === 'medio' ? 'bg-amber-500' : 
              level === 'alto' ? 'bg-orange-500' : 'bg-red-500'
            )} 
            style={{ width: `${score * 100}%` }}
          />
        </div>
      </div>
    </div>
  )
}
