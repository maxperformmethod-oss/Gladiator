import type { Metadata } from 'next'
import Link from 'next/link'
import { LogOut, Shield, User } from 'lucide-react'
import Settings from '@/components/klub/pages/Settings'
import { requireClen } from '@/server/auth'
import { odhlas } from '@/server/actions/auth'

export const metadata: Metadata = { title: 'Nastavenia', robots: { index: false } }

export default async function NastaveniaPage() {
  const clen = await requireClen()

  return (
    <>
      <Settings />

      {/* Účet — na mobile jediná cesta k odhláseniu (bočný panel je skrytý). */}
      <section className="mx-auto mt-8 max-w-2xl border-t border-line pt-6">
        <h2 className="display text-sm uppercase tracking-[0.14em] text-ink-faint">Účet</h2>
        <p className="mt-3 flex items-center gap-2 text-sm text-ink">
          <User className="size-4 shrink-0 text-ink-dim" aria-hidden />
          <span className="font-semibold">{clen.prezyvka ?? 'Člen'}</span>
        </p>

        {clen.rola === 'ADMIN' && (
          <Link
            href="/sprava"
            className="mt-4 inline-flex items-center gap-2 rounded-xl border border-gold-dim px-4 py-2.5 text-sm font-semibold text-gold transition-colors hover:border-gold hover:text-gold-hi"
          >
            <Shield className="size-4" aria-hidden />
            Správa klubu
          </Link>
        )}

        <form action={odhlas} className="mt-4">
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-xl border border-line-strong px-4 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-surface-2"
          >
            <LogOut className="size-4" aria-hidden />
            Odhlásiť sa
          </button>
        </form>
      </section>
    </>
  )
}
