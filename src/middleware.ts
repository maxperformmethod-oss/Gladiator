import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

/**
 * HTTP Basic Auth pre interné stránky /admin/* (prehľad objednávok pre
 * recepciu). Jednoduchá ochrana heslom z env — žiadny plnohodnotný auth
 * systém (ten príde v neskoršej fáze s členskými účtami).
 *
 * G2: ostatné cesty (/klub, /sprava) len obnovia Supabase session a pustia
 * ďalej — middleware v tejto etape NIKOHO nepresmerúva (ochrana až G3).
 */
export function middleware(req: NextRequest) {
  // Ostatné cesty (/klub, /sprava) → obnova Supabase session, potom next().
  // /admin/* pokračuje NEZMENENOU Basic Auth vetvou nižšie.
  if (!req.nextUrl.pathname.startsWith('/admin')) {
    return obnovSession(req)
  }

  const user = process.env.ADMIN_USER
  const password = process.env.ADMIN_PASSWORD

  if (!user || !password) {
    // Čitateľná chybová stránka (nie holý 503) — chýbajúca konfigurácia
    // nie je crash, len nedokončené nastavenie prostredia.
    return new NextResponse(
      `<!doctype html><html lang="sk"><head><meta charset="utf-8"><title>Admin nie je nakonfigurovaný</title></head>
<body style="font-family:system-ui;background:#0a0a0a;color:#f5f5f4;display:grid;place-items:center;min-height:100vh;margin:0">
<div style="max-width:34rem;padding:2rem;border:1px solid #333;border-radius:1rem;background:#141414">
<h1 style="color:#d4af37;font-size:1.25rem;margin:0 0 .75rem">Admin prehľad nie je nakonfigurovaný</h1>
<p style="color:#a6a29a;font-size:.9rem;line-height:1.6;margin:0">Chýbajú env premenné <code>ADMIN_USER</code> a <code>ADMIN_PASSWORD</code>.
Nastav ich vo Vercel dashboarde (Settings → Environment Variables) alebo v <code>.env.local</code> — presný postup je v <code>TODO.md</code>.</p>
</div></body></html>`,
      { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    )
  }

  const auth = req.headers.get('authorization')
  if (auth) {
    const [scheme, encoded] = auth.split(' ')
    if (scheme === 'Basic' && encoded) {
      try {
        const [u, p] = atob(encoded).split(':')
        if (u === user && p === password) {
          return NextResponse.next()
        }
      } catch {
        // neplatný base64 — spadne na 401 nižšie
      }
    }
  }

  return new NextResponse('Autorizácia potrebná.', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="Gladiator Admin", charset="UTF-8"' },
  })
}

/**
 * Obnova Supabase session podľa @supabase/ssr v0.12: getAll nad
 * request.cookies, setAll nad response.cookies, potom auth.getUser().
 * NIKOHO nepresmerúva — iba udrží session čerstvú pre serverové komponenty.
 */
async function obnovSession(req: NextRequest) {
  let response = NextResponse.next({ request: req })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => req.cookies.set(name, value))
          response = NextResponse.next({ request: req })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  await supabase.auth.getUser()

  return response
}

export const config = {
  matcher: ['/admin/:path*', '/klub/:path*', '/sprava/:path*'],
}
