import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

/** Základná karta — antracit povrch, jemný border, gold hover akcent. */
export function Card({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-line bg-surface p-6 transition-colors duration-300 hover:border-gold-dim',
        className
      )}
    >
      {children}
    </div>
  )
}
