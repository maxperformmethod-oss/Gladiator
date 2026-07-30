import type { Metadata } from 'next'
import { Section } from '@/components/ui/Section'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Notice } from '@/components/ui/Notice'

export const metadata: Metadata = {
  title: 'Členovia',
}

export default function SpravaClenoviaPage() {
  return (
    <Section>
      <SectionHeading eyebrow="Správa klubu" title="Členovia" />
      <Notice variant="info">Pripravuje sa.</Notice>
    </Section>
  )
}
