import type { Metadata } from 'next'
import { Section } from '@/components/ui/Section'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Notice } from '@/components/ui/Notice'

export const metadata: Metadata = {
  title: 'Obnova hesla',
  robots: { index: false, follow: false },
}

export default function ObnovaHeslaPage() {
  return (
    <Section>
      <SectionHeading eyebrow="Členská zóna" title="Obnova hesla" />
      <Notice variant="info">Pripravuje sa.</Notice>
    </Section>
  )
}
