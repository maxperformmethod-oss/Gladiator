import type { Metadata } from 'next'
import TrainingList from '@/components/klub/pages/TrainingList'

export const metadata: Metadata = { title: 'Tréningy', robots: { index: false } }

export default function TreningPage() {
  return <TrainingList />
}
