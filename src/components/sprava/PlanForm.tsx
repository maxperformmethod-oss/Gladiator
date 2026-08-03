'use client'

import { useActionState } from 'react'
import { Button } from '@/components/ui/Button'
import { Notice } from '@/components/ui/Notice'
import type { SpravaState } from '@/server/actions/treningy'

type Action = (prev: SpravaState, formData: FormData) => Promise<SpravaState>

const cislo = 'w-20 rounded-lg border border-line bg-bg px-2 py-1 text-ink outline-none transition-colors focus:border-gold-dim'

/** Formulár na založenie plánu: názov + výber cvikov s cieľom série × opakovania. */
export function PlanForm({
  action,
  cviky,
}: {
  action: Action
  cviky: { id: string; nazov: string; partia: string }[]
}) {
  const [state, formAction, pending] = useActionState<SpravaState, FormData>(action, {})

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <label className="flex max-w-md flex-col gap-1 text-sm">
        <span className="text-ink-dim">Názov plánu</span>
        <input
          name="nazov"
          required
          maxLength={80}
          className="rounded-xl border border-line bg-surface px-3 py-2 text-ink outline-none transition-colors focus:border-gold-dim"
        />
      </label>

      <div className="flex flex-col gap-2">
        {cviky.map((c) => (
          <div key={c.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-line bg-surface px-3 py-2 text-sm">
            <label className="flex items-center gap-2">
              <input type="checkbox" name={`cvik_${c.id}`} />
              <span className="text-ink">{c.nazov}</span>
              <span className="text-ink-faint">({c.partia})</span>
            </label>
            <span className="ml-auto flex items-center gap-2 text-ink-dim">
              <input name={`serie_${c.id}`} type="number" min={1} placeholder="série" className={cislo} />
              ×
              <input name={`opak_${c.id}`} type="number" min={1} placeholder="opak." className={cislo} />
            </span>
          </div>
        ))}
        {cviky.length === 0 && <p className="text-sm text-ink-dim">Najprv pridaj aspoň jeden aktívny cvik.</p>}
      </div>

      <div>
        <Button type="submit" disabled={pending}>
          {pending ? 'Ukladám…' : 'Vytvoriť plán'}
        </Button>
      </div>

      {state.error && (
        <div aria-live="polite">
          <Notice variant="warning">{state.error}</Notice>
        </div>
      )}
      {state.message && (
        <div aria-live="polite">
          <Notice variant="info">{state.message}</Notice>
        </div>
      )}
    </form>
  )
}
