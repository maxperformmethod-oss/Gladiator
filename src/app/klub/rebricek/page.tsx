import type { Metadata } from 'next'
import Link from 'next/link'
import { VyzvaStav } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { requireClen } from '@/server/auth'

export const metadata: Metadata = { title: 'Rebríček', robots: { index: false } }

// Poradie 1–3 naznačené odtieňmi zlatej (nie nové farby).
function poradieClass(rank: number): string {
  if (rank === 1) return 'text-gold'
  if (rank === 2) return 'text-gold-hi'
  if (rank === 3) return 'text-gold-dim'
  return 'text-ink-dim'
}

export default async function RebricekPage({
  searchParams,
}: {
  searchParams: Promise<{ vyzva?: string }>
}) {
  const clen = await requireClen()
  const { vyzva: vyzvaParam } = await searchParams

  // Prepínač: aktívna + archív (uzavreté) výzvy.
  const vyzvy = await prisma.vyzva.findMany({
    where: { stav: { in: [VyzvaStav.AKTIVNA, VyzvaStav.UZAVRETA] } },
    orderBy: [{ stav: 'asc' }, { zaciatok: 'desc' }],
    select: { id: true, nazov: true, typ: true, stav: true },
  })

  const aktivna = vyzvy.find((v) => v.stav === 'AKTIVNA') ?? null
  const zvolena = (vyzvaParam && vyzvy.find((v) => v.id === vyzvaParam)) || aktivna

  const zapisy = zvolena
    ? await prisma.vyzvaZapis.findMany({
        where: { vyzvaId: zvolena.id, stav: 'SCHVALENE' },
        orderBy: [{ hodnota: 'desc' }, { createdAt: 'asc' }],
        select: { id: true, hodnota: true, clenId: true, clen: { select: { prezyvka: true } } },
      })
    : []

  const jednotka = zvolena?.typ === 'SILOVA' ? 'kg' : 'min'

  return (
    <div>
      <h1 className="display text-2xl text-ink">Rebríček</h1>
      <p className="mt-1 text-sm text-ink-dim">
        {zvolena ? zvolena.nazov : 'Žiadna výzva'}
        {zvolena?.stav === 'UZAVRETA' && <span className="ml-2 text-xs uppercase tracking-[0.14em] text-ink-faint">archív</span>}
      </p>

      {/* Prepínač výziev */}
      {vyzvy.length > 1 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {vyzvy.map((v) => {
            const active = zvolena?.id === v.id
            return (
              <Link
                key={v.id}
                href={`/klub/rebricek?vyzva=${v.id}`}
                aria-current={active ? 'page' : undefined}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                  active ? 'border-gold/50 bg-gold/12 text-gold-hi' : 'border-line-strong text-ink-dim hover:text-ink'
                }`}
              >
                {v.nazov}
                {v.stav === 'AKTIVNA' ? '' : ' · archív'}
              </Link>
            )
          })}
        </div>
      )}

      {!zvolena ? (
        <div className="mt-6 rounded-2xl border border-line bg-surface p-5">
          <p className="text-ink-dim">Momentálne nebeží žiadna výzva.</p>
        </div>
      ) : zapisy.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-line bg-surface p-5">
          <p className="text-ink-dim">Zatiaľ nemá schválený zápis nikto. Buď prvý.</p>
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-2xl border border-line">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line bg-surface-2 text-left text-[11px] uppercase tracking-wider text-ink-faint">
                <th className="px-4 py-3 font-bold">#</th>
                <th className="px-4 py-3 font-bold">Prezývka</th>
                <th className="px-4 py-3 text-right font-bold">Hodnota</th>
              </tr>
            </thead>
            <tbody>
              {zapisy.map((z, i) => {
                const rank = i + 1
                const mine = z.clenId === clen.id
                return (
                  <tr
                    key={z.id}
                    className={`border-b border-line last:border-0 ${mine ? 'bg-gold/10' : ''}`}
                  >
                    <td className={`tnum px-4 py-3 font-extrabold ${poradieClass(rank)}`}>{rank}.</td>
                    <td className="px-4 py-3">
                      <span className={mine ? 'font-bold text-gold-hi' : 'text-ink'}>
                        {z.clen.prezyvka ?? `Člen ${rank}`}
                      </span>
                      {mine && <span className="ml-2 text-[11px] uppercase tracking-wider text-gold">ty</span>}
                    </td>
                    <td className="tnum px-4 py-3 text-right font-bold text-ink">
                      {Number(z.hodnota)} <span className="text-ink-dim">{jednotka}</span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-4 text-xs leading-relaxed text-ink-faint">
        Výsledky si zapisujú členovia sami a potvrdzuje ich obsluha gymu.
      </p>
    </div>
  )
}
