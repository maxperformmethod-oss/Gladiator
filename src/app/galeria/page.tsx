import type { Metadata } from 'next'
import Image from 'next/image'
import { Section } from '@/components/ui/Section'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Reveal } from '@/components/ui/Reveal'
import { GALERIA } from '@/lib/gym'

export const metadata: Metadata = {
  title: 'Galéria',
  description: 'Fotogaléria Gladiator Gym Lučenec — aréna, zóny, tréningy a eventy.',
}

/**
 * Editorial galéria:
 * - desktop: masonry cez CSS columns (rôzne výšky dlaždíc podľa skutočných
 *   rozmerov fotiek — žiadna gridová tabuľka, žiadny layout shift)
 * - mobil: horizontálny swipe so snapom (nie zmenšená masonry)
 */
export default function GaleriaPage() {
  return (
    <Section>
      <SectionHeading
        eyebrow="Galéria"
        title="Aréna na vlastné oči"
        lead="Priestory, tréningy aj eventy — všetko nafotené priamo v aréne."
      />

      {/* Mobil: swipe so snapom */}
      <div
        className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 md:hidden"
        aria-label="Galéria — posúvaj do strán"
      >
        {GALERIA.map((f) => (
          <figure
            key={f.src}
            className="relative aspect-[3/4] w-[80vw] shrink-0 snap-center overflow-hidden rounded-2xl border border-line bg-surface-2"
          >
            <Image
              src={f.src}
              alt={f.popis}
              fill
              sizes="80vw"
              className="object-cover"
            />
            <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-bg/90 to-transparent px-4 pb-3 pt-10 text-xs font-semibold uppercase tracking-[0.2em] text-ink">
              {f.popis}
            </figcaption>
          </figure>
        ))}
      </div>

      {/* Desktop: asymetrická masonry (CSS columns) s hover efektmi */}
      <div className="hidden gap-4 md:columns-2 lg:columns-3 md:[&>*]:mb-4 md:block">
        {GALERIA.map((f, i) => (
          <Reveal key={f.src} delay={(i % 3) * 0.06} className="break-inside-avoid">
            <figure className="group relative overflow-hidden rounded-2xl border border-line bg-surface-2 transition-colors duration-300 hover:border-gold-dim">
              <Image
                src={f.src}
                alt={f.popis}
                width={f.sirka}
                height={f.vyska}
                sizes="(max-width: 1024px) 50vw, 368px"
                className="h-auto w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
              />
              {/* Caption + zlatá linka — vysunie sa pri hoveri */}
              <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-2 bg-gradient-to-t from-bg/90 via-bg/40 to-transparent px-4 pb-3 pt-12 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                <span
                  className="mb-2 block h-0.5 w-8 origin-left scale-x-0 bg-gold transition-transform duration-500 group-hover:scale-x-100"
                  aria-hidden
                />
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-ink">
                  {f.popis}
                </span>
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </div>
    </Section>
  )
}
