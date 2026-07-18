import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Hero } from '@/components/sections/Hero'
import { Section } from '@/components/ui/Section'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Card } from '@/components/ui/Card'
import { ButtonLink } from '@/components/ui/Button'
import { Reveal } from '@/components/ui/Reveal'
import { Notice } from '@/components/ui/Notice'
import { PlaceholderImage } from '@/components/ui/PlaceholderImage'
import { TrainerCard } from '@/components/TrainerCard'
import { BRAND, EVENTY, SLUZBY, TRENERI, TRENERI_OVERENI, USP } from '@/lib/gym'

export default function HomePage() {
  return (
    <>
      <Hero />

      {/* USP */}
      <Section className="border-t border-line">
        <SectionHeading
          eyebrow="Prečo Gladiator"
          title={
            <>
              Aréna, nie <span className="gold-text">fitko</span>
            </>
          }
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {USP.map((usp, i) => (
            <Reveal key={usp.nazov} delay={i * 0.06}>
              <Card className="h-full">
                <p className="display text-lg text-ink">{usp.nazov}</p>
                <p className="mt-2 text-sm text-ink-dim">{usp.popis}</p>
              </Card>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* Foto pás — placeholder za reálne fotky arény */}
      <Section className="pt-0">
        <Reveal>
          <PlaceholderImage
            label="Hlavná sála — industriálna aréna, hexagónové LED svetlá"
            aspect="aspect-[21/9]"
          />
        </Reveal>
      </Section>

      {/* Služby */}
      <Section className="border-t border-line">
        <SectionHeading
          eyebrow="Služby"
          title="Viac než len činky"
          lead="Osobné vedenie, skupinová energia aj regenerácia — všetko pod jednou strechou."
        />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {SLUZBY.map((s, i) => (
            <Reveal key={s.slug} delay={i * 0.05}>
              <Card className="h-full">
                <p className="display text-lg text-ink">{s.nazov}</p>
                <p className="mt-2 text-sm text-ink-dim">{s.popis}</p>
              </Card>
            </Reveal>
          ))}
          <Reveal delay={SLUZBY.length * 0.05}>
            <Link
              href="/sluzby"
              className="group flex h-full min-h-32 items-center justify-center gap-2 rounded-2xl border border-dashed border-line-strong p-6 text-sm uppercase tracking-wider text-ink-dim transition-colors hover:border-gold-dim hover:text-gold"
            >
              Všetky služby
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </Reveal>
        </div>
      </Section>

      {/* Tréneri preview */}
      <Section className="border-t border-line">
        <SectionHeading
          eyebrow="Tím"
          title="Tréneri"
          lead="Technika, plán a ťah na výsledok — pod dohľadom ľudí, ktorí tréningom žijú."
        />
        {!TRENERI_OVERENI && (
          <Notice className="mb-8">
            Zoznam trénerov pre pobočku {BRAND.pobocka} čaká na overenie majiteľom.
          </Notice>
        )}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
          {TRENERI.map((t, i) => (
            <Reveal key={t.slug} delay={i * 0.05}>
              <TrainerCard trener={t} compact />
            </Reveal>
          ))}
        </div>
        <div className="mt-8">
          <ButtonLink href="/treneri" variant="outline">
            Spoznaj celý tím
          </ButtonLink>
        </div>
      </Section>

      {/* Eventy preview */}
      <Section className="border-t border-line">
        <SectionHeading eyebrow="Komunita" title="Eventy a novinky" />
        {EVENTY.length === 0 ? (
          <Reveal>
            <Card className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="display text-lg text-ink">Pripravujeme</p>
                <p className="mt-1 text-sm text-ink-dim">
                  Súťaže, spoločné tréningy a akcie pobočky {BRAND.pobocka} pribudnú čoskoro.
                </p>
              </div>
              <ButtonLink href="/eventy" variant="ghost">
                Sledovať eventy <ArrowRight size={16} />
              </ButtonLink>
            </Card>
          </Reveal>
        ) : null}
      </Section>

      {/* Záverečné CTA */}
      <Section className="hex-pattern border-t border-line">
        <Reveal className="text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-gold">
            {BRAND.tagline}
          </p>
          <p className="display mx-auto max-w-3xl text-4xl text-ink md:text-6xl">
            Tvoj prvý tréning začína rozhodnutím
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <ButtonLink href="/rezervacia">Rezervuj si termín</ButtonLink>
            <ButtonLink href="/cennik" variant="outline">
              Pozri cenník
            </ButtonLink>
          </div>
        </Reveal>
      </Section>
    </>
  )
}
