import Link from 'next/link'
import type { Trener } from '@/lib/gym'
import { cn } from '@/lib/cn'

function initials(meno: string) {
  return meno
    .split(' ')
    .map((w) => w[0])
    .join('')
}

/** Karta trénera — placeholder foto (iniciály), meno, odkaz na detail. */
export function TrainerCard({
  trener,
  compact = false,
}: {
  trener: Trener
  compact?: boolean
}) {
  return (
    <Link
      href={`/treneri/${trener.slug}`}
      className="group block rounded-2xl border border-line bg-surface p-5 transition-colors duration-300 hover:border-gold-dim"
    >
      <div
        className={cn(
          'hex-pattern mx-auto flex items-center justify-center rounded-full border border-line-strong bg-surface-2',
          compact ? 'h-16 w-16' : 'h-24 w-24'
        )}
        aria-hidden
      >
        <span className={cn('display text-gold', compact ? 'text-lg' : 'text-2xl')}>
          {initials(trener.meno)}
        </span>
      </div>
      <p
        className={cn(
          'display mt-4 text-center text-ink transition-colors group-hover:text-gold-hi',
          compact ? 'text-base' : 'text-lg'
        )}
      >
        {trener.meno}
      </p>
      <p className="mt-1 text-center text-xs uppercase tracking-wider text-ink-faint">
        {trener.specializacia ?? 'Profil čaká na doplnenie'}
      </p>
    </Link>
  )
}
