# CURRENT_STATUS.md — Gladiator Gym

**Verzia 4.0** · 3. 8. 2026 · po H1, pred merge PR #30

---

## Kde presne sme

| | |
| --- | --- |
| `main` | posledný merge PR #29 (`fix/static-public-pages`) |
| Pracovná vetva | `feat/training-model` → **PR #30, `1e847b9`, NEZMERGOVANÁ** |
| Posledná hotová etapa | **H1** — dátový model tréningov + správa cvikov a plánov |
| Ďalší krok | **H2** — členské obrazovky (`docs/CLAUDE_CODE_TASK_017.md`) |

---

## Jedným odsekom

Autentifikácia funguje end-to-end a je ručne overená — registrácia, prihlásenie,
obnova hesla aj e-mailový callback. `/klub` je len pre prihlásených, `/sprava`
len pre adminov, `middleware.ts` ostal nedotknutý. Verejný web beží na produkcii.
**H1 je hotová:** databáza má dátový model tréningov (`TreningPlan`, `PlanCvik`,
`Trening`, `Seria`), `Cvik` má partiu a voliteľného vlastníka, `Vyzva` má typ
a nepovinný cvik. V `/sprava` sa dajú spravovať globálne cviky a zakladať plány.
Čaká sa na merge PR #30 (obsahuje schému → merguje Maxim) a na ručné overenie
troch admin obrazoviek. Potom ide **H2 — členské obrazovky**.

---

## Hotové etapy

| Etapa | Čo | Commit / PR |
| --- | --- | --- |
| A0 | read-only audit repozitára | — |
| A | dokumentácia | `45ff000` |
| A1 | CI, Dependabot, ochrana `main` | `58c1687` |
| A2 | odstránenie zraniteľností Next.js | `3e6f5ef` |
| C | kostra `/klub`, `/sprava` | `2b9cd3c` |
| D | PWA manifest a ikony | `2b9cd3c` |
| — | príručka obsluhy | `cf63bd6` |
| E | schéma databázy | `0025618` |
| F | prvá migrácia na staging | `b9eb39d` |
| — | normalizácia line endings na LF | `b3212e7` (PR #22) |
| G1 | Supabase klienty | `a1f1c45` |
| G2 | registrácia · prihlásenie · obnova hesla · callback | `80b10f8` (PR #24) |
| G3 | ochrana `/klub` a `/sprava`, hlavička, odhlásenie | `ce493e5` (PR #27) |
| — | oprava statických verejných stránok | PR #29 |
| **H1** | **dátový model tréningov + `/sprava/cviky` a `/sprava/plany`** | **PR #30 — čaká na merge** |

---

## Stav databázy — overený 3. 8. 2026

Supabase projekt `Gladiator gym`, ref `dhuynypsdbqdkkaqjxwv`, eu-west-1.
**Rola projektu: staging.** Produkčný projekt neexistuje.

| Kontrola | Hodnota |
| --- | --- |
| tabuľky | **20** (19 modelov + `_prisma_migrations`) |
| migrácie | 3 — `20260731000000_init`, `20260803134512_training_model`, `20260803134702_seed_cviky`, všetky `finished`, žiadna `rolled_back` |
| RLS | zapnuté na všetkom |
| RLS policies | **0** — verejné REST API je úplne zavreté |
| `rls_auto_enable()` — `anon` / `authenticated` EXECUTE | **false / false** ✅ (revokované 3. 8.) |
| účty v `auth.users` | 2, obidva potvrdené |
| `maxperformmethod@gmail.com` | **ADMIN** |
| `maximmalovec8@gmail.com` | **CLEN** |
| globálne cviky (`clenId = null`) | **5** — Drep, Bench press, Mŕtvy ťah, Tlak nad hlavu, Zhyby |

### Poznámka k `rls_auto_enable()`

Je to **event trigger funkcia Supabase platformy**, nie náš objekt. Zámerne nie
je vo verzovaných migráciách — `REVOKE` sa spúšťa ručne pri zakladaní každého
nového Supabase projektu. Zapísané v `TODO.md` §6 a `PREVADZKA.md` §5.

---

## Supabase Auth — nastavené 3. 8. 2026

| Nastavenie | Hodnota |
| --- | --- |
| Site URL | `https://gladiator-eight.vercel.app` |
| Redirect URLs | úzky vzor na `/api/auth/callback**` (produkcia + localhost) |
| Confirm email | **OFF** — dočasne, kvôli testovaniu bez overenej domény |

> **Pred produkciou vrátiť Confirm email na ON.** `TODO.md` §6.

---

## Vercel a Sentry

| | Živý | Mŕtva duplicita |
| --- | --- | --- |
| Účet | **RPS-2022** (Pro) | `maximmalovec8-6717's projects` |
| Doména | `gladiator-eight.vercel.app` | `gladiator-ruby.vercel.app` |
| Nasadenia | PR checks aj produkcia | 1, z ~18.–19. 7., odvtedy nič |

Duplicitu odpojiť od GitHubu alebo zmazať. Vercel MCP konektor je autorizovaný
na osobný účet → preautorizovať na RPS-2022.

**Sentry:** org `maxperformstudio` (DE), projekt `gladiator-gym`, DSN vydané,
**do aplikácie nezapojené** (vyžaduje `npm install @sentry/nextjs`).

**Git identita:** `maxperformmethod@gmail.com` / Maxim Malovec, nastavené
globálne 3. 8. E-mail je v GitHube overený.

---

## Neuzavreté z H1

| # | Vec | Kto |
| --- | --- | --- |
| 1 | ručné overenie `/sprava/cviky` a `/sprava/plany` ako ADMIN (riadky A5 č. 1, 3, 4) | Maxim — headless sa nedá |
| 2 | merge PR #30 (obsahuje `prisma/schema.prisma`) | **Maxim** |
| 3 | zmazať 4 squash-mergnuté vetvy (#25, #26, #27, #29) | Claude Code, po odsúhlasení |
| 4 | rozhodnúť o 4 otvorených Dependabot PR (#13, #14, #15, #28) | Maxim |

### Známy kompromis H1

`vytvorPlan` zakladá plán s `clenId = admin.id` — plán patrí adminovi osobne,
členovia ho nevidia. Pre H2 to znamená: **člen si plány zakladá sám.**
Zdieľané „gym plány" (`TreningPlan.clenId = null`) sú neskoršie rozhodnutie;
uvoľniť stĺpec na nullable je aditívna, bezpečná migrácia.

---

## Čo neexistuje

Členské obrazovky (zápis tréningu, história, rekordy, prehľad) · výzvy
a schvaľovanie · rozcestník v `/sprava` · zálohy databázy · produkčný Supabase
projekt · automatizované testy · Sentry v aplikácii · vlastná doména

---

## Najbližší krok

**Etapa H2 — členské obrazovky.** Zadanie: `docs/CLAUDE_CODE_TASK_017.md`.
Rozsah: `/klub` rozcestník, zápis tréningu (`Trening` + `Seria`), História
s vypočítanými osobnými rekordmi, Prehľad so súhrnmi. Grafy a výzvy sú H3.

**Build pred H2 = 44/44.**

---

## Otvorené, zapísané na neskôr

| Vec | Kedy |
| --- | --- |
| staging Supabase projekt | **pred prvým prístupom niekoho mimo nás** |
| vlastná doména → Resend, Redirect URLs, Stripe live | čím skôr |
| Confirm email späť na ON | pred produkciou |
| produkčný Supabase projekt + Pro so zálohami | pred spustením |
| Sentry — vyžaduje `@sentry/nextjs` | čaká na schválenie |
| `overrides` pre `postcss` a `sharp` pod `next` | kedykoľvek |
| odstránenie `continue-on-error` z jobu `audit` | keď bude 0 zraniteľností |
| právna kontrola podmienok a GDPR | **paralelne, čím skôr** |

---

## Riziká vysokej priority

| # | Riziko | Kde |
| --- | --- | --- |
| R-1 | Úprava `src/middleware.ts` môže odomknúť `/admin/objednavky` | ošetrené, Basic Auth vetva zachovaná |
| R-2 | **`src/server/auth.ts` je jediná skutočná ochrana dát** — RLS policies je nula | `SECURITY.md` |
| R-3 | Migrácia na produkčnú databázu — zatiaľ nevykonaná | pred spustením |
| R-4 | Žiadne zálohy databázy | pred prvým reálnym členom |
| R-5 | Heslo ADMIN účtu bolo poslané v chate → **po testovaní zmeniť** | Supabase → Auth → Users |
