# CURRENT_STATUS.md — Gladiator Gym

**Verzia 5.0** · 4. 8. 2026 · po H3 (mesačná výzva + rebríček)

---

## Kde presne sme

| | |
| --- | --- |
| `main` | po merge PR #33 (H2c — lokálna členská zóna) |
| Pracovná vetva | `feat/vyzva-scoreboard` (H3) → vlastný PR do `main` |
| Posledná hotová etapa | **H3** — mesačná výzva a scoreboard |
| Ďalší krok | **testovacia fáza** — ladenie podľa spätnej väzby z posilky |

---

## Jedným odsekom

Autentifikácia funguje end-to-end a je ručne overená. `/klub` je len pre
prihlásených, `/sprava` len pre adminov, `middleware.ts` ostal nedotknutý.
**H1–H3 sú hotové** (H1–H2c zmergované, H3 vo vlastnom PR). Členská zóna je od
H2c **lokálna appka**: tréningové dáta žijú v prehliadači člena (`localStorage`,
kľúč viazaný na `clenId`), server o nich nevie — počas tréningu sa naň nechodí.
**H3** pridáva jediné, čo ide na server: **mesačnú výzvu** (`/sprava/vyzvy`
zakladá a schvaľuje admin) a **rebríček** (`/klub/rebricek`). Hodnotu do výzvy
posiela člen sám z lokálnych dát (predvyplní sa mu), je to údaj na čestné slovo
a **schvaľuje ho admin** — vedomé rozhodnutie, v UI priznané. V rebríčku sa
nikdy nezobrazuje e-mail, len prezývka. Schéma sa v H3 nemenila, žiadna migrácia.

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
| H1 | dátový model tréningov + `/sprava/cviky` | PR #30 |
| H2 | členské obrazovky (server) | PR #31 |
| H2b | MPM parita tréningu (per-set váha/opakovania) | PR #32 |
| H2c | členská zóna ako lokálna appka (port MAXPERFORMu) + migrácia `20260803234707_trening_mpm_parita` (v H2b, aplikovaná) | PR #33 |
| **H3** | **mesačná výzva + scoreboard** (`/sprava/vyzvy`, `/klub/vyzva`, `/klub/rebricek`) | **tento PR** |

---

## Stav databázy — overený 3. 8. 2026

Supabase projekt `Gladiator gym`, ref `dhuynypsdbqdkkaqjxwv`, eu-west-1.
**Rola projektu: staging.** Produkčný projekt neexistuje.

| Kontrola | Hodnota |
| --- | --- |
| tabuľky | **20** (19 modelov + `_prisma_migrations`) |
| migrácie | 4 — `20260731000000_init`, `20260803134512_training_model`, `20260803134702_seed_cviky`, `20260803234707_trening_mpm_parita`, všetky `finished`, žiadna `rolled_back` (overené 4. 8.) |
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

## Neuzavreté (aktuálne)

| # | Vec | Kto |
| --- | --- | --- |
| 1 | ručné preklikanie H3 (manuálna tabuľka TASK_020/021), hlavne bezpečnosť rebríčka a iPhone | Maxim — headless sa nedá |
| 2 | zmazať staré squash-mergnuté vetvy | Claude Code, po odsúhlasení |
| 3 | rozhodnúť o otvorených Dependabot PR | Maxim |

> `/sprava/plany` **už neexistuje** — v H2c sa serverová vrstva plánov zrušila,
> plány si člen vytvára lokálne v `/klub/trening` (dáta v prehliadači). Admin
> v `/sprava` spravuje len globálny katalóg cvikov a výzvy.

---

## Čo neexistuje

Zálohy databázy · produkčný Supabase projekt · automatizované testy · Sentry
v aplikácii · vlastná doména · server-side záloha lokálnych tréningových dát člena

---

## Najbližší krok

**Testovacia fáza** — appka sa nasadí do posilky a ladí sa podľa spätnej väzby.
Ďalšie väčšie rozhodnutia (napr. výzva na objem podľa partie = nová hodnota
v enume `VyzvaTyp` → migrácia) sú v `TODO.md` po konzultácii.

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
