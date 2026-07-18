'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { BRAND } from '@/lib/gym'
import { ButtonLink } from '@/components/ui/Button'

/**
 * Hero — fullscreen, jemný parallax pozadia, claim značky.
 * Pozadie = placeholder; príde reálne foto/video z arény LC.
 */
export function Hero() {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  })
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '18%'])
  const fade = useTransform(scrollYProgress, [0, 0.7], [1, 0])

  return (
    <section
      ref={ref}
      className="relative flex min-h-[calc(100dvh-4rem)] items-center overflow-hidden"
    >
      {/* Parallax pozadie — hex motív + zlatá žiara (placeholder za foto/video) */}
      <motion.div style={{ y: bgY }} className="absolute inset-0" aria-hidden>
        <div className="hex-pattern absolute inset-0" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_38%,rgba(212,175,55,0.13),transparent_70%)]" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-bg to-transparent" />
      </motion.div>

      <p className="absolute right-4 top-4 z-10 text-[10px] font-semibold uppercase tracking-[0.2em] text-warning/70">
        Pozadie: nahradiť reálnou fotkou / videom LC
      </p>

      <motion.div
        style={{ opacity: fade }}
        className="relative z-10 mx-auto w-full max-w-6xl px-4 py-24 md:px-6"
      >
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="mb-5 inline-flex items-center gap-3 rounded-full border border-line-strong bg-surface/60 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.25em] text-ink-dim"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-gold" aria-hidden />
          {BRAND.tagline} · est. {BRAND.zalozene} · {BRAND.pobocka}
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.08 }}
          className="display max-w-4xl text-5xl text-ink sm:text-6xl md:text-8xl"
        >
          Osloboď to najlepšie
          <br />
          <span className="gold-text">zo samého seba</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.16 }}
          className="mt-6 max-w-xl text-base text-ink-dim md:text-lg"
        >
          Industriálna tréningová aréna v Lučenci. Voľné váhy, stroje, kardio aj
          sprint dráha — pre serióznych cvičencov aj úplných začiatočníkov.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.24 }}
          className="mt-10 flex flex-wrap gap-4"
        >
          <ButtonLink href="/cennik">Cenník a členstvá</ButtonLink>
          <ButtonLink href="/vybavenie" variant="outline">
            Prezri si gym
          </ButtonLink>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.8 }}
        className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2 text-ink-faint"
        aria-hidden
      >
        <ChevronDown size={22} className="animate-bounce" />
      </motion.div>
    </section>
  )
}
