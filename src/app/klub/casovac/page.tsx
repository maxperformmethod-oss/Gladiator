import type { Metadata } from 'next'
import TimerPage from '@/components/klub/pages/TimerPage'

export const metadata: Metadata = { title: 'Časovač', robots: { index: false } }

export default function CasovacPage() {
  return <TimerPage />
}
