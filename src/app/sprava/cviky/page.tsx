import type { Metadata } from 'next'
import { Section } from '@/components/ui/Section'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Notice } from '@/components/ui/Notice'

export const metadata: Metadata = {
  title: 'Cviky',
}

export default function SpravaCvikyPage() {
  return (
    <Section>
      <SectionHeading eyebrow="Správa klubu" title="Cviky" />
      <Notice variant="info">Pripravuje sa.</Notice>
    </Section>
  )
}
