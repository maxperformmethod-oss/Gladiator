import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { requireClen } from '@/server/auth'
import { KlubNav } from '@/components/klub/KlubNav'
import { CasovacOdpocinku } from '@/components/klub/CasovacOdpocinku'

// Členská sekcia — prístup len pre prihlásených členov, mimo vyhľadávačov.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default async function KlubLayout({ children }: { children: ReactNode }) {
  // Neprihlásený → /prihlasenie · bez Clen → /registracia/prezyvka · neaktívny → /prihlasenie.
  const clen = await requireClen()
  return (
    <>
      <KlubNav />
      {children}
      {/* Časovač žije v layoute → beží ďalej pri prechode medzi stránkami /klub. */}
      <CasovacOdpocinku odpocinokSek={clen.odpocinokSek} zvuk={clen.zvuk} />
    </>
  )
}
