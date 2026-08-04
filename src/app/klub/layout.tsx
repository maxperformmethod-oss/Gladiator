import type { ReactNode } from 'react'
import { prisma } from '@/lib/prisma'
import { requireClen } from '@/server/auth'
import { KlubShell } from '@/components/klub/KlubShell'

/**
 * Serverový guard členskej zóny. Načíta člena (requireClen presmeruje
 * neprihlásených) a globálny katalóg cvikov, ktorý podá klientskej appke.
 * Samotné tréningové dáta žijú v prehliadači člena (localStorage), nie na serveri.
 */
export default async function KlubLayout({ children }: { children: ReactNode }) {
  const clen = await requireClen()

  const cviky = await prisma.cvik.findMany({
    where: { clenId: null, aktivny: true },
    orderBy: { poradie: 'asc' },
    select: { nazov: true, partia: true },
  })
  // Partiu posielame ako lowercase (zhodné s MuscleGroup v lib/klub); dedup podľa názvu.
  const videne = new Set<string>()
  const katalog = cviky
    .filter((c) => (videne.has(c.nazov) ? false : (videne.add(c.nazov), true)))
    .map((c) => ({ nazov: c.nazov, partia: c.partia.toLowerCase() }))

  return (
    <KlubShell clenId={clen.id} katalog={katalog} rola={clen.rola} prezyvka={clen.prezyvka}>
      {children}
    </KlubShell>
  )
}
