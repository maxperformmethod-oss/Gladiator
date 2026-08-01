import type { Metadata } from 'next'
import Link from 'next/link'
import { Section } from '@/components/ui/Section'
import { SectionHeading } from '@/components/ui/SectionHeading'
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
        <p className="mt-6 text-sm text-ink-dim">
          Nemáš konto?{' '}
          <Link href="/registracia" className="text-gold underline-offset-4 hover:underline">
            Zaregistruj sa
          </Link>
        </p>
      </div>
    </Section>
  )
}
