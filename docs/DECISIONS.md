# DECISIONS.md — Gladiator Gym PWA v1

**Verzia 3.0** · 2026-07-30

---

## Potvrdené

| ID | Rozhodnutie | Dôvod |
| --- | --- | --- |
| C-01 | Next.js 15 App Router, React 19, TS strict, npm | existujúci stav, nemení sa |
| C-03 | Tailwind v4 CSS-first, žiadny `tailwind.config.js` | existujúci stav |
| C-04 | Databáza beží na Supabase PostgreSQL | existujúci stav |
| C-05 | Prihlasovanie cez Supabase Auth (e-mail + heslo) | hotová služba, rovnaká inštancia ako DB |
| C-06 | Roly iba `CLEN` a `ADMIN` | zadanie |
| C-08 | Rola sa nastavuje na serveri natvrdo `CLEN`; z klienta sa nečíta | bezpečnosť |
| **D-01** | **Platby sa neriešia.** Existujúci Stripe kód sa nedotýka, nerozširuje ani neodstraňuje. | rozhodnutie majiteľa |
| **D-02** | **Prisma zostáva jediným nástrojom na prácu s dátami. Supabase sa použije iba na prihlasovanie.** | Prisma nie je alternatíva k Supabase — je to spôsob, akým kód hovorí so Supabase databázou. Už je v projekte a funguje. Druhá knižnica by znamenala dva spôsoby na to isté. |
| **D-03** | Členská sekcia `/klub`, administrácia klubu `/sprava` | `/admin/*` je obsadené existujúcim Basic Auth |
| **D-04** | `matcher: ['/admin/:path*']` — overený fakt | audit |
| **D-06** | **PWA bez service workera.** Manifest, ikony, theme color. | service worker vie ľuďom podávať starú verziu aj po nasadení opravy a nedá sa to vrátiť cez `git revert` |
| **D-07** | **Rozšíriť existujúcu tabuľku `Clen`. Nová `profiles` sa nevytvára.** | majiteľ chce jedného člena: registrácia na webe → prihlásený → funguje aj v PWA. Dve tabuľky = ten istý človek dvakrát. |
| **D-15** | **`/klub` je prístupný až po prihlásení.** Neprihlásený → presmerovanie na `/prihlasenie`. | jednoduchšie aj bezpečnejšie než pustiť ľudí dnu a vypínať funkcie po jednej |

### Ako bude fungovať registrácia (D-07 v praxi)

```
1. Návštevník vyplní na webe: e-mail, heslo, prezývku
2. Supabase Auth vytvorí účet a pošle potvrdzovací e-mail
3. Prisma vytvorí záznam Clen { authUserId, prezyvka, rola: CLEN }
4. Po potvrdení e-mailu je prihlásený — na webe aj v PWA
```

`authUserId` je nitka, ktorá spája Supabase účet s tabuľkou `Clen`.
Jeden človek, jeden záznam, jedno prihlásenie.

---

### C-12 — Infraštruktúra · CONFIRMED 30. 7. 2026

| ID | Rozhodnutie |
| --- | --- |
| **D-11** | Existujúci Supabase projekt `dhuynypsdbqdkkaqjxwv` = **staging**. Produkčný projekt vznikne čistý pred spustením naostro. |
| **D-14** | Vercel ↔ Git **funguje** — Production sleduje `main`, Preview ostatné vetvy. Tvrdenie v `TODO.md` §3b je zastarané. |
| **D-16** | Zálohy: **Supabase Pro** sa kúpi pred spustením naostro. Obnovu treba raz reálne vyskúšať. |
| **D-17** | Ochrana `main`: PR povinný, required check **iba `quality`**. `audit` sa stane required až po odstránení zraniteľností a odstránení `continue-on-error`. |
| **D-18** | **`npm audit fix --force` je v tomto projekte trvalo zakázaný** — navrhuje downgrade `@eslint/eslintrc` na 0.1.0. |
| **D-19** | Do Vercel **Production** sa nikdy nedostane connection string staging projektu. Staging patrí výhradne do **Preview**. |

### C-13 — Dátový model · CONFIRMED 30. 7. 2026 (po TASK_006)

| ID | Rozhodnutie |
| --- | --- |
| **D-13** | `Clen.email` bude `String? @unique`. Overené, že `Clen` sa v kóde nepoužíva vôbec — zmena nemôže nič rozbiť. Viacero `NULL` v Postgrese unikátnosť neporušuje. |
| **D-20** | **`onDelete` sa doplní teraz.** V schéme dnes nie je ani jedno. `Cascade` pri osobných dátach, **`SetNull` pri `Objednavka`** — účtovný doklad nesmie zmiznúť pri výmaze člena. |
| **D-21** | `Clen.aktivny Boolean @default(true)` — rovnaká sémantika ako `Trener.aktivny`. |
| **D-05** | **`zod` sa nepridáva.** Rozšírime `src/lib/validate.ts` o päť funkcií. Menej práce než ďalšia závislosť, a práve sme našli 12 zraniteľností v tých existujúcich. Prehodnotiť pri viac ako 15 formulároch. |

---

## Odložené

| ID | Otázka | Kedy sa rozhodne |
| --- | --- | --- |
| **D-11** | Samostatný staging Supabase projekt? | pred prvou migráciou (Etapa E/F). Teraz netreba — databáza je prázdna a Etapa C sa jej vôbec nedotýka. |
| **D-13** | Zostane `Clen.email` povinný? | pri návrhu schémy (Etapa E). **Návrh:** urobiť ho nepovinným — e-mail bude v Supabase Auth, `Clen.email` zostane voľný pre členov, ktorých raz zapíše recepcia bez online účtu. Nič nestojí, nič neblokuje. |
| **D-05** | Stačí `src/lib/validate.ts`, alebo pridať `zod`? | Etapa G. Najprv sa pozrieme, čo `validate.ts` vie. |
| **D-14** | Spúšťa `git push` naozaj Vercel deploy? | overí sa prvým commitom z Etapy C |

---

## Vysvetlivka: Prisma vs. Supabase

Častý zdroj zmätku, preto natvrdo:

| | Čo to je | Kde beží |
| --- | --- | --- |
| **Supabase** | server, na ktorom databáza fyzicky žije · plus hotová služba na prihlasovanie | v cloude |
| **Prisma** | nástroj v našom kóde, ktorý s tou databázou hovorí | v našej aplikácii |

Nevyberáme si medzi nimi. **Všetky dáta sú a zostanú v Supabase.** Prisma je
len spôsob, akým sa k nim kód dostane — a v projekte už je, už funguje,
a existujúci web ju používa.

Jediné, čo si Supabase pri prihlasovaní ukladá sám, je e-mail a heslo
(tabuľka `auth.users`). Toho sa Prisma nedotýka.
