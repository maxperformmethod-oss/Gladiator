import type { Metadata } from 'next'
import Link from 'next/link'
import { Section } from '@/components/ui/Section'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { AuthForm, Field } from '@/components/auth/AuthForm'
import { registruj } from '@/server/actions/auth'

export const metadata: Metadata = {
  title: 'Registrácia',
  robots: { index: false, follow: false },
}

export default function RegistraciaPage() {
  return (
    <Section>
      <div className="max-w-md">
        <SectionHeading eyebrow="Členská zóna" title="Registrácia" />
        <AuthForm action={registruj} submitLabel="Vytvoriť konto">
          <Field label="E-mail" name="email" type="email" autoComplete="email" required />
          <Field
            label="Heslo"
            name="password"
            type="password"
            autoComplete="new-password"
            minLength={10}
            required
          />
          <Field
            label="Prezývka"
            name="prezyvka"
            autoComplete="off"
            minLength={3}
            maxLength={20}
            required
          />
          <p className="text-sm text-ink-dim">
            Heslo aspoň 10 znakov. Prezývka 3–20 znakov — písmená, číslice, _ alebo -.
          </p>
        </AuthForm>
        <p className="mt-6 text-sm text-ink-dim">
          Už máš konto?{' '}
          <Link href="/prihlasenie" className="text-gold underline-offset-4 hover:underline">
            Prihlás sa
          </Link>
        </p>
      </div>
    </Section>
  )
}
