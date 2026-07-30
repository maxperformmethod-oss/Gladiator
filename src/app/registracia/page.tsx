import type { Metadata } from 'next'
import { Section } from '@/components/ui/Section'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Notice } from '@/components/ui/Notice'

export const metadata: Metadata = {
  title: 'Registrácia',
  robots: { index: false, follow: false },
}

export default function RegistraciaPage() {
  return (
    <Section>
      <SectionHeading eyebrow="Členská zóna" title="Registrácia" />
      <Notice variant="info">Pripravuje sa.</Notice>
    </Section>
  )
}
