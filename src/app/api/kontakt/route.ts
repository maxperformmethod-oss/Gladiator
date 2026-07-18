import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isEmail, reqString } from '@/lib/validate'

export const runtime = 'nodejs'

/** POST /api/kontakt — uloží správu z kontaktného formulára (Dopyt: KONTAKT). */
export async function POST(req: Request) {
  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Neplatná požiadavka.' }, { status: 400 })
  }

  const meno = reqString(body.meno, 120)
  const email = reqString(body.email, 200)
  const sprava = reqString(body.sprava, 2000)

  if (!meno || !email || !sprava || !isEmail(email)) {
    return NextResponse.json(
      { error: 'Vyplň meno, platný email a správu.' },
      { status: 400 }
    )
  }

  try {
    await prisma.dopyt.create({
      data: { typ: 'KONTAKT', meno, email, sprava },
    })
  } catch (err) {
    console.error('[kontakt] DB error:', err)
    return NextResponse.json(
      { error: 'Správu sa momentálne nepodarilo uložiť. Skús to neskôr alebo zavolaj.' },
      { status: 500 }
    )
  }

  return NextResponse.json({ ok: true })
}
