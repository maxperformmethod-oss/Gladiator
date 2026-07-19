import type { Metadata } from 'next'
import { Section } from '@/components/ui/Section'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Reveal } from '@/components/ui/Reveal'
import { PhotoReveal } from '@/components/ui/PhotoReveal'
import { PlaceholderImage } from '@/components/ui/PlaceholderImage'
import { TbdBadge } from '@/components/ui/TbdBadge'
import { VYBAVENIE_ZONY } from '@/lib/gym'

export const metadata: Metadata = {
  title: 'Vybavenie',
  description:
    'Tréningové zóny: voľné váhy, stroje, kardio a sprint dráha.',
}

export default function VybaveniePage() {
  return (
    <Section>
      <SectionHeading
        eyebrow="Vybavenie"
        title="Štyri zóny, jeden cieľ"
        lead={
          <>
            Konkrétne značky a počty strojov doplníme po potvrdení majiteľom
            <TbdBadge />
          </>
        }
      />
      <div className="grid gap-6 md:grid-cols-2">
        {VYBAVENIE_ZONY.map((z, i) => (
          <Reveal key={z.slug} delay={(i % 2) * 0.08}>
            <div className="group overflow-hidden rounded-2xl border border-line bg-surface transition-colors duration-300 hover:border-gold-dim">
              {z.foto ? (
                <PhotoReveal
                  src={z.foto}
                  alt={`Zóna ${z.nazov} v Gladiator Gyme`}
                  aspect="aspect-[16/9]"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 552px"
                  imgClassName={z.fotoPozicia}
                  className="rounded-none border-0"
                />
              ) : (
                <PlaceholderImage
                  label={`Zóna: ${z.nazov}`}
                  aspect="aspect-[16/9]"
                  className="rounded-none border-0"
                />
              )}
              <div className="p-6">
                <p className="display text-xl text-ink">{z.nazov}</p>
                <p className="mt-2 text-sm text-ink-dim">{z.popis}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  )
}
