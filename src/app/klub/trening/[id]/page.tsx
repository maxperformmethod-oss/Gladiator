import type { Metadata } from 'next'
import TrainingEditor from '@/components/klub/pages/TrainingEditor'

export const metadata: Metadata = { title: 'Upraviť tréning', robots: { index: false } }

export default async function UpravitTreningPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <TrainingEditor id={id} />
}
