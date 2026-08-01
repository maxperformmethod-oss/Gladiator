import type { Metadata } from 'next'
import Link from 'next/link'
import { Section } from '@/components/ui/Section'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { AuthForm, Field } from '@/components/auth/AuthForm'
import { obnovHeslo } from '@/server/actions/auth'

export const metadata: Metadata = {
  title: 'Obnova hesla',
  robots: { index: false, follow: false },
}

export default function ObnovaHeslaPage() {
  return (
    <Section>
      <div className="max-w-md">
        <SectionHeading
          eyebrow="Členská zóna"
          title="Obnova hesla"
          lead="Zadaj e-mail a pošleme ti odkaz na nastavenie nového hesla."
        />
        <AuthForm action={obnovHeslo} submitLabel="Poslať odkaz">
          <Field label="E-mail" name="email" type="email" autoComplete="email" required />
        </AuthForm>
        <p className="mt-6 text-sm text-ink-dim">
          Spomenul si si?{' '}
          <Link href="/prihlasenie" className="text-gold underline-offset-4 hover:underline">
            Prihlás sa
          </Link>
        </p>
      </div>
    </Section>
  )
}
