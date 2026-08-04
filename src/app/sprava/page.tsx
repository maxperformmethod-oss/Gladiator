import type { Metadata } from 'next'
import { Section } from '@/components/ui/Section'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Card } from '@/components/ui/Card'
import { ButtonLink } from '@/components/ui/Button'

export const metadata: Metadata = {
  title: 'Správa klubu',
}

const polozky = [
  { href: '/sprava/cviky', nazov: 'Cviky', popis: 'Katalóg globálnych cvikov.', aktivne: true },
  { href: '/sprava/clenovia', nazov: 'Členovia', popis: 'Pripravuje sa.', aktivne: false },
  { href: '/sprava/vyzvy', nazov: 'Výzvy', popis: 'Mesačná výzva a schvaľovanie zápisov.', aktivne: true },
  { href: '/sprava/vysledky', nazov: 'Výsledky', popis: 'Pripravuje sa.', aktivne: false },
]

export default function SpravaPage() {
  return (
    <Section>
      <SectionHeading eyebrow="Správa klubu" title="Správa" />
      <div className="grid gap-4 sm:grid-cols-2">
        {polozky.map((p) => (
          <Card key={p.href}>
            <h2 className="display text-lg text-ink">{p.nazov}</h2>
            <p className="mt-1 text-sm text-ink-dim">{p.popis}</p>
            {p.aktivne ? (
              <ButtonLink href={p.href} variant="outline" className="mt-4">
                Otvoriť
              </ButtonLink>
            ) : (
              <span className="mt-4 inline-block text-xs uppercase tracking-[0.14em] text-ink-faint">
                Pripravuje sa
              </span>
            )}
          </Card>
        ))}
      </div>
    </Section>
  )
}
