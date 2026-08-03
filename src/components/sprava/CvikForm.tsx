'use client'

import { useActionState } from 'react'
import { Button } from '@/components/ui/Button'
import { Notice } from '@/components/ui/Notice'
import type { SpravaState } from '@/server/actions/treningy'

type Action = (prev: SpravaState, formData: FormData) => Promise<SpravaState>

const pole = 'rounded-xl border border-line bg-surface px-3 py-2 text-ink outline-none transition-colors focus:border-gold-dim'

/**
 * Formulár na pridanie/úpravu globálneho cviku. Enum hodnoty (partia, jednotka)
 * prídu ako props zo servera — `@prisma/client` sa v klientovi neimportuje.
 */
export function CvikForm({
  action,
  submitLabel,
  partie,
  jednotky,
  cvik,
}: {
  action: Action
  submitLabel: string
  partie: string[]
  jednotky: string[]
  cvik?: { id: string; nazov: string; partia: string; jednotka: string; poradie: number; aktivny: boolean }
}) {
  const [state, formAction, pending] = useActionState<SpravaState, FormData>(action, {})

  return (
    <form action={formAction} className="flex flex-col gap-3 md:flex-row md:flex-wrap md:items-end">
      {cvik && <input type="hidden" name="id" value={cvik.id} />}

      <label className="flex flex-col gap-1 text-sm">
        <span className="text-ink-dim">Názov</span>
        <input name="nazov" defaultValue={cvik?.nazov} required maxLength={80} className={pole} />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="text-ink-dim">Partia</span>
        <select name="partia" defaultValue={cvik?.partia ?? 'NEZARADENE'} className={pole}>
          {partie.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="text-ink-dim">Jednotka</span>
        <select name="jednotka" defaultValue={cvik?.jednotka ?? 'KG'} className={pole}>
          {jednotky.map((j) => (
            <option key={j} value={j}>
              {j}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="text-ink-dim">Poradie</span>
        <input name="poradie" type="number" defaultValue={cvik?.poradie ?? 0} min={0} className={`${pole} w-24`} />
      </label>

      <label className="flex items-center gap-2 text-sm text-ink-dim">
        <input name="aktivny" type="checkbox" defaultChecked={cvik ? cvik.aktivny : true} />
        Aktívny
      </label>

      <Button type="submit" variant="outline" disabled={pending}>
        {pending ? '…' : submitLabel}
      </Button>

      {state.error && (
        <div aria-live="polite" className="w-full">
          <Notice variant="warning">{state.error}</Notice>
        </div>
      )}
      {state.message && (
        <div aria-live="polite" className="w-full">
          <Notice variant="info">{state.message}</Notice>
        </div>
      )}
    </form>
  )
}
