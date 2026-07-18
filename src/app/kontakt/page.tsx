import type { Metadata } from 'next'
import { ExternalLink, Mail, MapPin, Phone } from 'lucide-react'
import { Section } from '@/components/ui/Section'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Card } from '@/components/ui/Card'
import { Reveal } from '@/components/ui/Reveal'
import { Notice } from '@/components/ui/Notice'
import { PlaceholderImage } from '@/components/ui/PlaceholderImage'
import { ContactForm } from '@/components/forms/ContactForm'
import { KONTAKT, OTVARACIE_HODINY } from '@/lib/gym'

export const metadata: Metadata = {
  title: 'Kontakt',
  description: `${KONTAKT.adresa} · ${KONTAKT.telefon}`,
}

export default function KontaktPage() {
  return (
    <Section>
      <SectionHeading eyebrow="Kontakt" title="Kde nás nájdeš" />

      {!KONTAKT.overene && (
        <Notice className="mb-8">
          Kontaktné údaje a otváracie hodiny čakajú na potvrdenie majiteľom.
        </Notice>
      )}

      <div className="grid gap-10 lg:grid-cols-2">
        <div className="space-y-6">
          <Reveal>
            <Card>
              <ul className="space-y-4 text-sm">
                <li className="flex items-start gap-3">
                  <MapPin size={18} className="mt-0.5 shrink-0 text-gold" aria-hidden />
                  <span className="text-ink-dim">{KONTAKT.adresa}</span>
                </li>
                <li className="flex items-start gap-3">
                  <Phone size={18} className="mt-0.5 shrink-0 text-gold" aria-hidden />
                  <a href={KONTAKT.telefonHref} className="text-ink-dim transition-colors hover:text-ink">
                    {KONTAKT.telefon}
                  </a>
                </li>
                <li className="flex items-start gap-3">
                  <Mail size={18} className="mt-0.5 shrink-0 text-gold" aria-hidden />
                  <a href={KONTAKT.emailHref} className="text-ink-dim transition-colors hover:text-ink">
                    {KONTAKT.email}
                  </a>
                </li>
              </ul>
              <div className="mt-6 border-t border-line pt-4">
                <p className="display mb-3 text-sm text-gold">Otváracie hodiny</p>
                <ul className="space-y-2 text-sm text-ink-dim">
                  {OTVARACIE_HODINY.polozky.map((h) => (
                    <li key={h.dni} className="flex justify-between gap-4">
                      <span>{h.dni}</span>
                      <span className="tnum text-ink">{h.cas}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          </Reveal>

          <Reveal delay={0.08}>
            <div>
              {/* Mapa bez externého embedu (GDPR/cookies) — odkaz do Google Maps. */}
              <PlaceholderImage
                label="Mapa — poloha gymu"
                note="MAPA — ZVÁŽIŤ EMBED PO GDPR KONTROLE"
                aspect="aspect-[16/9]"
              />
              <a
                href={KONTAKT.mapaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-2 text-sm text-gold transition-colors hover:text-gold-hi"
              >
                Otvoriť v Google Maps <ExternalLink size={14} />
              </a>
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.12}>
          <Card>
            <p className="display mb-6 text-xl text-ink">Napíš nám</p>
            <ContactForm />
          </Card>
        </Reveal>
      </div>
    </Section>
  )
}
