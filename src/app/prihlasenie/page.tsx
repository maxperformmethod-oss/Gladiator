import type { Metadata } from 'next'
import { Section } from '@/components/ui/Section'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Notice } from '@/components/ui/Notice'

export const metadata: Metadata = {
  title: 'Prihlásenie',
  robots: { index: false, follow: false },
}

export default function PrihlaseniePage() {
  return (
    <Section>
      <SectionHeading eyebrow="Členská zóna" title="Prihlásenie" />
      <Notice variant="info">Pripravuje sa.</Notice>
    </Section>
  )
}
