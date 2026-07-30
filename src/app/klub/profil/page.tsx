import type { Metadata } from 'next'
import { Section } from '@/components/ui/Section'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Notice } from '@/components/ui/Notice'

export const metadata: Metadata = {
  title: 'Profil',
}

export default function KlubProfilPage() {
  return (
    <Section>
      <SectionHeading eyebrow="Členská zóna" title="Profil" />
      <Notice variant="info">Pripravuje sa.</Notice>
    </Section>
  )
}
