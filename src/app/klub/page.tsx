import type { Metadata } from 'next'
import Dashboard from '@/components/klub/pages/Dashboard'

export const metadata: Metadata = { title: 'Prehľad', robots: { index: false } }

export default function KlubPage() {
  return <Dashboard />
}
