'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/cn'

const polozky = [
  { href: '/klub', label: 'Prehľad' },
  { href: '/klub/trening', label: 'Tréning' },
  { href: '/klub/historia', label: 'História' },
  { href: '/klub/vyzva', label: 'Výzva' },
  { href: '/klub/nastavenia', label: 'Nastavenia' },
]

/** Vodorovná navigácia členskej zóny; aktívna položka je zlato zvýraznená. */
export function KlubNav() {
  const pathname = usePathname()
  return (
    <nav className="border-b border-line" aria-label="Členská zóna">
      <div className="mx-auto flex w-full max-w-6xl gap-1 overflow-x-auto px-4 md:px-6">
        {polozky.map((p) => {
          const active = p.href === '/klub' ? pathname === '/klub' : pathname.startsWith(p.href)
          return (
            <Link
              key={p.href}
              href={p.href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'whitespace-nowrap border-b-2 px-3 py-3 text-sm uppercase tracking-[0.12em] transition-colors',
                active ? 'border-gold text-gold' : 'border-transparent text-ink-dim hover:text-ink'
              )}
            >
              {p.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
