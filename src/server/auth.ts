import 'server-only'
import { cache } from 'react'
import { redirect, notFound } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import type { Clen } from '@prisma/client'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { prisma } from '@/lib/prisma'
import { normalizujPrezyvku } from '@/lib/validate'

/**
 * Celá autorizácia projektu na jednom mieste. Identita sa vždy berie zo
 * session — žiadna funkcia neprijíma userId ako parameter. Rola sa číta
 * z databázy (nie z JWT — token môže byť zastaraný).
 */

/**
 * Prihlásený používateľ zo Supabase, alebo null. `cache()` zbalí viac volaní
 * v rámci jedného requestu do jedného dotazu (layout aj guard čítajú session).
 */
export const getAuthUser = cache(async (): Promise<User | null> => {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
})

/** Záznam Clen prihláseného používateľa, alebo null. */
export async function getClen(): Promise<Clen | null> {
  const user = await getAuthUser()
  if (!user) return null
  return prisma.clen.findUnique({ where: { authUserId: user.id } })
}

/**
 * Doplní chýbajúci záznam Clen k existujúcemu Supabase účtu.
 * Idempotentné — ak už existuje, iba ho vráti. Rieši prípad, keď registrácia
 * zlyhala medzi vytvorením auth účtu a zápisom Clen.
 *
 * NIKDY negeneruje prezývku: ak Clen chýba a prezývka nie je daná, vráti null —
 * volajúci ho potom presmeruje na /registracia/prezyvka.
 */
export async function zabezpecClena(prezyvka?: string): Promise<Clen | null> {
  const user = await getAuthUser()
  if (!user) return null

  const existujuci = await prisma.clen.findUnique({
    where: { authUserId: user.id },
  })
  if (existujuci) return existujuci

  if (!prezyvka) return null

  return prisma.clen.create({
    data: {
      authUserId: user.id,
      email: user.email ?? null,
      prezyvka,
      prezyvkaNorm: normalizujPrezyvku(prezyvka),
      rola: 'CLEN', // natvrdo — nikdy z requestu
    },
  })
}

/**
 * Vyžaduje prihláseného a aktívneho člena.
 * Neprihlásený → /prihlasenie · prihlásený bez Clen → /registracia/prezyvka ·
 * neaktívny → /prihlasenie.
 */
export async function requireClen(): Promise<Clen> {
  const user = await getAuthUser()
  if (!user) redirect('/prihlasenie')

  const clen = await zabezpecClena()
  if (!clen) redirect('/registracia/prezyvka')
  if (!clen.aktivny) redirect('/prihlasenie')
  return clen
}

/**
 * Vyžaduje rolu ADMIN. Inak notFound() — nie redirect: cudzí človek sa nemá
 * dozvedieť, že /sprava vôbec existuje.
 */
export async function requireAdmin(): Promise<Clen> {
  const clen = await getClen()
  if (!clen || !clen.aktivny || clen.rola !== 'ADMIN') {
    notFound()
  }
  return clen
}
