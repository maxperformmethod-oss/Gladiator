import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { Section } from '@/components/ui/Section'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { AuthForm, Field } from '@/components/auth/AuthForm'
import { getAuthUser } from '@/server/auth'
import { nastavHeslo } from '@/server/actions/auth'

export const metadata: Metadata = {
  title: 'Nové heslo',
  robots: { index: false, follow: false },
}

export default async function NoveHesloPage() {
  // Sem sa dá dostať len s platnou session z odkazu v e-maile.
  const user = await getAuthUser()
  if (!user) redirect('/prihlasenie')

  return (
    <Section>
      <div className="max-w-md">
        <SectionHeading eyebrow="Členská zóna" title="Nové heslo" />
        <AuthForm action={nastavHeslo} submitLabel="Uložiť heslo">
          <Field
            label="Nové heslo"
            name="password"
            type="password"
            autoComplete="new-password"
            minLength={10}
            required
          />
          <p className="text-sm text-ink-dim">Aspoň 10 znakov.</p>
        </AuthForm>
      </div>
    </Section>
  )
}
