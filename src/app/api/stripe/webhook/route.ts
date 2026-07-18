import { NextResponse } from 'next/server'
import type Stripe from 'stripe'
import { getStripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'

/**
 * POST /api/stripe/webhook — potvrdenie platby zo Stripe.
 * checkout.session.completed → Objednavka.stav = PAID (+ email/meno zákazníka)
 * checkout.session.expired   → Objednavka.stav = FAILED (ak stále PENDING)
 *
 * Potvrdzovací email zákazníkovi posiela Stripe automaticky (receipt).
 * Pri chybe DB vraciame 500 → Stripe doručenie zopakuje.
 */
export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  if (!secret || secret.includes('PLACEHOLDER')) {
    console.error('[webhook] STRIPE_WEBHOOK_SECRET nie je nakonfigurovaný.')
    return NextResponse.json({ error: 'Webhook nie je nakonfigurovaný.' }, { status: 500 })
  }

  const signature = req.headers.get('stripe-signature')
  if (!signature) {
    return NextResponse.json({ error: 'Chýba podpis.' }, { status: 400 })
  }

  // Overenie podpisu vyžaduje surové telo požiadavky.
  const body = await req.text()

  let event: Stripe.Event
  try {
    event = getStripe().webhooks.constructEvent(body, signature, secret)
  } catch (err) {
    console.error('[webhook] Neplatný podpis:', err)
    return NextResponse.json({ error: 'Neplatný podpis.' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const paymentIntentId =
          typeof session.payment_intent === 'string'
            ? session.payment_intent
            : (session.payment_intent?.id ?? null)

        const order = await findOrder(session)
        if (!order) {
          console.error('[webhook] Objednávka pre session nenájdená:', session.id)
          break // nevraciame 500 — retry by nepomohol
        }

        await prisma.objednavka.update({
          where: { id: order.id },
          data: {
            stav: 'PAID',
            stripeSessionId: order.stripeSessionId ?? session.id,
            stripePaymentIntentId: paymentIntentId,
            email: order.email ?? session.customer_details?.email ?? null,
            meno: order.meno ?? session.customer_details?.name ?? null,
          },
        })
        break
      }

      case 'checkout.session.expired': {
        const session = event.data.object as Stripe.Checkout.Session
        const order = await findOrder(session)
        if (order && order.stav === 'PENDING') {
          await prisma.objednavka.update({
            where: { id: order.id },
            data: { stav: 'FAILED' },
          })
        }
        break
      }

      default:
        // Ostatné eventy ignorujeme (Fáza 1: len karty — sync platby).
        break
    }
  } catch (err) {
    console.error('[webhook] DB error:', err)
    // 500 → Stripe webhook zopakuje neskôr.
    return NextResponse.json({ error: 'Spracovanie zlyhalo.' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}

/** Nájde objednávku podľa session id, s fallbackom na číslo objednávky z metadát. */
async function findOrder(session: Stripe.Checkout.Session) {
  const bySession = await prisma.objednavka.findUnique({
    where: { stripeSessionId: session.id },
  })
  if (bySession) return bySession

  const cislo =
    session.metadata?.cisloObjednavky ?? session.client_reference_id ?? undefined
  if (!cislo) return null
  return prisma.objednavka.findUnique({ where: { cisloObjednavky: cislo } })
}
