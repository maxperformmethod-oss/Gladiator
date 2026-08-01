import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { zabezpecClena } from '@/server/auth'

/**
 * Spracuje odkaz z e-mailu: vymení `code` za session a presmeruje ďalej.
 * Pri `next` (napr. obnova hesla → /nove-heslo) ide rovno tam; inak doplní
 * záznam Clen a pustí do klubu. Pri chybe neutrálne na /prihlasenie.
 */
export async function GET(req: NextRequest) {
  const { origin, searchParams } = req.nextUrl
  const code = searchParams.get('code')
  const next = bezpecnyNext(searchParams.get('next'))

  if (!code) {
    console.error('[auth/callback] chýbajúci code v URL')
    return NextResponse.redirect(new URL('/prihlasenie', origin))
  }

  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.auth.exchangeCodeForSession(code)
  if (error) {
    console.error(`[auth/callback] exchangeCodeForSession zlyhalo: ${error.message}`)
    return NextResponse.redirect(new URL('/prihlasenie', origin))
  }

  // Obnova hesla: po výmene kódu rovno na nastavenie nového hesla.
  if (next) {
    return NextResponse.redirect(new URL(next, origin))
  }

  const clen = await zabezpecClena()
  if (!clen) {
    console.error('[auth/callback] session bez záznamu Clen — presmerované na /registracia/prezyvka')
    return NextResponse.redirect(new URL('/registracia/prezyvka', origin))
  }

  return NextResponse.redirect(new URL('/klub', origin))
}

/** Povolí len internú cestu (ochrana pred open-redirect cez `//` alebo `/\`). */
function bezpecnyNext(value: string | null): string | null {
  return value && /^\/(?![/\\])/.test(value) ? value : null
}
