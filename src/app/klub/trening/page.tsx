import type { Metadata } from 'next'
import { Section } from '@/components/ui/Section'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Card } from '@/components/ui/Card'
import { prisma } from '@/lib/prisma'
import { requireClen } from '@/server/auth'
import { AkciaForm } from '@/components/klub/AkciaForm'
import { Stepper } from '@/components/klub/Stepper'
import { AktivnyTrening } from '@/components/klub/AktivnyTrening'
import {
  vytvorPlan,
  premenujPlan,
  zmazPlan,
  pridajCvik,
  odoberCvik,
  presunCvik,
  pridajPlanSeriu,
  upravPlanSeriu,
  odoberPlanSeriu,
  zacniTrening,
} from '@/server/actions/klub'

export const metadata: Metadata = { title: 'Tréning' }

const pole = 'h-11 rounded-xl border border-line bg-surface px-3 text-base text-ink outline-none focus:border-gold-dim'

export default async function TreningPage() {
  const clen = await requireClen()

  const [otvoreny, plany, cviky] = await Promise.all([
    prisma.trening.findFirst({
      where: { clenId: clen.id, koniec: null },
      include: { serie: { include: { cvik: true }, orderBy: { poradie: 'asc' } } },
    }),
    prisma.treningPlan.findMany({
      where: { clenId: clen.id },
      orderBy: { createdAt: 'desc' },
      include: {
        cviky: {
          orderBy: { poradie: 'asc' },
          include: { cvik: true, serie: { orderBy: { poradie: 'asc' } } },
        },
      },
    }),
    prisma.cvik.findMany({ where: { clenId: null, aktivny: true }, orderBy: { poradie: 'asc' } }),
  ])

  if (otvoreny) {
    const serie = otvoreny.serie.map((s) => ({
      id: s.id,
      cvikId: s.cvikId,
      cvikNazov: s.cvik.nazov,
      opakovania: s.opakovania,
      hmotnost: Number(s.hmotnost),
      poradie: s.poradie,
      dokoncena: s.dokoncena,
    }))
    return (
      <Section>
        <SectionHeading eyebrow="Členská zóna" title="Aktívny tréning" />
        <AktivnyTrening
          trening={{ id: otvoreny.id, nazov: otvoreny.nazov, zaciatok: otvoreny.zaciatok.toISOString() }}
          serie={serie}
          cviky={cviky.map((c) => ({ id: c.id, nazov: c.nazov }))}
          odpocinokSek={clen.odpocinokSek}
        />
      </Section>
    )
  }

  return (
    <Section>
      <SectionHeading eyebrow="Členská zóna" title="Tréning" />

      {/* Začať tréning */}
      <Card className="mb-8">
        <h2 className="display mb-3 text-xl text-ink">Začať tréning</h2>
        <AkciaForm action={zacniTrening} submitLabel="Začať tréning" className="flex flex-wrap items-end gap-3">
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-ink-dim">Podľa plánu</span>
            <select name="planId" className={pole}>
              <option value="">— prázdny tréning —</option>
              {plany.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nazov}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-ink-dim">Názov (ak bez plánu)</span>
            <input name="nazov" maxLength={80} placeholder="Tréning" className={pole} />
          </label>
        </AkciaForm>
      </Card>

      {/* Moje plány */}
      <h2 className="display mb-4 text-xl text-ink">Moje plány</h2>

      <Card className="mb-6">
        <h3 className="display mb-3 text-base text-ink">Nový plán</h3>
        <AkciaForm action={vytvorPlan} submitLabel="Vytvoriť" className="flex flex-wrap items-end gap-3">
          <input name="nazov" required maxLength={80} placeholder="Názov plánu" className={`${pole} min-w-[12rem]`} />
        </AkciaForm>
      </Card>

      <div className="flex flex-col gap-4">
        {plany.map((p) => (
          <Card key={p.id}>
            <div className="mb-4 flex flex-wrap items-end gap-3">
              <AkciaForm action={premenujPlan} submitLabel="Premenovať" variant="ghost" className="flex items-end gap-2">
                <input type="hidden" name="id" value={p.id} />
                <input name="nazov" defaultValue={p.nazov} maxLength={80} className={pole} />
              </AkciaForm>
              <AkciaForm action={zmazPlan} submitLabel="Zmazať plán" variant="ghost">
                <input type="hidden" name="id" value={p.id} />
              </AkciaForm>
            </div>

            <div className="flex flex-col gap-4">
              {p.cviky.map((pc) => (
                <div key={pc.id} className="rounded-xl border border-line bg-surface p-3">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className="display text-base text-ink">{pc.cvik.nazov}</span>
                    <span className="text-xs text-ink-faint">({pc.cvik.jednotka})</span>
                    <span className="ml-auto flex items-center gap-1">
                      <AkciaForm action={presunCvik} submitLabel="↑" variant="ghost">
                        <input type="hidden" name="id" value={pc.id} />
                        <input type="hidden" name="smer" value="hore" />
                      </AkciaForm>
                      <AkciaForm action={presunCvik} submitLabel="↓" variant="ghost">
                        <input type="hidden" name="id" value={pc.id} />
                        <input type="hidden" name="smer" value="dole" />
                      </AkciaForm>
                      <AkciaForm action={odoberCvik} submitLabel="Odobrať" variant="ghost">
                        <input type="hidden" name="id" value={pc.id} />
                      </AkciaForm>
                    </span>
                  </div>

                  <ul className="flex flex-col gap-2">
                    {pc.serie.map((ps) => (
                      <li key={ps.id} className="flex flex-wrap items-center gap-2">
                        <span className="w-6 text-sm text-ink-dim">{ps.poradie}.</span>
                        <AkciaForm action={upravPlanSeriu} submitLabel="Uložiť" variant="ghost" className="flex flex-wrap items-center gap-2">
                          <input type="hidden" name="id" value={ps.id} />
                          <Stepper name="opakovania" label="opakovania" defaultValue={ps.opakovania} min={1} max={500} />
                          <span className="text-ink-dim">×</span>
                          <Stepper name="hmotnost" label="hmotnosť v kg" defaultValue={Number(ps.hmotnost)} min={0} max={999.99} step={2.5} decimal />
                          <span className="text-sm text-ink-dim">kg</span>
                        </AkciaForm>
                        <AkciaForm action={odoberPlanSeriu} submitLabel="×" variant="ghost">
                          <input type="hidden" name="id" value={ps.id} />
                        </AkciaForm>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-2">
                    <AkciaForm action={pridajPlanSeriu} submitLabel="Pridať sériu" variant="ghost">
                      <input type="hidden" name="planCvikId" value={pc.id} />
                    </AkciaForm>
                  </div>
                </div>
              ))}
              {p.cviky.length === 0 && <p className="text-sm text-ink-dim">Zatiaľ žiadny cvik.</p>}
            </div>

            <div className="mt-4 border-t border-line pt-4">
              <AkciaForm action={pridajCvik} submitLabel="Pridať cvik" variant="outline" className="flex flex-wrap items-end gap-2">
                <input type="hidden" name="planId" value={p.id} />
                <select name="cvikId" required className={pole}>
                  {cviky.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nazov}
                    </option>
                  ))}
                </select>
              </AkciaForm>
            </div>
          </Card>
        ))}
        {plany.length === 0 && <p className="text-sm text-ink-dim">Zatiaľ žiadny plán.</p>}
      </div>
    </Section>
  )
}
