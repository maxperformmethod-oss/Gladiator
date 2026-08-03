import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { requireAdmin } from '@/server/auth'

// Administrácia klubu — len rola ADMIN, mimo vyhľadávačov.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default async function SpravaLayout({ children }: { children: ReactNode }) {
  // Nie ADMIN → notFound() (nie redirect — o existencii /sprava sa cudzí nedozvie).
  await requireAdmin()
  return <>{children}</>
}
