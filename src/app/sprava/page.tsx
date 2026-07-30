import type { Metadata } from 'next'
import { Section } from '@/components/ui/Section'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Notice } from '@/components/ui/Notice'

export const metadata: Metadata = {
  title: 'Správa klubu',
}

export default function SpravaPage() {
  return (
    <Section>
      <SectionHeading eyebrow="Správa klubu" title="Správa klubu" />
      <Notice variant="info">Pripravuje sa.</Notice>
    </Section>
  )
}
