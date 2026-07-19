'use client'

import Image from 'next/image'
import { motion, useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/cn'

/**
 * Cinematic reveal fotky: clip-path „opona" zdola + jemné scale-settle
 * pri vstupe do viewportu. Voliteľný hover zoom a caption overlay.
 * prefers-reduced-motion → statické zobrazenie bez animácie.
 * Kontajner má pevný aspect → žiadny layout shift.
 */
export function PhotoReveal({
  src,
  alt,
  sizes,
  aspect = 'aspect-[4/3]',
  priority = false,
  hoverZoom = true,
  caption,
  imgClassName,
  className,
}: {
  src: string
  alt: string
  /** Presné sizes pre breakpointy — povinné (bandwidth na mobile). */
  sizes: string
  aspect?: string
  priority?: boolean
  hoverZoom?: boolean
  caption?: string
  /** Napr. object-position trieda pre tváre mimo stredu. */
  imgClassName?: string
  className?: string
}) {
  const reduce = useReducedMotion()

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-2xl border border-line bg-surface-2',
        aspect,
        className
      )}
    >
      <motion.div
        className="absolute inset-0"
        initial={reduce ? false : { clipPath: 'inset(100% 0% 0% 0%)' }}
        whileInView={{ clipPath: 'inset(0% 0% 0% 0%)' }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      >
        <motion.div
          className="absolute inset-0"
          initial={reduce ? false : { scale: 1.12 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        >
          <Image
            src={src}
            alt={alt}
            fill
            sizes={sizes}
            priority={priority}
            className={cn(
              'object-cover',
              hoverZoom &&
                'transition-transform duration-700 ease-out group-hover:scale-[1.05]',
              imgClassName
            )}
          />
        </motion.div>
      </motion.div>

      {caption && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-bg/90 via-bg/40 to-transparent px-4 pb-3 pt-12">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink">
            {caption}
          </p>
        </div>
      )}
    </div>
  )
}
