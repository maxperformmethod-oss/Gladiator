# CLAUDE.md — Gladiator Gym Lučenec

Prémiový web pre Gladiator Gym (pobočka Lučenec) s online predajom vstupov cez
Stripe. Jazyk obsahu: SK. „Body Building Factory", est. 2023, claim: „Osloboď to
najlepšie zo samého seba".

## Stack

- **Next.js 15 App Router** + React 19 + TypeScript (`src/app/`)
- **Tailwind v4 CSS-first** — tokeny v `src/app/globals.css` cez `@theme`,
  ŽIADNY `tailwind.config.js`. Nepridávať farby mimo tokenov.
- **Prisma + PostgreSQL (Supabase)** — `prisma/schema.prisma`; pooler URL za
  behu (`DATABASE_URL`), direct URL pre migrácie (`DIRECT_URL`). Supabase kvôli
  Fáze 2 (natívny auth + realtime pre QR vstupy) — auth sa zatiaľ NEpoužíva.
- **Stripe Checkout** (`price_data` z cenníka — žiadne ručné Stripe produkty)
- **framer-motion** — jemné animácie, `MotionConfig reducedMotion="user"`
  v `src/components/Providers.tsx` je POVINNÝ wrapper

## Dizajn — NEMENIŤ bez pokynu

- Farby: čierna `#0A0A0A` / antracit `#1A1A1A` / zlatá `#D4AF37` (presná hodnota
  TBD z loga) / biela typografia. Hexagónový LED motív (`.hex-pattern`).
- Fonty: Oswald (display, uppercase, kondenzovaný) + Inter (text) cez `next/font`.
- ŽIADNE stock fotky — len `PlaceholderImage` s poznámkou „NAHRADIŤ REÁLNOU
  FOTKOU LC". Mobile-first, ľahké animácie.
- Tón: sebavedomý, priamy, žiadny gýč.

## Pravdivosť obsahu — KRITICKÉ

- NEVYMÝŠĽAŤ fakty (m², počty strojov, ceny, mená) — všade kde chýbajú, `TbdBadge`.
- Obsah žije VÝHRADNE v `src/lib/gym.ts` a `src/lib/pricing.ts` (jediný zdroj
  pravdy, pripravené na neskorší CMS) — žiadne hardcoded texty v JSX.
- Neoverené dáta majú flagy (`CENNIK_OVERENY`, `TRENERI_OVERENI`,
  `KONTAKT.overene`) — prepínať až po potvrdení majiteľom.

## Platby

- Stripe VŽDY TEST MODE, kým neprebehne právna kontrola podmienok (pozri
  TODO.md sekcia 4 na prepnutie do produkcie).
- Flow: `/api/checkout` (Objednavka PENDING + session) → Stripe → webhook
  `/api/stripe/webhook` (PAID) + fallback na success stránke.
- Číslo objednávky `GLD-YYYYMMDD-XXXX` = kľúč pre recepciu (ručné overenie).
- Admin: `/admin/objednavky`, Basic Auth cez `src/middleware.ts`
  (`ADMIN_USER`/`ADMIN_PASSWORD`).

## Rozsah Fázy 1 — NEZAVÁDZAŤ

Žiadne user účty, blog/CMS, multi-jazyk, QR/čip logika, subscriptions.
Schéma má pripravené tabuľky (Clen, …) a stĺpce (`redemptionMethod`,
`redeemedAt`) — NEPOUŽÍVAŤ ich, len ich nechať pripravené.

## Príkazy

- `npm run dev` / `npm run build` / `npm run lint` (build aj lint musia prejsť)
- `npx prisma generate` po zmene schémy; `npx prisma migrate dev` len s reálnou DB
- DB stránky sú `force-dynamic` — build NEsmie vyžadovať bežiacu DB

## Git / deploy

- Remote: `maxperformmethod-oss/Gladiator`, autor Maxim Malovec
  (maximmalovec8@gmail.com). Deploy: Vercel.
- `TODO.md` = zoznam všetkých TBD + kroky Stripe test→prod. Pri zmenách
  udržiavať aktuálny.
