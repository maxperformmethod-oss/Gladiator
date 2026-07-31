import type { Metadata } from 'next'
import { Section } from '@/components/ui/Section'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Notice } from '@/components/ui/Notice'

export const metadata: Metadata = {
  title: 'Výsledky',
}

export default function SpravaVysledkyPage() {
  return (
    <Section>
      <SectionHeading eyebrow="Správa klubu" title="Výsledky" />
      <Notice variant="info">Pripravuje sa.</Notice>
    </Section>
  )
}
