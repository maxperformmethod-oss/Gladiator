import type { Metadata } from 'next'
import { Prisma } from '@prisma/client'
import { Section } from '@/components/ui/Section'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Card } from '@/components/ui/Card'
import { Button, ButtonLink } from '@/components/ui/Button'
import { prisma } from '@/lib/prisma'
import { requireClen } from '@/server/auth'
import { odhlas } from '@/server/actions/auth'
import { Ring } from '@/components/klub/Ring'
import { cn } from '@/lib/cn'

export const metadata: Metadata = { title: 'Klub' }

const DNI = ['Po', 'Ut', 'St', 'Št', 'Pi', 'So', 'Ne']
const dateKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`

function pondelok(): Date {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7))
  return d
}
function trvanie(z: Date, k: Date | null): string {
  if (!k) return '—'
  const min = Math.max(0, Math.round((k.getTime() - z.getTime()) / 60000))
  return min >= 60 ? `${Math.floor(min / 60)} h ${min % 60} min` : `${min} min`
}
const objem = (serie: { hmotnost: Prisma.Decimal; opakovania: number }[]) =>
  serie.reduce((a, s) => a.add(s.hmotnost.mul(s.opakovania)), new Prisma.Decimal(0))

export default async function KlubPage() {
  const clen = await requireClen()

  const [treningy, otvoreny] = await Promise.all([
    prisma.trening.findMany({
      where: { clenId: clen.id, koniec: { not: null } },
      orderBy: { zaciatok: 'desc' },
      include: { serie: { where: { dokoncena: true }, select: { hmotnost: true, opakovania: true } } },
    }),
    prisma.trening.findFirst({ where: { clenId: clen.id, koniec: null }, select: { id: true } }),
  ])

  const posledny = treningy[0]
  const mon = pondelok()
  const tentoTyzden = treningy.filter((t) => t.zaciatok >= mon).length
  const pred30 = new Date(Date.now() - 30 * 24 * 3600 * 1000)
  const objem30 = treningy.filter((t) => t.zaciatok >= pred30).reduce((a, t) => a.add(objem(t.serie)), new Prisma.Decimal(0))

  // Streak — dni po sebe končiace dnes alebo včera (MPM §3).
  const dni = new Set(treningy.map((t) => dateKey(t.zaciatok)))
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  if (!dni.has(dateKey(d))) d.setDate(d.getDate() - 1)
  let streak = 0
  while (dni.has(dateKey(d))) {
    streak++
    d.setDate(d.getDate() - 1)
  }

  // Konzistentnosť Po–Ne tohto týždňa.
  const tyzden = Array.from({ length: 7 }).map((_, i) => {
    const den = new Date(mon)
    den.setDate(mon.getDate() + i)
    return dni.has(dateKey(den))
  })

  return (
    <Section>
      <SectionHeading eyebrow="Členská zóna" title="Prehľad" />

      {otvoreny && (
        <div className="mb-6">
          <ButtonLink href="/klub/trening" variant="gold">
            Pokračovať v tréningu →
          </ButtonLink>
        </div>
      )}

      {!posledny ? (
        <Card>
          <p className="text-ink-dim">Ešte nemáš žiadny tréning. Začni prvý — čísla sa objavia samy.</p>
          <ButtonLink href="/klub/trening" className="mt-4">
            Začať tréning
          </ButtonLink>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="flex items-center justify-center">
            <Ring done={tentoTyzden} goal={clen.tyzdennyCiel} />
          </Card>
          <div className="grid gap-4">
            <Card>
              <p className="text-xs uppercase tracking-[0.14em] text-ink-dim">Séria dní</p>
              <p className="display mt-1 text-3xl text-gold [font-variant-numeric:tabular-nums]">{streak}</p>
            </Card>
            <Card>
              <p className="text-xs uppercase tracking-[0.14em] text-ink-dim">Objem za 30 dní</p>
              <p className="display mt-1 text-3xl text-gold [font-variant-numeric:tabular-nums]">{+objem30.toFixed(0)} kg</p>
            </Card>
          </div>
          <Card>
            <p className="text-xs uppercase tracking-[0.14em] text-ink-dim">Tento týždeň</p>
            <div className="mt-3 flex gap-1.5">
              {tyzden.map((ok, i) => (
                <div key={i} className="flex flex-1 flex-col items-center gap-1">
                  <div className={cn('h-8 w-full rounded-md', ok ? 'bg-gold' : 'bg-line')} />
                  <span className="text-[10px] uppercase text-ink-dim">{DNI[i]}</span>
                </div>
              ))}
            </div>
          </Card>
          <Card>
            <p className="text-xs uppercase tracking-[0.14em] text-ink-dim">Posledný tréning</p>
            <p className="display mt-1 text-lg text-ink">{posledny.nazov}</p>
            <p className="mt-1 text-sm text-ink-dim [font-variant-numeric:tabular-nums]">
              {posledny.zaciatok.toLocaleDateString('sk-SK')} · {trvanie(posledny.zaciatok, posledny.koniec)} · {+objem(posledny.serie).toFixed(0)} kg
            </p>
          </Card>
        </div>
      )}

      <div className="mt-8 flex flex-wrap items-center gap-3">
        {clen.rola === 'ADMIN' && (
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
