import type { Metadata } from 'next'
import { Section } from '@/components/ui/Section'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Card } from '@/components/ui/Card'
import { ButtonLink } from '@/components/ui/Button'
import { AppkaInstall } from '@/components/AppkaInstall'

export const metadata: Metadata = {
  title: 'Appka',
  description:
    'Tréningový denník Gladiator Gym — plány, rekordy, progres, mesačná výzva a rebríček. Nainštaluj si appku na plochu.',
}

const funkcie = [
  { nazov: 'Tréningový denník', popis: 'Plány, série, opakovania a váhy — všetko po ruke počas tréningu.' },
  { nazov: 'Rekordy a progres', popis: 'Osobné rekordy a grafy pokroku sa počítajú z tvojich tréningov.' },
  { nazov: 'Časovač odpočinku', popis: 'Prestávky medzi sériami so zvukom, na podporovaných zariadeniach aj vibráciou.' },
  { nazov: 'Mesačná výzva', popis: 'Zapoj sa do výzvy gymu a porovnaj sa s ostatnými.' },
  { nazov: 'Rebríček', popis: 'Poradie členov podľa výsledkov, ktoré potvrdzuje obsluha.' },
]

export default function AppkaPage() {
  return (
    <Section>
      <SectionHeading
        eyebrow="Členská appka"
        title="Tréning po ruke"
        lead="Gladiator appka je tvoj tréningový denník. Beží v prehliadači a dá sa pridať na plochu ako samostatná aplikácia — tréningové dáta zostávajú v tvojom zariadení."
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_minmax(0,26rem)] lg:items-start">
        <div className="grid gap-3 sm:grid-cols-2">
          {funkcie.map((f) => (
            <Card key={f.nazov}>
              <h2 className="display text-base text-ink">{f.nazov}</h2>
              <p className="mt-1 text-sm text-ink-dim">{f.popis}</p>
            </Card>
          ))}
        </div>

        <div className="flex flex-col gap-4">
          <AppkaInstall />
          <Card>
            <p className="text-sm text-ink-dim">
              Už máš účet? Prihlás sa a začni trénovať.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <ButtonLink href="/klub">Otvoriť appku</ButtonLink>
              <ButtonLink href="/registracia" variant="outline">
                Registrácia
              </ButtonLink>
            </div>
          </Card>
        </div>
      </div>
    </Section>
  )
}
