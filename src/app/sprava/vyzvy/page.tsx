import type { Metadata } from 'next'
import { Section } from '@/components/ui/Section'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Notice } from '@/components/ui/Notice'

export const metadata: Metadata = {
  title: 'Výzvy',
}

export default function SpravaVyzvyPage() {
  return (
    <Section>
      <SectionHeading eyebrow="Správa klubu" title="Výzvy" />
      <Notice variant="info">Pripravuje sa.</Notice>
    </Section>
  )
}
