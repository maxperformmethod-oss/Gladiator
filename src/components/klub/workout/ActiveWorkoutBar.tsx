'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Play } from 'lucide-react'
import { useApp } from '../AppProvider'
import { activeProgress } from '@/lib/klub/calc'

/** Pripomienka rozbehnutého tréningu – jeden klik a používateľ je späť. */
export function ActiveWorkoutBar() {
  const { data } = useApp()
  const router = useRouter()
  const active = data.active

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom))] z-30 px-3 pb-2 lg:bottom-4 lg:left-60"
        >
          <button
            type="button"
            onClick={() => router.push('/klub/trening/aktivny')}
            className="mx-auto flex w-full max-w-md items-center gap-3 rounded-2xl border border-gold/40 bg-gold/15 px-4 py-3 text-left shadow-xl shadow-black/50 backdrop-blur-md transition-colors hover:bg-gold/25"
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gold text-bg">
              <Play className="size-4" aria-hidden />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[11px] font-semibold uppercase tracking-wider text-gold-hi">
                Prebieha tréning · {Math.round(activeProgress(active) * 100)} %
              </span>
              <span className="block truncate text-sm font-bold">{active.name}</span>
            </span>
            <span className="text-xs font-semibold text-gold-hi">Pokračovať</span>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
