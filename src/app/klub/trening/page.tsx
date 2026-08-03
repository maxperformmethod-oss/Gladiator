import type { Metadata } from 'next'
import { Section } from '@/components/ui/Section'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Card } from '@/components/ui/Card'
import { prisma } from '@/lib/prisma'
import { requireClen } from '@/server/auth'
import { AkciaForm } from '@/components/klub/AkciaForm'
import {
  vytvorMojPlan,
  premenujPlan,
  zmazPlan,
  zacniTrening,
  pridajSeriu,
  zmazSeriu,
  ukonciTrening,
} from '@/server/actions/klub'

export const metadata: Metadata = { title: 'Tréning' }

const pole =
  'w-full rounded-xl border border-line bg-surface px-3 py-2 text-ink outline-none transition-colors focus:border-gold-dim'
const cislo = 'w-24 rounded-lg border border-line bg-bg px-2 py-1 text-ink outline-none focus:border-gold-dim'

const kg = (d: { toString(): string }) => +Number(d).toFixed(1)

export default async function TreningPage() {
  const clen = await requireClen()

  const [otvoreny, plany, cviky] = await Promise.all([
    prisma.trening.findFirst({
      where: { clenId: clen.id, koniec: null },
      include: {
        plan: { include: { cviky: { include: { cvik: true }, orderBy: { poradie: 'asc' } } } },
        serie: { include: { cvik: true }, orderBy: { poradie: 'asc' } },
      },
    }),
    prisma.treningPlan.findMany({
      where: { clenId: clen.id },
      orderBy: { createdAt: 'desc' },
      include: { cviky: { include: { cvik: true }, orderBy: { poradie: 'asc' } } },
    }),
    prisma.cvik.findMany({ where: { clenId: null, aktivny: true }, orderBy: { poradie: 'asc' } }),
  ])

  // Do výberu cvikov pri sérii: najprv cviky z plánu (v poradí), potom ostatné.
  const cvikyPreSeriu = otvoreny
    ? [
        ...otvoreny.plan?.cviky.map((pc) => pc.cvik) ?? [],
        ...cviky.filter((c) => !otvoreny.plan?.cviky.some((pc) => pc.cvikId === c.id)),
      ]
    : cviky

  return (
    <Section>
      <SectionHeading eyebrow="Členská zóna" title="Tréning" />

      {/* ── Aktívny tréning / Začať ─────────────────────────────────────── */}
      {otvoreny ? (
        <Card className="mb-10">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="display text-xl text-ink">{otvoreny.nazov}</h2>
            <span className="text-xs uppercase tracking-[0.14em] text-gold">Prebieha</span>
          </div>

          {otvoreny.serie.length > 0 ? (
            <ul className="mt-4 flex flex-col gap-2">
              {otvoreny.serie.map((s) => (
                <li
                  key={s.id}
                  className="flex items-center justify-between rounded-xl border border-line bg-surface px-3 py-2 text-sm"
                >
                  <span className="text-ink">
                    <span className="text-ink-dim">{s.poradie}.</span> {s.cvik.nazov} —{' '}
                    <strong>{kg(s.hmotnost)} kg × {s.opakovania}</strong>
                  </span>
                  <AkciaForm action={zmazSeriu} submitLabel="Zmazať" variant="ghost" className="shrink-0">
                    <input type="hidden" name="id" value={s.id} />
                  </AkciaForm>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-ink-dim">Zatiaľ žiadna séria. Pridaj prvú nižšie.</p>
          )}

          <div className="mt-6 border-t border-line pt-6">
            <h3 className="display mb-3 text-base text-ink">Pridať sériu</h3>
            <AkciaForm action={pridajSeriu} submitLabel="Pridať sériu" className="flex flex-wrap items-end gap-3">
              <input type="hidden" name="treningId" value={otvoreny.id} />
              <label className="flex flex-col gap-1 text-sm">
                <span className="text-ink-dim">Cvik</span>
                <select name="cvikId" required className={pole}>
                  {cvikyPreSeriu.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nazov}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1 text-sm">
                <span className="text-ink-dim">Hmotnosť (kg)</span>
                <input name="hmotnost" type="number" inputMode="decimal" step="0.5" min={0} max={999.99} required className={cislo} />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                <span className="text-ink-dim">Opakovania</span>
                <input name="opakovania" type="number" inputMode="numeric" min={1} max={500} required className={cislo} />
              </label>
            </AkciaForm>
          </div>

          <div className="mt-6">
            <AkciaForm action={ukonciTrening} submitLabel="Ukončiť tréning" variant="outline">
              <input type="hidden" name="id" value={otvoreny.id} />
            </AkciaForm>
          </div>
        </Card>
      ) : (
        <Card className="mb-10">
          <h2 className="display mb-3 text-xl text-ink">Začať tréning</h2>
          <AkciaForm action={zacniTrening} submitLabel="Začať tréning" className="flex flex-wrap items-end gap-3">
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-ink-dim">Názov (nepovinné)</span>
              <input name="nazov" maxLength={80} placeholder="Tréning" className={pole} />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-ink-dim">Podľa plánu (nepovinné)</span>
              <select name="planId" className={pole}>
                <option value="">— bez plánu —</option>
                {plany.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nazov}
                  </option>
                ))}
              </select>
            </label>
          </AkciaForm>
        </Card>
      )}

      {/* ── Moje plány ──────────────────────────────────────────────────── */}
      <h2 className="display mb-4 text-xl text-ink">Moje plány</h2>

      <Card className="mb-6">
        <h3 className="display mb-4 text-base text-ink">Nový plán</h3>
        <AkciaForm action={vytvorMojPlan} submitLabel="Vytvoriť plán">
          <label className="flex max-w-md flex-col gap-1 text-sm">
            <span className="text-ink-dim">Názov plánu</span>
            <input name="nazov" required maxLength={80} className={pole} />
          </label>
          <div className="flex flex-col gap-2">
            {cviky.map((c) => (
              <div key={c.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-line bg-surface px-3 py-2 text-sm">
                <label className="flex items-center gap-2">
                  <input type="checkbox" name={`cvik_${c.id}`} />
                  <span className="text-ink">{c.nazov}</span>
                  <span className="text-ink-faint">({c.partia})</span>
                </label>
                <span className="ml-auto flex items-center gap-2 text-ink-dim">
                  <input name={`serie_${c.id}`} type="number" inputMode="numeric" min={1} max={50} placeholder="série" className={cislo} />
                  ×
                  <input name={`opak_${c.id}`} type="number" inputMode="numeric" min={1} max={500} placeholder="opak." className={cislo} />
                </span>
              </div>
            ))}
            {cviky.length === 0 && <p className="text-sm text-ink-dim">Admin zatiaľ nepridal žiadny cvik.</p>}
          </div>
        </AkciaForm>
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
            <div className="mt-4 flex flex-wrap items-end gap-4">
              <AkciaForm action={premenujPlan} submitLabel="Premenovať" variant="ghost" className="flex items-end gap-2">
                <input type="hidden" name="id" value={p.id} />
                <input name="nazov" defaultValue={p.nazov} maxLength={80} className={pole} />
              </AkciaForm>
              <AkciaForm action={zmazPlan} submitLabel="Zmazať" variant="ghost">
                <input type="hidden" name="id" value={p.id} />
              </AkciaForm>
            </div>
          </Card>
        ))}
        {plany.length === 0 && <p className="text-sm text-ink-dim">Zatiaľ žiadny plán.</p>}
      </div>
    </Section>
  )
}
