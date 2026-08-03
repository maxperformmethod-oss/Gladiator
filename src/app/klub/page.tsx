import type { Metadata } from 'next'
import { Section } from '@/components/ui/Section'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Notice } from '@/components/ui/Notice'
import { Button, ButtonLink } from '@/components/ui/Button'
import { getClen } from '@/server/auth'
import { odhlas } from '@/server/actions/auth'

export const metadata: Metadata = {
  title: 'Klub',
}

export default async function KlubPage() {
  // Stránka je pod guardom (requireClen v layoute), takže člen je vždy prítomný.
  // „Správa" ukážeme len adminovi — rolu čítame tu, kde je stránka dynamická.
  const clen = await getClen()

  return (
    <Section>
      <SectionHeading eyebrow="Členská zóna" title="Klub" />
      <Notice variant="info">Pripravuje sa.</Notice>
      <div className="mt-8 flex flex-wrap items-center gap-3">
        {clen?.rola === 'ADMIN' && (
          <ButtonLink href="/sprava" variant="outline">
            Správa
          </ButtonLink>
        )}
        <form action={odhlas}>
          <Button type="submit" variant="ghost">
            Odhlásiť sa
          </Button>
        </form>
      </div>
    </Section>
  )
}
