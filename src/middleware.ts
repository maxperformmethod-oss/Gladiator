import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * HTTP Basic Auth pre interné stránky /admin/* (prehľad objednávok pre
 * recepciu). Jednoduchá ochrana heslom z env — žiadny plnohodnotný auth
 * systém (ten príde v neskoršej fáze s členskými účtami).
 */
export function middleware(req: NextRequest) {
  const user = process.env.ADMIN_USER
  const password = process.env.ADMIN_PASSWORD

  if (!user || !password) {
    return new NextResponse(
      'Admin nie je nakonfigurovaný — nastav ADMIN_USER a ADMIN_PASSWORD.',
      { status: 503 }
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

export const config = {
  matcher: ['/admin/:path*'],
}
