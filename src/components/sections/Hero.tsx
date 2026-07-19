'use client'

import { useRef } from 'react'
import Image from 'next/image'
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { BRAND } from '@/lib/gym'
import { ButtonLink } from '@/components/ui/Button'

/**
 * Hero — reálny letecký záber arény: pomalý scale-settle pri načítaní,
 * jemný parallax pri scrolli, gradient overlaye pre čitateľnosť textu
 * (najmä na mobile). Reduced motion → statické zobrazenie.
 */
export function Hero() {
  const ref = useRef<HTMLElement>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  })
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '16%'])
  const fade = useTransform(scrollYProgress, [0, 0.7], [1, 0])

  return (
    <section
      ref={ref}
      className="relative flex min-h-[calc(100dvh-4rem)] items-center overflow-hidden"
    >
      {/* Fotka arény s parallaxou a pomalým scale-settle */}
      <motion.div style={{ y: bgY }} className="absolute inset-0" aria-hidden>
        <motion.div
          className="absolute inset-0"
          initial={reduce ? false : { scale: 1.12 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <Image
            src="/fotky/hero-arena.jpg"
            alt="Letecký pohľad na tréningovú arénu Gladiator Gym — stroje a voľné váhy v čierno-zlatej hale"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </motion.div>
        {/* Overlaye: čitateľnosť textu + plynulý prechod do čiernej */}
        <div className="absolute inset-0 bg-gradient-to-r from-bg/85 via-bg/45 to-bg/25" />
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-bg to-transparent" />
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-bg/70 to-transparent" />
        <div className="hex-pattern absolute inset-0 opacity-60" />
      </motion.div>

      <motion.div
        style={{ opacity: fade }}
        className="relative z-10 mx-auto w-full max-w-6xl px-4 py-24 md:px-6"
      >
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="mb-5 inline-flex items-center gap-3 rounded-full border border-line-strong bg-bg/60 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.25em] text-ink-dim backdrop-blur-sm"
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
