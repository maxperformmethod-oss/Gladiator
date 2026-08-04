'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

const PRESETS = [30, 60, 90, 120]

/**
 * Plávajúci časovač odpočinku (bez knižnice). Štartuje sa oknovým eventom
 * `gg:odpocinok` (detail = sekundy) — napr. po odškrtnutí série. Žije v layoute
 * `/klub`, takže beží ďalej pri prechode medzi stránkami. Zvuk cez Web Audio.
 */
export function CasovacOdpocinku({ odpocinokSek, zvuk }: { odpocinokSek: number; zvuk: boolean }) {
  const [zostava, setZostava] = useState<number | null>(null)
  const [bezi, setBezi] = useState(false)
  const audioRef = useRef<AudioContext | null>(null)

  const pipni = useCallback(() => {
    if (!zvuk) return
    try {
      const Ctor =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      if (!Ctor) return
      const ctx = audioRef.current ?? new Ctor()
      audioRef.current = ctx
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.frequency.value = 880
      gain.gain.value = 0.15
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start()
      osc.stop(ctx.currentTime + 0.2)
    } catch {
      /* audio nedostupné */
    }
  }, [zvuk])

  const start = useCallback((sek: number) => {
    setZostava(sek)
    setBezi(true)
  }, [])

  useEffect(() => {
    const h = (e: Event) => {
      const sek = (e as CustomEvent<number>).detail
      start(Number.isFinite(sek) && sek > 0 ? sek : odpocinokSek)
    }
    window.addEventListener('gg:odpocinok', h)
    return () => window.removeEventListener('gg:odpocinok', h)
  }, [odpocinokSek, start])

  useEffect(() => {
    if (!bezi || zostava === null) return
    if (zostava <= 0) {
      setBezi(false)
      pipni()
      return
    }
    const t = setTimeout(() => setZostava((z) => (z === null ? null : z - 1)), 1000)
    return () => clearTimeout(t)
  }, [bezi, zostava, pipni])

  if (zostava === null) return null

  const mm = Math.floor(zostava / 60)
  const ss = String(zostava % 60).padStart(2, '0')
  const btn = 'rounded-lg border border-line px-2 py-1 text-xs text-ink-dim transition-colors hover:text-ink'

  return (
    <div
      role="timer"
      aria-label="Odpočinok"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-bg/95 backdrop-blur"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center gap-2 px-4 py-2 md:px-6">
        <span className="display mr-1 text-2xl text-gold [font-variant-numeric:tabular-nums]">
          {mm}:{ss}
        </span>
        <button type="button" onClick={() => setBezi((b) => !b)} aria-label={bezi ? 'Pauza' : 'Pokračovať'} className={btn}>
          {bezi ? 'Pauza' : 'Štart'}
        </button>
        <button type="button" onClick={() => setZostava((z) => Math.max(0, (z ?? 0) - 15))} aria-label="mínus 15 sekúnd" className={btn}>
          −15
        </button>
        <button type="button" onClick={() => setZostava((z) => (z ?? 0) + 15)} aria-label="plus 15 sekúnd" className={btn}>
          +15
        </button>
        <div className="ml-auto flex items-center gap-1">
          {PRESETS.map((p) => (
            <button key={p} type="button" onClick={() => start(p)} aria-label={`${p} sekúnd`} className={btn}>
              {p}
            </button>
          ))}
          <button
            type="button"
            onClick={() => {
              setZostava(null)
              setBezi(false)
            }}
            aria-label="Zavrieť odpočinok"
            className="rounded-lg px-2 py-1 text-sm text-ink-dim transition-colors hover:text-ink"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  )
}
