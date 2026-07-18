import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

/** Sekcia s jednotným vertikálnym rytmom a max šírkou obsahu. */
export function Section({
  children,
  className,
  innerClassName,
  id,
}: {
  children: ReactNode
  className?: string
  innerClassName?: string
  id?: string
}) {
  return (
    <section id={id} className={cn('py-16 md:py-24', className)}>
      <div className={cn('mx-auto w-full max-w-6xl px-4 md:px-6', innerClassName)}>
        {children}
      </div>
    </section>
  )
}
