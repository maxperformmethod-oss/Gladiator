import type { Metadata } from 'next'
import { Section } from '@/components/ui/Section'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Reveal } from '@/components/ui/Reveal'
import { PhotoReveal } from '@/components/ui/PhotoReveal'
import { PlaceholderImage } from '@/components/ui/PlaceholderImage'
import { ButtonLink } from '@/components/ui/Button'
import { SLUZBY } from '@/lib/gym'

export const metadata: Metadata = {
  title: 'Služby',
  description:
    'Osobný tréning, skupinové lekcie, spinning, funkčná zóna a solárium.',
}

export default function SluzbyPage() {
  return (
    <Section>
      <SectionHeading
        eyebrow="Služby"
        title="Vyber si svoju cestu"
        lead="Každá služba má jedno spoločné — výsledok. Forma je na tebe."
      />
      <div className="space-y-10">
        {SLUZBY.map((s, i) => (
          <Reveal key={s.slug}>
            <div
              className={`grid items-center gap-6 md:grid-cols-2 ${
                i % 2 === 1 ? 'md:[&>*:first-child]:order-2' : ''
              }`}
            >
              {s.foto ? (
                <PhotoReveal
                  src={s.foto}
                  alt={`${s.nazov} v Gladiator Gyme`}
                  aspect="aspect-[16/9]"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 552px"
                  imgClassName={s.fotoPozicia}
                />
              ) : (
                <PlaceholderImage label={s.nazov} aspect="aspect-[16/9]" />
              )}
              <div>
                <p className="display text-2xl text-ink md:text-3xl">{s.nazov}</p>
                <p className="mt-3 max-w-md text-ink-dim">{s.popis}</p>
                <div className="mt-6">
                  <ButtonLink href="/rezervacia" variant="outline">
                    Mám záujem
                  </ButtonLink>
                </div>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  )
}
