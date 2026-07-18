'use client'

import { useState } from 'react'
import { ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/Button'

/**
 * „Kúpiť online" — vytvorí Stripe Checkout Session cez /api/checkout
 * a presmeruje na platobnú bránu.
 */
export function BuyButton({ kluc, nazov }: { kluc: string; nazov: string }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function buy() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kluc }),
      })
      const data = await res.json()
      if (!res.ok || !data.url) {
        throw new Error(data.error ?? 'Platbu sa nepodarilo spustiť.')
      }
      window.location.assign(data.url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Platbu sa nepodarilo spustiť.')
      setLoading(false)
    }
  }

  return (
    <div>
      <Button
        onClick={buy}
        disabled={loading}
        className="w-full"
        aria-label={`Kúpiť online: ${nazov}`}
      >
        <ShoppingCart size={16} aria-hidden />
        {loading ? 'Presmerovávam…' : 'Kúpiť online'}
      </Button>
      {error && <p className="mt-2 text-xs text-danger">{error}</p>}
    </div>
  )
}
