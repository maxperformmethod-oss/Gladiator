import type { Metadata } from 'next'
import Link from 'next/link'
import { VyzvaTyp, VyzvaStav } from '@prisma/client'
import { Section } from '@/components/ui/Section'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Card } from '@/components/ui/Card'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/server/auth'
import { VyzvaForm } from '@/components/sprava/VyzvaForm'
import { vytvorVyzvu, upravVyzvu } from '@/server/actions/vyzvy'

export const metadata: Metadata = { title: 'Výzvy' }

const TYP_LABEL: Record<string, string> = { SILOVA: 'Silová', CASOVA: 'Časová' }
const STAV_LABEL: Record<string, string> = { NAVRH: 'Návrh', AKTIVNA: 'Aktívna', UZAVRETA: 'Uzavretá' }
const den = (d: Date) => d.toISOString().slice(0, 10)

export default async function SpravaVyzvyPage() {
  await requireAdmin()

  const [vyzvy, cviky] = await Promise.all([
    prisma.vyzva.findMany({
      orderBy: { createdAt: 'desc' },
      include: { zapisy: { select: { stav: true } } },
    }),
    prisma.cvik.findMany({
      where: { clenId: null, aktivny: true },
      orderBy: [{ poradie: 'asc' }, { nazov: 'asc' }],
      select: { id: true, nazov: true },
    }),
  ])
  const typy = Object.values(VyzvaTyp)
  const stavy = Object.values(VyzvaStav)

  return (
    <Section>
      <SectionHeading
        eyebrow="Správa klubu"
        title="Výzvy"
        lead="Naraz môže byť aktívna len jedna výzva. Výsledky si zapisujú členovia sami a potvrdzuje ich obsluha."
      />

      <Card className="mb-8">
        <h2 className="display mb-4 text-lg text-ink">Nová výzva</h2>
        <VyzvaForm action={vytvorVyzvu} submitLabel="Vytvoriť" typy={typy} stavy={stavy} cviky={cviky} />
      </Card>

      <div className="flex flex-col gap-4">
        {vyzvy.map((v) => {
          const caka = v.zapisy.filter((z) => z.stav === 'CAKA').length
          const posudene = v.zapisy.filter((z) => z.stav === 'SCHVALENE' || z.stav === 'ZAMIETNUTE').length
          const zapisyLabel = caka > 0 ? `${caka} čakajú · ${posudene} posúdených` : `${posudene} posúdených`
          return (
          <Card key={v.id}>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="display text-lg text-ink">{v.nazov}</h3>
                <p className="mt-1 text-xs uppercase tracking-[0.14em] text-ink-dim">
                  {TYP_LABEL[v.typ] ?? v.typ} · {STAV_LABEL[v.stav] ?? v.stav} ·{' '}
                  <span className="tnum">
                    {den(v.zaciatok)} – {den(v.koniec)}
                  </span>
                </p>
              </div>
              <Link
                href={`/sprava/vyzvy/${v.id}`}
                className={`display rounded-xl border px-4 py-2 text-xs tracking-[0.12em] ${
                  caka > 0
                    ? 'border-gold bg-gold/10 text-gold-hi hover:bg-gold/20'
                    : 'border-gold-dim text-gold hover:border-gold hover:text-gold-hi'
                }`}
              >
                Zápisy · {zapisyLabel}
              </Link>
            </div>
            <VyzvaForm
              action={upravVyzvu}
              submitLabel="Uložiť"
              typy={typy}
              stavy={stavy}
              cviky={cviky}
              vyzva={{
                id: v.id,
                nazov: v.nazov,
                popis: v.popis,
                typ: v.typ,
                cvikId: v.cvikId,
                zaciatok: den(v.zaciatok),
                koniec: den(v.koniec),
                stav: v.stav,
              }}
            />
          </Card>
          )
        })}
        {vyzvy.length === 0 && <p className="text-sm text-ink-dim">Zatiaľ žiadne výzvy.</p>}
      </div>
    </Section>
  )
}
