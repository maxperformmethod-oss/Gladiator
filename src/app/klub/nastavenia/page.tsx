import type { Metadata } from 'next'
import { Section } from '@/components/ui/Section'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Card } from '@/components/ui/Card'
import { requireClen } from '@/server/auth'
import { AkciaForm } from '@/components/klub/AkciaForm'
import { Stepper } from '@/components/klub/Stepper'
import { ulozNastavenia } from '@/server/actions/klub'

export const metadata: Metadata = { title: 'Nastavenia' }

export default async function NastaveniaPage() {
  const clen = await requireClen()

  return (
    <Section>
      <SectionHeading eyebrow="Členská zóna" title="Nastavenia" />
      <Card className="max-w-md">
        <AkciaForm action={ulozNastavenia} submitLabel="Uložiť">
          <label className="flex flex-col gap-2 text-sm">
            <span className="text-ink-dim">Týždenný cieľ (tréningov)</span>
            <Stepper name="tyzdennyCiel" label="Týždenný cieľ" defaultValue={clen.tyzdennyCiel} min={1} max={14} />
          </label>
          <label className="flex flex-col gap-2 text-sm">
            <span className="text-ink-dim">Predvolený odpočinok (sekundy)</span>
            <Stepper name="odpocinokSek" label="Odpočinok v sekundách" defaultValue={clen.odpocinokSek} min={10} max={600} step={15} />
          </label>
          <label className="flex items-center gap-2 text-sm text-ink-dim">
            <input name="zvuk" type="checkbox" defaultChecked={clen.zvuk} className="h-5 w-5" />
            Zvukové upozornenie na konci odpočinku
          </label>
        </AkciaForm>
      </Card>
    </Section>
  )
}
