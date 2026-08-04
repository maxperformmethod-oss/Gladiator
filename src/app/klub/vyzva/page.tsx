import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Výzva', robots: { index: false } }

/** Mesačná výzva a rebríček bežia na serveri – prídu v etape H3. */
export default function VyzvaPage() {
  return (
    <div className="mx-auto max-w-lg pt-6 sm:pt-12">
      <div className="flex flex-col items-center rounded-2xl border border-dashed border-line-strong bg-surface/50 px-6 py-12 text-center">
        <div className="mb-5 flex size-14 items-center justify-center rounded-2xl bg-surface-3 text-gold">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="size-7" aria-hidden>
            <path d="M6 3v6a6 6 0 0 0 12 0V3M4 3h16M8 21h8M12 15v6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h1 className="display text-2xl text-ink">Mesačná výzva</h1>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-ink-dim">
          Rebríček a mesačná výzva sa pripravujú. Na rozdiel od zvyšku členskej zóny
          bežia na serveri – aby sa dali porovnávať výsledky celej komunity.
        </p>
        <span className="mt-5 rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-gold-hi">
          Pripravuje sa
        </span>
      </div>
    </div>
  )
}
