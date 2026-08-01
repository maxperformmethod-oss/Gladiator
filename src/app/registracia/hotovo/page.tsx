import type { Metadata } from 'next'
import { Section } from '@/components/ui/Section'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Notice } from '@/components/ui/Notice'

export const metadata: Metadata = {
  title: 'Skontroluj si e-mail',
  robots: { index: false, follow: false },
}

export default function RegistraciaHotovoPage() {
  return (
    <Section>
      <div className="max-w-md">
        <SectionHeading eyebrow="Členská zóna" title="Skontroluj si e-mail" />
        <Notice variant="info">
          Ak si zadal platný e-mail, poslali sme naň potvrdzovací odkaz. Otvor ho
          a dokonči registráciu.
        </Notice>
      </div>
    </Section>
  )
}
