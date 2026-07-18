import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

/** Nadpis sekcie: zlatý eyebrow + kondenzovaný uppercase titul + voliteľný text. */
export function SectionHeading({
  eyebrow,
  title,
  lead,
  className,
}: {
  eyebrow?: string
  title: ReactNode
  lead?: ReactNode
  className?: string
}) {
  return (
    <div className={cn('mb-10 max-w-3xl md:mb-14', className)}>
      {eyebrow && (
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-gold">
          {eyebrow}
        </p>
      )}
      <h2 className="display text-3xl text-ink md:text-5xl">{title}</h2>
      {lead && <p className="mt-4 text-base text-ink-dim md:text-lg">{lead}</p>}
    </div>
  )
}
