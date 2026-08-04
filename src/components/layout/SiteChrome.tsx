'use client'

import type { ReactNode } from 'react'
import { usePathname } from 'next/navigation'

/**
 * Marketingová hlavička a päta patria len na verejný web. Členská zóna
 * (`/klub`) a administrácia (`/sprava`) majú vlastný layout a nesmú vyzerať
 * ako podstránka webu — tam renderujeme holý obsah bez hlavičky, päty a odsadenia.
 */
export function SiteChrome({
  header,
  footer,
  children,
}: {
  header: ReactNode
  footer: ReactNode
  children: ReactNode
}) {
  const pathname = usePathname()
  const bezChrome = pathname.startsWith('/klub') || pathname.startsWith('/sprava')

  if (bezChrome) return <>{children}</>

  return (
    <div className="flex min-h-dvh flex-col">
      {header}
      <main className="flex-1 pt-16">{children}</main>
      {footer}
    </div>
  )
}
