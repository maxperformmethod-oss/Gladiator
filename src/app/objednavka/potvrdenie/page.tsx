import type { Metadata } from 'next'
import { CheckCircle2, Clock } from 'lucide-react'
import { Section } from '@/components/ui/Section'
import { Notice } from '@/components/ui/Notice'
import { ButtonLink } from '@/components/ui/Button'
import { getStripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { formatCena } from '@/lib/pricing'
import { KONTAKT } from '@/lib/gym'
import type { Objednavka } from '@prisma/client'

export const metadata: Metadata = {
  title: 'Potvrdenie objednávky',
}

// DB + Stripe dopyt pri každom zobrazení — nesmie sa prerenderovať pri buildi.
export const dynamic = 'force-dynamic'

export default async function PotvrdeniePage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>
}) {
  const { session_id } = await searchParams

  if (!session_id) {
    return (
      <Wrapper>
        <Notice>Chýba identifikátor platby — otvor stránku z odkazu po platbe.</Notice>
        <ButtonLink href="/cennik" variant="outline" className="mt-6">
          Späť na cenník
        </ButtonLink>
      </Wrapper>
    )
  }

  let order: Objednavka | null = null
  let loadError = false

  try {
    order = await prisma.objednavka.findUnique({
      where: { stripeSessionId: session_id },
    })

    // Fallback pre prípad, že webhook ešte nedobehol: over stav priamo v Stripe
    // a objednávku označ PAID hneď — zákazník vidí potvrdenie okamžite.
    if (order && order.stav === 'PENDING') {
      const session = await getStripe().checkout.sessions.retrieve(session_id)
      if (session.payment_status === 'paid') {
        order = await prisma.objednavka.update({
          where: { id: order.id },
          data: {
            stav: 'PAID',
            stripePaymentIntentId:
              typeof session.payment_intent === 'string'
                ? session.payment_intent
                : (session.payment_intent?.id ?? null),
            email: order.email ?? session.customer_details?.email ?? null,
            meno: order.meno ?? session.customer_details?.name ?? null,
          },
        })
      }
    }
  } catch (err) {
    console.error('[potvrdenie] error:', err)
    loadError = true
  }

  if (loadError || !order) {
    return (
      <Wrapper>
        <Notice>
          Objednávku sa nepodarilo načítať. Ak ti z karty odišla platba, napíš nám
          na{' '}
          <a href={KONTAKT.emailHref} className="text-gold hover:text-gold-hi">
            {KONTAKT.email}
          </a>{' '}
          a uveď identifikátor platby: <code className="break-all">{session_id}</code>
        </Notice>
        <ButtonLink href="/cennik" variant="outline" className="mt-6">
          Späť na cenník
        </ButtonLink>
      </Wrapper>
    )
  }

  const zaplatena = order.stav === 'PAID'

  return (
    <Wrapper>
      <div className="flex flex-col items-center text-center">
        {zaplatena ? (
          <CheckCircle2 size={48} className="text-success" aria-hidden />
        ) : (
          <Clock size={48} className="text-warning" aria-hidden />
        )}
        <h1 className="display mt-4 text-3xl text-ink md:text-5xl">
          {zaplatena ? 'Platba prebehla úspešne' : 'Platba sa spracováva'}
        </h1>
        <p className="mt-3 max-w-md text-sm text-ink-dim">
          {zaplatena
            ? 'Potvrdenie platby ti poslal Stripe na email. Toto je tvoje číslo objednávky — nahlás ho pri vstupe na recepcii:'
            : 'Platba zatiaľ nie je potvrdená. Ak si platbu dokončil, stav sa aktualizuje o chvíľu — číslo objednávky si každopádne ulož:'}
        </p>

        <p className="tnum mt-6 rounded-2xl border border-gold-dim bg-gold-soft px-8 py-4 text-2xl font-semibold tracking-widest text-gold md:text-3xl">
          {order.cisloObjednavky}
        </p>

        <dl className="mt-8 w-full max-w-sm space-y-2 text-sm">
          <Row label="Produkt" value={order.produktNazov} />
          <Row label="Suma" value={formatCena(order.suma)} />
          {order.meno && <Row label="Meno" value={order.meno} />}
          {order.email && <Row label="Email" value={order.email} />}
          <Row
            label="Dátum"
            value={new Intl.DateTimeFormat('sk-SK', {
              dateStyle: 'medium',
              timeStyle: 'short',
            }).format(order.createdAt)}
          />
          <Row label="Stav" value={zaplatena ? 'Zaplatená' : 'Čaká na potvrdenie'} />
        </dl>

        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <ButtonLink href="/">Späť na domov</ButtonLink>
          <ButtonLink href="/kontakt" variant="outline">
            Potrebujem pomoc
          </ButtonLink>
        </div>
      </div>
    </Wrapper>
  )
}

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <Section className="hex-pattern">
      <div className="mx-auto max-w-2xl">{children}</div>
    </Section>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-line pb-2">
      <dt className="text-ink-faint">{label}</dt>
      <dd className="text-right text-ink">{value}</dd>
    </div>
  )
}
