import type { Metadata } from 'next'
import Settings from '@/components/klub/pages/Settings'

export const metadata: Metadata = { title: 'Nastavenia', robots: { index: false } }

export default function NastaveniaPage() {
  return <Settings />
}
