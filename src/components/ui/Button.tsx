import Link from 'next/link'
import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/cn'

type Variant = 'gold' | 'outline' | 'ghost'

const base =
  'display inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm tracking-[0.12em] transition-colors duration-200 disabled:pointer-events-none disabled:opacity-50'

const variants: Record<Variant, string> = {
  gold: 'btn-sweep bg-gold text-bg hover:bg-gold-hi',
  outline: 'border border-gold-dim text-gold hover:border-gold hover:text-gold-hi',
  ghost: 'text-ink-dim hover:text-ink',
}

interface CommonProps {
  variant?: Variant
  className?: string
  children: ReactNode
}

/** Odkazové tlačidlo (next/link). */
export function ButtonLink({
  href,
  variant = 'gold',
  className,
  children,
}: CommonProps & { href: string }) {
  return (
    <Link href={href} className={cn(base, variants[variant], className)}>
      {children}
    </Link>
  )
}

/** Klasické tlačidlo. */
export function Button({
  variant = 'gold',
  className,
  children,
  ...rest
}: CommonProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={cn(base, variants[variant], className)} {...rest}>
      {children}
    </button>
  )
}
