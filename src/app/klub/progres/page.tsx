import type { Metadata } from 'next'
import Progress from '@/components/klub/pages/Progress'

export const metadata: Metadata = { title: 'Progres', robots: { index: false } }

export default function ProgresPage() {
  return <Progress />
}
