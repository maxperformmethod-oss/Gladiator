import type { Metadata } from 'next'
import Link from 'next/link'
import { Prisma } from '@prisma/client'
import { Section } from '@/components/ui/Section'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Card } from '@/components/ui/Card'
import { prisma } from '@/lib/prisma'
import { requireClen } from '@/server/auth'
import { cn } from '@/lib/cn'

export const metadata: Metadata = { title: 'História' }

const DNI = ['Po', 'Ut', 'St', 'Št', 'Pi', 'So', 'Ne']

function trvanie(z: Date, k: Date | null): string {
  if (!k) return '—'
  const min = Math.max(0, Math.round((k.getTime() - z.getTime()) / 60000))
  return min >= 60 ? `${Math.floor(min / 60)} h ${min % 60} min` : `${min} min`
}

export default async function HistoriaPage() {
  const clen = await requireClen()

  const treningy = await prisma.trening.findMany({
    where: { clenId: clen.id, koniec: { not: null } },
    orderBy: { zaciatok: 'desc' },
    include: {
      serie: { where: { dokoncena: true }, include: { cvik: true }, orderBy: { poradie: 'asc' } },
    },
  })

  const objem = (serie: { hmotnost: Prisma.Decimal; opakovania: number }[]) =>
    serie.reduce((a, s) => a.add(s.hmotnost.mul(s.opakovania)), new Prisma.Decimal(0))

  // Osobné rekordy — počítané v JS z dokončených sérií (MPM §3). Skip w≤0 alebo r≤0.
  type Rec = { id: string; nazov: string; best1RM: number; hw: number; hr: number; bestVol: number }
  const rekMap = new Map<string, Rec>()
  for (const t of treningy) {
    for (const s of t.serie) {
      const w = Number(s.hmotnost)
      const r = s.opakovania
      if (w <= 0 || r <= 0) continue
      const e = rekMap.get(s.cvikId) ?? { id: s.cvikId, nazov: s.cvik.nazov, best1RM: 0, hw: 0, hr: 0, bestVol: 0 }
      e.best1RM = Math.max(e.best1RM, w * (1 + r / 30))
      if (w > e.hw || (w === e.hw && r > e.hr)) {
        e.hw = w
        e.hr = r
      }
      e.bestVol = Math.max(e.bestVol, w * r)
      rekMap.set(s.cvikId, e)
    }
  }
  const rekordy = [...rekMap.values()].sort((a, b) => b.best1RM - a.best1RM)

  // Mesačný kalendár aktuálneho mesiaca.
  const dnes = new Date()
  const rok = dnes.getFullYear()
  const mesiac = dnes.getMonth()
  const offset = (new Date(rok, mesiac, 1).getDay() + 6) % 7
  const pocetDni = new Date(rok, mesiac + 1, 0).getDate()
  const odtrenovane = new Set(
    treningy.filter((t) => t.zaciatok.getFullYear() === rok && t.zaciatok.getMonth() === mesiac).map((t) => t.zaciatok.getDate())
  )

  const fmt = (n: number) => +n.toFixed(1)

  return (
    <Section>
      <SectionHeading eyebrow="Členská zóna" title="História" />

      {/* Kalendár */}
      <Card className="mb-8">
        <p className="display mb-3 text-base text-ink">{dnes.toLocaleDateString('sk-SK', { month: 'long', year: 'numeric' })}</p>
        <div className="grid grid-cols-7 gap-1 text-center">
          {DNI.map((d) => (
            <div key={d} className="text-xs uppercase tracking-[0.1em] text-ink-dim">
              {d}
            </div>
          ))}
          {Array.from({ length: offset }).map((_, i) => (
            <div key={`b${i}`} />
          ))}
          {Array.from({ length: pocetDni }).map((_, i) => {
            const den = i + 1
            const trenoval = odtrenovane.has(den)
            const dnesok = den === dnes.getDate()
            return (
              <div
                key={den}
                className={cn(
                  'grid aspect-square place-items-center rounded-lg text-sm [font-variant-numeric:tabular-nums]',
                  trenoval ? 'bg-gold text-bg' : 'text-ink-dim',
                  dnesok && !trenoval && 'ring-1 ring-gold-dim'
                )}
              >
                {den}
              </div>
            )
          })}
        </div>
      </Card>

      {/* Rekordy */}
      <h2 className="display mb-4 text-xl text-ink">Osobné rekordy</h2>
      {rekordy.length > 0 ? (
        <div className="mb-8 overflow-x-auto">
          <table className="w-full min-w-[34rem] text-sm">
            <thead>
              <tr className="border-b border-line text-left text-ink-dim">
                <th className="py-2 pr-4 font-medium">Cvik</th>
                <th className="py-2 pr-4 font-medium">Odhad 1RM</th>
                <th className="py-2 pr-4 font-medium">Najťažšia séria</th>
                <th className="py-2 font-medium">Najlepší objem série</th>
              </tr>
            </thead>
            <tbody className="[font-variant-numeric:tabular-nums]">
              {rekordy.map((r) => (
                <tr key={r.id} className="border-b border-line/60">
                  <td className="py-2 pr-4 text-ink">{r.nazov}</td>
                  <td className="py-2 pr-4 text-ink-dim">{fmt(r.best1RM)} kg</td>
                  <td className="py-2 pr-4 text-ink-dim">
                    {fmt(r.hw)} kg × {r.hr}
                  </td>
                  <td className="py-2 text-ink-dim">{fmt(r.bestVol)} kg</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="mb-8 text-sm text-ink-dim">Rekordy sa objavia po prvom tréningu.</p>
      )}

      {/* Zoznam tréningov */}
      <h2 className="display mb-4 text-xl text-ink">Tréningy</h2>
      {treningy.length > 0 ? (
        <div className="flex flex-col gap-3">
          {treningy.map((t) => (
            <Link key={t.id} href={`/klub/historia/${t.id}`} className="block">
              <Card className="transition-colors hover:border-gold-dim">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="display text-lg text-ink">{t.nazov}</span>
                  <span className="text-sm text-ink-dim [font-variant-numeric:tabular-nums]">
                    {t.zaciatok.toLocaleDateString('sk-SK')} · {trvanie(t.zaciatok, t.koniec)} · {t.serie.length} sérií ·{' '}
                    {+objem(t.serie).toFixed(0)} kg
                  </span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-sm text-ink-dim">Zatiaľ žiadny ukončený tréning.</p>
      )}
    </Section>
  )
}
