'use server'

import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { zabezpecClena } from '@/server/auth'
import { isEmail, reqString, validujPrezyvku } from '@/lib/validate'

/** Stav formulára pre `useActionState`: prázdny objekt = zatiaľ bez odozvy. */
export type AuthState = { error?: string; message?: string }

// Bezpečnostné pravidlo (C2): chyby neprezradia, či e-mail v systéme existuje.
const CHYBA_PRIHLASENIE = 'Nesprávny e-mail alebo heslo.'
const CHYBA_VSEOBECNA = 'Niečo sa pokazilo. Skús to o chvíľu znova.'
const CHYBA_PREZYVKA_OBSADENA = 'Túto prezývku už niekto používa. Vyber si inú.'

/**
 * Registrácia. Prezývka sa overí a rezervuje ešte pred vytvorením auth účtu.
 * Pri už existujúcom e-maile sa správame IDENTICKY ako pri úspechu (redirect na
 * „skontroluj si e-mail") — útočník sa nedozvie, kto je registrovaný.
 */
export async function registruj(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = reqString(formData.get('email'), 200)
  const heslo = formData.get('password')
  const prezyvka = validujPrezyvku(formData.get('prezyvka'))

  if (!email || !isEmail(email) || typeof heslo !== 'string' || heslo.length < 10 || heslo.length > 200 || !prezyvka) {
    return { error: 'Skontroluj e-mail, heslo (aspoň 10 znakov) a prezývku (3–20 znakov).' }
  }

  const obsadena = await prisma.clen.findUnique({ where: { prezyvkaNorm: prezyvka.prezyvkaNorm } })
  if (obsadena) return { error: CHYBA_PREZYVKA_OBSADENA }

  const h = await headers()
  const host = h.get('host')
  const proto = h.get('x-forwarded-proto') ?? 'http'
  const emailRedirectTo = host ? `${proto}://${host}/api/auth/callback` : undefined

  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase.auth.signUp({
    email,
    password: heslo,
    options: { emailRedirectTo },
  })
  if (error) return { error: CHYBA_VSEOBECNA }

  // Supabase pri existujúcom e-maile vráti používateľa s prázdnym `identities`
  // (bez chyby) — Clen v tom prípade nevytvárame, len ideme na rovnakú stránku.
  const novyUcet = !!data.user && (data.user.identities?.length ?? 0) > 0
  if (novyUcet && data.user) {
    try {
      await prisma.clen.create({
        data: {
          authUserId: data.user.id,
          email,
          prezyvka: prezyvka.prezyvka,
          prezyvkaNorm: prezyvka.prezyvkaNorm,
          rola: 'CLEN', // natvrdo — nikdy z formData
        },
      })
    } catch {
      // Auth účet už existuje; Clen doplní zabezpecClena() pri prvom prihlásení.
    }
  }

  redirect('/registracia/hotovo')
}

/**
 * Prihlásenie. Pri chybe vždy tá istá neutrálna veta. Po úspechu doplní Clen;
 * ak chýba prezývka, presmeruje na jej doplnenie. Neaktívneho člena odhlási.
 */
export async function prihlas(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = reqString(formData.get('email'), 200)
  const heslo = formData.get('password')

  if (!email || !isEmail(email) || typeof heslo !== 'string' || !heslo) {
    return { error: CHYBA_PRIHLASENIE }
  }

  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password: heslo })
  if (error) return { error: CHYBA_PRIHLASENIE }

  const clen = await zabezpecClena()
  if (!clen) redirect('/registracia/prezyvka')

  if (!clen.aktivny) {
    await supabase.auth.signOut()
    return { error: 'Tvoje konto je momentálne pozastavené. Ozvi sa nám na recepcii.' }
  }

  redirect('/klub')
}

/** Odhlásenie. */
export async function odhlas(): Promise<void> {
  const supabase = await createSupabaseServerClient()
  await supabase.auth.signOut()
  redirect('/')
}

/**
 * Doplnenie prezývky pre už prihlásený Supabase účet bez záznamu Clen
 * (stránka /registracia/prezyvka). Rola `CLEN` je natvrdo.
 */
export async function doplnPrezyvku(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const prezyvka = validujPrezyvku(formData.get('prezyvka'))
  if (!prezyvka) {
    return { error: 'Prezývka musí mať 3–20 znakov: písmená, číslice, _ alebo -.' }
  }

  const obsadena = await prisma.clen.findUnique({ where: { prezyvkaNorm: prezyvka.prezyvkaNorm } })
  if (obsadena) return { error: CHYBA_PREZYVKA_OBSADENA }

  let clen
  try {
    clen = await zabezpecClena(prezyvka.prezyvka)
  } catch {
    // Súbeh dvoch requestov na tú istú prezývku — unikátny index v DB.
    return { error: CHYBA_PREZYVKA_OBSADENA }
  }
  if (!clen) redirect('/prihlasenie') // session medzičasom vypršala

  redirect('/klub')
}

/**
 * Žiadosť o obnovu hesla. Odpoveď je VŽDY rovnaká — či účet existuje alebo nie —
 * aby útočník nezistil, kto je registrovaný. Odkaz vedie cez callback (výmena
 * kódu za session), ktorý potom pustí používateľa na /nove-heslo.
 */
export async function obnovHeslo(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = reqString(formData.get('email'), 200)

  if (email && isEmail(email)) {
    const h = await headers()
    const host = h.get('host')
    if (host) {
      const proto = h.get('x-forwarded-proto') ?? 'http'
      const supabase = await createSupabaseServerClient()
      // Prípadnú chybu ignorujeme naschvál — odozva musí byť vždy rovnaká.
      await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${proto}://${host}/api/auth/callback?next=/nove-heslo`,
      })
    }
  }

  return { message: 'Ak účet existuje, poslali sme e-mail.' }
}

/**
 * Nastavenie nového hesla (stránka /nove-heslo, kam sa dá dostať len s platnou
 * session z e-mailového odkazu). Po zmene odhlási a pošle na prihlásenie.
 */
export async function nastavHeslo(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const heslo = formData.get('password')
  if (typeof heslo !== 'string' || heslo.length < 10 || heslo.length > 200) {
    return { error: 'Heslo musí mať aspoň 10 znakov.' }
  }

  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.auth.updateUser({ password: heslo })
  if (error) {
    return { error: 'Nepodarilo sa zmeniť heslo. Skús to znova.' }
  }

  await supabase.auth.signOut()
  redirect('/prihlasenie')
}
