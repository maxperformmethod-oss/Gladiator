import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { requireClen } from '@/server/auth'

// Členská sekcia — prístup len pre prihlásených členov, mimo vyhľadávačov.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default async function KlubLayout({ children }: { children: ReactNode }) {
  // Neprihlásený → /prihlasenie · bez Clen → /registracia/prezyvka · neaktívny → /prihlasenie.
  await requireClen()
  return <>{children}</>
}
