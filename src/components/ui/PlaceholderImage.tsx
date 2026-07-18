import { Camera } from 'lucide-react'
import { cn } from '@/lib/cn'

/**
 * Placeholder namiesto fotky — ŽIADNE stock fotky.
 * Každé použitie = miesto, kde príde reálna fotka z pobočky Lučenec.
 */
export function PlaceholderImage({
  label,
  aspect = 'aspect-[4/3]',
  note = 'NAHRADIŤ REÁLNOU FOTKOU LC',
  className,
}: {
  /** Popis, čo má byť na fotke (napr. „Zóna voľných váh"). */
  label?: string
  /** Tailwind aspect trieda, napr. 'aspect-video'. */
  aspect?: string
  note?: string
  className?: string
}) {
  return (
    <div
      className={cn(
        'hex-pattern relative flex w-full flex-col items-center justify-center gap-2 overflow-hidden rounded-2xl border border-dashed border-line-strong bg-surface-2 text-center',
        aspect,
        className
      )}
      role="img"
      aria-label={label ? `Placeholder fotky: ${label}` : 'Placeholder fotky'}
    >
      <Camera size={28} className="text-ink-faint" aria-hidden />
      <p className="px-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-warning">
        {note}
      </p>
      {label && (
        <p className="px-4 text-xs uppercase tracking-wider text-ink-faint">{label}</p>
      )}
    </div>
  )
}
