import type { Metadata } from 'next'
import { Partia, Jednotka } from '@prisma/client'
import { Section } from '@/components/ui/Section'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Card } from '@/components/ui/Card'
import { prisma } from '@/lib/prisma'
import { CvikForm } from '@/components/sprava/CvikForm'
import { vytvorCvik, upravCvik } from '@/server/actions/treningy'

export const metadata: Metadata = {
  title: 'Cviky',
}

export default async function SpravaCvikyPage() {
  // Len globálne cviky (clenId = null); vlastné cviky členov sa tu nespravujú.
  const cviky = await prisma.cvik.findMany({
    where: { clenId: null },
    orderBy: [{ poradie: 'asc' }, { nazov: 'asc' }],
  })
  const partie = Object.values(Partia)
  const jednotky = Object.values(Jednotka)

  return (
    <Section>
      <SectionHeading
        eyebrow="Správa klubu"
        title="Cviky"
        lead="Globálne cviky pre všetkých členov. Mazať sa nedajú — deaktivuj ich."
      />

      <Card className="mb-8">
        <h2 className="display mb-4 text-lg text-ink">Pridať cvik</h2>
        <CvikForm action={vytvorCvik} submitLabel="Pridať" partie={partie} jednotky={jednotky} />
      </Card>

      <div className="flex flex-col gap-3">
        {cviky.map((c) => (
          <Card key={c.id}>
            <CvikForm
              action={upravCvik}
              submitLabel="Uložiť"
              partie={partie}
              jednotky={jednotky}
              cvik={{
                id: c.id,
                nazov: c.nazov,
                partia: c.partia,
                jednotka: c.jednotka,
                poradie: c.poradie,
                aktivny: c.aktivny,
              }}
            />
          </Card>
        ))}
        {cviky.length === 0 && <p className="text-sm text-ink-dim">Zatiaľ žiadne cviky.</p>}
      </div>
    </Section>
  )
}
