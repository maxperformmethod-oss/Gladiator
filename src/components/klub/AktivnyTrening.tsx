'use client'

import { useEffect, useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Notice } from '@/components/ui/Notice'
import { cn } from '@/lib/cn'
import {
  prepniSeriu,
  upravSeriu,
  odoberSeriu,
  pridajSeriu,
  ukonciTrening,
  zrusTrening,
} from '@/server/actions/klub'

type Seria = {
  id: string
  cvikId: string
  cvikNazov: string
  opakovania: number
  hmotnost: number
  poradie: number
  dokoncena: boolean
}

type Props = {
  trening: { id: string; nazov: string; zaciatok: string }
  serie: Seria[]
  cviky: { id: string; nazov: string }[]
  odpocinokSek: number
}

function cas(sek: number): string {
  const h = Math.floor(sek / 3600)
  const m = Math.floor((sek % 3600) / 60)
  const s = sek % 60
  const mm = String(m).padStart(2, '0')
  const ss = String(s).padStart(2, '0')
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`
}

const num = (v: string) => {
  const n = Number(v.replace(',', '.'))
  return Number.isFinite(n) ? n : 0
}

export function AktivnyTrening({ trening, serie, cviky, odpocinokSek }: Props) {
  const router = useRouter()
  const [pending, start] = useTransition()
  const [chyba, setChyba] = useState<string>()
  const [ubehlo, setUbehlo] = useState(0)

  // Klientsky časovač uplynutého času (tiká každú sekundu z `zaciatok`).
  useEffect(() => {
    const zac = new Date(trening.zaciatok).getTime()
    const tik = () => setUbehlo(Math.max(0, Math.floor((Date.now() - zac) / 1000)))
    tik()
    const i = setInterval(tik, 1000)
    return () => clearInterval(i)
  }, [trening.zaciatok])

  // Lokálny stav polí (opakovania/hmotnosť) na úpravu počas tréningu.
  const [pola, setPola] = useState<Record<string, { r: string; w: string }>>({})
  const hodnota = (s: Seria) => pola[s.id] ?? { r: String(s.opakovania), w: String(s.hmotnost) }
  const setPole = (id: string, k: 'r' | 'w', v: string) =>
    setPola((p) => ({ ...p, [id]: { ...(p[id] ?? { r: '', w: '' }), [k]: v } }))

  const done = serie.filter((s) => s.dokoncena).length
  const total = serie.length

  // Zoskupenie sérií podľa cviku, v poradí.
  const skupiny = useMemo(() => {
    const map = new Map<string, { nazov: string; serie: Seria[] }>()
    for (const s of [...serie].sort((a, b) => a.poradie - b.poradie)) {
      if (!map.has(s.cvikId)) map.set(s.cvikId, { nazov: s.cvikNazov, serie: [] })
      map.get(s.cvikId)!.serie.push(s)
    }
    return [...map.entries()].map(([cvikId, v]) => ({ cvikId, ...v }))
  }, [serie])

  const aktualnyCvik = skupiny.find((g) => g.serie.some((s) => !s.dokoncena))?.cvikId

  const spusti = (fn: () => Promise<{ error?: string }>, poRefresh = true) => {
    setChyba(undefined)
    start(async () => {
      const res = await fn()
      if (res?.error) setChyba(res.error)
      else if (poRefresh) router.refresh()
    })
  }

  const fd = (obj: Record<string, string>) => {
    const f = new FormData()
    for (const [k, v] of Object.entries(obj)) f.set(k, v)
    return f
  }

  const toggle = (s: Seria) => {
    if (!s.dokoncena) window.dispatchEvent(new CustomEvent('gg:odpocinok', { detail: odpocinokSek }))
    spusti(() => prepniSeriu({}, fd({ id: s.id })))
  }

  const [novyCvik, setNovyCvik] = useState(cviky[0]?.id ?? '')
  const [novR, setNovR] = useState('10')
  const [novW, setNovW] = useState('0')

  return (
    <div>
      {/* Lepkavá hlavička */}
      <div className="sticky top-16 z-30 -mx-4 mb-6 border-b border-line bg-bg/95 px-4 py-3 backdrop-blur md:-mx-6 md:px-6">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="display truncate text-lg text-ink">{trening.nazov}</p>
            <p className="text-sm text-ink-dim [font-variant-numeric:tabular-nums]">
              {cas(ubehlo)} · {done}/{total} sérií
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="ghost"
              disabled={pending}
              onClick={() => {
                if (window.confirm('Zrušiť tréning? Zmažú sa všetky série.')) spusti(() => zrusTrening({}, fd({ id: trening.id })), false)
              }}
            >
              Zrušiť
            </Button>
            <Button
              type="button"
              variant="gold"
              disabled={pending}
              onClick={() => {
                if (window.confirm('Ukončiť tréning?')) spusti(() => ukonciTrening({}, fd({ id: trening.id })), false)
              }}
            >
              Ukončiť
            </Button>
          </div>
        </div>
        <div className="mx-auto mt-2 h-1.5 w-full max-w-6xl overflow-hidden rounded-full bg-line">
          <div className="h-full bg-gold transition-[width] duration-300" style={{ width: `${total ? (done / total) * 100 : 0}%` }} />
        </div>
      </div>

      {chyba && (
        <div className="mb-4" aria-live="polite">
          <Notice variant="warning">{chyba}</Notice>
        </div>
      )}

      <div className="flex flex-col gap-6">
        {skupiny.map((g) => (
          <div key={g.cvikId} className={cn('rounded-2xl border p-4', g.cvikId === aktualnyCvik ? 'border-gold-dim bg-surface' : 'border-line bg-surface/60')}>
            <h3 className="display mb-3 text-lg text-ink">{g.nazov}</h3>
            <ul className="flex flex-col gap-2">
              {g.serie.map((s) => {
                const h = hodnota(s)
                return (
                  <li key={s.id} className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      aria-label={s.dokoncena ? 'Zrušiť dokončenie série' : 'Označiť sériu ako dokončenú'}
                      aria-pressed={s.dokoncena}
                      disabled={pending}
                      onClick={() => toggle(s)}
                      className={cn(
                        'grid h-11 w-11 shrink-0 place-items-center rounded-xl border text-lg transition-colors',
                        s.dokoncena ? 'border-gold bg-gold text-bg' : 'border-line text-ink-dim hover:border-gold-dim'
                      )}
                    >
                      {s.dokoncena ? '✓' : s.poradie}
                    </button>

                    <input
                      aria-label="opakovania"
                      inputMode="numeric"
                      value={h.r}
                      onChange={(e) => setPole(s.id, 'r', e.target.value)}
                      className="h-11 w-16 rounded-xl border border-line bg-bg text-center text-base text-ink outline-none [font-variant-numeric:tabular-nums]"
                    />
                    <span className="text-ink-dim">×</span>
                    <input
                      aria-label="hmotnosť v kg"
                      inputMode="decimal"
                      value={h.w}
                      onChange={(e) => setPole(s.id, 'w', e.target.value)}
                      className="h-11 w-20 rounded-xl border border-line bg-bg text-center text-base text-ink outline-none [font-variant-numeric:tabular-nums]"
                    />
                    <span className="text-sm text-ink-dim">kg</span>

                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => spusti(() => upravSeriu({}, fd({ id: s.id, opakovania: String(num(h.r)), hmotnost: String(num(h.w)) })))}
                      className="rounded-lg border border-line px-2 py-1 text-xs text-ink-dim hover:text-ink"
                    >
                      Uložiť
                    </button>
                    <button
                      type="button"
                      aria-label="Odobrať sériu"
                      disabled={pending}
                      onClick={() => spusti(() => odoberSeriu({}, fd({ id: s.id })))}
                      className="rounded-lg px-2 py-1 text-xs text-ink-dim hover:text-ink"
                    >
                      ×
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </div>

      {/* Pridať sériu (aj k cviku mimo plánu) */}
      <div className="mt-6 rounded-2xl border border-line bg-surface p-4">
        <h3 className="display mb-3 text-base text-ink">Pridať sériu</h3>
        <div className="flex flex-wrap items-center gap-2">
          <select
            aria-label="cvik"
            value={novyCvik}
            onChange={(e) => setNovyCvik(e.target.value)}
            className="h-11 rounded-xl border border-line bg-bg px-3 text-base text-ink outline-none"
          >
            {cviky.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nazov}
              </option>
            ))}
          </select>
          <input aria-label="opakovania" inputMode="numeric" value={novR} onChange={(e) => setNovR(e.target.value)} className="h-11 w-16 rounded-xl border border-line bg-bg text-center text-base text-ink outline-none [font-variant-numeric:tabular-nums]" />
          <span className="text-ink-dim">×</span>
          <input aria-label="hmotnosť v kg" inputMode="decimal" value={novW} onChange={(e) => setNovW(e.target.value)} className="h-11 w-20 rounded-xl border border-line bg-bg text-center text-base text-ink outline-none [font-variant-numeric:tabular-nums]" />
          <span className="text-sm text-ink-dim">kg</span>
          <Button
            type="button"
            variant="outline"
            disabled={pending || !novyCvik}
            onClick={() => spusti(() => pridajSeriu({}, fd({ treningId: trening.id, cvikId: novyCvik, opakovania: String(num(novR)), hmotnost: String(num(novW)) })))}
          >
            Pridať
          </Button>
        </div>
      </div>
    </div>
  )
}
