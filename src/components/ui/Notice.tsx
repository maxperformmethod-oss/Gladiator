import type { ReactNode } from 'react'
import { AlertTriangle, Info } from 'lucide-react'
import { cn } from '@/lib/cn'

type Variant = 'warning' | 'info'

const styles: Record<Variant, string> = {
  warning: 'border-warning/40 bg-warning/5 text-warning',
  info: 'border-line-strong bg-surface-2 text-ink-dim',
}

/**
 * Banner pre upozornenia — neoverené údaje, návrhy čakajúce na kontrolu a pod.
 */
export function Notice({
  children,
  variant = 'warning',
  className,
}: {
  children: ReactNode
  variant?: Variant
  className?: string
}) {
  const Icon = variant === 'warning' ? AlertTriangle : Info
  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-xl border px-4 py-3 text-sm',
        styles[variant],
        className
      )}
    >
      <Icon size={18} className="mt-0.5 shrink-0" aria-hidden />
      <div>{children}</div>
    </div>
  )
}
