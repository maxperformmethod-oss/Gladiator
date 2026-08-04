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

// Poradie partií pri zoskupení; NEZARADENE ide posledné.
const PARTIA_PORADIE: Record<string, number> = {
  NOHY: 0, HRUD: 1, CHRBAT: 2, RAMENA: 3, BICEPS: 4, TRICEPS: 5, CORE: 6, NEZARADENE: 7,
}
const PARTIA_LABEL: Record<string, string> = {
  NOHY: 'Nohy', HRUD: 'Hruď', CHRBAT: 'Chrbát', RAMENA: 'Ramená',
  BICEPS: 'Biceps', TRICEPS: 'Triceps', CORE: 'Core', NEZARADENE: 'Nezaradené',
}

export default async function SpravaCvikyPage() {
  // Len globálne cviky (clenId = null); vlastné cviky členov sa tu nespravujú.
  const cviky = await prisma.cvik.findMany({
    where: { clenId: null },
    orderBy: [{ poradie: 'asc' }, { nazov: 'asc' }],
  })
  const partie = Object.values(Partia)
  const jednotky = Object.values(Jednotka)

  // Zoskupenie podľa partie; poradie skupín podľa PARTIA_PORADIE (NEZARADENE posledné).
  const skupiny = new Map<string, typeof cviky>()
  for (const c of cviky) {
    const arr = skupiny.get(c.partia) ?? []
    arr.push(c)
    skupiny.set(c.partia, arr)
  }
  const zoradene = [...skupiny.entries()].sort(
    (a, b) => (PARTIA_PORADIE[a[0]] ?? 99) - (PARTIA_PORADIE[b[0]] ?? 99),
  )

  return (
    <Section>
      <SectionHeading
        eyebrow="Správa klubu"
        title="Cviky"
        lead="Globálne cviky pre všetkých členov, zoskupené podľa partie. Mazať sa nedajú — deaktivuj ich. Slug sa pri premenovaní nemení."
      />

      <Card className="mb-8">
        <h2 className="display mb-4 text-lg text-ink">Pridať cvik</h2>
        <CvikForm action={vytvorCvik} submitLabel="Pridať" partie={partie} jednotky={jednotky} />
      </Card>

      {cviky.length === 0 && <p className="text-sm text-ink-dim">Zatiaľ žiadne cviky.</p>}

      <div className="flex flex-col gap-8">
        {zoradene.map(([partia, zoznam]) => (
          <div key={partia}>
            <h2 className="display mb-3 text-sm uppercase tracking-[0.14em] text-gold-hi">
              {PARTIA_LABEL[partia] ?? partia}{' '}
              <span className="text-ink-faint">· {zoznam.length}</span>
            </h2>
            <div className="flex flex-col gap-3">
              {zoznam.map((c) => (
                <Card key={c.id}>
                  <CvikForm
                    action={upravCvik}
                    submitLabel="Uložiť"
                    partie={partie}
                    jednotky={jednotky}
                    cvik={{
                      id: c.id,
                      nazov: c.nazov,
                      slug: c.slug,
                      partia: c.partia,
                      jednotka: c.jednotka,
                      poradie: c.poradie,
                      aktivny: c.aktivny,
                    }}
                  />
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Section>
  )
}
