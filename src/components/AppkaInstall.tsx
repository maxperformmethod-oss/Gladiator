'use client'

import { useEffect, useState } from 'react'

/** `beforeinstallprompt` nie je v lib.dom — minimálny typ, ktorý potrebujeme. */
interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

type Platforma = 'ios' | 'android' | 'desktop'

const krok = 'flex gap-3 text-sm text-ink-dim'
const cislo = 'flex size-6 shrink-0 items-center justify-center rounded-full bg-gold/15 text-xs font-bold text-gold-hi'

/** Návod „Zdieľať → Pridať na plochu" pre iPhone (Safari nepodporuje prompt). */
function NavodIos() {
  return (
    <ol className="mt-4 flex flex-col gap-3">
      <li className={krok}>
        <span className={cislo}>1</span>
        <span>Otvor túto stránku v prehliadači <strong className="text-ink">Safari</strong>.</span>
      </li>
      <li className={krok}>
        <span className={cislo}>2</span>
        <span>Ťukni na ikonu <strong className="text-ink">Zdieľať</strong> (štvorec so šípkou nahor) v spodnej lište.</span>
      </li>
      <li className={krok}>
        <span className={cislo}>3</span>
        <span>Vyber <strong className="text-ink">Pridať na plochu</strong> a potvrď <strong className="text-ink">Pridať</strong>.</span>
      </li>
      <li className={krok}>
        <span className={cislo}>4</span>
        <span>Appka sa otvorí ako samostatná aplikácia rovno na <strong className="text-ink">Gladiator klube</strong>.</span>
      </li>
    </ol>
  )
}

/** Návod pre prehliadač bez zachytenej udalosti (menu → Inštalovať aplikáciu). */
function NavodMenu() {
  return (
    <ol className="mt-4 flex flex-col gap-3">
      <li className={krok}>
        <span className={cislo}>1</span>
        <span>Otvor menu prehliadača (⋮ alebo ikona inštalácie v adresnom riadku).</span>
      </li>
      <li className={krok}>
        <span className={cislo}>2</span>
        <span>Vyber <strong className="text-ink">Inštalovať aplikáciu</strong> alebo <strong className="text-ink">Pridať na plochu</strong>.</span>
      </li>
      <li className={krok}>
        <span className={cislo}>3</span>
        <span>Appka sa otvorí ako samostatná aplikácia na členskej zóne.</span>
      </li>
    </ol>
  )
}

export function AppkaInstall() {
  const [platforma, setPlatforma] = useState<Platforma>('desktop')
  const [prompt, setPrompt] = useState<InstallPromptEvent | null>(null)
  const [nainstalovana, setNainstalovana] = useState(false)

  useEffect(() => {
    const ua = navigator.userAgent
    const isIos =
      /iphone|ipad|ipod/i.test(ua) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
    setPlatforma(isIos ? 'ios' : /android/i.test(ua) ? 'android' : 'desktop')

    if (window.matchMedia('(display-mode: standalone)').matches) setNainstalovana(true)

    const onPrompt = (e: Event) => {
      e.preventDefault()
      setPrompt(e as InstallPromptEvent)
    }
    const onInstalled = () => {
      setNainstalovana(true)
      setPrompt(null)
    }
    window.addEventListener('beforeinstallprompt', onPrompt)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  async function nainstaluj() {
    if (!prompt) return
    await prompt.prompt()
    await prompt.userChoice
    setPrompt(null)
  }

  if (nainstalovana) {
    return (
      <div className="rounded-2xl border border-gold/30 bg-gold/10 p-5">
        <p className="text-sm text-ink">Appka je nainštalovaná. Nájdeš ju medzi aplikáciami na ploche.</p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-line bg-surface p-5">
      {platforma === 'ios' ? (
        <>
          <h3 className="display text-lg text-ink">Inštalácia na iPhone / iPad</h3>
          <NavodIos />
        </>
      ) : prompt ? (
        <>
          <h3 className="display text-lg text-ink">Inštalácia</h3>
          <p className="mt-2 text-sm text-ink-dim">Jedným ťuknutím pridáš appku na plochu.</p>
          <button
            type="button"
            onClick={nainstaluj}
            className="btn-sweep display mt-4 inline-flex items-center gap-2 rounded-xl bg-gold px-6 py-3 text-sm tracking-[0.12em] text-bg hover:bg-gold-hi"
          >
            Nainštalovať
          </button>
        </>
      ) : (
        <>
          <h3 className="display text-lg text-ink">Inštalácia cez menu prehliadača</h3>
          <p className="mt-2 text-sm text-ink-dim">
            Tvoj prehliadač neponúkol tlačidlo automaticky — pridaj appku ručne:
          </p>
          <NavodMenu />
        </>
      )}
    </div>
  )
}
