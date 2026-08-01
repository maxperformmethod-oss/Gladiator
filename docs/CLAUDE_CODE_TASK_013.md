# CLAUDE_CODE_TASK_013 — Etapa G2: registrácia a prihlásenie

Verzia 1.0 · 31. 7. 2026 · Cieľ: **dá sa zaregistrovať a prihlásiť**

---

## Rozsah čítania

Prečítaj iba: `CLAUDE.md`, `docs/CURRENT_STATUS.md`, `docs/DATABASE.md`
sekcie 2 a 6, a toto zadanie. **Nerob audit repozitára, nerekonštruuj históriu.**

Ďalšie súbory otváraj len tie, ktoré priamo meníš.

---

## Štyri časti, tri zastavenia

| Časť | Čo | Po nej |
| --- | --- | --- |
| A | validácia + autorizačná vrstva | pokračuj |
| B | **middleware — najrizikovejší súbor** | **ZASTAV** |
| C | registrácia + prihlásenie + callback | **ZASTAV** |
| D | obnova hesla | **ZASTAV** |

---

## ZAKÁZANÉ v celej úlohe

- žiadna zmena `prisma/schema.prisma`, žiadna migrácia
- žiadny `npm install` — všetko potrebné už máme
- `src/app/layout.tsx`, `src/app/globals.css`, existujúce stránky
  a komponenty — **nedotýkať sa**
- `src/lib/gym.ts`, `src/lib/pricing.ts` — nedotýkať sa
- žiadne `as any`, `@ts-expect-error`, `eslint-disable`
- necommituj a nepushuj bez schválenia

```
git checkout main && git pull        → základ potvrdí Maxim
git checkout -b feat/auth-flow
```

---

# ČASŤ A — validácia a autorizácia

## A1. Rozšír `src/lib/validate.ts`

Zachovaj existujúce tri funkcie bezo zmeny. Pridaj pod ne:

```ts
/** Reťazec v rozsahu dĺžky. Vracia orezanú hodnotu alebo null. */
export function rangeString(value: unknown, min: number, max: number): string | null

/** Overí, že reťazec zodpovedá vzoru. */
export function matchesPattern(value: string, pattern: RegExp): boolean

/** Číslo v rozsahu. Prijíma aj číselný reťazec z formulára. */
export function numberInRange(value: unknown, min: number, max: number): number | null

/** Dátum, ktorý nie je v budúcnosti. Vracia Date alebo null. */
export function pastDate(value: unknown): Date | null

/** Hodnota patrí do povoleného zoznamu. */
export function oneOf<T extends string>(value: unknown, allowed: readonly T[]): T | null
```

Píš ich v štýle existujúceho súboru — jednoduché, bez závislostí, vracajú
hodnotu alebo `null`.

## A2. Normalizácia prezývky

Do `src/lib/validate.ts` pridaj:

```ts
/**
 * Prezývka na porovnávanie: malé písmená, bez diakritiky.
 * Používa sa VÝHRADNE na serveri pre stĺpec Clen.prezyvkaNorm.
 */
export function normalizujPrezyvku(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}
```

Pravidlá pre prezývku, ktoré budeš vynucovať:

- dĺžka 3 až 20 znakov
- po normalizácii iba `a-z`, `0-9`, `_`, `-`
- zakázané: `admin`, `gladiator`, `recepcia`, `sprava`, `system`, `root`

## A3. Vytvor `src/server/auth.ts`

Celá autorizácia projektu bude v tomto jedinom súbore. Musí sa dať prečítať
na jedno posedenie.

```ts
import 'server-only'
```

Funkcie:

```ts
/** Prihlásený používateľ zo Supabase, alebo null. */
getAuthUser(): Promise<User | null>

/** Záznam Clen prihláseného používateľa, alebo null. */
getClen(): Promise<Clen | null>

/**
 * Doplní chýbajúci záznam Clen k existujúcemu Supabase účtu.
 * Idempotentné — ak už existuje, iba ho vráti.
 * Rieši prípad, keď registrácia zlyhala medzi krokom 3 a 4.
 * NIKDY negeneruje prezývku — pri chýbajúcom Clen bez prezývky vráti null.
 */
zabezpecClena(prezyvka?: string): Promise<Clen | null>

/** Vyžaduje prihláseného a aktívneho člena. Inak presmeruje na /prihlasenie. */
requireClen(): Promise<Clen>

/** Vyžaduje rolu ADMIN. Inak notFound(). */
requireAdmin(): Promise<Clen>
```

**Záväzné pravidlo pre `zabezpecClena()` — NIKDY negeneruje prezývku:**

| Stav | Výsledok |
| --- | --- |
| `Clen` existuje | vráť ho |
| neexistuje + `prezyvka` daná | vytvor (`rola: 'CLEN'`) a vráť |
| neexistuje + bez `prezyvky` | vráť `null` |

Keď `zabezpecClena()` vráti `null`, volajúci to musí ošetriť presmerovaním
na `/registracia/prezyvka`:

- `prihlas()` (Časť C) — pri `null` presmeruj na `/registracia/prezyvka`
- `/api/auth/callback` (Časť C) — to isté
- `requireClen()` — to isté

**Tvrdé pravidlá:**

- `requireClen()` odmietne aj člena, ktorý má `aktivny = false`
- `requireAdmin()` použije `notFound()`, **nie** `redirect()` — cudzí človek
  sa nemá dozvedieť, že `/sprava` existuje
- rola sa číta **z databázy**, nie z JWT — token môže byť zastaraný
- žiadna z týchto funkcií neprijíma `userId` ako parameter; identitu si berie
  vždy zo session

---

# ČASŤ B — middleware · NAJRIZIKOVEJŠIA ZMENA

`src/middleware.ts` dnes chráni produkčný `/admin/objednavky` cez HTTP Basic
Auth. Ak to pokazíš, buď sa admin odomkne, alebo sa zamkne celý web.

## B1. Najprv si ho prečítaj a odcituj

Vypíš jeho súčasný obsah **doslovne**, vrátane `export const config`,
predtým než čokoľvek zmeníš.

## B2. Pravidlá úpravy

**Existujúcu Basic Auth vetvu nemeň — ani o znak.** Iba ju obaľ podmienkou.

Nová štruktúra:

```
if (pathname.startsWith('/admin'))  → PÔVODNÝ KÓD, presne ako bol
else                                → obnova Supabase session, potom next()
```

Matcher sa **iba rozširuje**:

```ts
export const config = {
  matcher: ['/admin/:path*', '/klub/:path*', '/sprava/:path*'],
}
```

Obnovu session urob podľa dokumentácie `@supabase/ssr` verzie 0.12 —
`createServerClient` s `getAll`/`setAll` nad `request.cookies`
a `response.cookies`, potom `supabase.auth.getUser()`.

**Middleware v tejto etape nikoho nepresmerúva.** Iba obnoví session
a pustí ďalej. Ochrana ciest príde v G3, na úrovni layoutov.

## B3. Overenie — povinné, ručne

Spusti `npm run dev` a over v tomto poradí:

| Cesta | Očakávané |
| --- | --- |
| `/admin/objednavky` | pýta heslo alebo 503 — **rovnako ako predtým** |
| `/` | funguje bez zmeny |
| `/cennik` | funguje bez zmeny |
| `/klub` | „Pripravuje sa", žiadna chyba |
| `/sprava` | „Pripravuje sa", žiadna chyba |

**ZASTAV a nahlás výsledok tejto tabuľky, než budeš pokračovať Časťou C.**

---

# ČASŤ C — registrácia, prihlásenie, callback

## C1. `src/server/actions/auth.ts`

Server Actions. Každá začína validáciou, končí návratom chyby alebo
presmerovaním.

### `registruj(formData)`

```
1. validácia e-mailu, hesla (min 10 znakov), prezývky (A2)
2. kontrola, že prezyvkaNorm je voľná
3. supabase.auth.signUp({ email, password })
4. Prisma: create Clen { authUserId, prezyvka, prezyvkaNorm, rola: CLEN }
5. presmeruj na stránku „skontroluj si e-mail"
```

**`rola: 'CLEN'` je v kóde natvrdo.** Z `formData` sa nečíta.

Ak krok 4 zlyhá, používateľovi ukáž zrozumiteľnú chybu — účet doplní
`zabezpecClena()` pri prvom prihlásení.

### `prihlas(formData)`

```
1. validácia
2. supabase.auth.signInWithPassword
3. zabezpecClena()  ← doplní Clen, ak chýba
4. ak clen.aktivny === false → odhlás a vráť chybu
5. presmeruj na /klub
```

### `odhlas()`

```
supabase.auth.signOut() → presmeruj na /
```

## C2. Chybové hlásenia — bezpečnostné pravidlo

| Situácia | Čo zobraziť |
| --- | --- |
| neexistujúci e-mail pri prihlásení | „Nesprávny e-mail alebo heslo." |
| zlé heslo | **tá istá veta** |
| e-mail už registrovaný | „Skontroluj si e-mail." — ako pri úspechu |
| serverová chyba | všeobecná veta, **žiadny technický detail** |

Útočník sa nesmie dozvedieť, kto je v systéme registrovaný.

## C3. Stránky

Prepíš existujúce placeholdery `src/app/registracia/page.tsx`
a `src/app/prihlasenie/page.tsx`.

- Server Component + formulár volajúci Server Action
- `'use client'` iba tam, kde treba zobraziť chybu a stav odosielania
- **použi existujúce komponenty** z `src/components/ui/` — `Section`,
  `SectionHeading`, `Button`, `Notice`, `Card`
- **nevytváraj nové CSS triedy a nedotýkaj sa `globals.css`**
- ponechaj `robots: { index: false }` v metadátach
- na registrácii uveď pravidlá pre prezývku a minimálnu dĺžku hesla

Pridaj `src/app/registracia/hotovo/page.tsx` — „Skontroluj si e-mail".

## C3b. `src/app/registracia/prezyvka/page.tsx` — doplnenie prezývky

Stránka pre prípad, keď je používateľ **prihlásený cez Supabase, ale nemá
záznam `Clen`** (napr. `zabezpecClena()` vrátila `null`).

- vyžaduje prihlásenú Supabase session, ale žiadny `Clen`
- jediné pole: **prezývka** (pravidlá podľa A2)
- po odoslaní: validácia + kontrola voľnosti `prezyvkaNorm` + `create Clen`
  s **`rola: 'CLEN'` natvrdo** → redirect `/klub`
- ak `Clen` už existuje, rovno redirect `/klub`
- **použi existujúce komponenty** z `src/components/ui/`, **žiadne nové CSS**

## C4. `src/app/api/auth/callback/route.ts`

Spracuje odkaz z potvrdzovacieho e-mailu:

```
1. prečítaj `code` z URL
2. supabase.auth.exchangeCodeForSession(code)
3. zabezpecClena()
4. presmeruj na /klub
```

Pri chybe presmeruj na `/prihlasenie` s neutrálnou chybovou správou.

## C5. Nastavenie v Supabase — ✅ SPLNENÉ 31. 7. 2026 (Maxim)

Supabase → **Authentication → URL Configuration** (G2 beží LEN cez localhost;
adresa Vercel Preview sa doplní až v G3):

- ✅ Site URL: `http://localhost:3000`
- ✅ Redirect URLs: `http://localhost:3000/api/auth/callback`
- ✅ **Authentication → Providers → Email**: potvrdenie e-mailu zapnuté

**ZASTAV po Časti C.**

---

# ČASŤ D — obnova hesla

Prepíš `src/app/obnova-hesla/page.tsx` a `src/app/nove-heslo/page.tsx`.

- `obnova-hesla` → formulár s e-mailom → `resetPasswordForEmail`
  → vždy tá istá odpoveď „Ak účet existuje, poslali sme e-mail."
- `nove-heslo` → formulár s novým heslom → `updateUser`
  → presmeruj na `/prihlasenie`

Rovnaké pravidlá pre chybové hlásenia ako v C2.

---

## Kontrola pred reportom

```
npx tsc --noEmit
npm run lint
npm run build
git status --short
git diff --stat
```

- [ ] build **43/43** — základ 40 + `/registracia/hotovo`, `/registracia/prezyvka`
      a route handler `/api/auth/callback` (ten sa do tally „Generating static
      pages" ráta, preto 43 a nie 42)
- [ ] `git diff` neobsahuje `layout.tsx`, `globals.css`, `gym.ts`,
      `pricing.ts`, `prisma/`
- [ ] `/admin/objednavky` stále pýta heslo
- [ ] žiadny nový balík

---

## Report

```
## A. VALIDÁCIA           nové funkcie
## B1. PÔVODNÝ MIDDLEWARE doslovne
## B2. NOVÝ MIDDLEWARE    doslovne
## B3. TABUĽKA OVERENIA   5 ciest
## C. SÚBORY              zoznam nových a zmenených
## C5. ČO MÁM NASTAVIŤ JA v Supabase
## D. OBNOVA HESLA
## KONTROLY               tsc · lint · build · git
## RIZIKÁ
## NÁVRH COMMITU
## OTÁZKY                 max 3
```

---

## Ukončenie

Po reporte **zastav**. Necommituj, nepushuj.

Ak by ťa čokoľvek nútilo zmeniť `layout.tsx`, `globals.css` alebo
existujúcu stránku — **zastav a opýtaj sa.**
