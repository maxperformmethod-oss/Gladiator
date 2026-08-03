'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { requireClen } from '@/server/auth'
import { numberInRange, reqString } from '@/lib/validate'

/** Stav členských formulárov pre `useActionState` (rovnaký vzor ako treningy.ts). */
export type KlubState = { error?: string; message?: string }

// ── Plány člena ────────────────────────────────────────────────────────────
// Jediné miesto v appke, kde plány vznikajú. Vlastník = prihlásený člen.

export async function vytvorMojPlan(_prev: KlubState, formData: FormData): Promise<KlubState> {
  const clen = await requireClen()
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
    if (!serie || !opak) return { error: `Pri cviku „${c.nazov}" vyplň série aj opakovania.` }
    polozky.push({ cvikId: c.id, cielSerie: serie, cielOpakovania: opak, poradie: poradie++ })
  }
  if (polozky.length === 0) return { error: 'Vyber aspoň jeden cvik a zadaj cieľ.' }

  await prisma.treningPlan.create({
    data: { clenId: clen.id, nazov, cviky: { create: polozky } },
  })
  revalidatePath('/klub/trening')
  return { message: `Plán „${nazov}" vytvorený.` }
}

export async function premenujPlan(_prev: KlubState, formData: FormData): Promise<KlubState> {
  const clen = await requireClen()
  const id = reqString(formData.get('id'), 40)
  const nazov = reqString(formData.get('nazov'), 80)
  if (!id || !nazov) return { error: 'Zadaj názov.' }

  const res = await prisma.treningPlan.updateMany({
    where: { id, clenId: clen.id }, // vlastníctvo cez clenId, nie cez id z formData
    data: { nazov },
  })
  if (res.count === 0) return { error: 'Plán sa nenašiel.' }
  revalidatePath('/klub/trening')
  return { message: 'Premenované.' }
}

export async function zmazPlan(_prev: KlubState, formData: FormData): Promise<KlubState> {
  const clen = await requireClen()
  const id = reqString(formData.get('id'), 40)
  if (!id) return { error: 'Chýba plán.' }

  // Cascade zmaže PlanCvik; Trening.planId je SET NULL, odcvičené tréningy prežijú.
  const res = await prisma.treningPlan.deleteMany({ where: { id, clenId: clen.id } })
  if (res.count === 0) return { error: 'Plán sa nenašiel.' }
  revalidatePath('/klub/trening')
  return { message: 'Plán zmazaný.' }
}

// ── Tréning ──────────────────────────────────────────────────────────────────

export async function zacniTrening(_prev: KlubState, formData: FormData): Promise<KlubState> {
  const clen = await requireClen()

  // Najviac jeden otvorený tréning naraz.
  const otvoreny = await prisma.trening.findFirst({
    where: { clenId: clen.id, koniec: null },
    select: { id: true },
  })
  if (otvoreny) return { error: 'Máš otvorený tréning — pokračuj v ňom alebo ho ukonči.' }

  const planIdRaw = reqString(formData.get('planId'), 40)
  let planId: string | null = null
  let nazov = reqString(formData.get('nazov'), 80)

  if (planIdRaw) {
    const plan = await prisma.treningPlan.findFirst({
      where: { id: planIdRaw, clenId: clen.id }, // plán musí patriť členovi
      select: { id: true, nazov: true },
    })
    if (!plan) return { error: 'Plán sa nenašiel.' }
    planId = plan.id
    if (!nazov) nazov = plan.nazov
  }
  if (!nazov) nazov = 'Tréning'

  await prisma.trening.create({
    data: { clenId: clen.id, planId, nazov, zaciatok: new Date() },
  })
  revalidatePath('/klub/trening')
  return { message: 'Tréning začatý.' }
}

export async function pridajSeriu(_prev: KlubState, formData: FormData): Promise<KlubState> {
  const clen = await requireClen()
  const treningId = reqString(formData.get('treningId'), 40)
  const cvikId = reqString(formData.get('cvikId'), 40)
  const hmotnost = numberInRange(formData.get('hmotnost'), 0, 999.99)
  const opakovania = numberInRange(formData.get('opakovania'), 1, 500)

  if (!treningId || !cvikId) return { error: 'Chýba tréning alebo cvik.' }
  if (hmotnost === null) return { error: 'Hmotnosť zadaj v rozsahu 0–999.99 kg.' }
  if (opakovania === null) return { error: 'Opakovania zadaj v rozsahu 1–500.' }

  // Tréning musí patriť členovi a byť otvorený.
  const trening = await prisma.trening.findFirst({
    where: { id: treningId, clenId: clen.id, koniec: null },
    select: { id: true },
  })
  if (!trening) return { error: 'Otvorený tréning sa nenašiel.' }

  // Cvik musí byť globálny a aktívny (vlastné cviky sú až H2+).
  const cvik = await prisma.cvik.findFirst({
    where: { id: cvikId, clenId: null, aktivny: true },
    select: { id: true },
  })
  if (!cvik) return { error: 'Cvik sa nenašiel.' }

  const pocet = await prisma.seria.count({ where: { treningId } })
  await prisma.seria.create({
    data: { treningId, cvikId, hmotnost, opakovania, poradie: pocet + 1 },
  })
  revalidatePath('/klub/trening')
  return { message: 'Séria pridaná.' }
}

export async function zmazSeriu(_prev: KlubState, formData: FormData): Promise<KlubState> {
  const clen = await requireClen()
  const id = reqString(formData.get('id'), 40)
  if (!id) return { error: 'Chýba séria.' }

  // Len vlastná (cez Trening.clenId) a len kým tréning nie je ukončený.
  const res = await prisma.seria.deleteMany({
    where: { id, trening: { clenId: clen.id, koniec: null } },
  })
  if (res.count === 0) return { error: 'Sériu sa nepodarilo zmazať.' }
  revalidatePath('/klub/trening')
  return { message: 'Séria zmazaná.' }
}

export async function ukonciTrening(_prev: KlubState, formData: FormData): Promise<KlubState> {
  const clen = await requireClen()
  const id = reqString(formData.get('id'), 40)
  if (!id) return { error: 'Chýba tréning.' }

  const res = await prisma.trening.updateMany({
    where: { id, clenId: clen.id, koniec: null },
    data: { koniec: new Date() },
  })
  if (res.count === 0) return { error: 'Otvorený tréning sa nenašiel.' }
  revalidatePath('/klub/trening')
  revalidatePath('/klub')
  revalidatePath('/klub/historia')
  return { message: 'Tréning ukončený.' }
}
