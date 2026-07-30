# PROJECT_CONTEXT.md — Gladiator Gym

Verzia dokumentu: 1.0 · Dátum: 2026-07-30 · Autor: Cowork (architekt/koordinátor)

---

## 0. Rozsah tohto dokumentu a hranica overiteľnosti

**DÔLEŽITÉ — čítaj ako prvé.**

Tento dokument NEBOL vytvorený na základe priameho čítania repozitára. V čase jeho
vzniku nebol projektový priečinok pripojený ku Cowork session. K dispozícii bol
iba snapshot vybraných súborov nasynchronizovaných do projektových znalostí.

### Čo bolo skutočne prečítané (VERIFIED)

| Súbor | Poznámka |
| --- | --- |
| `package.json` | plný obsah |
| `package-lock.json` | plný obsah, 442 balíkov, lockfileVersion 3 |
| `tsconfig.json` | plný obsah |
| `next.config.ts` | plný obsah |
| `postcss.config.mjs` | plný obsah |
| `eslint.config.mjs` | plný obsah |
| `.gitignore` | plný obsah |
| `.env.example` | prečítané, hodnoty NEvypísané |
| `.env` | prečítané, hodnoty NEvypísané |
| `.env.local` | prečítané, hodnoty NEvypísané |
| `README.md` | plný obsah |
| `CLAUDE.md` (pôvodný) | plný obsah |
| `TODO.md` | plný obsah |
| `GLADIATOR GYM.md` (zadanie, 14 sekcií) | plný obsah |

### Čo NEBOLO overené (UNVERIFIED — nemal som k tomu prístup)

- celý strom `src/` — routes, `page.tsx`, `layout.tsx`, komponenty
- `src/middleware.ts` vrátane `matcher` konfigurácie (kritické, viď riziká)
- `prisma/schema.prisma` — reálne modely, stĺpce, indexy
- `prisma/migrations/` — či existujú a v akom stave
- `public/` — či existuje `manifest.json`, ikony, service worker
- `src/app/globals.css` — Tailwind `@theme` tokeny
- Git stav — branch, remote, čistota working tree, história commitov
- Vercel konfigurácia — projekt, env premenné, Git prepojenie, production branch
- reálne bežiaci build / lint

**Dôsledok:** ÚLOHA 1 (read-only analýza) je z tejto pozície splniteľná len
čiastočne. Zvyšok musí vykonať Claude Code priamo v repozitári — viď
`docs/CLAUDE_CODE_TASK_001.md`.

---

## 1. Overený technologický stack

Verzie sú čítané z `package-lock.json` (skutočne nainštalované), nie z rozsahov
v `package.json`.

### Runtime a framework

| Balík | Rozsah v package.json | Nainštalovaná verzia (lock) |
| --- | --- | --- |
| `next` | `^15.3.0` | **15.5.20** |
| `react` | `^19.0.0` | **19.2.7** |
| `react-dom` | `^19.0.0` | **19.2.7** |
| `typescript` | `^5.7.0` | **5.9.3** |
| `@types/node` | `^24.13.2` | 24.13.3 |

- **Framework:** Next.js 15 App Router. Potvrdzuje to aj `next-env.d.ts`, ktorý
  obsahuje `/// <reference path="./.next/types/routes.d.ts" />` — typed routes
  z Next 15.
- **Jazyk:** TypeScript, `strict: true`, `noEmit: true`,
  `moduleResolution: "bundler"`, alias `@/*` → `./src/*`. Aplikačný kód žije v `src/`.
- **Nie je to Vite. Nie je to Pages Router.**

### Styling

| Balík | Verzia |
| --- | --- |
| `tailwindcss` | **4.3.3** |
| `@tailwindcss/postcss` | 4.3.3 |
| `postcss` | 8.5.19 |

- Tailwind v4 **CSS-first**. `postcss.config.mjs` obsahuje iba
  `plugins: ['@tailwindcss/postcss']`.
- Podľa `CLAUDE.md`: **žiadny `tailwind.config.js`**, tokeny sú
  v `src/app/globals.css` cez `@theme`.

### Dáta

| Balík | Verzia |
| --- | --- |
| `prisma` | **6.19.3** |
| `@prisma/client` | **6.19.3** |

- ORM je **Prisma**, nie `supabase-js`. V `package-lock.json` sa nenachádza
  **žiadny** balík obsahujúci reťazec `supabase`.
- `postinstall: "prisma generate"` — Prisma klient sa generuje pri každom install
  (dôležité pre Vercel build).
- Databáza: PostgreSQL hostovaný na Supabase. `DATABASE_URL` = transaction pooler
  (port 6543), `DIRECT_URL` = direct connection (port 5432) pre migrácie.

### Platby

| Balík | Verzia |
| --- | --- |
| `stripe` | **18.5.0** |

Stripe Checkout je **existujúca, funkčná a centrálna funkcia Fázy 1**.

### UI / animácie

| Balík | Verzia |
| --- | --- |
| `framer-motion` | **12.42.2** |
| `lucide-react` | **1.25.0** |

`MotionConfig reducedMotion="user"` v `src/components/Providers.tsx` je podľa
`CLAUDE.md` povinný wrapper.

### Lint

`eslint@9.39.5`, `eslint-config-next@15.5.20`, `@eslint/eslintrc@^3`.
Flat config, extends `next/core-web-vitals` + `next/typescript`.

### Package manager

- **npm.** `package-lock.json`, `lockfileVersion: 3` (npm 7+). Žiadny
  `pnpm-lock.yaml` ani `yarn.lock` medzi synchronizovanými súbormi.
- ASSUMPTION: v repozitári nie sú iné lockfiles. Musí overiť Claude Code.

### Čo v závislostiach NIE JE (dôležité)

Žiadny `@supabase/supabase-js`, `@supabase/ssr`, `next-auth`, `zod`, `next-pwa`,
`@serwist/next`, `workbox-*`, `bcrypt`, `jose`. To znamená:

- **autentifikácia používateľov dnes neexistuje**,
- **PWA podpora dnes neexistuje ani na úrovni závislostí**,
- **runtime validácia vstupov nemá knižnicu**.

---

## 2. Overený funkčný stav projektu (z README.md, CLAUDE.md, TODO.md)

Toto sú tvrdenia z projektovej dokumentácie, nie z kódu. Označené ako
DOCUMENTED — pravdepodobne pravdivé, ale kód som nevidel.

### Existujúci verejný web

- Slovenský obsah, značka „Gladiator Gym Lučenec — Body Building Factory",
  est. 2023, claim „Osloboď to najlepšie zo samého seba".
- Dizajn: čierna `#0A0A0A` / antracit `#1A1A1A` / zlatá `#D4AF37` / biela
  typografia, hexagónový LED motív (`.hex-pattern`).
- Fonty Oswald + Inter cez `next/font`.
- Žiadne stock fotky — komponent `PlaceholderImage` s poznámkou
  „NAHRADIŤ REÁLNOU FOTKOU LC".
- Obsah je centralizovaný v `src/lib/gym.ts` a `src/lib/pricing.ts` ako jediný
  zdroj pravdy. Žiadne hardcoded texty v JSX.
- Flagy neoverených dát: `CENNIK_OVERENY`, `TRENERI_OVERENI`, `KONTAKT.overene`,
  `OTVARACIE_HODINY.overene`.

### Odvodené existujúce routes

Z `TODO.md` a `CLAUDE.md` sa dajú odvodiť tieto cesty (DOCUMENTED, nie overené
čítaním priečinka):

| Route | Zdroj zmienky |
| --- | --- |
| `/` (hero) | `src/components/sections/Hero.tsx` |
| `/o-gyme` | `src/app/o-gyme/page.tsx` |
| `/vybavenie` | `src/app/vybavenie/page.tsx` |
| `/cennik` | `src/app/cennik/page.tsx` |
| `/kontakt` | `src/app/kontakt/page.tsx` |
| `/podmienky` | `src/app/podmienky/page.tsx` |
| `/admin/objednavky` | Basic Auth cez `src/middleware.ts` |
| `/api/checkout` | vytvorenie Objednavka PENDING + Stripe session |
| `/api/stripe/webhook` | `checkout.session.completed`, `.expired` |
| success stránka (presný názov neznámy) | fallback po platbe |

Ďalšie routes (galéria, služby, tréneri, eventy) sú zmienené obsahovo, ale
konkrétne súbory v dokumentácii nefigurujú.

### Existujúca „autentifikácia"

- **HTTP Basic Auth** v `src/middleware.ts`, premenné `ADMIN_USER` /
  `ADMIN_PASSWORD`, chráni `/admin/objednavky`.
- Žiadne používateľské účty, žiadne session, žiadne role v DB.
- Supabase Auth je podľa `CLAUDE.md` explicitne **nepoužívaný**
  („auth sa zatiaľ NEpoužíva").

### Existujúci dátový model

Z `TODO.md`, sekcia 3a — **10 tabuliek v jednej migrácii `init`**:

`Pobocka`, `Trener`, `Sluzba`, `Cennik`, `Clen`, `Objednavka`, `Dopyt`
a pripravené-ale-nepoužívané `Permanentka`, `QRToken`, `VstupHistoria`.
`Objednavka` má prázdne stĺpce `redemptionMethod` a `redeemedAt`.

Číslo objednávky má formát `GLD-YYYYMMDD-XXXX`.

**Pozor:** `Clen` už existuje ako tabuľka. To je priamy prekryv s plánovanou
tabuľkou `profiles` z nového zadania. Riziko duplicitného modelu člena.

### Stav PWA

- Žiadny dôkaz o `manifest.json`, ikonách ani service workeri.
- ASSUMPTION: PWA neexistuje v žiadnej podobe. Musí potvrdiť Claude Code.

### Stav Git a deploy

Z `TODO.md`, sekcia 3b (DOCUMENTED):

- Remote: `maxperformmethod-oss/Gladiator`, autor Maxim Malovec.
- Vercel projekt `gladiator` vznikol **priamym uploadom súborov**, takže
  `git push` **NEspúšťa deploy**. Prepojenie GitHub ↔ Vercel je stále otvorená
  ručná úloha.
- Žiadny `vercel.json` — Next.js sa autodetekuje.
- Production URL: `https://gladiator-ruby.vercel.app`.

**Toto je jeden z najdôležitejších otvorených bodov.** Bez funkčného
Git → Vercel pipeline neexistuje auditovateľná história nasadení a nedá sa
oddeliť staging od produkcie.

### Stav environment premenných

Kľúče (bez hodnôt):

| Súbor | Kľúče |
| --- | --- |
| `.env` | `DATABASE_URL`, `DIRECT_URL` |
| `.env.local` | `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_SITE_URL`, `ADMIN_USER`, `ADMIN_PASSWORD` |
| `.env.example` | všetkých 8 vyššie |

`.gitignore` obsahuje `.env*` s výnimkou `!.env.example` — správne nastavené.

**Bezpečnostné zistenie (viď `docs/SECURITY.md`, S-1):** súbory `.env` a
`.env.local` boli nahraté do projektových znalostí Claude. Porovnaním sa zistilo,
že 5 zo 6 hodnôt v `.env.local` je **bajtovo zhodných s `.env.example`**, teda
placeholdery. `ADMIN_PASSWORD` a obe DB URL v `.env` sa od príkladu líšia.
Ich obsah som nečítal ani nezobrazoval. Vyžaduje sa manuálne overenie.

---

## 3. Cieľ projektu

Postupne rozšíriť existujúci verejný web Gladiator Gym o:

1. **členskú PWA** pre prihlásených členov (member),
2. **administračné rozhranie** pre správu členov, cvikov, výziev a výsledkov,
3. **bezpečnú backend vrstvu** s autentifikáciou a serverovou autorizáciou,

pri zachovaní **nedotknutého existujúceho verejného frontendu**.

Architektonický cieľ: jasné rozdelenie na tri vrstvy — Presentation,
Application/Backend, Data/Infrastructure.

---

## 4. Rozsah PWA v1

### Verejný návštevník (nie je DB rola)

- vidí verejný web,
- vidí odkaz na registráciu a prihlásenie.

### Member

- vytvorí profil,
- má verejný **unikátny nickname**,
- upraví svoj povolený profil,
- pridá osobný rekord,
- zobrazí históriu vlastných rekordov,
- vidí leaderboard,
- zapojí sa do jednej mesačnej výzvy,
- odošle výsledok na schválenie.

### Admin

- vidí členov,
- zablokuje alebo deaktivuje účet,
- spravuje cviky a disciplíny,
- vytvára a upravuje výzvy,
- schvaľuje alebo zamieta výsledky,
- spravuje leaderboard,
- vidí základné administračné záznamy (`admin_logs`).

Admin rola **sa nesmie dať zvoliť pri registrácii**.

### Autentifikácia v1

Iba: e-mail, heslo, potvrdenie e-mailu, obnovenie hesla, verejný nickname.
Roly iba `member` a `admin`. E-mail zostáva v Supabase Auth a **nekopíruje sa**
do verejnej tabuľky `profiles`.

### Databáza v1 — 6 entít

`profiles`, `exercises`, `personal_records`, `challenges`, `challenge_entries`,
`admin_logs`.

### PWA v1

Web app manifest, názov, ikony, theme color, inštalovateľnosť na plochu,
základná mobilná optimalizácia, service worker iba v rozsahu, ktorý neohrozí
aktualizácie ani autentifikáciu.

### Infraštruktúra v1

Supabase Auth + PostgreSQL, Vercel hosting, GitHub verzionovanie.

---

## 5. Čo je mimo rozsahu v1

Bez výslovného schválenia majiteľa sa **nepridáva**:

trénerská rola · **nové** platobné funkcie · QR vstupy · rezervácie · chat ·
súkromné správy · komentáre · komunitný feed · fotografie · videá · nahrávanie
súborov · zdravotné údaje · telefónne čísla · adresy · dátumy narodenia ·
push notifikácie · sociálne prihlasovanie · natívne mobilné aplikácie ·
App Store / Google Play · AI funkcie · zložité externé integrácie ·
komplikovaný offline režim · offline zápis dát.

---

## 6. Kritické upresnenie rozsahu: Stripe

Zadanie zakazuje „platby" a „Stripe". Existujúci projekt má Stripe Checkout ako
**centrálnu, už nasadenú funkciu Fázy 1** (`stripe@18.5.0`, `/api/checkout`,
`/api/stripe/webhook`, model `Objednavka`, `/admin/objednavky`).

Tieto dve vety si odporujú, ak sa zákaz číta ako „odstráň Stripe".

**Interpretácia použitá vo všetkých dokumentoch:**

> Zákaz sa vzťahuje na **pridávanie nových** platobných funkcií do PWA v1
> (predplatné členstva, platba za výzvu, uloženie karty, Stripe Customer portál,
> subscriptions). Existujúci predaj vstupov a permanentiek zostáva
> **nedotknutý a plne funkčný**.

**Tento bod je označený ako PENDING** v `docs/DECISIONS.md` (D-01) a vyžaduje
explicitné potvrdenie majiteľa. Kým nie je potvrdený, nikto sa Stripe kódu
nedotýka — ani ho nepridáva, ani neodstraňuje.

---

## 7. Rozpor v projektových znalostiach — `memory.md`

Súbor `memory.md` v projektových znalostiach popisuje **iný projekt**:
MaxPerform Studio portfolio (GSAP, ScrollTrigger, SplitText, Lenis, canvas WebP
frame sequences, Formspree, `/pravne-informacie`). Obsahuje aj tvrdenie
„Three.js a Framer Motion sú explicitne vylúčené" — čo je v priamom rozpore
s Gladiator Gym, kde je `framer-motion@12.42.2` produkčná závislosť.

**Odporúčanie:** `memory.md` nepoužívať ako zdroj pravdy pre Gladiator Gym.
Jediné dva prenositeľné body: preferencia doručovania výstupov ako súborov,
a localhost port 3000.

---

## 8. Zhrnutie — čo existuje vs. čo chýba

| Oblasť | Stav |
| --- | --- |
| Next.js 15 App Router + TS strict | ✅ existuje |
| Tailwind v4 CSS-first + dizajnové tokeny | ✅ existuje |
| Verejný web (SK obsah, ~8+ stránok) | ✅ existuje |
| Obsah centralizovaný v `src/lib/` | ✅ existuje |
| Prisma + Supabase Postgres, 10 tabuliek | ✅ existuje (DOCUMENTED) |
| Stripe Checkout TEST mode | ✅ existuje |
| Admin objednávok (Basic Auth) | ✅ existuje |
| ESLint flat config | ✅ existuje |
| **Používateľské účty / Supabase Auth** | ❌ chýba |
| **Role member/admin v DB** | ❌ chýba |
| **RLS policies** | ❌ chýba |
| **Serverová autorizačná vrstva** | ❌ chýba |
| **Validačná knižnica (zod a pod.)** | ❌ chýba |
| **PWA manifest / ikony / SW** | ❌ chýba (ASSUMPTION) |
| **profiles / exercises / records / challenges** | ❌ chýba |
| **Git → Vercel automatický deploy** | ❌ nefunguje (DOCUMENTED) |
| **Staging prostredie** | ❌ chýba |
| **Automatizované testy** | ❌ chýba |

---

## 9. Ďalší krok

Vykonať `docs/CLAUDE_CODE_TASK_001.md` — read-only inventúra repozitára
Claude Code-om. Bez nej zostáva veľká časť tohto dokumentu na úrovni ASSUMPTION.
