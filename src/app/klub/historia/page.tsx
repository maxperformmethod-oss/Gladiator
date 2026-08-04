import type { Metadata } from 'next'
import History from '@/components/klub/pages/History'

export const metadata: Metadata = { title: 'História', robots: { index: false } }

export default function HistoriaPage() {
  return <History />
}
