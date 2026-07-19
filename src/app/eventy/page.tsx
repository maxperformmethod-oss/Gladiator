import type { Metadata } from 'next'
import { CalendarDays } from 'lucide-react'
import { Section } from '@/components/ui/Section'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Card } from '@/components/ui/Card'
import { Reveal } from '@/components/ui/Reveal'
import { PhotoReveal } from '@/components/ui/PhotoReveal'
import { ButtonLink } from '@/components/ui/Button'
import { BRAND, EVENTY } from '@/lib/gym'

export const metadata: Metadata = {
  title: 'Eventy a novinky',
  description: `Akcie a novinky ${BRAND.nazov} ${BRAND.pobocka}.`,
}

export default function EventyPage() {
  return (
    <Section>
      <SectionHeading
        eyebrow="Komunita"
        title="Eventy a novinky"
        lead="Súťaže, spoločné tréningy a akcie pobočky."
      />
      {EVENTY.length === 0 ? (
        <div className="space-y-6">
          {/* Atmosféra z minulej akcie — event fotka */}
          <PhotoReveal
            src="/fotky/event-dav.jpg"
            alt="Event v Gladiator Gyme — tlaky na lavičke pred davom divákov"
            aspect="aspect-[16/9] md:aspect-[21/9]"
            sizes="(max-width: 1152px) 100vw, 1104px"
            hoverZoom={false}
            caption="Takto vyzerá event v aréne"
          />
          <Reveal>
            <Card className="flex flex-col items-center gap-4 py-12 text-center">
              <CalendarDays size={32} className="text-gold" aria-hidden />
              <p className="display text-2xl text-ink">Pripravujeme</p>
              <p className="max-w-md text-sm text-ink-dim">
                Prvé eventy pobočky {BRAND.pobocka} zverejníme čoskoro. Medzitým sa
                zastav osobne — aréna je otvorená 7 dní v týždni.
              </p>
              <ButtonLink href="/kontakt" variant="outline" className="mt-2">
                Kde nás nájdeš
              </ButtonLink>
            </Card>
          </Reveal>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {EVENTY.map((e) => (
            <Reveal key={e.slug}>
              <Card>
                <p className="text-xs uppercase tracking-wider text-gold">
                  {e.datum ?? 'Termín upresníme'}
                </p>
                <p className="display mt-2 text-xl text-ink">{e.nazov}</p>
                <p className="mt-2 text-sm text-ink-dim">{e.popis}</p>
              </Card>
            </Reveal>
          ))}
        </div>
      )}
    </Section>
  )
}
