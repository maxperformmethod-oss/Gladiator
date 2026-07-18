import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { formatCena } from '@/lib/pricing'
import { Notice } from '@/components/ui/Notice'
import { cn } from '@/lib/cn'
import type { Objednavka, ObjednavkaStav } from '@prisma/client'

export const metadata: Metadata = {
  title: 'Objednávky — interné',
  robots: { index: false, follow: false },
}

// Vždy čerstvé dáta z DB.
export const dynamic = 'force-dynamic'

const STAV_STYL: Record<ObjednavkaStav, { label: string; cls: string }> = {
  PAID: { label: 'Zaplatená', cls: 'border-success/40 text-success' },
  PENDING: { label: 'Čaká', cls: 'border-warning/40 text-warning' },
  FAILED: { label: 'Zlyhala', cls: 'border-danger/40 text-danger' },
}

export default async function AdminObjednavkyPage() {
  let objednavky: Objednavka[] = []
  let dbError = false

  try {
    objednavky = await prisma.objednavka.findMany({
      orderBy: { createdAt: 'desc' },
      take: 200,
    })
  } catch (err) {
    console.error('[admin/objednavky] DB error:', err)
    dbError = true
  }

  const fmt = new Intl.DateTimeFormat('sk-SK', {
    dateStyle: 'short',
    timeStyle: 'short',
  })

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-10 md:px-6">
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold">
          Interné — recepcia
        </p>
        <h1 className="display mt-2 text-3xl text-ink">Objednávky</h1>
        <p className="mt-2 max-w-2xl text-sm text-ink-dim">
          Zákazník pri vstupe nahlási <strong>číslo objednávky</strong> alebo
          email — over, že stav je <strong>Zaplatená</strong>. Zobrazuje sa
          posledných 200 objednávok; obnov stránku pre čerstvé dáta.
        </p>
      </div>

      {dbError ? (
        <Notice>
          Databáza nie je dostupná — skontroluj <code>DATABASE_URL</code> (pozri
          TODO.md).
        </Notice>
      ) : objednavky.length === 0 ? (
        <Notice variant="info">Zatiaľ žiadne objednávky.</Notice>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-line">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-line bg-surface text-xs uppercase tracking-wider text-ink-faint">
                <th className="px-4 py-3 font-medium">Číslo objednávky</th>
                <th className="px-4 py-3 font-medium">Stav</th>
                <th className="px-4 py-3 font-medium">Meno</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Produkt</th>
                <th className="px-4 py-3 font-medium">Suma</th>
                <th className="px-4 py-3 font-medium">Dátum</th>
              </tr>
            </thead>
            <tbody>
              {objednavky.map((o) => (
                <tr key={o.id} className="border-b border-line last:border-0">
                  <td className="tnum px-4 py-3 font-semibold text-gold">
                    {o.cisloObjednavky}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        'inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium',
                        STAV_STYL[o.stav].cls
                      )}
                    >
                      {STAV_STYL[o.stav].label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-ink">{o.meno ?? '—'}</td>
                  <td className="px-4 py-3 text-ink-dim">{o.email ?? '—'}</td>
                  <td className="px-4 py-3 text-ink">{o.produktNazov}</td>
                  <td className="tnum px-4 py-3 text-ink">{formatCena(o.suma)}</td>
                  <td className="tnum px-4 py-3 text-ink-dim">
                    {fmt.format(o.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
