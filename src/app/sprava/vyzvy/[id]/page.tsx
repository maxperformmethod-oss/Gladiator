import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Section } from '@/components/ui/Section'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Card } from '@/components/ui/Card'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/server/auth'
import { ZapisRozhodnutie } from '@/components/sprava/ZapisRozhodnutie'

export const metadata: Metadata = { title: 'Zápisy výzvy' }

const STAV_LABEL: Record<string, string> = {
  SUKROMNY: 'Súkromný',
  CAKA: 'Čaká',
  SCHVALENE: 'Schválené',
  ZAMIETNUTE: 'Zamietnuté',
}
const PORADIE_STAVU: Record<string, number> = { CAKA: 0, SCHVALENE: 1, ZAMIETNUTE: 2, SUKROMNY: 3 }

export default async function SpravaVyzvaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin()
  const { id } = await params

  const vyzva = await prisma.vyzva.findUnique({
    where: { id },
    include: {
      zapisy: { include: { clen: { select: { prezyvka: true } } } },
    },
  })
  if (!vyzva) notFound()

  const jednotka = vyzva.typ === 'SILOVA' ? 'kg' : 'min'
  // Čakajúce hore, potom podľa hodnoty zostupne.
  const zapisy = [...vyzva.zapisy].sort((a, b) => {
    const s = (PORADIE_STAVU[a.stav] ?? 9) - (PORADIE_STAVU[b.stav] ?? 9)
    if (s !== 0) return s
    return Number(b.hodnota) - Number(a.hodnota)
  })

  return (
    <Section>
      <SectionHeading eyebrow="Správa klubu" title={vyzva.nazov} lead="Schvaľovanie zápisov. Pri zamietnutí je dôvod povinný." />

      <p className="mb-6">
        <Link href="/sprava/vyzvy" className="text-sm text-gold underline-offset-4 hover:underline">
          ← Späť na výzvy
        </Link>
      </p>

      <div className="flex flex-col gap-3">
        {zapisy.map((z) => (
          <Card key={z.id}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="display text-base text-ink">{z.clen.prezyvka ?? 'Člen'}</p>
                <p className="mt-0.5 text-xs uppercase tracking-[0.14em] text-ink-dim">
                  {STAV_LABEL[z.stav] ?? z.stav} · {z.createdAt.toLocaleDateString('sk-SK')}
                </p>
              </div>
              <p className="display text-2xl tabular-nums text-gold">
                {Number(z.hodnota)} <span className="text-sm text-ink-dim">{jednotka}</span>
              </p>
            </div>
            {z.stav === 'ZAMIETNUTE' && z.dovodZamietnutia && (
              <p className="mt-2 text-sm text-danger">Dôvod: {z.dovodZamietnutia}</p>
            )}
            <ZapisRozhodnutie zapisId={z.id} stav={z.stav} />
          </Card>
        ))}
        {zapisy.length === 0 && <p className="text-sm text-ink-dim">Zatiaľ žiadne zápisy.</p>}
      </div>
    </Section>
  )
}
