'use client'

import { useActionState, useMemo, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useApp } from '../AppProvider'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { formatDate, formatDurationWords } from '@/lib/klub/format'
import { normalizujPrezyvku } from '@/lib/validate'
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

export default function VyzvaClient({ vyzva, zapis, rank }: VyzvaClientProps) {
  const { data } = useApp()
  const [state, formAction, pending] = useActionState<VyzvaState, FormData>(odosliZapis, {})

  // Odvodené dáta z lokálnych tréningov v období výzvy.
  const d = useMemo(() => {
    if (!vyzva) return null
    const start = new Date(`${vyzva.zaciatok}T00:00:00`).getTime()
    const end = new Date(`${vyzva.koniec}T23:59:59.999`).getTime()
    const vObdobi = data.sessions
      .filter((s) => {
        const t = new Date(s.finishedAt).getTime()
        return t >= start && t <= end
      })
      .sort((a, b) => new Date(b.finishedAt).getTime() - new Date(a.finishedAt).getTime())

    // Najťažšia séria cviku v období — porovnanie názvov znormalizované
    // (bez veľkosti písmen, diakritiky a okrajových medzier).
    const bestVObdobi = (nazov: string): number | null => {
      const ciel = normalizujPrezyvku(nazov)
      let best = 0
      for (const s of vObdobi)
        for (const ex of s.exercises)
          if (normalizujPrezyvku(ex.name) === ciel)
            for (const set of ex.sets) if (set.weight > best) best = set.weight
      return best > 0 ? best : null
    }

    const vlastneCviky = [...new Set(data.sessions.flatMap((s) => s.exercises.map((e) => e.name)))].sort(
      (a, b) => a.localeCompare(b, 'sk'),
    )
    const minuty = Math.floor(vObdobi.reduce((sum, s) => sum + s.durationSec, 0) / 60)
    return { vObdobi, bestVObdobi, vlastneCviky, minuty }
  }, [vyzva, data.sessions])

  const autoNavrh = useMemo(() => {
    if (!vyzva || !d) return null
    if (vyzva.typ === 'CASOVA') return d.minuty > 0 ? d.minuty : null
    if (!vyzva.cvikNazov) return null
    return d.bestVObdobi(vyzva.cvikNazov)
  }, [vyzva, d])

  const [hodnota, setHodnota] = useState(() =>
    zapis ? String(zapis.hodnota) : autoNavrh !== null ? String(autoNavrh) : '',
  )
  const [vybranyCvik, setVybranyCvik] = useState('')

  if (!vyzva || !d) {
    return (
      <div>
        <h1 className="display text-2xl text-ink">Výzva</h1>
        <Card className="mt-6">
          <p className="text-ink-dim">Momentálne nebeží žiadna výzva.</p>
        </Card>
      </div>
    )
  }

  const jednotka = vyzva.typ === 'SILOVA' ? 'kg' : 'min'
  const todayMid = new Date()
  todayMid.setHours(0, 0, 0, 0)
  const endMid = new Date(`${vyzva.koniec}T00:00:00`)
  const zostava = Math.max(0, Math.floor((endMid.getTime() - todayMid.getTime()) / DAY) + 1)
  const prebehla = todayMid.getTime() > new Date(`${vyzva.koniec}T23:59:59.999`).getTime()

  // Silová výzva: cvik sa v období nenašiel → ponúkni výber z vlastných cvikov.
  const silovaNenajdene = vyzva.typ === 'SILOVA' && autoNavrh === null

  const vyberCvik = (nazov: string) => {
    setVybranyCvik(nazov)
    const v = nazov ? d.bestVObdobi(nazov) : null
    setHodnota(v !== null ? String(v) : '')
  }

  const zdrojCas = d.vObdobi.slice(0, 5)
  const viacCas = Math.max(0, d.vObdobi.length - zdrojCas.length)

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <h1 className="display text-2xl text-ink">{vyzva.nazov}</h1>
      <p className="mt-1 text-xs uppercase tracking-[0.14em] text-ink-faint tnum">
        {vyzva.typ === 'SILOVA' ? `Silová · ${vyzva.cvikNazov ?? 'cvik'}` : 'Časová · minúty'} ·{' '}
        {formatDate(`${vyzva.zaciatok}T00:00:00`)} – {formatDate(`${vyzva.koniec}T00:00:00`)} ·{' '}
        {prebehla ? 'ukončená' : `zostáva ${zostava} dní`}
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

          {/* Silová výzva: cvik sa nenašiel → výber z vlastných cvikov */}
          {silovaNenajdene && (
            <div className="rounded-xl border border-line-strong bg-surface-3 p-3">
              <p className="text-sm text-ink-dim">
                V tvojich tréningoch sme cvik <strong className="text-ink">{vyzva.cvikNazov}</strong> nenašli.
              </p>
              {d.vlastneCviky.length > 0 ? (
                <label className="mt-2 flex flex-col gap-1 text-xs">
                  <span className="text-ink-dim">Vyber, ktorý cvik sa do výzvy počíta:</span>
                  <select
                    value={vybranyCvik}
                    onChange={(e) => vyberCvik(e.target.value)}
                    aria-label="Vlastný cvik do výzvy"
                    className="h-11 rounded-lg border border-line-strong bg-surface px-3 text-base text-ink outline-none focus:border-gold"
                  >
                    <option value="">— vyber cvik —</option>
                    {d.vlastneCviky.map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </label>
              ) : (
                <p className="mt-1 text-xs text-ink-faint">
                  V histórii nemáš žiadne cviky — hodnotu doplň ručne.
                </p>
              )}
              {vybranyCvik && d.bestVObdobi(vybranyCvik) === null && (
                <p className="mt-1 text-xs text-ink-faint">
                  Cvik „{vybranyCvik}“ nemá v období výzvy žiadnu sériu — hodnotu doplň ručne.
                </p>
              )}
            </div>
          )}

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

          {/* Odkiaľ sa hodnota vzala */}
          {vyzva.typ === 'CASOVA' ? (
            d.vObdobi.length > 0 ? (
              <div className="text-xs text-ink-faint">
                <p>Súčet minút z tvojich tréningov v období výzvy:</p>
                <ul className="mt-1 flex flex-col gap-0.5">
                  {zdrojCas.map((s) => (
                    <li key={s.id} className="tnum">
                      {formatDate(s.finishedAt)} · {formatDurationWords(s.durationSec)}
                    </li>
                  ))}
                  {viacCas > 0 && <li>a ďalších {viacCas}…</li>}
                </ul>
              </div>
            ) : (
              <p className="text-xs text-ink-faint">
                V období výzvy nemáš žiadne tréningy — minúty doplň ručne.
              </p>
            )
          ) : (
            !silovaNenajdene && (
              <p className="text-xs text-ink-faint">
                Predvyplnené z najťažšej série cviku {vyzva.cvikNazov} v období výzvy. Hodnotu môžeš upraviť.
              </p>
            )
          )}

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
          {state.message && <p className="text-sm text-gold-hi">{state.message}</p>}
        </form>
      </Card>
    </motion.div>
  )
}
