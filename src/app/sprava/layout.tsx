import type { Metadata } from 'next'
import type { ReactNode } from 'react'

// Rozpracovaná administrácia klubu — nesmie skončiť vo vyhľadávačoch.
// Žiadny guard/kontrola prihlásenia — tá príde v Etape G.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default function SpravaLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
