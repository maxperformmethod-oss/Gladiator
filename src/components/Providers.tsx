'use client'

import { MotionConfig } from 'framer-motion'
import type { ReactNode } from 'react'

/**
 * Globálny MotionConfig — rešpektuje prefers-reduced-motion systémovo
 * pre všetky framer-motion animácie (povinné podľa dizajnových pravidiel).
 */
export function Providers({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>
}
