import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { Section } from '@/components/ui/Section'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { AuthForm, Field } from '@/components/auth/AuthForm'
import { getAuthUser, getClen } from '@/server/auth'
import { doplnPrezyvku } from '@/server/actions/auth'

export const metadata: Metadata = {
  title: 'Doplnenie prezývky',
  robots: { index: false, follow: false },
}

export default async function PrezyvkaPage() {
  // Stránka len pre prihlásený Supabase účet, ktorý ešte nemá záznam Clen.
  const user = await getAuthUser()
  if (!user) redirect('/prihlasenie')
  const clen = await getClen()
  if (clen) redirect('/klub')

  return (
    <Section>
      <div className="max-w-md">
        <SectionHeading
          eyebrow="Členská zóna"
          title="Vyber si prezývku"
          lead="Ešte jeden krok — pod touto prezývkou ťa uvidia ostatní."
        />
        <AuthForm action={doplnPrezyvku} submitLabel="Uložiť prezývku">
          <Field
            label="Prezývka"
            name="prezyvka"
            autoComplete="off"
            minLength={3}
            maxLength={20}
            required
          />
          <p className="text-sm text-ink-dim">
            3–20 znakov — písmená, číslice, _ alebo -.
          </p>
        </AuthForm>
      </div>
    </Section>
  )
}
