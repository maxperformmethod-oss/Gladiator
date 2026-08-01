import type { Metadata } from 'next'
import { Section } from '@/components/ui/Section'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Notice } from '@/components/ui/Notice'
import { Button } from '@/components/ui/Button'
import { odhlas } from '@/server/actions/auth'

export const metadata: Metadata = {
  title: 'Klub',
}

export default function KlubPage() {
  return (
    <Section>
      <SectionHeading eyebrow="Členská zóna" title="Klub" />
      <Notice variant="info">Pripravuje sa.</Notice>
      <form action={odhlas} className="mt-8">
        <Button type="submit" variant="outline">
          Odhlásiť sa
        </Button>
      </form>
    </Section>
  )
}
