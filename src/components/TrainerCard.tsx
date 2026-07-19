import Image from 'next/image'
import Link from 'next/link'
import type { Trener } from '@/lib/gym'
import { cn } from '@/lib/cn'

/** Karta trénera — reálna fotka s hover zoomom, meno, odkaz na detail. */
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
      className="group block overflow-hidden rounded-2xl border border-line bg-surface transition-colors duration-300 hover:border-gold-dim"
    >
      <div className="relative aspect-square overflow-hidden">
        <Image
          src={trener.foto}
          alt={`Tréner ${trener.meno}`}
          fill
          sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 210px"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
        />
        {/* Jemný zlatý akcent pri hoveri */}
        <div
          className="absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-gold transition-transform duration-500 group-hover:scale-x-100"
          aria-hidden
        />
      </div>
      <div className={cn('px-4', compact ? 'py-3' : 'py-4')}>
        <p
          className={cn(
            'display text-center text-ink transition-colors group-hover:text-gold-hi',
            compact ? 'text-sm sm:text-base' : 'text-lg'
          )}
        >
          {trener.meno}
        </p>
        <p className="mt-1 text-center text-[11px] uppercase tracking-wider text-ink-faint">
          {trener.specializacia ?? 'Tréner Gladiator Gymu'}
        </p>
      </div>
    </Link>
  )
}
