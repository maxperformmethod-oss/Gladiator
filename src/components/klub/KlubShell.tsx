'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  ChartLine,
  Dumbbell,
  History,
  LayoutDashboard,
  LogOut,
  Medal,
  Settings,
  Shield,
  Swords,
  Timer,
  Trophy,
  User,
} from 'lucide-react'
import type { KatalogCvik } from '@/lib/klub/types'
import { odhlas } from '@/server/actions/auth'
import { AppProvider, useApp } from './AppProvider'
import { ToastProvider } from './ToastProvider'
import { TimerProvider } from './TimerProvider'
import { RestTimerBar } from './timer/RestTimerBar'
import { ActiveWorkoutBar } from './workout/ActiveWorkoutBar'

const NAV = [
  { href: '/klub', label: 'Prehľad', icon: LayoutDashboard, exact: true },
  { href: '/klub/trening', label: 'Tréning', icon: Dumbbell, exact: false },
  { href: '/klub/historia', label: 'História', icon: History, exact: false },
  { href: '/klub/progres', label: 'Progres', icon: ChartLine, exact: false },
  { href: '/klub/rekordy', label: 'Rekordy', icon: Trophy, exact: false },
]

const SECONDARY = [
  { href: '/klub/casovac', label: 'Časovač', icon: Timer },
  { href: '/klub/vyzva', label: 'Výzva', icon: Swords },
  { href: '/klub/rebricek', label: 'Rebríček', icon: Medal },
  { href: '/klub/nastavenia', label: 'Nastavenia', icon: Settings },
]

function isActive(pathname: string, href: string, exact: boolean): boolean {
  return exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`)
}

function Logo() {
  return (
    <span className="flex flex-col leading-none">
      <span className="display text-lg tracking-[0.08em] text-ink">
        GLADI<span className="text-gold">ATOR</span>
      </span>
      <span className="mt-1 text-[9px] font-semibold uppercase tracking-[0.22em] text-ink-faint">
        Členská zóna
      </span>
    </span>
  )
}

/** Časovač potrebuje aktuálne `soundOn` z preferencií člena a zápis späť. */
function TimerBridge({ children }: { children: ReactNode }) {
  const { data, setPrefs } = useApp()
  return (
    <TimerProvider soundOn={data.prefs.soundOn} setSoundOn={(on) => setPrefs({ soundOn: on })}>
      {children}
    </TimerProvider>
  )
}

/** Vizuálny rámec členskej zóny: bočná (desktop) / spodná (mobil) navigácia. */
function Chrome({
  rola,
  prezyvka,
  children,
}: {
  rola: string
  prezyvka: string | null
  children: ReactNode
}) {
  const pathname = usePathname()
  const onWorkout = pathname.startsWith('/klub/trening/aktivny')
  const jeAdmin = rola === 'ADMIN'

  return (
    <div className="min-h-dvh lg:flex">
      {/* Bočný panel – desktop */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-line bg-surface px-4 py-6 lg:flex">
        <Link href="/klub" className="mb-8 block px-2" aria-label="Gladiator – prehľad">
          <Logo />
        </Link>
        <nav className="flex flex-1 flex-col gap-1" aria-label="Členská zóna">
          {NAV.map(({ href, label, icon: Icon, exact }) => {
            const active = isActive(pathname, href, exact)
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? 'page' : undefined}
                className={`flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold transition-colors ${
                  active ? 'bg-gold/12 text-gold-hi' : 'text-ink-dim hover:bg-surface-2 hover:text-ink'
                }`}
              >
                <Icon className="size-5" aria-hidden />
                {label}
              </Link>
            )
          })}
          <div className="my-3 border-t border-line" />
          {SECONDARY.map(({ href, label, icon: Icon }) => {
            const active = isActive(pathname, href, false)
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? 'page' : undefined}
                className={`flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold transition-colors ${
                  active ? 'bg-gold/12 text-gold-hi' : 'text-ink-dim hover:bg-surface-2 hover:text-ink'
                }`}
              >
                <Icon className="size-5" aria-hidden />
                {label}
              </Link>
            )
          })}
        </nav>

        {/* Administrácia — iná zóna, len pre admina. Bežný člen ju nedostane ani do HTML. */}
        {jeAdmin && (
          <>
            <div className="my-2 border-t border-line" />
            <Link
              href="/sprava"
              className="flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold text-gold-hi transition-colors hover:bg-surface-2"
            >
              <Shield className="size-5" aria-hidden />
              Správa
            </Link>
          </>
        )}

        {/* Účet */}
        <div className="mt-2 border-t border-line pt-3">
          <div className="flex items-center gap-2 px-3 pb-1 text-sm text-ink">
            <User className="size-4 shrink-0 text-ink-dim" aria-hidden />
            <span className="truncate font-semibold">{prezyvka ?? 'Člen'}</span>
          </div>
          <form action={odhlas}>
            <button
              type="submit"
              className="flex h-11 w-full items-center gap-3 rounded-xl px-3 text-sm font-semibold text-ink-dim transition-colors hover:bg-surface-2 hover:text-ink"
            >
              <LogOut className="size-5" aria-hidden />
              Odhlásiť sa
            </button>
          </form>
          <Link href="/" className="mt-1 block px-3 text-[11px] leading-relaxed text-ink-faint hover:text-ink-dim">
            ← Späť na web
          </Link>
        </div>
      </aside>

      {/* Horná lišta – mobil */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-line bg-bg/85 px-4 backdrop-blur-md lg:hidden">
        <Link href="/klub" aria-label="Gladiator – prehľad">
          <Logo />
        </Link>
        <div className="flex items-center gap-1">
          {SECONDARY.map(({ href, label, icon: Icon }) => {
            const active = isActive(pathname, href, false)
            return (
              <Link
                key={href}
                href={href}
                aria-label={label}
                aria-current={active ? 'page' : undefined}
                className={`flex size-11 items-center justify-center rounded-xl transition-colors ${
                  active ? 'bg-gold/12 text-gold-hi' : 'text-ink-dim hover:text-ink'
                }`}
              >
                <Icon className="size-5" aria-hidden />
              </Link>
            )
          })}
          {/* Profil — vedie na Nastavenia, kde je na mobile odhlásenie. */}
          <Link
            href="/klub/nastavenia"
            aria-label="Účet a odhlásenie"
            className="ml-1 flex size-11 items-center justify-center rounded-xl border border-line text-ink-dim transition-colors hover:text-ink"
          >
            <User className="size-5" aria-hidden />
          </Link>
        </div>
      </header>

      {/* Obsah */}
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-32 pt-5 sm:px-6 lg:ml-60 lg:px-10 lg:pb-16 lg:pt-8">
        {children}
      </main>

      {/* Plávajúce panely nad spodnou navigáciou */}
      {!onWorkout && <ActiveWorkoutBar />}
      <RestTimerBar />

      {/* Spodná navigácia – mobil */}
      <nav
        aria-label="Členská zóna"
        className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/92 backdrop-blur-md pb-safe lg:hidden"
      >
        <div className="mx-auto grid max-w-md grid-cols-5">
          {NAV.map(({ href, label, icon: Icon, exact }) => {
            const active = isActive(pathname, href, exact)
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? 'page' : undefined}
                className={`flex h-16 flex-col items-center justify-center gap-1 px-0.5 text-[10px] font-semibold transition-colors ${
                  active ? 'text-gold-hi' : 'text-ink-faint hover:text-ink-dim'
                }`}
              >
                <span
                  className={`flex h-7 w-11 items-center justify-center rounded-full transition-colors ${
                    active ? 'bg-gold/15' : ''
                  }`}
                >
                  <Icon className="size-5" aria-hidden />
                </span>
                <span className="max-w-full truncate">{label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}

/** Koreň členskej zóny: dáta v prehliadači, guard `requireClen` je v layoute. */
export function KlubShell({
  clenId,
  katalog,
  rola,
  prezyvka,
  children,
}: {
  clenId: string
  katalog: KatalogCvik[]
  rola: string
  prezyvka: string | null
  children: ReactNode
}) {
  return (
    <AppProvider clenId={clenId} katalog={katalog}>
      <ToastProvider>
        <TimerBridge>
          <Chrome rola={rola} prezyvka={prezyvka}>
            {children}
          </Chrome>
        </TimerBridge>
      </ToastProvider>
    </AppProvider>
  )
}
