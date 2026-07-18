'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { BRAND, KONTAKT, NAV } from '@/lib/gym'
import { cn } from '@/lib/cn'

export function Header() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  // Zavri mobilné menu pri zmene stránky.
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  // Zamkni scroll pod otvoreným menu.
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  const navItems = NAV.filter((item) => item.href !== '/')

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-line bg-bg/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 md:px-6">
        <Link href="/" className="flex items-baseline gap-2" aria-label="Domov">
          <span className="display text-xl text-ink">
            GLADIATOR <span className="gold-text">GYM</span>
          </span>
          <span className="hidden text-[10px] uppercase tracking-[0.3em] text-ink-faint sm:inline">
            {BRAND.pobocka}
          </span>
        </Link>

        <nav className="hidden items-center gap-5 lg:flex" aria-label="Hlavná navigácia">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'text-xs uppercase tracking-[0.14em] transition-colors',
                pathname === item.href || pathname.startsWith(`${item.href}/`)
                  ? 'text-gold'
                  : 'text-ink-dim hover:text-ink'
              )}
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/rezervacia"
            className="display rounded-xl bg-gold px-4 py-2 text-xs tracking-[0.12em] text-bg transition-colors hover:bg-gold-hi"
          >
            Rezervácia
          </Link>
        </nav>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-line text-ink lg:hidden"
          aria-expanded={open}
          aria-label={open ? 'Zavrieť menu' : 'Otvoriť menu'}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobilné menu — fullscreen overlay pod headrom */}
      {open && (
        <div className="fixed inset-x-0 top-16 bottom-0 z-40 overflow-y-auto bg-bg lg:hidden">
          <nav
            className="mx-auto flex w-full max-w-6xl flex-col gap-1 px-4 py-6"
            aria-label="Mobilná navigácia"
          >
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'display rounded-xl px-3 py-3 text-2xl transition-colors',
                  pathname === item.href ? 'text-gold' : 'text-ink hover:text-gold-hi'
                )}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/rezervacia"
              className="display mt-4 rounded-xl bg-gold px-5 py-4 text-center text-lg tracking-[0.1em] text-bg"
            >
              Rezervácia
            </Link>
            <div className="mt-8 border-t border-line pt-6 text-sm text-ink-dim">
              <p>{KONTAKT.adresa}</p>
              <p className="mt-2">
                <a href={KONTAKT.telefonHref} className="hover:text-ink">
                  {KONTAKT.telefon}
                </a>
                {' · '}
                <a href={KONTAKT.emailHref} className="hover:text-ink">
                  {KONTAKT.email}
                </a>
              </p>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
