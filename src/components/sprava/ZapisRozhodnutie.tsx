'use client'

import { useActionState } from 'react'
import { Notice } from '@/components/ui/Notice'
import { posudZapis, type VyzvaState } from '@/server/actions/vyzvy'

const btn = 'display rounded-xl border px-4 py-2 text-xs tracking-[0.12em] disabled:opacity-50'

/**
 * Rozhodovacie ovládanie jedného zápisu: schváliť / zamietnuť (s dôvodom) / vrátiť.
 *
 * Každá akcia má **vlastný `<form>` so skrytým poľom `akcia`** — hodnota tak
 * ide do FormData vždy, nezávisle od toho, ktoré submit tlačidlo prehliadač
 * pošle ako „submitter". Predtým akcie zdieľali jeden formulár a líšili sa len
 * `name`/`value` na tlačidle, ktoré sa cez `useActionState` dispatch neprenášalo
 * spoľahlivo — vetva „schváliť" tak nikdy nezbehla (zápis zostal `CAKA`).
 */
export function ZapisRozhodnutie({ zapisId, stav }: { zapisId: string; stav: string }) {
  const [state, formAction, pending] = useActionState<VyzvaState, FormData>(posudZapis, {})

  return (
    <div className="mt-3 flex flex-col gap-2 border-t border-line pt-3">
      {stav !== 'ZAMIETNUTE' && (
        <form action={formAction} className="flex flex-col gap-2 sm:flex-row sm:items-end">
          <input type="hidden" name="zapisId" value={zapisId} />
          <input type="hidden" name="akcia" value="zamietnut" />
          <label className="flex flex-1 flex-col gap-1 text-xs">
            <span className="text-ink-dim">Dôvod zamietnutia (povinný)</span>
            <input
              name="dovod"
              maxLength={300}
              className="rounded-lg border border-line bg-surface px-3 py-2 text-base text-ink outline-none focus:border-gold-dim"
            />
          </label>
          <button type="submit" disabled={pending} className={`${btn} shrink-0 border-danger/40 text-danger hover:border-danger`}>
            Zamietnuť
          </button>
        </form>
      )}

      <div className="flex flex-wrap gap-2">
        {stav !== 'SCHVALENE' && (
          <form action={formAction}>
            <input type="hidden" name="zapisId" value={zapisId} />
            <input type="hidden" name="akcia" value="schvalit" />
            <button type="submit" disabled={pending} className={`${btn} border-gold-dim text-gold hover:border-gold hover:text-gold-hi`}>
              Schváliť
            </button>
          </form>
        )}
        {stav !== 'CAKA' && (
          <form action={formAction}>
            <input type="hidden" name="zapisId" value={zapisId} />
            <input type="hidden" name="akcia" value="vratit" />
            <button type="submit" disabled={pending} className={`${btn} border-line-strong text-ink-dim hover:text-ink`}>
              Vrátiť na čakajúce
            </button>
          </form>
        )}
      </div>

      {state.error && <Notice variant="warning">{state.error}</Notice>}
      {state.message && <Notice variant="info">{state.message}</Notice>}
    </div>
  )
}
