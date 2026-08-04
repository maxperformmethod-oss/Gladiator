import type { Metadata } from 'next'
import { VyzvaStav } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { requireClen } from '@/server/auth'
import VyzvaClient from '@/components/klub/pages/VyzvaClient'

export const metadata: Metadata = { title: 'Výzva', robots: { index: false } }

const den = (d: Date) => d.toISOString().slice(0, 10)

export default async function VyzvaPage() {
  const clen = await requireClen()

  const vyzva = await prisma.vyzva.findFirst({
    where: { stav: VyzvaStav.AKTIVNA },
    include: { cvik: { select: { nazov: true } } },
  })

  if (!vyzva) {
    return <VyzvaClient vyzva={null} zapis={null} rank={null} />
  }

  const zapis = await prisma.vyzvaZapis.findUnique({
    where: { vyzvaId_clenId: { vyzvaId: vyzva.id, clenId: clen.id } },
    select: { hodnota: true, stav: true, dovodZamietnutia: true },
  })

  // Poradie počítame len pri schválenom zápise (rovnaké pravidlo ako rebríček).
  let rank: number | null = null
  if (zapis?.stav === 'SCHVALENE') {
    const schvalene = await prisma.vyzvaZapis.findMany({
      where: { vyzvaId: vyzva.id, stav: 'SCHVALENE' },
      orderBy: [{ hodnota: 'desc' }, { createdAt: 'asc' }],
      select: { clenId: true },
    })
    const idx = schvalene.findIndex((z) => z.clenId === clen.id)
    rank = idx >= 0 ? idx + 1 : null
  }

  return (
    <VyzvaClient
      vyzva={{
        id: vyzva.id,
        nazov: vyzva.nazov,
        popis: vyzva.popis,
        typ: vyzva.typ,
        zaciatok: den(vyzva.zaciatok),
        koniec: den(vyzva.koniec),
        cvikNazov: vyzva.cvik?.nazov ?? null,
      }}
      zapis={zapis ? { hodnota: Number(zapis.hodnota), stav: zapis.stav, dovodZamietnutia: zapis.dovodZamietnutia } : null}
      rank={rank}
    />
  )
}
