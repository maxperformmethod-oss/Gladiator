import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { SLUZBY } from '@/lib/gym'
import { isEmail, optString, reqString } from '@/lib/validate'

export const runtime = 'nodejs'

/**
 * POST /api/rezervacia — uloží rezervačný dopyt (Dopyt: REZERVACIA).
 * Fáza 1: iba zber dopytu — bez automatického potvrdzovania termínu.
 */
export async function POST(req: Request) {
  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Neplatná požiadavka.' }, { status: 400 })
  }

  const meno = reqString(body.meno, 120)
  const email = reqString(body.email, 200)
  const telefon = optString(body.telefon, 30)
  const sluzbaRaw = reqString(body.sluzba, 60)
  const terminPozadovany = optString(body.terminPozadovany, 200)
  const sprava = optString(body.sprava, 2000)

  if (!meno || !email || !isEmail(email)) {
    return NextResponse.json(
      { error: 'Vyplň meno a platný email.' },
      { status: 400 }
    )
  }

  const sluzba =
    sluzbaRaw && (sluzbaRaw === 'ine' || SLUZBY.some((s) => s.slug === sluzbaRaw))
      ? sluzbaRaw
      : 'ine'

  try {
    await prisma.dopyt.create({
      data: {
        typ: 'REZERVACIA',
        meno,
        email,
        telefon,
        sluzba,
        terminPozadovany,
        sprava,
      },
    })
  } catch (err) {
    console.error('[rezervacia] DB error:', err)
    return NextResponse.json(
      { error: 'Dopyt sa momentálne nepodarilo uložiť. Skús to neskôr alebo zavolaj.' },
      { status: 500 }
    )
  }

  return NextResponse.json({ ok: true })
}
