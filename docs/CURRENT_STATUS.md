# CURRENT_STATUS.md — Gladiator Gym

**Verzia 3.0** · 31. 7. 2026

---

## Jedným odsekom

Infraštruktúrna fáza je uzavretá — CI, ochrana `main`, Dependabot, dokumentácia
aj príručka obsluhy sú hotové a osem runtime zraniteľností v Next.js je
zaplátaných. Schéma databázy je navrhnutá, zapísaná a **prvá migrácia je
aplikovaná na staging** — 16 tabuliek, 18 cudzích kľúčov, 8 databázových
obmedzení, RLS zapnuté na všetkom a nula policies. Aplikácia sama zatiaľ nemá
prihlasovanie ani žiadnu funkciu; `/klub` a `/sprava` sú prázdne stránky.
Ďalej ide **Etapa G — prihlasovanie**, rozdelená na tri kroky.

---

## Hotové etapy

| Etapa | Čo | Commit |
| --- | --- | --- |
| A0 | read-only audit repozitára | — |
| A | dokumentácia | `45ff000` |
| A1 | CI, Dependabot, ochrana `main` | `58c1687` |
| A2 | odstránenie zraniteľností Next.js | `3e6f5ef` |
| C | kostra `/klub`, `/sprava`, prihlasovanie | `2b9cd3c` |
| D | PWA manifest a ikony | `2b9cd3c` |
| — | príručka obsluhy | `cf63bd6` |
| E | schéma databázy | `0025618` |
| **F** | **prvá migrácia na staging** | **`b9eb39d`** |

---

## Stav databázy — overený 31. 7. 2026

Supabase projekt `Gladiator gym`, ref `dhuynypsdbqdkkaqjxwv`, eu-west-1.
**Rola projektu: staging.** Produkčný projekt zatiaľ neexistuje.

| Kontrola | Hodnota |
| --- | --- |
| tabuľky | 16 (15 modelov + `_prisma_migrations`) |
| s RLS | 16 — všetky |
| RLS policies | **0** — verejné REST API je úplne zavreté |
| CHECK obmedzenia | 8 |
| cudzie kľúče | 18 |
| `Objednavka_clenId_fkey` | `SET NULL` — účtovný doklad prežije výmaz člena |
| používatelia v `auth.users` | 0 |

---

## Čo neexistuje

Prihlasovanie · roly v praxi · `src/server/` · členské funkcie ·
administrácia klubu · zálohy databázy · produkčný Supabase projekt ·
automatizované testy · Sentry · Vercel environment premenné

---

## Najbližší krok

**Etapa G — prihlasovanie**, v troch častiach:

| | Čo | Zadanie |
| --- | --- | --- |
| G1 | balíky `@supabase/*`, klientske súbory, premenné | `CLAUDE_CODE_TASK_012.md` |
| G2 | middleware, registrácia, prihlásenie, obnova hesla | pripraví sa |
| G3 | ochrana `/klub` a `/sprava`, admin rola, odkaz v menu | pripraví sa |

---

## Otvorené, zapísané na neskôr

| Vec | Kedy |
| --- | --- |
| `overrides` pre `postcss` a `sharp` pod `next` | po Etape G |
| odstránenie `continue-on-error` z jobu `audit` | keď bude 0 zraniteľností |
| Sentry — vyžaduje `@sentry/nextjs` | čaká na schválenie |
| Vercel environment premenné pre Preview | Etapa G2 |
| produkčný Supabase projekt + Supabase Pro so zálohami | pred spustením |
| právna kontrola podmienok a GDPR, zmluva o spracúvaní údajov | **paralelne, čím skôr** |

---

## Riziká vysokej priority

| # | Riziko | Kde |
| --- | --- | --- |
| R-1 | Úprava `src/middleware.ts` môže odomknúť `/admin/objednavky` | Etapa G2 |
| R-2 | `src/server/auth.ts` bude jediná skutočná ochrana dát | `SECURITY.md` |
| R-3 | Migrácia na produkčnú databázu — zatiaľ nevykonaná | pred spustením |
| R-4 | Žiadne zálohy databázy | pred prvým reálnym členom |
