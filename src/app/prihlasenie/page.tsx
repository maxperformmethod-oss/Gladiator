import type { Metadata } from 'next'
import Link from 'next/link'
import { Section } from '@/components/ui/Section'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Notice } from '@/components/ui/Notice'
import { AuthForm, Field } from '@/components/auth/AuthForm'
import { prihlas } from '@/server/actions/auth'

export const metadata: Metadata = {
  title: 'Prihlásenie',
  robots: { index: false, follow: false },
}

export default function PrihlaseniePage() {
  return (
    <Section>
      <div className="max-w-md">
        <SectionHeading eyebrow="Členská zóna" title="Prihlásenie" />
        <AuthForm action={prihlas} submitLabel="Prihlásiť sa">
          <Field label="E-mail" name="email" type="email" autoComplete="email" required />
          <Field
            label="Heslo"
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />
        </AuthForm>

        {/* B2: trvalá poznámka — zobrazená vždy, teda neprezradí nič o konkrétnom účte. */}
        <Notice variant="info" className="mt-6">
          Ak si sa práve zaregistroval, najprv potvrď e-mail — odkaz sme ti poslali.
        </Notice>

        <p className="mt-6 text-sm text-ink-dim">
          <Link href="/obnova-hesla" className="text-gold underline-offset-4 hover:underline">
            Zabudol si heslo?
          </Link>
        </p>
        <p className="mt-2 text-sm text-ink-dim">
          Nemáš konto?{' '}
          <Link href="/registracia" className="text-gold underline-offset-4 hover:underline">
            Zaregistruj sa
          </Link>
        </p>
      </div>
    </Section>
  )
}
