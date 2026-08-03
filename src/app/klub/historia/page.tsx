import type { Metadata } from 'next'
import { Prisma } from '@prisma/client'
import { Section } from '@/components/ui/Section'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Card } from '@/components/ui/Card'
import { prisma } from '@/lib/prisma'
import { requireClen } from '@/server/auth'

export const metadata: Metadata = { title: 'História' }

function trvanie(zaciatok: Date, koniec: Date): string {
  const min = Math.max(0, Math.round((koniec.getTime() - zaciatok.getTime()) / 60000))
  const h = Math.floor(min / 60)
  const m = min % 60
  return h > 0 ? `${h} h ${m} min` : `${m} min`
}

// Zaokrúhlenie až pri zobrazení; výpočet prebehol presne (NUMERIC / Decimal).
const fmt = (d: Prisma.Decimal | string) => +Number(d).toFixed(1)

type PR = {
  id: string
  nazov: string
  max_hmotnost: Prisma.Decimal | string
  max_1rm: Prisma.Decimal | string
  max_objem: Prisma.Decimal | string
}

export default async function HistoriaPage() {
  const clen = await requireClen()

  const treningy = await prisma.trening.findMany({
    where: { clenId: clen.id, koniec: { not: null } },
    orderBy: { zaciatok: 'desc' },
    include: { serie: { include: { cvik: true }, orderBy: { poradie: 'asc' } } },
  })

  // Osobné rekordy — POČÍTANÉ v SQL (Postgres NUMERIC = presné), filtrované cez clenId.
  const rekordy = await prisma.$queryRaw<PR[]>`
    SELECT c.id, c.nazov,
           max(s.hmotnost)                             AS max_hmotnost,
           max(s.hmotnost * (1 + s.opakovania / 30.0)) AS max_1rm,
           max(s.opakovania * s.hmotnost)              AS max_objem
    FROM "Seria" s
    JOIN "Trening" t ON t.id = s."treningId"
    JOIN "Cvik" c    ON c.id = s."cvikId"
    WHERE t."clenId" = ${clen.id}
    GROUP BY c.id, c.nazov
    ORDER BY c.nazov
  `

  return (
    <Section>
      <SectionHeading eyebrow="Členská zóna" title="História" />

      <h2 className="display mb-4 text-xl text-ink">Osobné rekordy</h2>
      {rekordy.length > 0 ? (
        <div className="mb-10 overflow-x-auto">
          <table className="w-full min-w-[32rem] text-sm">
            <thead>
              <tr className="border-b border-line text-left text-ink-dim">
                <th className="py-2 pr-4 font-medium">Cvik</th>
                <th className="py-2 pr-4 font-medium">Najťažšia séria</th>
                <th className="py-2 pr-4 font-medium">Odhad 1RM (Epley)</th>
                <th className="py-2 font-medium">Najlepší objem série</th>
              </tr>
            </thead>
            <tbody>
              {rekordy.map((r) => (
                <tr key={r.id} className="border-b border-line/60">
                  <td className="py-2 pr-4 text-ink">{r.nazov}</td>
                  <td className="py-2 pr-4 text-ink-dim">{fmt(r.max_hmotnost)} kg</td>
                  <td className="py-2 pr-4 text-ink-dim">{fmt(r.max_1rm)} kg</td>
                  <td className="py-2 text-ink-dim">{fmt(r.max_objem)} kg</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="mb-10 text-sm text-ink-dim">Zatiaľ žiadne série — rekordy sa objavia po prvom tréningu.</p>
      )}

      <h2 className="display mb-4 text-xl text-ink">Odcvičené tréningy</h2>
      {treningy.length > 0 ? (
        <div className="flex flex-col gap-3">
          {treningy.map((t) => {
            const objem = t.serie.reduce(
              (acc, s) => acc.add(s.hmotnost.mul(s.opakovania)),
              new Prisma.Decimal(0)
            )
            const dlzka = t.koniec ? trvanie(t.zaciatok, t.koniec) : '—'
            return (
              <Card key={t.id}>
                <details>
                  <summary className="flex cursor-pointer flex-wrap items-baseline justify-between gap-2">
                    <span className="display text-lg text-ink">{t.nazov}</span>
                    <span className="text-sm text-ink-dim">
                      {t.zaciatok.toLocaleDateString('sk-SK')} · {dlzka} · {t.serie.length} sérií ·{' '}
                      {+objem.toFixed(0)} kg
                    </span>
                  </summary>
                  <ul className="mt-3 flex flex-col gap-1 text-sm text-ink-dim">
                    {t.serie.map((s) => (
                      <li key={s.id}>
                        {s.poradie}. {s.cvik.nazov} — {fmt(s.hmotnost)} kg × {s.opakovania}
                      </li>
                    ))}
                  </ul>
                </details>
              </Card>
            )
          })}
        </div>
      ) : (
        <p className="text-sm text-ink-dim">Zatiaľ žiadny ukončený tréning.</p>
      )}
    </Section>
  )
}
