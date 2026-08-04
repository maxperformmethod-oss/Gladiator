'use client'

import { useActionState, useMemo, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useApp } from '../AppProvider'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { odosliZapis, type VyzvaState } from '@/server/actions/vyzvy'

const DAY = 24 * 60 * 60 * 1000

export interface VyzvaClientProps {
  vyzva: {
    id: string
    nazov: string
    popis: string | null
    typ: 'SILOVA' | 'CASOVA'
    zaciatok: string // YYYY-MM-DD
    koniec: string // YYYY-MM-DD
    cvikNazov: string | null
  } | null
  zapis: { hodnota: number; stav: string; dovodZamietnutia: string | null } | null
  rank: number | null
}

function dielo(zaciatok: string, koniec: string) {
  return { start: new Date(`${zaciatok}T00:00:00`), end: new Date(`${koniec}T23:59:59.999`) }
}

export default function VyzvaClient({ vyzva, zapis, rank }: VyzvaClientProps) {
  const { data } = useApp()
  const [state, formAction, pending] = useActionState<VyzvaState, FormData>(odosliZapis, {})

  // Predvyplnenie z lokálnych tréningov v období výzvy.
  const navrh = useMemo(() => {
    if (!vyzva) return null
    const { start, end } = dielo(vyzva.zaciatok, vyzva.koniec)
    const vObdobi = data.sessions.filter((s) => {
      const t = new Date(s.finishedAt).getTime()
      return t >= start.getTime() && t <= end.getTime()
    })
    if (vObdobi.length === 0) return null

    if (vyzva.typ === 'CASOVA') {
      const sek = vObdobi.reduce((sum, s) => sum + s.durationSec, 0)
      const min = Math.floor(sek / 60)
      return min > 0 ? min : null
    }
    // SILOVA — najťažšia séria daného cviku (podľa názvu, case-insensitive + trim).
    if (!vyzva.cvikNazov) return null
    const cieľ = vyzva.cvikNazov.trim().toLowerCase()
    let best = 0
    for (const s of vObdobi) {
      for (const ex of s.exercises) {
        if (ex.name.trim().toLowerCase() !== cieľ) continue
        for (const set of ex.sets) if (set.weight > best) best = set.weight
      }
    }
    return best > 0 ? best : null
  }, [vyzva, data.sessions])

  const jednotka = vyzva?.typ === 'SILOVA' ? 'kg' : 'min'
  const initial = zapis ? String(zapis.hodnota) : navrh !== null ? String(navrh) : ''
  const [hodnota, setHodnota] = useState(initial)

  if (!vyzva) {
    return (
      <div>
        <h1 className="display text-2xl text-ink">Výzva</h1>
        <Card className="mt-6">
          <p className="text-ink-dim">Momentálne nebeží žiadna výzva.</p>
        </Card>
      </div>
    )
  }

  const { end } = dielo(vyzva.zaciatok, vyzva.koniec)
  const todayMid = new Date()
  todayMid.setHours(0, 0, 0, 0)
  const endMid = new Date(`${vyzva.koniec}T00:00:00`)
  const zostava = Math.max(0, Math.floor((endMid.getTime() - todayMid.getTime()) / DAY) + 1)
  const prebehla = todayMid.getTime() > end.getTime()

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <h1 className="display text-2xl text-ink">{vyzva.nazov}</h1>
      <p className="mt-1 text-xs uppercase tracking-[0.14em] text-ink-faint tnum">
        {vyzva.typ === 'SILOVA' ? `Silová · ${vyzva.cvikNazov ?? 'cvik'}` : 'Časová · minúty'} ·{' '}
        {vyzva.zaciatok} – {vyzva.koniec} · {prebehla ? 'ukončená' : `zostáva ${zostava} dní`}
      </p>
      {vyzva.popis && <p className="mt-3 text-sm leading-relaxed text-ink-dim">{vyzva.popis}</p>}

      {/* Stav zápisu */}
      {zapis?.stav === 'SCHVALENE' && (
        <Card tone="gold" className="mt-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-gold-hi">Schválené</p>
          <p className="tnum mt-1 text-3xl font-extrabold text-ink">
            {zapis.hodnota} <span className="text-lg text-ink-dim">{jednotka}</span>
          </p>
          {rank !== null && (
            <p className="mt-1 text-sm text-ink-dim">
              Poradie v rebríčku: <span className="tnum font-bold text-gold">{rank}.</span>{' '}
              <Link href="/klub/rebricek" className="text-gold-hi underline-offset-4 hover:underline">
                Rebríček
              </Link>
            </p>
          )}
        </Card>
      )}
      {zapis?.stav === 'CAKA' && (
        <Card className="mt-6">
          <p className="text-sm text-ink-dim">Čaká na potvrdenie obsluhou.</p>
        </Card>
      )}
      {zapis?.stav === 'ZAMIETNUTE' && (
        <Card className="mt-6 border-danger/30">
          <p className="text-sm font-semibold text-danger">Zamietnuté</p>
          {zapis.dovodZamietnutia && <p className="mt-1 text-sm text-ink-dim">Dôvod: {zapis.dovodZamietnutia}</p>}
        </Card>
      )}

      {/* Odoslanie / prepis */}
      <Card className="mt-4">
        <form action={formAction} className="flex flex-col gap-3">
          <input type="hidden" name="vyzvaId" value={vyzva.id} />
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="text-ink-dim">Tvoja hodnota ({jednotka})</span>
            <input
              name="hodnota"
              value={hodnota}
              onChange={(e) => setHodnota(e.target.value)}
              inputMode={vyzva.typ === 'SILOVA' ? 'decimal' : 'numeric'}
              aria-label={`Hodnota do výzvy v jednotkách ${jednotka}`}
              className="tnum h-11 w-40 rounded-xl border border-line-strong bg-surface-3 px-3 text-base font-bold text-ink outline-none focus:border-gold"
            />
          </label>
          <p className="text-xs text-ink-faint">
            {navrh !== null
              ? `Predvyplnené z tvojich tréningov od ${vyzva.zaciatok} do ${vyzva.koniec}. Hodnotu môžeš upraviť.`
              : `V období výzvy nemáš žiadne tréningy s dátami – hodnotu doplň ručne.`}
          </p>
          <div>
            <Button type="submit" disabled={pending}>
              {pending
                ? '…'
                : zapis?.stav === 'SCHVALENE'
                  ? 'Poslať lepší výsledok'
                  : zapis
                    ? 'Prepísať hodnotu'
                    : 'Odoslať do výzvy'}
            </Button>
          </div>
          <p className="text-xs text-ink-faint">
            Výsledky si zapisujú členovia sami a potvrdzuje ich obsluha gymu.
            {zapis?.stav === 'SCHVALENE' && ' Opätovné odoslanie vráti zápis späť na čakajúci.'}
          </p>
          {state.error && <p className="text-sm text-danger">{state.error}</p>}
          {state.message && <p className="text-sm text-success">{state.message}</p>}
        </form>
      </Card>
    </motion.div>
  )
}
