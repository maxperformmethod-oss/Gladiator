import type { Metadata } from 'next'
import TrainingEditor from '@/components/klub/pages/TrainingEditor'

export const metadata: Metadata = { title: 'Nový tréning', robots: { index: false } }

export default function NovyTreningPage() {
  return <TrainingEditor />
}
