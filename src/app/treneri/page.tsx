import type { Metadata } from 'next'
import { Section } from '@/components/ui/Section'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Reveal } from '@/components/ui/Reveal'
import { Notice } from '@/components/ui/Notice'
import { TrainerCard } from '@/components/TrainerCard'
import { BRAND, TRENERI, TRENERI_OVERENI } from '@/lib/gym'

export const metadata: Metadata = {
  title: 'Tréneri',
  description: `Tréneri ${BRAND.nazov} ${BRAND.pobocka}.`,
}

export default function TreneriPage() {
  return (
    <Section>
      <SectionHeading
        eyebrow="Tím"
        title="Tréneri"
        lead="Ľudia, ktorí ťa naučia techniku, postavia plán a dohliadnu na progres."
      />
      {!TRENERI_OVERENI && (
        <Notice className="mb-8">
          Mená pochádzajú z podkladov — priradenie k pobočke {BRAND.pobocka} zatiaľ
          nie je overené majiteľom. Profily (foto, bio, špecializácia) doplníme po
          potvrdení.
        </Notice>
      )}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
        {TRENERI.map((t, i) => (
          <Reveal key={t.slug} delay={(i % 5) * 0.05}>
            <TrainerCard trener={t} />
          </Reveal>
        ))}
      </div>
    </Section>
  )
}
