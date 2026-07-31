import type { Metadata } from 'next'
import { Section } from '@/components/ui/Section'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Notice } from '@/components/ui/Notice'

export const metadata: Metadata = {
  title: 'Výzva',
}

export default function KlubVyzvaPage() {
  return (
    <Section>
      <SectionHeading eyebrow="Členská zóna" title="Výzva" />
      <Notice variant="info">Pripravuje sa.</Notice>
    </Section>
  )
}
