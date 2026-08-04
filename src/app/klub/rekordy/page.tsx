import type { Metadata } from 'next'
import Records from '@/components/klub/pages/Records'

export const metadata: Metadata = { title: 'Rekordy', robots: { index: false } }

export default function RekordyPage() {
  return <Records />
}
