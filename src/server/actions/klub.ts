'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { requireClen } from '@/server/auth'
import { numberInRange, reqString } from '@/lib/validate'

/** Stav členských formulárov pre `useActionState`. */
export type KlubState = { error?: string; message?: string }

const OK: KlubState = {}

// ── Plány (šablóny) ──────────────────────────────────────────────────────────

export async function vytvorPlan(_p: KlubState, fd: FormData): Promise<KlubState> {
  const clen = await requireClen()
  const nazov = reqString(fd.get('nazov'), 80)
  if (!nazov) return { error: 'Zadaj názov plánu.' }
  await prisma.treningPlan.create({ data: { clenId: clen.id, nazov } })
  revalidatePath('/klub/trening')
  return { message: 'Plán vytvorený.' }
}

export async function premenujPlan(_p: KlubState, fd: FormData): Promise<KlubState> {
  const clen = await requireClen()
  const id = reqString(fd.get('id'), 40)
  const nazov = reqString(fd.get('nazov'), 80)
  if (!id || !nazov) return { error: 'Zadaj názov.' }
  const res = await prisma.treningPlan.updateMany({ where: { id, clenId: clen.id }, data: { nazov } })
  if (res.count === 0) return { error: 'Plán sa nenašiel.' }
  revalidatePath('/klub/trening')
  return OK
}

export async function zmazPlan(_p: KlubState, fd: FormData): Promise<KlubState> {
  const clen = await requireClen()
  const id = reqString(fd.get('id'), 40)
  if (!id) return { error: 'Chýba plán.' }
  const res = await prisma.treningPlan.deleteMany({ where: { id, clenId: clen.id } })
  if (res.count === 0) return { error: 'Plán sa nenašiel.' }
  revalidatePath('/klub/trening')
  return { message: 'Plán zmazaný.' }
}

/** Pridá cvik z globálneho katalógu do plánu + jednu predvolenú sériu. */
export async function pridajCvik(_p: KlubState, fd: FormData): Promise<KlubState> {
  const clen = await requireClen()
  const planId = reqString(fd.get('planId'), 40)
  const cvikId = reqString(fd.get('cvikId'), 40)
  if (!planId || !cvikId) return { error: 'Chýba plán alebo cvik.' }

  const plan = await prisma.treningPlan.findFirst({ where: { id: planId, clenId: clen.id }, select: { id: true } })
  if (!plan) return { error: 'Plán sa nenašiel.' }
  const cvik = await prisma.cvik.findFirst({ where: { id: cvikId, clenId: null, aktivny: true }, select: { id: true } })
  if (!cvik) return { error: 'Cvik sa nenašiel.' }

  const poradie = await prisma.planCvik.count({ where: { planId } })
  await prisma.planCvik.create({
    data: { planId, cvikId, poradie, serie: { create: { poradie: 1, opakovania: 10, hmotnost: 0 } } },
  })
  revalidatePath('/klub/trening')
  return OK
}

export async function odoberCvik(_p: KlubState, fd: FormData): Promise<KlubState> {
  const clen = await requireClen()
  const id = reqString(fd.get('id'), 40)
  if (!id) return { error: 'Chýba cvik.' }
  const res = await prisma.planCvik.deleteMany({ where: { id, plan: { clenId: clen.id } } })
  if (res.count === 0) return { error: 'Cvik sa nenašiel.' }
  revalidatePath('/klub/trening')
  return OK
}

export async function nastavPoznamku(_p: KlubState, fd: FormData): Promise<KlubState> {
  const clen = await requireClen()
  const id = reqString(fd.get('id'), 40)
  const poznamka = reqString(fd.get('poznamka'), 200)
  if (!id) return { error: 'Chýba cvik.' }
  const res = await prisma.planCvik.updateMany({ where: { id, plan: { clenId: clen.id } }, data: { poznamka } })
  if (res.count === 0) return { error: 'Cvik sa nenašiel.' }
  revalidatePath('/klub/trening')
  return OK
}

/** Presunie cvik v pláne hore/dole výmenou `poradie` so susedom. */
export async function presunCvik(_p: KlubState, fd: FormData): Promise<KlubState> {
  const clen = await requireClen()
  const id = reqString(fd.get('id'), 40)
  const smer = fd.get('smer') === 'hore' ? 'hore' : 'dole'
  if (!id) return { error: 'Chýba cvik.' }

  const cvik = await prisma.planCvik.findFirst({
    where: { id, plan: { clenId: clen.id } },
    select: { id: true, planId: true, poradie: true },
  })
  if (!cvik) return { error: 'Cvik sa nenašiel.' }

  const sused = await prisma.planCvik.findFirst({
    where: {
      planId: cvik.planId,
      poradie: smer === 'hore' ? { lt: cvik.poradie } : { gt: cvik.poradie },
    },
    orderBy: { poradie: smer === 'hore' ? 'desc' : 'asc' },
    select: { id: true, poradie: true },
  })
  if (!sused) return OK // už na kraji

  await prisma.$transaction([
    prisma.planCvik.update({ where: { id: cvik.id }, data: { poradie: sused.poradie } }),
    prisma.planCvik.update({ where: { id: sused.id }, data: { poradie: cvik.poradie } }),
  ])
  revalidatePath('/klub/trening')
  return OK
}

// ── Plánované série (vlastná váha aj opakovania) ────────────────────────────

async function overPlanCvik(clenId: string, planCvikId: string) {
  return prisma.planCvik.findFirst({ where: { id: planCvikId, plan: { clenId } }, select: { id: true } })
}

/** Pridá sériu; predvyplní ju kópiou poslednej, inak 10 opak. × 0 kg. */
export async function pridajPlanSeriu(_p: KlubState, fd: FormData): Promise<KlubState> {
  const clen = await requireClen()
  const planCvikId = reqString(fd.get('planCvikId'), 40)
  if (!planCvikId) return { error: 'Chýba cvik.' }
  if (!(await overPlanCvik(clen.id, planCvikId))) return { error: 'Cvik sa nenašiel.' }

  const posledna = await prisma.planSeria.findFirst({
    where: { planCvikId },
    orderBy: { poradie: 'desc' },
    select: { poradie: true, opakovania: true, hmotnost: true },
  })
  await prisma.planSeria.create({
    data: {
      planCvikId,
      poradie: (posledna?.poradie ?? 0) + 1,
      opakovania: posledna?.opakovania ?? 10,
      hmotnost: posledna?.hmotnost ?? 0,
    },
  })
  revalidatePath('/klub/trening')
  return OK
}

export async function upravPlanSeriu(_p: KlubState, fd: FormData): Promise<KlubState> {
  const clen = await requireClen()
  const id = reqString(fd.get('id'), 40)
  const opakovania = numberInRange(fd.get('opakovania'), 1, 500)
  const hmotnost = numberInRange(fd.get('hmotnost'), 0, 999.99)
  if (!id) return { error: 'Chýba séria.' }
  if (opakovania === null) return { error: 'Opakovania: 1–500.' }
  if (hmotnost === null) return { error: 'Hmotnosť: 0–999.99 kg.' }
  const res = await prisma.planSeria.updateMany({
    where: { id, planCvik: { plan: { clenId: clen.id } } },
    data: { opakovania, hmotnost },
  })
  if (res.count === 0) return { error: 'Séria sa nenašla.' }
  revalidatePath('/klub/trening')
  return OK
}

export async function odoberPlanSeriu(_p: KlubState, fd: FormData): Promise<KlubState> {
  const clen = await requireClen()
  const id = reqString(fd.get('id'), 40)
  if (!id) return { error: 'Chýba séria.' }
  const res = await prisma.planSeria.deleteMany({ where: { id, planCvik: { plan: { clenId: clen.id } } } })
  if (res.count === 0) return { error: 'Séria sa nenašla.' }
  revalidatePath('/klub/trening')
  return OK
}

// ── Aktívny tréning ──────────────────────────────────────────────────────────

export async function zacniTrening(_p: KlubState, fd: FormData): Promise<KlubState> {
  const clen = await requireClen()

  const otvoreny = await prisma.trening.findFirst({ where: { clenId: clen.id, koniec: null }, select: { id: true } })
  if (otvoreny) return { error: 'Máš otvorený tréning — pokračuj v ňom alebo ho ukonči.' }

  const planId = reqString(fd.get('planId'), 40)
  let nazov = reqString(fd.get('nazov'), 80) ?? 'Tréning'

  const serie: { cvikId: string; poradie: number; opakovania: number; hmotnost: number; dokoncena: boolean }[] = []
  let realPlanId: string | null = null

  if (planId) {
    const plan = await prisma.treningPlan.findFirst({
      where: { id: planId, clenId: clen.id },
      include: { cviky: { include: { serie: { orderBy: { poradie: 'asc' } } }, orderBy: { poradie: 'asc' } } },
    })
    if (!plan) return { error: 'Plán sa nenašiel.' }
    realPlanId = plan.id
    nazov = plan.nazov
    let poradie = 1
    for (const pc of plan.cviky) {
      for (const ps of pc.serie) {
        serie.push({
          cvikId: pc.cvikId,
          poradie: poradie++,
          opakovania: ps.opakovania,
          hmotnost: Number(ps.hmotnost),
          dokoncena: false,
        })
      }
    }
  }

  const trening = await prisma.trening.create({
    data: {
      clenId: clen.id,
      planId: realPlanId,
      nazov,
      zaciatok: new Date(),
      serie: serie.length ? { create: serie } : undefined,
    },
    select: { id: true },
  })
  revalidatePath('/klub/trening')
  revalidatePath('/klub')
  redirect(`/klub/trening`) // aktívny tréning sa zobrazí na tej istej stránke
  return { message: `Tréning začatý (${trening.id}).` }
}

/** Prepne dokončenie série (obojsmerne). Odpočinok štartuje klient. */
export async function prepniSeriu(_p: KlubState, fd: FormData): Promise<KlubState> {
  const clen = await requireClen()
  const id = reqString(fd.get('id'), 40)
  if (!id) return { error: 'Chýba séria.' }
  const s = await prisma.seria.findFirst({
    where: { id, trening: { clenId: clen.id, koniec: null } },
    select: { dokoncena: true },
  })
  if (!s) return { error: 'Séria sa nenašla.' }
  const res = await prisma.seria.updateMany({
    where: { id, trening: { clenId: clen.id, koniec: null } },
    data: { dokoncena: !s.dokoncena },
  })
  if (res.count === 0) return { error: 'Séria sa nenašla.' }
  revalidatePath('/klub/trening')
  return OK
}

export async function upravSeriu(_p: KlubState, fd: FormData): Promise<KlubState> {
  const clen = await requireClen()
  const id = reqString(fd.get('id'), 40)
  const opakovania = numberInRange(fd.get('opakovania'), 1, 500)
  const hmotnost = numberInRange(fd.get('hmotnost'), 0, 999.99)
  if (!id) return { error: 'Chýba séria.' }
  if (opakovania === null) return { error: 'Opakovania: 1–500.' }
  if (hmotnost === null) return { error: 'Hmotnosť: 0–999.99 kg.' }
  const res = await prisma.seria.updateMany({
    where: { id, trening: { clenId: clen.id, koniec: null } },
    data: { opakovania, hmotnost },
  })
  if (res.count === 0) return { error: 'Séria sa nenašla.' }
  revalidatePath('/klub/trening')
  return OK
}

/** Pridá sériu navyše (aj k cviku mimo plánu) do otvoreného tréningu. */
export async function pridajSeriu(_p: KlubState, fd: FormData): Promise<KlubState> {
  const clen = await requireClen()
  const treningId = reqString(fd.get('treningId'), 40)
  const cvikId = reqString(fd.get('cvikId'), 40)
  const opakovania = numberInRange(fd.get('opakovania'), 1, 500) ?? 10
  const hmotnost = numberInRange(fd.get('hmotnost'), 0, 999.99) ?? 0
  if (!treningId || !cvikId) return { error: 'Chýba tréning alebo cvik.' }

  const trening = await prisma.trening.findFirst({
    where: { id: treningId, clenId: clen.id, koniec: null },
    select: { id: true },
  })
  if (!trening) return { error: 'Otvorený tréning sa nenašiel.' }
  const cvik = await prisma.cvik.findFirst({ where: { id: cvikId, clenId: null, aktivny: true }, select: { id: true } })
  if (!cvik) return { error: 'Cvik sa nenašiel.' }

  const poradie = await prisma.seria.count({ where: { treningId } })
  await prisma.seria.create({ data: { treningId, cvikId, poradie: poradie + 1, opakovania, hmotnost, dokoncena: false } })
  revalidatePath('/klub/trening')
  return OK
}

export async function odoberSeriu(_p: KlubState, fd: FormData): Promise<KlubState> {
  const clen = await requireClen()
  const id = reqString(fd.get('id'), 40)
  if (!id) return { error: 'Chýba séria.' }
  const res = await prisma.seria.deleteMany({ where: { id, trening: { clenId: clen.id, koniec: null } } })
  if (res.count === 0) return { error: 'Sériu sa nepodarilo zmazať.' }
  revalidatePath('/klub/trening')
  return OK
}

export async function ukonciTrening(_p: KlubState, fd: FormData): Promise<KlubState> {
  const clen = await requireClen()
  const id = reqString(fd.get('id'), 40)
  if (!id) return { error: 'Chýba tréning.' }

  const trening = await prisma.trening.findFirst({
    where: { id, clenId: clen.id, koniec: null },
    select: { id: true },
  })
  if (!trening) return { error: 'Otvorený tréning sa nenašiel.' }
  const dokoncenych = await prisma.seria.count({
    where: { treningId: id, dokoncena: true, trening: { clenId: clen.id } },
  })
  if (dokoncenych === 0) return { error: 'Označ aspoň jednu dokončenú sériu.' }

  // MPM nedokončené série do histórie nedáva.
  await prisma.seria.deleteMany({ where: { treningId: id, dokoncena: false, trening: { clenId: clen.id } } })
  await prisma.trening.updateMany({ where: { id, clenId: clen.id, koniec: null }, data: { koniec: new Date() } })
  revalidatePath('/klub')
  revalidatePath('/klub/historia')
  redirect(`/klub/historia/${id}`)
  return OK
}

export async function zrusTrening(_p: KlubState, fd: FormData): Promise<KlubState> {
  const clen = await requireClen()
  const id = reqString(fd.get('id'), 40)
  if (!id) return { error: 'Chýba tréning.' }
  const res = await prisma.trening.deleteMany({ where: { id, clenId: clen.id, koniec: null } })
  if (res.count === 0) return { error: 'Otvorený tréning sa nenašiel.' }
  revalidatePath('/klub/trening')
  redirect('/klub/trening')
  return OK
}

// ── Nastavenia ───────────────────────────────────────────────────────────────

export async function ulozNastavenia(_p: KlubState, fd: FormData): Promise<KlubState> {
  const clen = await requireClen()
  const tyzdennyCiel = numberInRange(fd.get('tyzdennyCiel'), 1, 14)
  const odpocinokSek = numberInRange(fd.get('odpocinokSek'), 10, 600)
  const zvuk = fd.get('zvuk') === 'on'
  if (tyzdennyCiel === null || odpocinokSek === null) {
    return { error: 'Cieľ 1–14, odpočinok 10–600 s.' }
  }
  await prisma.clen.updateMany({
    where: { id: clen.id },
    data: { tyzdennyCiel, odpocinokSek: Math.round(odpocinokSek), zvuk },
  })
  revalidatePath('/klub')
  revalidatePath('/klub/nastavenia')
  return { message: 'Uložené.' }
}
