'use client'

import type { InputHTMLAttributes, ReactNode } from 'react'
import { createContext, useActionState, useContext } from 'react'
import { Button } from '@/components/ui/Button'
import { Notice } from '@/components/ui/Notice'
import type { AuthState } from '@/server/actions/auth'

type AuthAction = (prev: AuthState, formData: FormData) => Promise<AuthState>

// Hodnoty na predvyplnenie polí po chybe (B4). Heslo sem nikdy nepatrí.
const StickyValues = createContext<Record<string, string> | undefined>(undefined)

/**
 * Klientský obal auth formulárov: drží stav odosielania a zobrazí odozvu cez
 * existujúce ui komponenty (Button, Notice). Polia sa vkladajú ako children;
 * po chybe si `Field` predvyplní hodnotu zo `state.values` (okrem hesla).
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
    <StickyValues.Provider value={state.values}>
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
    </StickyValues.Provider>
  )
}

/** Pole formulára — label + input, štýlované cez existujúce dizajnové tokeny. */
export function Field({
  label,
  name,
  type,
  ...rest
}: { label: string } & InputHTMLAttributes<HTMLInputElement>) {
  const sticky = useContext(StickyValues)
  // Heslo sa po chybe nikdy nepredvyplní (B4).
  const defaultValue = type === 'password' || typeof name !== 'string' ? undefined : sticky?.[name]

  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="text-ink-dim">{label}</span>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        {...rest}
        className="w-full rounded-xl border border-line bg-surface px-4 py-3 text-ink outline-none transition-colors focus:border-gold-dim"
      />
    </label>
  )
}
