# Gladiator Gym Lučenec

Web „Body Building Factory" — prezentácia gymu + online predaj vstupov
a permanentiek cez Stripe (Fáza 1).

## Spustenie

```bash
npm install                # závislosti
cp .env.example .env.local # doplň reálne hodnoty (DB, Stripe, admin)
npx prisma generate        # Prisma klient (spúšťa sa aj automaticky)
npm run dev                # dev server na http://localhost:3000
```

S reálnou databázou (Supabase — connection stringy pozri `.env.example`):

```bash
npx prisma migrate dev --name init   # vytvorí tabuľky
```

Stripe webhook lokálne:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
# vypísaný whsec_... vlož do STRIPE_WEBHOOK_SECRET v .env.local
```

Testovacia platba: karta `4242 4242 4242 4242`, ľubovoľná expirácia v budúcnosti.

## Stack

Next.js 15 (App Router) · React 19 · TypeScript · Tailwind v4 (CSS-first) ·
Prisma + Supabase Postgres · Stripe Checkout · framer-motion · Vercel

## Štruktúra

- `src/lib/gym.ts`, `src/lib/pricing.ts` — všetok obsah webu (jediný zdroj pravdy)
- `src/app/` — stránky (App Router), `src/app/api/` — checkout, webhook, formuláre
- `src/app/admin/objednavky` — interný prehľad pre recepciu (Basic Auth)
- `prisma/schema.prisma` — dátový model (pripravený aj na budúce fázy)
- **`TODO.md` — všetky TBD miesta + checklist prepnutia Stripe do produkcie**

## Príkazy

| Príkaz | Účel |
| --- | --- |
| `npm run dev` | dev server |
| `npm run build` | produkčný build (musí prejsť bez chýb) |
| `npm run lint` | ESLint |
| `npm start` | beh produkčného buildu |
