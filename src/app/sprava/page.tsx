import type { Metadata } from 'next'
import { Section } from '@/components/ui/Section'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Card } from '@/components/ui/Card'
import { ButtonLink } from '@/components/ui/Button'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/server/auth'

export const metadata: Metadata = { title: 'Správa klubu' }

export default async function SpravaPage() {
  await requireAdmin()

  // Zápisy čakajúce na posúdenie — nech admin vidí, že je čo schvaľovať.
  const cakajuce = await prisma.vyzvaZapis.count({ where: { stav: 'CAKA' } })

  const polozky = [
    { href: '/sprava/cviky', nazov: 'Cviky', popis: 'Globálny katalóg cvikov (zoskupený podľa partie).', badge: null as string | null },
    {
      href: '/sprava/vyzvy',
      nazov: 'Výzvy',
      popis: 'Mesačná výzva a schvaľovanie zápisov členov.',
      badge: cakajuce > 0 ? `${cakajuce} čakajú` : null,
    },
  ]

  return (
    <Section>
      <SectionHeading
        eyebrow="Správa klubu"
        title="Správa"
        lead="Admin spravuje dve veci: globálny katalóg cvikov a mesačné výzvy (vrátane schvaľovania zápisov). Nič iné — tréningy, história a osobné rekordy členov žijú v ich prehliadači a neschvaľujú sa."
      />
      <div className="grid gap-4 sm:grid-cols-2">
        {polozky.map((p) => (
          <Card key={p.href}>
            <div className="flex items-center justify-between gap-3">
              <h2 className="display text-lg text-ink">{p.nazov}</h2>
              {p.badge && (
                <span className="tnum rounded-full border border-gold/40 bg-gold/10 px-2.5 py-1 text-xs font-bold text-gold-hi">
                  {p.badge}
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-ink-dim">{p.popis}</p>
            <ButtonLink href={p.href} variant="outline" className="mt-4">
              Otvoriť
            </ButtonLink>
          </Card>
        ))}
      </div>
    </Section>
  )
}
