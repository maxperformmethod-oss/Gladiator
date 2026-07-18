import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

/**
 * Malý inline štítok pre neoverené / chýbajúce údaje.
 * Default text: „TBD".
 */
export function TbdBadge({
  children = 'TBD',
  className,
}: {
  children?: ReactNode
  className?: string
}) {
  return (
    <span
      className={cn(
        'ml-2 inline-flex items-center rounded-full border border-warning/40 px-2 py-0.5 align-middle text-[10px] font-medium uppercase tracking-wider text-warning',
        className
      )}
    >
      {children}
    </span>
  )
}
