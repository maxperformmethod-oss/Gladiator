'use client'

import type { ReactNode } from 'react'
import { useActionState } from 'react'
import { Button } from '@/components/ui/Button'
import { Notice } from '@/components/ui/Notice'
import type { KlubState } from '@/server/actions/klub'

type Action = (prev: KlubState, formData: FormData) => Promise<KlubState>
type Variant = 'gold' | 'outline' | 'ghost'

/**
 * Všeobecný obal členských formulárov: stav odosielania + odozva cez existujúce
 * ui komponenty. Polia sa vkladajú ako children (rovnaký vzor ako CvikForm).
 */
export function AkciaForm({
  action,
  submitLabel,
  children,
  variant = 'gold',
  className = 'flex flex-col gap-3',
}: {
  action: Action
  submitLabel: string
  children?: ReactNode
  variant?: Variant
  className?: string
}) {
  const [state, formAction, pending] = useActionState<KlubState, FormData>(action, {})

  return (
    <form action={formAction} className={className}>
      {children}
      {state.error && (
        <div aria-live="polite">
          <Notice variant="warning">{state.error}</Notice>
        </div>
      )}
      {state.message && (
        <div aria-live="polite">
          <Notice variant="info">{state.message}</Notice>
        </div>
      )}
      <Button type="submit" variant={variant} disabled={pending}>
        {pending ? '…' : submitLabel}
      </Button>
    </form>
  )
}
