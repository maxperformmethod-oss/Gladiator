'use client'

import { useSearchParams } from 'next/navigation'
import { Notice } from '@/components/ui/Notice'

/** Zobrazí sa po návrate zo zrušenej Stripe platby (?zrusene=1). */
export function CancelNotice() {
  const searchParams = useSearchParams()
  if (searchParams.get('zrusene') !== '1') return null
  return (
    <Notice variant="info" className="mb-8">
      Platba bola zrušená — z karty sa nič nestrhlo. Môžeš to skúsiť znova.
    </Notice>
  )
}
