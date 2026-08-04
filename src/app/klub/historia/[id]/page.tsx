import type { Metadata } from 'next'
import { Suspense } from 'react'
import HistoryDetail from '@/components/klub/pages/HistoryDetail'

export const metadata: Metadata = { title: 'Tréning', robots: { index: false } }

export default async function HistoriaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <Suspense fallback={null}>
      <HistoryDetail id={id} />
    </Suspense>
  )
}
