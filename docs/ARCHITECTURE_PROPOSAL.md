# ARCHITECTURE_PROPOSAL.md — Gladiator Gym PWA v1

**Verzia 2.0** · 2026-07-30 · Stav: **NÁVRH — čaká na schválenie**
Nahrádza verziu 1.0, ktorá bola písaná bez prístupu k repozitáru.

---

## 0. Čo sa oproti v1 zmenilo a prečo

Audit repozitára (Etapa A0) vyvrátil päť predpokladov z v1. Toto sú opravy:

| # | v1 tvrdila | Realita z auditu | Dôsledok |
| --- | --- | --- | --- |
| 1 | „`prisma migrate` môže zmazať produkčné objednávky" — riziko R-2, kritické | **`prisma/migrations/` neexistuje. Žiadna migrácia nikdy nebežala. `migration_lock.toml` neexistuje.** | Databáza je prázdna alebo neexistuje. **Niet čo stratiť.** R-2 klesá z kritického na nízke. Toto je najlepší možný moment na návrh schémy. |
| 2 | `matcher` neznámy, treba sa `/admin` vyhnúť „pre istotu" | **`matcher: ['/admin/:path*']`** — chytá `/admin/klub`, nechytá `/klub` ani `/sprava` | Potvrdené: nová sekcia **nesmie** ísť pod `/admin`. `/klub` a `/sprava` sú voľné. |
| 3 | „`Clen` je prázdna, deprecujeme ju a vytvoríme `profiles`" | **`Clen` má povinné FK z `Permanentka`, `QRToken`, `VstupHistoria` a voliteľné z `Objednavka`** | Paralelná `profiles` by vytvorila **dve identity člena**. Odporúčanie sa mení: rozšíriť `Clen`, nevytvárať `profiles`. |
| 4 | „treba pridať `zod`" | **`src/lib/validate.ts` už existuje** | Nový balík možno vôbec netreba. Otvorené — viď D-05. |
| 5 | ~6 verejných routes | **14 verejných stránok + 4 API routes** (`/sluzby`, `/treneri`, `/treneri/[slug]`, `/galeria`, `/eventy`, `/rezervacia`, `/objednavka/potvrdenie`, `/api/kontakt`, `/api/rezervacia`) | Web je väčší, než v1 predpokladala. O to dôležitejšie je sa ho nedotknúť. |

Ďalšie zistenia: kódová báza je **čistá** — nula `any`, nula `@ts-ignore`, nula
`console.log`, nula `dangerouslySetInnerHTML`. Git história neobsahuje `.env`.
Všetky `process.env` výskyty sú v serverových súboroch.

---

## 1. Vedúci princíp tejto verzie

> **Najjednoduchšia štruktúra, ktorá ešte spĺňa tri vrstvy.**

Projekt spravuje a hostuje jeden človek. Každý priečinok navyše je budúca réžia.
Preto som z v1 vypustil: `features/`, `services/`, `repositories/`,
`route groups`, `types/`, `supabase/` (CLI), a rozdelenie `components/` na
`public/member/admin`.

Platby sa v tejto fáze **neriešia vôbec**. Existujúci Stripe kód sa nedotýka,
nerozširuje ani neodstraňuje.

---

## 2. Tri vrstvy — konkrétne

| Vrstva | Kde žije | Zodpovednosť |
| --- | --- | --- |
| **1 — Presentation** | `src/app/**` (page, layout) · `src/components/**` | UI, formuláre, zobrazenie. Žiadne DB dotazy, žiadne tajomstvá, žiadne rozhodovanie o rolách. |
| **2 — Application** | `src/server/*.ts` | Business logika, autorizácia, validácia, Server Actions. Jediné miesto, ktoré smie volať Vrstvu 3. |
| **3 — Data** | `prisma/schema.prisma` · `src/lib/prisma.ts` · `src/lib/supabase*.ts` | Schéma, migrácie, DB klient, Auth klient, RLS. |

**Jediné tvrdé pravidlo:** komponent nikdy neimportuje `prisma`. Vždy len funkciu
zo `src/server/`.

Toto pravidlo sa dá overiť jedným grepom, takže sa nedá potichu porušiť:

```
grep -rn "from '@/lib/prisma'" src/app src/components   # musí byť prázdne
```

---

## 3. Priečinková štruktúra

`[E]` = existuje · `[N]` = nový · **tučné** = dotýka sa existujúceho súboru

```
prisma/
└── schema.prisma                     [E]  ← rozšírenie, viď §5

public/
├── fotky/                            [E]  nedotknuté
├── manifest.webmanifest              [N]
└── icons/                            [N]  192, 512, maskable

src/
├── middleware.ts                     **[E]  ← jediná riziková úprava, §6**
│
├── app/
│   ├── layout.tsx                    **[E]  ← pribudne odkaz na manifest**
│   ├── globals.css                   [E]  NEMENIŤ
│   ├── page.tsx, o-gyme, sluzby, vybavenie, treneri, treneri/[slug],
│   │   cennik, galeria, eventy, kontakt, rezervacia, podmienky,
│   │   not-found, objednavka/potvrdenie                      [E] NEMENIŤ
│   ├── admin/objednavky/             [E]  NEMENIŤ (Basic Auth)
│   ├── api/checkout, api/kontakt, api/rezervacia,
│   │   api/stripe/webhook            [E]  NEMENIŤ
│   │
│   ├── registracia/page.tsx          [N]
│   ├── prihlasenie/page.tsx          [N]
│   ├── obnova-hesla/page.tsx         [N]
│   ├── nove-heslo/page.tsx           [N]
│   ├── api/auth/callback/route.ts    [N]  potvrdenie e-mailu + reset
│   │
│   ├── klub/                         [N]  členská sekcia
│   │   ├── layout.tsx                     guard: prihlásený
│   │   ├── page.tsx                       prehľad
│   │   ├── profil/page.tsx
│   │   ├── rekordy/page.tsx
│   │   ├── rebricek/page.tsx
│   │   └── vyzva/page.tsx
│   │
│   └── sprava/                       [N]  administrácia klubu
│       ├── layout.tsx                     guard: admin
│       ├── page.tsx
│       ├── clenovia/page.tsx
│       ├── cviky/page.tsx
│       ├── vyzvy/page.tsx
│       └── vysledky/page.tsx
│
├── components/
│   ├── layout/, sections/, forms/, ui/, Providers.tsx,
│   │   TrainerCard.tsx, CancelNotice.tsx                     [E] NEMENIŤ
│   └── klub/                         [N]  všetky nové komponenty tu
│
├── lib/
│   ├── cn, gym, order-number, pricing, prisma, stripe, validate  [E] NEMENIŤ
│   ├── supabase.ts                   [N]  browser klient (anon key)
│   └── supabase-server.ts            [N]  server klient (cookies)
│
└── server/                           [N]  ← celá Vrstva 2, 5 súborov
    ├── auth.ts                            getUser · requireClen · requireAdmin
    ├── profil.ts                          čítanie a úprava vlastného profilu
    ├── rekordy.ts                         osobné rekordy + rebríček
    ├── vyzvy.ts                           výzva + zápisy + schvaľovanie
    └── admin.ts                           správa členov, cvikov, admin log
```

**Celkovo pribudne:** 5 súborov v `src/server/`, 2 v `src/lib/`,
16 stránok, 1 API route, manifest + ikony.
**Dotkne sa:** `src/middleware.ts`, `src/app/layout.tsx`, `prisma/schema.prisma`.
Nič iné.

### Prečo bez `route groups`

`(auth)` a `(public)` nemenia URL — ich jediný prínos je zdieľaný layout.
Štyri prihlasovacie stránky zdieľaný layout nepotrebujú. Vypustené.

### Prečo `src/components/klub/` a nie `klub/` + `sprava/`

Členské a administračné komponenty budú zdieľať tabuľky, formuláre a karty.
Dva priečinky by viedli k duplikácii. Jeden priečinok, jasné názvy súborov.

### Prečo `/sprava` a nie `/admin/klub`

**Overený fakt:** `matcher: ['/admin/:path*']`. Čokoľvek pod `/admin` zdedí
HTTP Basic Auth. Tým by admin klubu vyžadoval dve heslá naraz a Supabase
session by sa k nemu nedostala. `/sprava` je mimo matchera. Rozhodnuté.

---

## 4. Routes a prístup

| Route | Prístup | Cache |
| --- | --- | --- |
| 14 existujúcich verejných stránok | verejný | bez zmeny |
| `/registracia`, `/prihlasenie`, `/obnova-hesla`, `/nove-heslo` | len neprihlásený | statické |
| `/api/auth/callback` | verejný (token v URL) | `no-store` |
| `/klub/**` | prihlásený člen | `no-store` |
| `/sprava/**` | **len admin** | `no-store` + `noindex` |
| `/admin/objednavky` | Basic Auth | bez zmeny |
| `/api/checkout`, `/api/stripe/webhook`, `/api/kontakt`, `/api/rezervacia` | bez zmeny | bez zmeny |

---

## 5. Dátový model — rozšírenie `Clen`, nie nová `profiles`

### Rozhodnutie a jeho dôvod

Zadanie žiadalo tabuľku `profiles`. **Neodporúčam ju.**

Audit ukázal, že `Clen` má **povinné** cudzie kľúče z `Permanentka`, `QRToken`
a `VstupHistoria`, a voliteľný z `Objednavka`. Nová `profiles` by znamenala dve
tabuľky reprezentujúce toho istého človeka — presne tá duplicitná architektúra,
ktorú zadanie zakazuje. Pri jednom správcovi je to navyše zaručený zdroj chýb.

**Odporúčanie: rozšíriť existujúci model `Clen`.**

Je to bezpečné práve teraz, lebo **žiadna migrácia ešte nebežala** — nemeníme
existujúcu tabuľku, iba dokončujeme jej návrh pred prvým `migrate`.

### Zmeny v `Clen`

| Stĺpec | Akcia | Poznámka |
| --- | --- | --- |
| `authUserId` | **pridať** | `String? @unique @db.Uuid` — väzba na `auth.users.id`. Nullable, lebo môže existovať člen bez online účtu. |
| `prezyvka` | **pridať** | `String? @unique` — verejný nickname, case-insensitive unikátnosť |
| `rola` | **pridať** | enum `Rola { CLEN, ADMIN }`, default `CLEN` |
| `aktivny` | **pridať** | `Boolean @default(true)` — deaktivácia namiesto mazania |
| `email` | **ponechať, ale nepovinné** | Zadanie chce e-mail iba v `auth.users`. Pri online členoch je zdrojom pravdy `auth.users`. Pri offline členoch (zadaných recepciou) môže zostať tu. **Otvorené — D-13.** |
| `meno`, `telefon` | ponechať | existujúce, do PWA sa nezobrazujú |

### Nové modely (slovenské názvy — konzistentne s existujúcou schémou)

Existujúca schéma používa `Pobocka`, `Trener`, `Objednavka`. Anglické
`exercises` / `personal_records` by rozdvojili konvenciu.

| Model | Kľúčové polia |
| --- | --- |
| `Cvik` | `id`, `slug @unique`, `nazov`, `jednotka` (KG / OPAKOVANIA / SEKUNDY), `aktivny` |
| `Rekord` | `id`, `clenId →Clen`, `cvikId →Cvik`, `hodnota Decimal`, `dosiahnute DateTime`, `createdAt`; index `[clenId, cvikId]` |
| `Vyzva` | `id`, `nazov`, `cvikId →Cvik`, `zaciatok`, `koniec`, `stav` (NAVRH / AKTIVNA / UZAVRETA) |
| `VyzvaZapis` | `id`, `vyzvaId`, `clenId`, `hodnota`, `stav` (CAKA / SCHVALENE / ZAMIETNUTE), `posudilId? →Clen`, `posudene?`; **`@@unique([vyzvaId, clenId])`** |
| `AdminLog` | `id`, `aktorId →Clen`, `akcia`, `cielTyp`, `cielId`, `createdAt` |

Celkovo: **10 existujúcich + 5 nových = 15 modelov.**

### Prvá migrácia

Keďže `prisma/migrations/` neexistuje, prvá migrácia bude **baseline so všetkými
15 modelmi naraz**. Spustí sa **najprv proti staging Supabase projektu**, nikdy
priamo proti tomu, ktorý je vo Vercel Production.

Supabase schéma `auth` **nepatrí Prisme**. `Clen.authUserId` je obyčajný UUID
stĺpec bez Prisma relácie na `auth.users`. FK constraint (ak vôbec) sa doplní
raw SQL-om v tej istej migrácii. Tým sa Prisma nikdy nepokúsi „driftovať"
Supabase auth tabuľky.

---

## 6. Middleware — jediná riziková úprava

Súčasný stav (overený):

```ts
export const config = { matcher: ['/admin/:path*'] }
```

52 riadkov, HTTP Basic Auth, fail-closed 503 pri chýbajúcej konfigurácii.

### Návrh

Matcher sa **rozšíri**, existujúca vetva sa **nedotkne**:

```ts
export const config = {
  matcher: ['/admin/:path*', '/klub/:path*', '/sprava/:path*'],
}
```

Logika:

```
if (pathname.startsWith('/admin'))  → existujúci Basic Auth kód, bezo zmeny
else                                → refresh Supabase session, prípadný redirect
```

### Bezpečnostná poistka

Middleware **nie je** jediná ochrana `/sprava`. Rolu overuje aj
`src/app/sprava/layout.tsx` na serveri a **každá** Server Action v
`src/server/admin.ts`. Middleware rieši UX (rýchly redirect), nie autorizáciu.

**Rollback:** jeden commit, jeden súbor, `git revert`.

---

## 7. Dátové toky

### Registrácia

```
formulár (e-mail, heslo, prezývka)
  → Server Action v src/server/auth.ts
      1. validácia vstupu
      2. kontrola, že prezývka je voľná
      3. Supabase Auth signUp()          → pošle potvrdzovací e-mail
      4. Prisma: create Clen { authUserId, prezyvka, rola: CLEN }
  → „Skontroluj si e-mail"
```

`rola: CLEN` je v kóde **natvrdo**. Z requestu sa nečíta.

### Zápis rekordu

```
formulár (cvikId, hodnota, dátum)
  → Server Action v src/server/rekordy.ts
      1. clen = await requireClen()      ← identita zo session, NIE z formulára
      2. validácia (rozsah hodnoty, dátum nie v budúcnosti, cvik existuje)
      3. Prisma: create Rekord { clenId: clen.id, ... }
  → revalidatePath('/klub/rekordy')
```

### Výzva

```
Člen:  requireClen() → create VyzvaZapis { stav: CAKA }
       stav je v kóde natvrdo; z requestu sa nečíta

Admin: requireAdmin()
       → kontrola: posudilId !== clenId (žiadne samoschválenie)
       → update VyzvaZapis { stav: SCHVALENE | ZAMIETNUTE }
       → create AdminLog
```

### Rebríček

```
Server Component → src/server/rekordy.ts → zoznamRebricka()
  SELECT prezyvka, hodnota
  WHERE stav = SCHVALENE AND clen.aktivny = true
  → nikdy e-mail, nikdy authUserId, nikdy id
```

---

## 8. Klient vs. server

| Operácia | Kde | Prečo |
| --- | --- | --- |
| prihlásenie, registrácia | klient volá Supabase + server callback | Supabase musí nastaviť cookie |
| refresh session | middleware | cookie sa obnoví pred renderom |
| **overenie roly** | **výhradne server** | klient sa dá zmanipulovať |
| čítanie a zápis dát | výhradne server | jediný prístup k Prisme |
| UX validácia formulára | klient | iba pohodlie — serverová validácia je povinná aj tak |

---

## 9. PWA — odporúčam BEZ service workera

Toto je zmena oproti v1.

| | Možnosť | Inštalovateľnosť | Riziko |
| --- | --- | --- | --- |
| **1** | **manifest + ikony + theme color** | iOS Safari „Pridať na plochu" ✅ · Android Chrome neponúkne automatickú výzvu, ale manuálne pridanie funguje | **prakticky nulové** |
| 2 | + service worker | Android Chrome ponúkne výzvu | cache maskuje nové deploye · SW prežije `git revert` v už nainštalovaných prehliadačoch · môže kolidovať s `force-dynamic` stránkami |

**Odporúčam možnosť 1 pre v1.** Dôvod: si jediný správca. Service worker je
najbežnejší zdroj situácie „nasadil som opravu a používatelia ju nevidia".
Zisk (automatická inštalačná výzva na Androide) je malý, cena pri chybe vysoká.

Service worker sa dá pridať kedykoľvek neskôr, keď bude aplikácia stabilná —
ako samostatná, dobre otestovaná etapa.

**Čo sa v Etape D urobí:**

- `public/manifest.webmanifest` — názov, `short_name`, `start_url: /klub`,
  `display: standalone`, `theme_color: #0a0a0a`, `background_color: #0a0a0a`
- ikony 192, 512, maskable
- `<link rel="manifest">` v `src/app/layout.tsx`
  (`viewport` a `themeColor` už v layoute existujú — netreba pridávať)

---

## 10. RLS

Pri tomto návrhu číta dáta **výhradne Prisma** cez privilegované spojenie, takže
RLS nie je primárna ochrana. Primárnou je `src/server/auth.ts`.

RLS sa napriek tomu zapne na všetkých piatich nových tabuľkách a na `Clen` ako
**druhá vrstva** — poistka pre prípad, že by sa niekedy otvoril priamy prístup
cez Supabase anon key. Konkrétne policy sa navrhnú v Etape E.

**Nutná podmienka tohto návrhu:** celá autorizácia je v jednom súbore
(`src/server/auth.ts`), aby sa dala prečítať a overiť na jednom mieste.

---

## 11. Riziká

| # | Riziko | Závažnosť | Zmiernenie |
| --- | --- | --- | --- |
| R-1 | Úprava `middleware.ts` odomkne `/admin/objednavky` | **vysoká** | matcher sa iba rozširuje; existujúca vetva sa nedotýka; manuálny test `/admin/objednavky` pred aj po |
| R-2 | Chyba v `src/server/auth.ts` = únik dát bez záchrannej siete | **vysoká** | jediný súbor · guard na začiatku každej funkcie · RLS ako druhá vrstva · testovací checklist Etapy J |
| R-3 | Prvá migrácia proti nesprávnej databáze | **vysoká** | najprv staging projekt · overiť `DATABASE_URL` pred spustením · nikdy `migrate reset` |
| R-4 | `Clen.email` × `auth.users.email` — dva zdroje pravdy | stredná | rozhodnutie D-13 pred migráciou |
| R-5 | Nesprávny `NEXT_PUBLIC_` prefix zverejní tajomstvo v bundli | stredná (vysoká pri chybe) | v tejto fáze sa `service_role` kľúč **vôbec nezavádza** |
| R-6 | Nový CSS ovplyvní existujúci vzhľad | nízka | `globals.css` sa nemení; nové štýly len Tailwind triedami v `/klub` a `/sprava` |
| R-7 | Repo v OneDrive + Node 26 → zámok súborov pri `prisma generate` | nízka | pred migráciou zastaviť dev server (už zdokumentované v `TODO.md`) |
| R-8 | Supabase klient natiahnutý do bundlu verejných stránok | nízka | `src/lib/supabase.ts` importovať iba v `/klub`, `/sprava` a auth stránkach |

---

## 12. Čo sa v tejto etape NEROBÍ

Nič sa neinštaluje · nespúšťajú sa migrácie · nepripája sa Supabase ·
nemení sa Vercel ani Git · nemaže ani nepresúva sa žiadny súbor ·
**Stripe sa nedotýka v žiadnej podobe** · nevytvára sa service worker.

---

## 13. Otvorené rozhodnutia

| ID | Otázka | Odporúčanie |
| --- | --- | --- |
| D-05 | Stačí existujúci `src/lib/validate.ts`, alebo pridať `zod`? | najprv pozrieť, čo `validate.ts` vie; balík pridať len ak nestačí |
| D-06 | PWA bez service workera? | **áno, bez** (§9) |
| D-07 | Rozšíriť `Clen` namiesto novej `profiles`? | **áno, rozšíriť** (§5) |
| D-11 | Samostatný staging Supabase projekt? | **áno**, free tier |
| D-13 | Zostáva `Clen.email`, alebo bude e-mail iba v `auth.users`? | ponechať ako nepovinný pre offline členov zadaných recepciou |
| D-14 | Naozaj `git push` spúšťa Vercel deploy? Audit a `TODO.md` si odporujú. | overiť jedným testovacím commitom |
