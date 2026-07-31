import type { Metadata } from 'next'
import { Section } from '@/components/ui/Section'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Notice } from '@/components/ui/Notice'

export const metadata: Metadata = {
  title: 'Klub',
}

export default function KlubPage() {
  return (
    <Section>
      <SectionHeading eyebrow="Členská zóna" title="Klub" />
      <Notice variant="info">Pripravuje sa.</Notice>
    </Section>
  )
}
