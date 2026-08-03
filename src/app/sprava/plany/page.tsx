import type { Metadata } from 'next'
import { Section } from '@/components/ui/Section'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Card } from '@/components/ui/Card'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/server/auth'
import { PlanForm } from '@/components/sprava/PlanForm'
import { vytvorPlan } from '@/server/actions/treningy'

export const metadata: Metadata = {
  title: 'Tréningové plány',
}

export default async function SpravaPlanyPage() {
  const admin = await requireAdmin()
  const [cviky, plany] = await Promise.all([
    prisma.cvik.findMany({ where: { clenId: null, aktivny: true }, orderBy: { poradie: 'asc' } }),
    prisma.treningPlan.findMany({
      where: { clenId: admin.id },
      orderBy: { createdAt: 'desc' },
      include: { cviky: { include: { cvik: true }, orderBy: { poradie: 'asc' } } },
    }),
  ])

  return (
    <Section>
      <SectionHeading
        eyebrow="Správa klubu"
        title="Tréningové plány"
        lead="V H1 zakladá admin plány sám sebe. Zdieľané plány pre členov prídu neskôr."
      />

      <Card className="mb-8">
        <h2 className="display mb-4 text-lg text-ink">Nový plán</h2>
        <PlanForm
          action={vytvorPlan}
          cviky={cviky.map((c) => ({ id: c.id, nazov: c.nazov, partia: c.partia }))}
        />
      </Card>

      <div className="flex flex-col gap-3">
        {plany.map((p) => (
          <Card key={p.id}>
            <h3 className="display text-lg text-ink">{p.nazov}</h3>
            <ul className="mt-2 flex flex-col gap-1 text-sm text-ink-dim">
              {p.cviky.map((pc) => (
                <li key={pc.id}>
                  {pc.cvik.nazov} — {pc.cielSerie}×{pc.cielOpakovania}
                </li>
              ))}
            </ul>
          </Card>
        ))}
        {plany.length === 0 && <p className="text-sm text-ink-dim">Zatiaľ žiadny plán.</p>}
      </div>
    </Section>
  )
}
