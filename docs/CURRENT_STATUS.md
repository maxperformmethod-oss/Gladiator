# CURRENT_STATUS.md — Gladiator Gym

**Verzia 2.0** · 2026-07-30 · po dokončení Etapy A0 (audit repozitára)

---

## Jedným odsekom

Verejný web je hotový a väčší, než sme predpokladali — **14 stránok + 4 API
routes**, čistý kód (nula `any`, nula `@ts-ignore`, nula `console.log`).
**Databáza ešte nikdy nebola migrovaná** — `prisma/migrations/` neexistuje.
Členská PWA, autentifikácia ani role neexistujú. Projekt je na konci **Etapy A**,
architektúra v2 čaká na schválenie. Nezmenil sa ani jeden riadok kódu.

---

## Posledná dokončená etapa

**A0 — audit repozitára · DONE** (Claude Code, read-only, `git status` čistý).

Výsledok opravil päť predpokladov z architektúry v1. Detaily v
`ARCHITECTURE_PROPOSAL.md` §0.

---

## Overený stav (z auditu)

| Oblasť | Stav |
| --- | --- |
| Framework | Next.js 15.5.20 · React 19.2.7 · TS 5.9.3 strict · npm · Node 26 |
| Verejné stránky | **14** — `/`, `/o-gyme`, `/sluzby`, `/vybavenie`, `/treneri`, `/treneri/[slug]`, `/cennik`, `/galeria`, `/eventy`, `/kontakt`, `/rezervacia`, `/podmienky`, `/objednavka/potvrdenie`, `404` |
| API routes | **4** — `/api/checkout`, `/api/kontakt`, `/api/rezervacia`, `/api/stripe/webhook` |
| Admin | `/admin/objednavky`, Basic Auth, `matcher: ['/admin/:path*']`, fail-closed 503 |
| Komponenty | 50 súborov v `src/` · 10 client, 10 server komponentov |
| `src/lib/` | `cn`, `gym`, `order-number`, `pricing`, `prisma`, `stripe`, **`validate`** |
| Prisma schéma | 10 modelov, 6 enumov, 238 riadkov |
| **Migrácie** | **žiadne — `prisma/migrations/` a `migration_lock.toml` neexistujú** |
| Styling | Tailwind v4 `@theme`, žiadny `tailwind.config.*`, 6 vlastných tried |
| PWA | **žiadna** — bez manifestu, bez SW, bez ikon; `viewport.themeColor` už existuje |
| Git | `main` ↔ `origin/main`, working tree čistý (1 untracked `.pptx`) |
| Bezpečnosť histórie | ✅ `.env` / `.env.local` **nikdy neboli v Git histórii** |
| Kvalita kódu | nula `any` · nula `@ts-ignore` · nula `console.log` · nula `dangerouslySetInnerHTML` · nula `localStorage` |
| Deploy | žiadny `vercel.json`, `.github/workflows`, Dockerfile |

**Dôležité:** keďže migrácia nikdy nebežala, databáza je prázdna alebo
neexistuje. To znamená, že `/admin/objednavky` a `/api/checkout` dnes reálne
nemajú kam zapisovať. Platby nie sú v prevádzke — čo je v súlade s tým, že ich
zatiaľ neriešime.

---

## Čo neexistuje

Používateľské účty · Supabase Auth · role · RLS · `src/server/` ·
`src/lib/supabase*` · PWA manifest a ikony · sekcie `/klub` a `/sprava` ·
modely `Cvik`, `Rekord`, `Vyzva`, `VyzvaZapis`, `AdminLog` · staging ·
automatizované testy · akákoľvek migrácia.

---

## Vyriešené odvtedy

| ID | Otázka | Odpoveď |
| --- | --- | --- |
| D-01 | Stripe | **Neriešime.** Existujúci kód sa nedotýka, nerozširuje ani neodstraňuje. |
| D-02 | Prisma vs. supabase-js | **Prisma jediný ORM.** Supabase iba na Auth. |
| D-03 | Názvy routes | **`/klub` + `/sprava`** |
| D-04 | Middleware matcher | **`['/admin/:path*']`** — potvrdené, `/admin` je obsadené |

---

## Otvorené — potrebujem tvoje rozhodnutie

| ID | Otázka | Moje odporúčanie |
| --- | --- | --- |
| **D-07** | Rozšíriť `Clen` namiesto vytvorenia novej `profiles`? | **áno** — `Clen` má povinné FK zo 4 modelov, dve tabuľky = dve identity člena |
| **D-06** | PWA bez service workera vo v1? | **áno** — SW je najčastejší zdroj „nasadil som opravu a nikto ju nevidí" |
| **D-11** | Samostatný staging Supabase projekt? | **áno** — free tier, prvá migrácia nesmie ísť rovno na produkciu |
| **D-13** | Zostáva `Clen.email`? | **áno, ako nepovinný** — pre členov zadaných recepciou bez online účtu |

D-05 (zod) a D-14 (Vercel deploy) sa vyriešia mimochodom v ďalšej etape.

---

## Najbližší krok

Schváliť `ARCHITECTURE_PROPOSAL.md` v2 a odpovedať na štyri otázky vyššie.

Potom pripravím `CLAUDE_CODE_TASK_002.md` pre **Etapu C** — vytvorenie prázdnej
štruktúry priečinkov a placeholder stránok, **bez Supabase, bez databázy, bez
business logiky**. Cieľom Etapy C je jediné: overiť, že nová štruktúra
spolunažíva s existujúcim webom a že `build` aj `lint` prejdú.

---

## Riziká vysokej priority

| # | Riziko | Kde |
| --- | --- | --- |
| R-1 | Úprava `middleware.ts` môže odomknúť `/admin/objednavky` | `ARCHITECTURE_PROPOSAL.md` §6 |
| R-2 | `src/server/auth.ts` je jediná skutočná ochrana dát | §10 |
| R-3 | Prvá migrácia musí ísť najprv na staging | §5 |

**Odpadlo oproti v1:** riziko zmazania produkčných objednávok pri drifte —
žiadna migrácia nikdy nebežala, niet čo stratiť. Toto je najlepší možný moment
na dokončenie návrhu schémy.
