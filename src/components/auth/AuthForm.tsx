'use client'

import type { InputHTMLAttributes, ReactNode } from 'react'
import { useActionState } from 'react'
import { Button } from '@/components/ui/Button'
import { Notice } from '@/components/ui/Notice'
import type { AuthState } from '@/server/actions/auth'

type AuthAction = (prev: AuthState, formData: FormData) => Promise<AuthState>

/**
 * Klientský obal auth formulárov: drží stav odosielania a zobrazí odozvu cez
 * existujúce ui komponenty (Button, Notice). Polia sa vkladajú ako children.
 */
export function AuthForm({
  action,
  submitLabel,
  children,
}: {
  action: AuthAction
  submitLabel: string
  children: ReactNode
}) {
  const [state, formAction, pending] = useActionState<AuthState, FormData>(action, {})

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {children}
      {state.message && (
        <div aria-live="polite">
          <Notice variant="info">{state.message}</Notice>
        </div>
      )}
      {state.error && (
        <div aria-live="polite">
          <Notice variant="warning">{state.error}</Notice>
        </div>
      )}
      <Button type="submit" disabled={pending}>
        {pending ? 'Odosielam…' : submitLabel}
      </Button>
    </form>
  )
}

/** Pole formulára — label + input, štýlované cez existujúce dizajnové tokeny. */
export function Field({
  label,
  ...rest
}: { label: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="text-ink-dim">{label}</span>
      <input
        {...rest}
        className="w-full rounded-xl border border-line bg-surface px-4 py-3 text-ink outline-none transition-colors focus:border-gold-dim"
      />
    </label>
  )
}
