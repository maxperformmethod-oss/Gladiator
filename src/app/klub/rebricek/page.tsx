import type { Metadata } from 'next'
import { Section } from '@/components/ui/Section'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Notice } from '@/components/ui/Notice'

export const metadata: Metadata = {
  title: 'Rebríček',
}

export default function KlubRebricekPage() {
  return (
    <Section>
      <SectionHeading eyebrow="Členská zóna" title="Rebríček" />
      <Notice variant="info">Pripravuje sa.</Notice>
    </Section>
  )
}
