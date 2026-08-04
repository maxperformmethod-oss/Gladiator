'use client'

import { useActionState } from 'react'
import { Notice } from '@/components/ui/Notice'
import { posudZapis, type VyzvaState } from '@/server/actions/vyzvy'

/** Rozhodovacie ovládanie jedného zápisu: schváliť / zamietnuť (s dôvodom) / vrátiť. */
export function ZapisRozhodnutie({ zapisId, stav }: { zapisId: string; stav: string }) {
  const [state, formAction, pending] = useActionState<VyzvaState, FormData>(posudZapis, {})

  return (
    <form action={formAction} className="mt-3 flex flex-col gap-2 border-t border-line pt-3">
      <input type="hidden" name="zapisId" value={zapisId} />

      <label className="flex flex-col gap-1 text-xs">
        <span className="text-ink-dim">Dôvod zamietnutia (povinný pri zamietnutí)</span>
        <input
          name="dovod"
          maxLength={300}
          className="rounded-lg border border-line bg-surface px-3 py-2 text-base text-ink outline-none focus:border-gold-dim"
        />
      </label>

      <div className="flex flex-wrap gap-2">
        {stav !== 'SCHVALENE' && (
          <button
            type="submit"
            name="akcia"
            value="schvalit"
            disabled={pending}
            className="display rounded-xl border border-gold-dim px-4 py-2 text-xs tracking-[0.12em] text-gold hover:border-gold hover:text-gold-hi disabled:opacity-50"
          >
            Schváliť
          </button>
        )}
        {stav !== 'ZAMIETNUTE' && (
          <button
            type="submit"
            name="akcia"
            value="zamietnut"
            disabled={pending}
            className="display rounded-xl border border-danger/40 px-4 py-2 text-xs tracking-[0.12em] text-danger hover:border-danger disabled:opacity-50"
          >
            Zamietnuť
          </button>
        )}
        {stav !== 'CAKA' && (
          <button
            type="submit"
            name="akcia"
            value="vratit"
            disabled={pending}
            className="display rounded-xl border border-line-strong px-4 py-2 text-xs tracking-[0.12em] text-ink-dim hover:text-ink disabled:opacity-50"
          >
            Vrátiť na čakajúce
          </button>
        )}
      </div>

      {state.error && <Notice variant="warning">{state.error}</Notice>}
      {state.message && <Notice variant="info">{state.message}</Notice>}
    </form>
  )
}
