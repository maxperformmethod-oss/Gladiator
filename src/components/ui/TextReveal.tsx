'use client'

import { motion, useReducedMotion } from 'framer-motion'

/**
 * Text reveal po slovách — jemný fade-up stagger pri scrolli.
 * prefers-reduced-motion → statický text. A11y: čítačky dostanú celý
 * text cez aria-label, animované slová sú aria-hidden.
 */
export function TextReveal({
  text,
  delay = 0,
}: {
  text: string
  delay?: number
}) {
  const reduce = useReducedMotion()
  if (reduce) return <>{text}</>

  const slova = text.split(' ')
  return (
    <span aria-label={text}>
      {slova.map((slovo, i) => (
        <motion.span
          key={`${slovo}-${i}`}
          aria-hidden
          className="inline-block will-change-transform"
          initial={{ opacity: 0, y: '0.55em' }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{
            duration: 0.5,
            ease: 'easeOut',
            delay: delay + i * 0.045,
          }}
        >
          {slovo}
          {i < slova.length - 1 ? ' ' : ''}
        </motion.span>
      ))}
    </span>
  )
}
