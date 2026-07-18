import type { Metadata } from 'next'
import { Section } from '@/components/ui/Section'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Card } from '@/components/ui/Card'
import { Reveal } from '@/components/ui/Reveal'
import { Notice } from '@/components/ui/Notice'
import { ReservationForm } from '@/components/forms/ReservationForm'
import { KONTAKT } from '@/lib/gym'

export const metadata: Metadata = {
  title: 'Rezervácia',
  description: 'Rezervuj si osobný tréning, skupinovú lekciu alebo solárium.',
}

export default function RezervaciaPage() {
  return (
    <Section>
      <div className="mx-auto max-w-2xl">
        <SectionHeading
          eyebrow="Rezervácia"
          title="Rezervuj si termín"
          lead="Pošli dopyt — ozveme sa ti s potvrdením. Termín je záväzný až po našom potvrdení."
        />
        <Notice variant="info" className="mb-8">
          Automatické potvrdzovanie termínov zatiaľ nefunguje — formulár slúži na
          zber dopytov. Súrne termíny rieš telefonicky:{' '}
          <a href={KONTAKT.telefonHref} className="text-gold hover:text-gold-hi">
            {KONTAKT.telefon}
          </a>
          .
        </Notice>
        <Reveal>
          <Card>
            <ReservationForm />
          </Card>
        </Reveal>
      </div>
    </Section>
  )
}
