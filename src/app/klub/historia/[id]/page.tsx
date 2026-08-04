import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Prisma } from '@prisma/client'
import { Section } from '@/components/ui/Section'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Card } from '@/components/ui/Card'
import { Notice } from '@/components/ui/Notice'
import { prisma } from '@/lib/prisma'
import { requireClen } from '@/server/auth'

export const metadata: Metadata = { title: 'Tréning', robots: { index: false } }

const objemDecimal = (serie: { hmotnost: Prisma.Decimal; opakovania: number }[]) =>
  serie.reduce((a, s) => a.add(s.hmotnost.mul(s.opakovania)), new Prisma.Decimal(0))

function trvanie(z: Date, k: Date | null): string {
  if (!k) return '—'
  const min = Math.max(0, Math.round((k.getTime() - z.getTime()) / 60000))
  return min >= 60 ? `${Math.floor(min / 60)} h ${min % 60} min` : `${min} min`
}

export default async function TreningDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const clen = await requireClen()

  // Bezpečnosť: filtrujeme cez clenId — cudzí tréning sa nezobrazí (404).
  const trening = await prisma.trening.findFirst({
    where: { id, clenId: clen.id, koniec: { not: null } },
    include: { serie: { where: { dokoncena: true }, include: { cvik: true }, orderBy: { poradie: 'asc' } } },
  })
  if (!trening) notFound()

  const objem = objemDecimal(trening.serie)

  // Najlepší 1RM za cvik v tomto tréningu.
  const tento = new Map<string, { nazov: string; oneRM: number }>()
  for (const s of trening.serie) {
    const w = Number(s.hmotnost)
    const r = s.opakovania
    if (w <= 0 || r <= 0) continue
    const oneRM = w * (1 + r / 30)
    const e = tento.get(s.cvikId)
    if (!e || oneRM > e.oneRM) tento.set(s.cvikId, { nazov: s.cvik.nazov, oneRM })
  }

  // Najlepší 1RM za cvik zo STARŠÍCH tréningov (pred týmto).
  const starsie = await prisma.seria.findMany({
    where: { dokoncena: true, trening: { clenId: clen.id, koniec: { lt: trening.koniec ?? new Date() } } },
    select: { cvikId: true, hmotnost: true, opakovania: true },
  })
  const starsiBest = new Map<string, number>()
  for (const s of starsie) {
    const w = Number(s.hmotnost)
    const r = s.opakovania
    if (w <= 0 || r <= 0) continue
    starsiBest.set(s.cvikId, Math.max(starsiBest.get(s.cvikId) ?? 0, w * (1 + r / 30)))
  }
  const noveRekordy = [...tento.entries()].filter(([cvikId, v]) => v.oneRM > (starsiBest.get(cvikId) ?? 0))

  // Porovnanie s posledným tréningom toho istého plánu.
  let poslednyRovnaky: { objem: number } | null = null
  if (trening.planId) {
    const p = await prisma.trening.findFirst({
      where: { clenId: clen.id, planId: trening.planId, id: { not: trening.id }, koniec: { lt: trening.koniec ?? new Date() } },
      orderBy: { koniec: 'desc' },
      include: { serie: { where: { dokoncena: true }, select: { hmotnost: true, opakovania: true } } },
    })
    if (p) poslednyRovnaky = { objem: +objemDecimal(p.serie).toFixed(0) }
  }

  const skupiny = new Map<string, { nazov: string; serie: typeof trening.serie }>()
  for (const s of trening.serie) {
    if (!skupiny.has(s.cvikId)) skupiny.set(s.cvikId, { nazov: s.cvik.nazov, serie: [] })
    skupiny.get(s.cvikId)!.serie.push(s)
  }
  const tentoObjem = +objem.toFixed(0)

  return (
    <Section>
      <SectionHeading eyebrow="Členská zóna" title={trening.nazov} />

      <p className="mb-6 text-sm text-ink-dim [font-variant-numeric:tabular-nums]">
        {trening.zaciatok.toLocaleDateString('sk-SK')} · {trvanie(trening.zaciatok, trening.koniec)} ·{' '}
        {trening.serie.length} sérií · <strong className="text-ink">{tentoObjem} kg</strong> objem
      </p>

      {/* Súhrn */}
      {noveRekordy.length > 0 && (
        <Notice variant="info" className="mb-6">
          <strong>Nové rekordy:</strong>{' '}
          {noveRekordy.map(([, v]) => `${v.nazov} (1RM ${+v.oneRM.toFixed(1)} kg)`).join(' · ')}
        </Notice>
      )}
      {poslednyRovnaky && (
        <p className="mb-6 text-sm text-ink-dim">
          Objem oproti poslednému rovnakému plánu: {tentoObjem} kg vs {poslednyRovnaky.objem} kg (
          {tentoObjem - poslednyRovnaky.objem >= 0 ? '+' : ''}
          {tentoObjem - poslednyRovnaky.objem} kg).
        </p>
      )}

      <div className="flex flex-col gap-3">
        {[...skupiny.entries()].map(([cvikId, g]) => (
          <Card key={cvikId}>
            <h3 className="display text-lg text-ink">{g.nazov}</h3>
            <ul className="mt-2 flex flex-col gap-1 text-sm text-ink-dim [font-variant-numeric:tabular-nums]">
              {g.serie.map((s) => (
                <li key={s.id}>
                  {s.poradie}. {+Number(s.hmotnost).toFixed(1)} kg × {s.opakovania}
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>

      <p className="mt-8">
        <Link href="/klub/historia" className="text-gold underline-offset-4 hover:underline">
          ← Späť na históriu
        </Link>
      </p>
    </Section>
  )
}
