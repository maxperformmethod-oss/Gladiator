import type { Metadata } from 'next'
import { Suspense } from 'react'
import { Section } from '@/components/ui/Section'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Reveal } from '@/components/ui/Reveal'
import { Notice } from '@/components/ui/Notice'
import { BuyButton } from '@/components/ui/BuyButton'
import { ButtonLink } from '@/components/ui/Button'
import { CancelNotice } from '@/components/CancelNotice'
import { CENNIK, CENNIK_OVERENY, CENNIK_SKUPINY, formatCena } from '@/lib/pricing'

export const metadata: Metadata = {
  title: 'Cenník a členstvá',
  description:
    'Jednorazové vstupy, permanentky a balíky vstupov — kúpiš pohodlne online.',
}

export default function CennikPage() {
  return (
    <Section>
      <SectionHeading
        eyebrow="Cenník"
        title="Cenník a členstvá"
        lead="Vstupy a permanentky kúpiš online — po zaplatení dostaneš číslo objednávky, ktoré nahlásiš na recepcii."
      />

      <Suspense fallback={null}>
        <CancelNotice />
      </Suspense>

      {!CENNIK_OVERENY && (
        <Notice className="mb-4">
          ÚDAJE ČAKAJÚCE NA POTVRDENIE — ceny pochádzajú z podkladov a majiteľ ich
          ešte finálne nepotvrdil.
        </Notice>
      )}
      <Notice variant="info" className="mb-10">
        Online platby bežia v <strong>testovacom režime</strong> — reálne platby
        spustíme po právnej kontrole obchodných podmienok.
      </Notice>

      <div className="space-y-14">
        {CENNIK_SKUPINY.map((skupina) => {
          const polozky = CENNIK.filter((p) => p.typ === skupina.typ)
          if (polozky.length === 0) return null
          return (
            <div key={skupina.typ}>
              <h2 className="display mb-6 text-2xl text-ink">{skupina.nazov}</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {polozky.map((p, i) => (
                  <Reveal key={p.kluc} delay={(i % 3) * 0.05}>
                    <div className="flex h-full flex-col rounded-2xl border border-line bg-surface p-6 transition-colors duration-300 hover:border-gold-dim">
                      <p className="display text-lg text-ink">{p.nazov}</p>
                      <p className="tnum mt-3 text-3xl font-semibold text-gold">
                        {formatCena(p.cenaCenty)}
                      </p>
                      {p.platnost && (
                        <p className="mt-1 text-xs uppercase tracking-wider text-ink-faint">
                          Platnosť: {p.platnost}
                        </p>
                      )}
                      {p.poznamka && (
                        <p className="mt-3 text-xs text-ink-dim">{p.poznamka}</p>
                      )}
                      <div className="mt-auto pt-5">
                        {p.kupitelneOnline && p.cenaCenty !== null ? (
                          <BuyButton kluc={p.kluc} nazov={p.nazov} />
                        ) : p.cenaCenty !== null ? (
                          <p className="rounded-xl border border-line px-4 py-3 text-center text-xs uppercase tracking-wider text-ink-dim">
                            Platba na recepcii
                          </p>
                        ) : (
                          <ButtonLink
                            href="/kontakt"
                            variant="outline"
                            className="w-full"
                          >
                            Opýtať sa na cenu
                          </ButtonLink>
                        )}
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-14 max-w-2xl text-sm text-ink-dim">
        <p className="display mb-2 text-base text-ink">Ako to funguje</p>
        <ol className="list-decimal space-y-1 pl-5">
          <li>Vyber si vstup, permanentku alebo balík a zaplať kartou online.</li>
          <li>Dostaneš potvrdenie platby a unikátne číslo objednávky.</li>
          <li>Na recepcii nahlás číslo objednávky alebo email — a ideš trénovať.</li>
        </ol>
      </div>
    </Section>
  )
}
