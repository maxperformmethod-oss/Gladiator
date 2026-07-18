import type { Metadata } from 'next'
import { Section } from '@/components/ui/Section'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Card } from '@/components/ui/Card'
import { Reveal } from '@/components/ui/Reveal'
import { PlaceholderImage } from '@/components/ui/PlaceholderImage'
import { TbdBadge } from '@/components/ui/TbdBadge'
import { ButtonLink } from '@/components/ui/Button'
import { BRAND, VYBAVENIE_ZONY } from '@/lib/gym'

export const metadata: Metadata = {
  title: 'O gyme',
  description: `${BRAND.nazov} ${BRAND.pobocka} — ${BRAND.tagline}, est. ${BRAND.zalozene}.`,
}

export default function OGymePage() {
  return (
    <>
      <Section>
        <SectionHeading
          eyebrow="O gyme"
          title={
            <>
              Body Building <span className="gold-text">Factory</span>
            </>
          }
          lead={`„${BRAND.claim}." — to nie je slogan na stenu, to je dôvod, prečo ${BRAND.nazov} od roku ${BRAND.zalozene} existuje.`}
        />
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <Reveal>
            <div className="space-y-4 text-ink-dim">
              <p>
                Gladiator Gym {BRAND.pobocka} je industriálna tréningová aréna —
                surový priestor s hexagónovými LED svetlami, kde sa chodí makať,
                nie pózovať. Žiadny gýč, žiadna generická fitness šablóna.
              </p>
              <p>
                Trénuje tu každý, kto to myslí vážne — od serióznych cvičencov cez
                študentov až po seniorov. Začiatočník dostane vedenie, skúsený
                cvičenec priestor a záťaž, akú potrebuje.
              </p>
              <p className="text-sm">
                Plocha gymu: <TbdBadge /> · Počet strojov: <TbdBadge /> — presné
                čísla doplníme po potvrdení majiteľom.
              </p>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <PlaceholderImage label="Interiér arény — celkový záber" aspect="aspect-[4/3]" />
          </Reveal>
        </div>
      </Section>

      <Section className="border-t border-line">
        <SectionHeading
          eyebrow="Zóny"
          title="Čo ťa vnútri čaká"
          lead="Štyri tréningové zóny — detailne v sekcii Vybavenie."
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {VYBAVENIE_ZONY.map((z, i) => (
            <Reveal key={z.slug} delay={i * 0.06}>
              <Card className="h-full">
                <p className="display text-lg text-ink">{z.nazov}</p>
                <p className="mt-2 text-sm text-ink-dim">{z.popis}</p>
              </Card>
            </Reveal>
          ))}
        </div>
        <div className="mt-8">
          <ButtonLink href="/vybavenie" variant="outline">
            Detail vybavenia
          </ButtonLink>
        </div>
      </Section>
    </>
  )
}
