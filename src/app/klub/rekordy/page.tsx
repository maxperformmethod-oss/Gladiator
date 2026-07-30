import type { Metadata } from 'next'
import { Section } from '@/components/ui/Section'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Notice } from '@/components/ui/Notice'

export const metadata: Metadata = {
  title: 'Rekordy',
}

export default function KlubRekordyPage() {
  return (
    <Section>
      <SectionHeading eyebrow="Členská zóna" title="Rekordy" />
      <Notice variant="info">Pripravuje sa.</Notice>
    </Section>
  )
}
