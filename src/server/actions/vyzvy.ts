'use server'

import { revalidatePath } from 'next/cache'
import { VyzvaTyp, VyzvaStav } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { requireAdmin, requireClen } from '@/server/auth'
import { reqString, optString, oneOf, normalizujPrezyvku } from '@/lib/validate'

/** Stav formulárov výziev pre `useActionState`. */
export type VyzvaState = { error?: string; message?: string }

const TYPY = Object.values(VyzvaTyp)
const STAVY = Object.values(VyzvaStav)

/** Slug z názvu: bez diakritiky, len a-z/0-9, ostatné → pomlčka (ako pri cviku). */
function slugify(nazov: string): string {
  return normalizujPrezyvku(nazov)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/** Dátum z `YYYY-MM-DD` na UTC polnoc (stĺpec je @db.Date), inak null. */
function parseDate(value: unknown): Date | null {
  if (typeof value !== 'string') return null
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim())
  if (!m) return null
  const d = new Date(`${value.trim()}T00:00:00.000Z`)
  return Number.isNaN(d.getTime()) ? null : d
}

/** Hodnota zápisu: prijme čiarku aj bodku, 0–999999.99 (Decimal(8,2)). */
function parseHodnota(value: unknown): number | null {
  if (typeof value !== 'string') return null
  const n = Number(value.replace(',', '.').trim())
  if (!Number.isFinite(n) || n < 0 || n > 999999.99) return null
  return Math.round(n * 100) / 100
}

/** Spoločná validácia polí výzvy zo servera. */
async function citajPolia(formData: FormData): Promise<
  | { error: string }
  | {
      nazov: string
      popis: string | null
      typ: VyzvaTyp
      cvikId: string | null
      zaciatok: Date
      koniec: Date
      stav: VyzvaStav
    }
> {
  const nazov = reqString(formData.get('nazov'), 80)
  const popis = optString(formData.get('popis'), 500)
  const typ = oneOf(formData.get('typ'), TYPY)
  const stav = oneOf(formData.get('stav'), STAVY)
  const zaciatok = parseDate(formData.get('zaciatok'))
  const koniec = parseDate(formData.get('koniec'))
  const cvikIdRaw = optString(formData.get('cvikId'), 40)

  if (!nazov || !typ || !stav) return { error: 'Vyplň názov, typ a stav.' }
  if (!zaciatok || !koniec) return { error: 'Zadaj platné dátumy začiatku a konca.' }
  if (koniec.getTime() < zaciatok.getTime()) return { error: 'Koniec nesmie byť pred začiatkom.' }

  // Silová výzva potrebuje cvik; časová ho mať nesmie.
  let cvikId: string | null = null
  if (typ === VyzvaTyp.SILOVA) {
    if (!cvikIdRaw) return { error: 'Silová výzva vyžaduje cvik.' }
    const cvik = await prisma.cvik.findFirst({ where: { id: cvikIdRaw, clenId: null }, select: { id: true } })
    if (!cvik) return { error: 'Vybraný cvik neexistuje.' }
    cvikId = cvik.id
  }

  return { nazov, popis, typ, cvikId, zaciatok, koniec, stav }
}

/** Overí, že by aktiváciou nevznikla druhá aktívna výzva. */
async function mozeBytAktivna(vyzvaId: string | null): Promise<boolean> {
  const ina = await prisma.vyzva.findFirst({
    where: { stav: VyzvaStav.AKTIVNA, ...(vyzvaId ? { id: { not: vyzvaId } } : {}) },
    select: { id: true },
  })
  return ina === null
}

/** A — admin: založenie výzvy. */
export async function vytvorVyzvu(_prev: VyzvaState, formData: FormData): Promise<VyzvaState> {
  await requireAdmin()

  const polia = await citajPolia(formData)
  if ('error' in polia) return polia

  if (polia.stav === VyzvaStav.AKTIVNA && !(await mozeBytAktivna(null))) {
    return { error: 'Už beží iná aktívna výzva. Naraz môže byť aktívna len jedna.' }
  }

  const slug = slugify(polia.nazov)
  if (!slug) return { error: 'Z názvu sa nedá odvodiť slug.' }

  try {
    await prisma.vyzva.create({
      data: {
        slug,
        nazov: polia.nazov,
        popis: polia.popis,
        typ: polia.typ,
        cvikId: polia.cvikId,
        zaciatok: polia.zaciatok,
        koniec: polia.koniec,
        stav: polia.stav,
      },
    })
  } catch {
    return { error: 'Výzva s podobným názvom (slug) už existuje.' }
  }

  revalidatePath('/sprava/vyzvy')
  return { message: `Výzva „${polia.nazov}" vytvorená.` }
}

/** A — admin: úprava výzvy. Slug sa NEmení. */
export async function upravVyzvu(_prev: VyzvaState, formData: FormData): Promise<VyzvaState> {
  await requireAdmin()

  const id = reqString(formData.get('id'), 40)
  if (!id) return { error: 'Chýba identifikátor výzvy.' }

  const polia = await citajPolia(formData)
  if ('error' in polia) return polia

  if (polia.stav === VyzvaStav.AKTIVNA && !(await mozeBytAktivna(id))) {
    return { error: 'Už beží iná aktívna výzva. Naraz môže byť aktívna len jedna.' }
  }

  const res = await prisma.vyzva.updateMany({
    where: { id },
    data: {
      nazov: polia.nazov,
      popis: polia.popis,
      typ: polia.typ,
      cvikId: polia.cvikId,
      zaciatok: polia.zaciatok,
      koniec: polia.koniec,
      stav: polia.stav,
    },
  })
  if (res.count === 0) return { error: 'Výzva sa nenašla.' }

  revalidatePath('/sprava/vyzvy')
  revalidatePath(`/sprava/vyzvy/${id}`)
  return { message: 'Uložené.' }
}

/** B — admin: schválenie / zamietnutie / vrátenie zápisu. */
export async function posudZapis(_prev: VyzvaState, formData: FormData): Promise<VyzvaState> {
  const admin = await requireAdmin()

  const zapisId = reqString(formData.get('zapisId'), 40)
  const akcia = oneOf(formData.get('akcia'), ['schvalit', 'zamietnut', 'vratit'] as const)
  if (!zapisId || !akcia) return { error: 'Neplatná akcia.' }

  const zapis = await prisma.vyzvaZapis.findUnique({ where: { id: zapisId }, select: { id: true, vyzvaId: true } })
  if (!zapis) return { error: 'Zápis sa nenašiel.' }

  if (akcia === 'zamietnut') {
    const dovod = reqString(formData.get('dovod'), 300)
    if (!dovod) return { error: 'Pri zamietnutí je dôvod povinný.' }
    await prisma.vyzvaZapis.update({
      where: { id: zapisId },
      data: { stav: 'ZAMIETNUTE', posudilId: admin.id, posudene: new Date(), dovodZamietnutia: dovod },
    })
  } else if (akcia === 'schvalit') {
    await prisma.vyzvaZapis.update({
      where: { id: zapisId },
      data: { stav: 'SCHVALENE', posudilId: admin.id, posudene: new Date(), dovodZamietnutia: null },
    })
  } else {
    // vrátiť na čakajúce
    await prisma.vyzvaZapis.update({
      where: { id: zapisId },
      data: { stav: 'CAKA', posudilId: null, posudene: null, dovodZamietnutia: null },
    })
  }

  revalidatePath(`/sprava/vyzvy/${zapis.vyzvaId}`)
  revalidatePath('/klub/rebricek')
  return { message: 'Rozhodnutie uložené.' }
}

/** C — člen: odoslanie / prepis vlastného zápisu (upsert, stav → čaká). */
export async function odosliZapis(_prev: VyzvaState, formData: FormData): Promise<VyzvaState> {
  const clen = await requireClen()

  const vyzvaId = reqString(formData.get('vyzvaId'), 40)
  const hodnota = parseHodnota(formData.get('hodnota'))
  if (!vyzvaId) return { error: 'Chýba výzva.' }
  if (hodnota === null) return { error: 'Zadaj platnú hodnotu.' }

  const vyzva = await prisma.vyzva.findFirst({
    where: { id: vyzvaId, stav: VyzvaStav.AKTIVNA },
    select: { id: true },
  })
  if (!vyzva) return { error: 'Výzva už nie je aktívna.' }

  await prisma.vyzvaZapis.upsert({
    where: { vyzvaId_clenId: { vyzvaId, clenId: clen.id } },
    create: { vyzvaId, clenId: clen.id, hodnota, stav: 'CAKA' },
    update: { hodnota, stav: 'CAKA', posudilId: null, posudene: null, dovodZamietnutia: null },
  })

  revalidatePath('/klub/vyzva')
  revalidatePath('/klub/rebricek')
  return { message: 'Odoslané. Čaká na potvrdenie obsluhou.' }
}
