/** Kruhový ukazovateľ týždenného cieľa — čisté SVG, žiadna knižnica. */
export function Ring({ done, goal }: { done: number; goal: number }) {
  const r = 52
  const obvod = 2 * Math.PI * r
  const podiel = goal > 0 ? Math.min(1, done / goal) : 0
  return (
    <div className="relative inline-grid place-items-center">
      <svg width={128} height={128} viewBox="0 0 128 128" aria-hidden className="-rotate-90">
        <circle cx={64} cy={64} r={r} fill="none" stroke="currentColor" strokeWidth={10} className="text-line" />
        <circle
          cx={64}
          cy={64}
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth={10}
          strokeLinecap="round"
          strokeDasharray={obvod}
          strokeDashoffset={obvod * (1 - podiel)}
          className="text-gold transition-[stroke-dashoffset] duration-500"
        />
      </svg>
      <div className="absolute text-center">
        <div className="display text-3xl text-ink [font-variant-numeric:tabular-nums]">
          {done}
          <span className="text-ink-dim">/{goal}</span>
        </div>
        <div className="text-[10px] uppercase tracking-[0.2em] text-ink-dim">tento týždeň</div>
      </div>
    </div>
  )
}
