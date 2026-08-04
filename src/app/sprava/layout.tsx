import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import Link from 'next/link'
import { ArrowLeft, LogOut } from 'lucide-react'
import { requireAdmin } from '@/server/auth'
import { odhlas } from '@/server/actions/auth'

// Administrácia klubu — len rola ADMIN, mimo vyhľadávačov.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default async function SpravaLayout({ children }: { children: ReactNode }) {
  // Nie ADMIN → notFound() (nie redirect — o existencii /sprava sa cudzí nedozvie).
  await requireAdmin()

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-line bg-bg/90 backdrop-blur-md">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-4 px-4 md:px-6">
          <Link href="/sprava" className="display text-lg tracking-[0.08em] text-ink">
            Správa <span className="text-gold">klubu</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="/klub"
              className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-ink-dim transition-colors hover:text-ink"
            >
              <ArrowLeft className="size-4" aria-hidden />
              Späť do appky
            </Link>
            <form action={odhlas}>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-xl border border-line px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-ink-dim transition-colors hover:text-ink"
              >
                <LogOut className="size-4" aria-hidden />
                Odhlásiť
              </button>
            </form>
          </div>
        </div>
      </header>
      {children}
    </>
  )
}
