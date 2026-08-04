'use client'

import { useActionState, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Notice } from '@/components/ui/Notice'
import type { VyzvaState } from '@/server/actions/vyzvy'

type Action = (prev: VyzvaState, formData: FormData) => Promise<VyzvaState>

const pole =
  'rounded-xl border border-line bg-surface px-3 py-2 text-base text-ink outline-none transition-colors focus:border-gold-dim'

const TYP_LABEL: Record<string, string> = { SILOVA: 'Silová (kg)', CASOVA: 'Časová (minúty)' }
const STAV_LABEL: Record<string, string> = { NAVRH: 'Návrh', AKTIVNA: 'Aktívna', UZAVRETA: 'Uzavretá' }

export function VyzvaForm({
  action,
  submitLabel,
  typy,
  stavy,
  cviky,
  vyzva,
}: {
  action: Action
  submitLabel: string
  typy: string[]
  stavy: string[]
  cviky: { id: string; nazov: string }[]
  vyzva?: {
    id: string
    nazov: string
    popis: string | null
    typ: string
    cvikId: string | null
    zaciatok: string
    koniec: string
    stav: string
  }
}) {
  const [state, formAction, pending] = useActionState<VyzvaState, FormData>(action, {})
  const [typ, setTyp] = useState(vyzva?.typ ?? 'SILOVA')

  return (
    <form action={formAction} className="flex flex-col gap-3">
      {vyzva && <input type="hidden" name="id" value={vyzva.id} />}

      <label className="flex flex-col gap-1 text-sm">
        <span className="text-ink-dim">Názov</span>
        <input name="nazov" defaultValue={vyzva?.nazov} required maxLength={80} className={pole} />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="text-ink-dim">Popis</span>
        <textarea name="popis" defaultValue={vyzva?.popis ?? ''} maxLength={500} rows={2} className={pole} />
      </label>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-ink-dim">Typ</span>
          <select
            name="typ"
            value={typ}
            onChange={(e) => setTyp(e.target.value)}
            className={pole}
          >
            {typy.map((t) => (
              <option key={t} value={t}>
                {TYP_LABEL[t] ?? t}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="text-ink-dim">Cvik {typ === 'SILOVA' ? '(povinné)' : '(len pri silovej)'}</span>
          <select
            name="cvikId"
            defaultValue={vyzva?.cvikId ?? ''}
            disabled={typ !== 'SILOVA'}
            className={`${pole} disabled:opacity-40`}
          >
            <option value="">— vyber cvik —</option>
            {cviky.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nazov}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="text-ink-dim">Stav</span>
          <select name="stav" defaultValue={vyzva?.stav ?? 'NAVRH'} className={pole}>
            {stavy.map((s) => (
              <option key={s} value={s}>
                {STAV_LABEL[s] ?? s}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-ink-dim">Začiatok</span>
          <input name="zaciatok" type="date" defaultValue={vyzva?.zaciatok} required className={pole} />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-ink-dim">Koniec</span>
          <input name="koniec" type="date" defaultValue={vyzva?.koniec} required className={pole} />
        </label>
      </div>

      <div>
        <Button type="submit" variant="outline" disabled={pending}>
          {pending ? '…' : submitLabel}
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
