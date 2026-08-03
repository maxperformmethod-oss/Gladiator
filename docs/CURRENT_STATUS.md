# CURRENT_STATUS.md — Gladiator Gym

**Verzia 3.3** · 1. 8. 2026 · po Etape G, pred H

---

## Kde presne sme

| | |
| --- | --- |
| `main` | `ce493e5` (G3, PR #27) + oprava statických stránok (táto PR) |
| Pracovná vetva | `fix/static-public-pages` (oprava R1/R2) → PR proti `main` |
| Posledná hotová etapa | **Etapa G** — autentifikácia + ochrana ciest (G1–G3) |
| Ďalší krok | **Etapa H** — členské funkcie (`docs/ETAPA_H_KONCEPT.md`) |

---

## Jedným odsekom

Infraštruktúrna fáza je uzavretá — CI, ochrana `main`, Dependabot, dokumentácia
aj príručka obsluhy sú hotové a osem runtime zraniteľností v Next.js je
zaplátaných. Schéma databázy je navrhnutá, zapísaná a **prvá migrácia je
aplikovaná na staging** — 16 tabuliek, 18 cudzích kľúčov, 8 databázových
obmedzení, RLS zapnuté na všetkom a nula policies. **Etapa G2 je hotová:** cez
Supabase Auth sa dá zaregistrovať, prihlásiť a obnoviť heslo (registrácia,
prihlásenie, e-mailový callback, obnova aj nastavenie nového hesla).
**Etapa G je uzavretá:** `/klub` je len pre prihlásených členov, `/sprava` len
pre adminov (ochrana cez layouty, `middleware.ts` nedotknutý), verejné stránky
ostali staticky renderované. Ďalej ide **Etapa H** — členské funkcie.

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
| **G1** | **Supabase klienty** | **`a1f1c45`** |
| — | normalizácia line endings na LF | `b3212e7` (v PR #22) |
| **G2** | **registrácia · prihlásenie · obnova hesla · callback** | `80b10f8` (PR #24) |
| **G3** | **ochrana `/klub`/`/sprava`, hlavička, odhlásenie** | `ce493e5` (PR #27) |

---

## Vercel a Sentry — overené cez konektory 31. 7. 2026

### Vercel — dva projekty na jednom repozitári

| | Živý | Mŕtva duplicita |
| --- | --- | --- |
| Účet | **RPS-2022** (Pro) | `maximmalovec8-6717's projects` |
| Doména | `gladiator-eight.vercel.app` | `gladiator-ruby.vercel.app` |
| Projekt ID | — (MCP naň nevidí) | `prj_HB9ohhHmBaZY7eCb7ZgpuYwfbTja` |
| Nasadenia | robí PR checks aj produkciu | **1**, z ~18.–19. 7., odvtedy nič |

Kanonický je **RPS-2022**. Duplicitu odpojiť od GitHubu alebo zmazať.
Vercel MCP konektor je autorizovaný na osobný účet → preautorizovať na RPS-2022.

**Environment premenné (31. 7. 2026):** `NEXT_PUBLIC_SUPABASE_URL`
a `NEXT_PUBLIC_SUPABASE_ANON_KEY` sú nastavené pre **Production aj Preview**.
Prejavia sa až na **nasledujúcom nasadení**.

### Sentry

Organizácia `maxperformstudio` (DE región). Projekt **`gladiator-gym`**
vytvorený 31. 7. 2026, platforma `javascript-nextjs`, DSN vydané.
**Do aplikácie zatiaľ nezapojené** — vyžaduje `npm install @sentry/nextjs`.
DSN patrí do env premennej, nie natvrdo do kódu.

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

**Jeden nález (WARN):** `public.rls_auto_enable()` je `SECURITY DEFINER`
a volateľná rolou `anon` cez `/rest/v1/rpc/rls_auto_enable`. Nízka závažnosť,
ale zbytočná expozícia → `REVOKE EXECUTE`, zapísané v `TODO.md`.

---

## Čo neexistuje

Členské funkcie · administrácia klubu (stránky `/sprava` sú zatiaľ prázdne) ·
zálohy databázy · produkčný Supabase projekt · automatizované testy ·
Sentry **v aplikácii** (projekt už existuje)

---

## Najbližší krok

**Etapa H — členské funkcie.** Etapa G je uzavretá. Koncept je v
`docs/ETAPA_H_KONCEPT.md` a **čaká na dve rozhodnutia majiteľa**:

1. **Kto schvaľuje výkon** — kto potvrdzuje zapísané výsledky/rekordy.
2. **Typ výzvy** — aká je mesačná výzva.

Kým tie dve veci nie sú rozhodnuté, Etapa H sa nezačína.

**Build = 43/43.** (Route handler `/api/auth/callback` sa do tally „Generating
static pages" ráta, preto 43 a nie 42.)

---

## Otvorené, zapísané na neskôr

| Vec | Kedy |
| --- | --- |
| `overrides` pre `postcss` a `sharp` pod `next` | po Etape G |
| odstránenie `continue-on-error` z jobu `audit` | keď bude 0 zraniteľností |
| Sentry — vyžaduje `@sentry/nextjs` | čaká na schválenie |
| produkčný Supabase projekt + Supabase Pro so zálohami | pred spustením |
| právna kontrola podmienok a GDPR, zmluva o spracúvaní údajov | **paralelne, čím skôr** |

---

## Riziká vysokej priority

| # | Riziko | Kde |
| --- | --- | --- |
| R-1 | Úprava `src/middleware.ts` môže odomknúť `/admin/objednavky` | G2 — **ošetrené**, Basic Auth vetva zachovaná |
| R-2 | `src/server/auth.ts` je jediná skutočná ochrana dát — aktívna od G3 | `SECURITY.md` |
| R-3 | Migrácia na produkčnú databázu — zatiaľ nevykonaná | pred spustením |
| R-4 | Žiadne zálohy databázy | pred prvým reálnym členom |
