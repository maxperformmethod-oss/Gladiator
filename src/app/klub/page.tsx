import type { Metadata } from 'next'
import { Prisma } from '@prisma/client'
import { Section } from '@/components/ui/Section'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Card } from '@/components/ui/Card'
import { Button, ButtonLink } from '@/components/ui/Button'
import { prisma } from '@/lib/prisma'
import { requireClen } from '@/server/auth'
import { odhlas } from '@/server/actions/auth'

export const metadata: Metadata = { title: 'Klub' }

const dateKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`

function pondelok(): Date {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7)) // 0 = pondelok
  return d
}

function trvanie(zaciatok: Date, koniec: Date | null): string {
  if (!koniec) return '—'
  const min = Math.max(0, Math.round((koniec.getTime() - zaciatok.getTime()) / 60000))
  return min >= 60 ? `${Math.floor(min / 60)} h ${min % 60} min` : `${min} min`
}

const objemTreningu = (serie: { hmotnost: Prisma.Decimal; opakovania: number }[]) =>
  serie.reduce((acc, s) => acc.add(s.hmotnost.mul(s.opakovania)), new Prisma.Decimal(0))

export default async function KlubPage() {
  const clen = await requireClen()

  const treningy = await prisma.trening.findMany({
    where: { clenId: clen.id, koniec: { not: null } },
    orderBy: { zaciatok: 'desc' },
    include: { serie: { select: { hmotnost: true, opakovania: true } } },
  })

  const posledny = treningy[0]
  const tento = treningy.filter((t) => t.zaciatok >= pondelok()).length
  const pred30 = new Date(Date.now() - 30 * 24 * 3600 * 1000)
  const objem30 = treningy
    .filter((t) => t.zaciatok >= pred30)
    .reduce((acc, t) => acc.add(objemTreningu(t.serie)), new Prisma.Decimal(0))

  // Séria dní — počet po sebe idúcich dní s aspoň jedným tréningom.
  const dni = new Set(treningy.map((t) => dateKey(t.zaciatok)))
  let seriaDni = 0
  if (posledny) {
    const d = new Date(posledny.zaciatok)
    d.setHours(0, 0, 0, 0)
    while (dni.has(dateKey(d))) {
      seriaDni++
      d.setDate(d.getDate() - 1)
    }
  }

  const dlazdice = [
    { label: 'Tréningy tento týždeň', hodnota: String(tento) },
    { label: 'Séria dní', hodnota: String(seriaDni) },
    { label: 'Objem za 30 dní', hodnota: `${+objem30.toFixed(0)} kg` },
  ]

  return (
    <Section>
      <SectionHeading eyebrow="Členská zóna" title="Prehľad" />

      {!posledny ? (
        <Card>
          <p className="text-ink-dim">
            Ešte nemáš žiadny tréning. Začni prvý — čísla sa objavia samy.
          </p>
          <ButtonLink href="/klub/trening" className="mt-4">
            Začať tréning
          </ButtonLink>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {dlazdice.map((d) => (
            <Card key={d.label}>
              <p className="text-xs uppercase tracking-[0.14em] text-ink-dim">{d.label}</p>
              <p className="display mt-2 text-3xl text-gold">{d.hodnota}</p>
            </Card>
          ))}
          <Card>
            <p className="text-xs uppercase tracking-[0.14em] text-ink-dim">Posledný tréning</p>
            <p className="display mt-2 text-lg text-ink">{posledny.nazov}</p>
            <p className="mt-1 text-sm text-ink-dim">
              {posledny.zaciatok.toLocaleDateString('sk-SK')} · {trvanie(posledny.zaciatok, posledny.koniec)} ·{' '}
              {+objemTreningu(posledny.serie).toFixed(0)} kg
            </p>
          </Card>
        </div>
      )}

      <div className="mt-8 flex flex-wrap items-center gap-3">
        {clen.rola === 'ADMIN' && (
          <ButtonLink href="/sprava" variant="outline">
            Správa
          </ButtonLink>
        )}
        <form action={odhlas}>
          <Button type="submit" variant="ghost">
            Odhlásiť sa
          </Button>
        </form>
      </div>
    </Section>
  )
}
