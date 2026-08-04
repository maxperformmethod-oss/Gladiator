'use client'

import { useState } from 'react'

/**
 * Číselný stepper `− [pole] +` (MPM §5). 44×44 dotykové ciele, `inputMode`,
 * prijíma čiarku aj bodku, orezáva do min–max, tabuľkové číslice, aria-labels.
 * Hodnota poľa sa odosiela vo formulári cez `name`.
 */
export function Stepper({
  name,
  defaultValue,
  min,
  max,
  step = 1,
  decimal = false,
  label,
}: {
  name: string
  defaultValue: number
  min: number
  max: number
  step?: number
  decimal?: boolean
  label: string
}) {
  const [txt, setTxt] = useState(String(defaultValue))

  const clamp = (x: number) => {
    const c = Math.min(max, Math.max(min, decimal ? Math.round(x * 100) / 100 : Math.round(x)))
    return Number.isFinite(c) ? c : min
  }
  const parse = () => {
    const n = Number(txt.replace(',', '.'))
    return Number.isFinite(n) ? n : min
  }
  const set = (n: number) => setTxt(String(clamp(n)))

  return (
    <div className="inline-flex h-11 items-stretch overflow-hidden rounded-xl border border-line bg-surface">
      <button
        type="button"
        aria-label={`${label}: menej`}
        onClick={() => set(parse() - step)}
        className="w-11 text-xl text-ink-dim transition-colors hover:text-ink"
      >
        −
      </button>
      <input
        name={name}
        value={txt}
        aria-label={label}
        inputMode={decimal ? 'decimal' : 'numeric'}
        onChange={(e) => setTxt(e.target.value)}
        onBlur={() => set(parse())}
        className="w-16 bg-transparent text-center text-base text-ink outline-none [font-variant-numeric:tabular-nums]"
      />
      <button
        type="button"
        aria-label={`${label}: viac`}
        onClick={() => set(parse() + step)}
        className="w-11 text-xl text-ink-dim transition-colors hover:text-ink"
      >
        +
      </button>
    </div>
  )
}
