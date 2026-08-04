import type { Metadata } from 'next'
import WorkoutActive from '@/components/klub/pages/WorkoutActive'

export const metadata: Metadata = { title: 'Aktívny tréning', robots: { index: false } }

export default function AktivnyTreningPage() {
  return <WorkoutActive />
}
