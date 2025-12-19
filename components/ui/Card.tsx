import { ReactNode } from 'react'
import { cn } from '@/utils/utils'

interface CardProps {
  children: ReactNode
  className?: string
  title?: string
  description?: string
  footer?: ReactNode
}

export function Card({ children, className, title, description, footer }: CardProps) {
  return (
    <div className={cn('overflow-hidden rounded-xl border border-secondary-200 bg-white shadow-soft transition-all hover:shadow-card', className)}>
      {(title || description) && (
        <div className="border-b border-secondary-100 px-6 py-4">
          {title && <h3 className="text-lg font-semibold text-secondary-900">{title}</h3>}
          {description && <p className="text-sm text-secondary-500">{description}</p>}
        </div>
      )}
      <div className="px-6 py-5">{children}</div>
      {footer && <div className="border-t border-secondary-100 bg-secondary-50 px-6 py-4">{footer}</div>}
    </div>
  )
}
