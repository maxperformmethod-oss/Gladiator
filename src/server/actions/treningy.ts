'use server'

import { revalidatePath } from 'next/cache'
import { Partia, Jednotka } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/server/auth'
import { numberInRange, oneOf, reqString, normalizujPrezyvku } from '@/lib/validate'

/** Stav admin formulárov pre `useActionState`. */
export type SpravaState = { error?: string; message?: string }

const PARTIE = Object.values(Partia)
const JEDNOTKY = Object.values(Jednotka)

/** Slug z názvu: bez diakritiky, len a-z/0-9, medzery a ostatné → pomlčka. */
function slugify(nazov: string): string {
  return normalizujPrezyvku(nazov)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/** C1 — pridanie GLOBÁLNEHO cviku (clenId = null). */
export async function vytvorCvik(_prev: SpravaState, formData: FormData): Promise<SpravaState> {
  await requireAdmin()

  const nazov = reqString(formData.get('nazov'), 80)
  const partia = oneOf(formData.get('partia'), PARTIE)
  const jednotka = oneOf(formData.get('jednotka'), JEDNOTKY)
  const poradie = numberInRange(formData.get('poradie'), 0, 9999) ?? 0
  const aktivny = formData.get('aktivny') === 'on'

  if (!nazov || !partia || !jednotka) {
    return { error: 'Vyplň názov, partiu a jednotku.' }
  }
  const slug = slugify(nazov)
  if (!slug) return { error: 'Z názvu sa nedá odvodiť slug.' }

  try {
    await prisma.cvik.create({
      data: { slug, nazov, partia, jednotka, poradie, aktivny, clenId: null },
    })
  } catch {
    return { error: 'Cvik s podobným názvom (slug) už existuje.' }
  }

  revalidatePath('/sprava/cviky')
  return { message: `Cvik „${nazov}" pridaný.` }
}

/** C1 — úprava globálneho cviku. Mazanie nie je — deaktivuje sa cez `aktivny`. */
export async function upravCvik(_prev: SpravaState, formData: FormData): Promise<SpravaState> {
  await requireAdmin()

  const id = reqString(formData.get('id'), 40)
  const nazov = reqString(formData.get('nazov'), 80)
  const partia = oneOf(formData.get('partia'), PARTIE)
  const jednotka = oneOf(formData.get('jednotka'), JEDNOTKY)
  const poradie = numberInRange(formData.get('poradie'), 0, 9999) ?? 0
  const aktivny = formData.get('aktivny') === 'on'

  if (!id || !nazov || !partia || !jednotka) {
    return { error: 'Vyplň názov, partiu a jednotku.' }
  }

  // Iba globálne cviky (clenId = null) — vlastné cviky členov sa tu nespravujú.
  const res = await prisma.cvik.updateMany({
    where: { id, clenId: null },
    data: { nazov, partia, jednotka, poradie, aktivny },
  })
  if (res.count === 0) return { error: 'Cvik sa nenašiel.' }

  revalidatePath('/sprava/cviky')
  return { message: 'Uložené.' }
}

/** C2 — založenie plánu. H1: admin ho zakladá SÁM SEBE (`clenId` = admin). */
export async function vytvorPlan(_prev: SpravaState, formData: FormData): Promise<SpravaState> {
  const admin = await requireAdmin()

  const nazov = reqString(formData.get('nazov'), 80)
  if (!nazov) return { error: 'Zadaj názov plánu.' }

  const cviky = await prisma.cvik.findMany({
    where: { clenId: null, aktivny: true },
    orderBy: { poradie: 'asc' },
  })

  const polozky: { cvikId: string; cielSerie: number; cielOpakovania: number; poradie: number }[] = []
  let poradie = 1
  for (const c of cviky) {
    if (formData.get(`cvik_${c.id}`) !== 'on') continue
    const serie = numberInRange(formData.get(`serie_${c.id}`), 1, 50)
    const opak = numberInRange(formData.get(`opak_${c.id}`), 1, 500)
    if (!serie || !opak) {
      return { error: `Pri cviku „${c.nazov}" vyplň série aj opakovania.` }
    }
    polozky.push({ cvikId: c.id, cielSerie: serie, cielOpakovania: opak, poradie: poradie++ })
  }
  if (polozky.length === 0) return { error: 'Vyber aspoň jeden cvik a zadaj cieľ.' }

  await prisma.treningPlan.create({
    data: { clenId: admin.id, nazov, cviky: { create: polozky } },
  })

  revalidatePath('/sprava/plany')
  return { message: `Plán „${nazov}" vytvorený.` }
}
