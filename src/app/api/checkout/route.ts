import { NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { getPolozka } from '@/lib/pricing'
import { generateOrderNumber } from '@/lib/order-number'
import { SITE_URL } from '@/lib/gym'

export const runtime = 'nodejs'

/**
 * POST /api/checkout — vytvorí objednávku (PENDING) + Stripe Checkout Session.
 * Body: { kluc: string } — kľúč položky cenníka (lib/pricing.ts).
 * Stripe produkty sa negenerujú ručne — používa sa price_data z cenníka.
 */
export async function POST(req: Request) {
  let kluc: unknown
  try {
    const body = await req.json()
    kluc = body?.kluc
  } catch {
    return NextResponse.json({ error: 'Neplatná požiadavka.' }, { status: 400 })
  }

  if (typeof kluc !== 'string') {
    return NextResponse.json({ error: 'Chýba položka cenníka.' }, { status: 400 })
  }

  const polozka = getPolozka(kluc)
  if (!polozka) {
    return NextResponse.json({ error: 'Položka cenníka neexistuje.' }, { status: 404 })
  }
  if (!polozka.kupitelneOnline || polozka.cenaCenty === null) {
    return NextResponse.json(
      { error: 'Túto položku nie je možné kúpiť online.' },
      { status: 400 }
    )
  }

  // 1) Objednávka PENDING s unikátnym číslom — recepcia podľa neho overí platbu.
  let order
  try {
    order = await prisma.objednavka.create({
      data: {
        cisloObjednavky: generateOrderNumber(),
        produktKluc: polozka.kluc,
        produktNazov: polozka.nazov,
        produktTyp: polozka.typ,
        suma: polozka.cenaCenty,
        mena: 'eur',
        stav: 'PENDING',
      },
    })
  } catch (err) {
    console.error('[checkout] DB error:', err)
    return NextResponse.json(
      { error: 'Objednávky sú momentálne nedostupné (databáza nie je nakonfigurovaná).' },
      { status: 500 }
    )
  }

  // 2) Stripe Checkout Session
  try {
    const stripe = getStripe()
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      locale: 'sk',
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: 'eur',
            unit_amount: polozka.cenaCenty,
            product_data: {
              name: polozka.nazov,
              ...(polozka.platnost
                ? { description: `Platnosť: ${polozka.platnost}` }
                : {}),
            },
          },
        },
      ],
      client_reference_id: order.cisloObjednavky,
      metadata: {
        cisloObjednavky: order.cisloObjednavky,
        produktKluc: polozka.kluc,
        // TBD: fakturačné údaje predávajúceho (IČO/DIČ) — doplniť po dodaní
      },
      success_url: `${SITE_URL}/objednavka/potvrdenie?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${SITE_URL}/cennik?zrusene=1`,
    })

    await prisma.objednavka.update({
      where: { id: order.id },
      data: { stripeSessionId: session.id },
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('[checkout] Stripe error:', err)
    // Neúspešná inicializácia platby — objednávku označ FAILED, nech nevisí PENDING.
    await prisma.objednavka
      .update({ where: { id: order.id }, data: { stav: 'FAILED' } })
      .catch(() => {})

    const message =
      err instanceof Error && err.message.includes('STRIPE_SECRET_KEY')
        ? err.message
        : 'Platbu sa nepodarilo inicializovať. Skús to prosím neskôr.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
