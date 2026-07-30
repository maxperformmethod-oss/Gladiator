# CLAUDE_CODE_TASK_005 — PWA shell + CI pipeline

Verzia 1.0 · 2026-07-30
**Nahrádza TASK_003 a TASK_004.** Tie už nespúšťaj.

Dve nezávislé časti, dve vetvy, dva commity, **jeden spoločný report na konci.**

---

## Vstupné podmienky

- [ ] posledný commit na `feat/pwa-shell` je `ad004ff feat(pwa): add auth, member and admin route skeletons`
- [ ] `main` je na `64f2bac`, nedotknutý, nepushnutý
- [ ] `git status --short` ukazuje iba známy untracked `Gladiator_Gym_Community_Cult_Proposal_RESEARCH(2).pptx`
- [ ] `git diff --stat` prázdny
- [ ] máš k dispozícii súbory `rozbal-ikony.mjs` a `gladiator-icons.json`

Ak ktorákoľvek neplatí — **zastav a napíš mi to. Nič neopravuj sám.**

---

## ZAKÁZANÉ v celej úlohe

- **`npm install` — ZAKÁZANÝ.** Žiadny nový balík, ani dev.
- **Žiadny service worker.** Žiadny `sw.js`, `next-pwa`, `serwist`, `workbox`.
- **`src/app/layout.tsx` — NEMENIŤ.**
- `src/middleware.ts`, `prisma/schema.prisma`, `src/app/globals.css`,
  `src/app/icon.svg` — nedotýkať sa.
- **Nepripájať Supabase.** Žiadny klient, kľúč ani env premenná.
- **Nemeniť produkčné nastavenia Vercelu ani Supabase.**
- **Nespúšťať produkčný deploy z `main`.**
- Žiadny existujúci súbor sa nemení, nepresúva ani nemaže.
- Necommitovať a nepushovať bez schválenia.
- **Ikony negeneruj, neupravuj, nekonvertuj, nekomprimuj.**

---
---

# ČASŤ A — PWA shell

Vetva: `feat/pwa-shell` (už existuje, pokračuješ na nej)

```
git checkout feat/pwa-shell
```

## A1. Rozbalenie ikon

Ulož `rozbal-ikony.mjs` a `gladiator-icons.json` **do koreňa repozitára**,
potom spusti:

```
node rozbal-ikony.mjs ./gladiator-icons.json .
```

Skript používa iba vstavané Node moduly. Nič neinštaluje.

Overí a vypíše pri každej ikone: sha256, veľkosť v bajtoch, PNG signatúru
a rozmery čítané priamo z hlavičky súboru. Ak čokoľvek nesedí, skončí s kódom 1.

Očakávaný výstup:

```
OK  public/icons/icon-192.png  192x192  21187 B  sha256=c9aff9fda0b9906f
OK  public/icons/icon-512.png  512x512  95745 B  sha256=7d4814567a56fa2c
OK  public/icons/icon-maskable-512.png  512x512  61949 B  sha256=66435f63dab50c8f
OK  src/app/apple-icon.png  180x180  19055 B  sha256=9ab5140c1143259a

Hotovo. 4 ikony zapisane.
```

**Ak sa výstup líši čo i len v jednom znaku — zastav a nahlás to.**

Vypíš výstup skriptu doslovne do reportu.

### Po rozbalení oba pomocné súbory ZMAŽ

```
rm rozbal-ikony.mjs gladiator-icons.json
```

Nesmú skončiť v commite. Kontrolujem to nižšie.

### Poznámka k ikonám

Bezpečná stredová zóna platí **iba** pre `icon-maskable-512.png` — obsah má
polomer 195 px pri limite 205 px, vyhovuje. Ostatné tri ju zámerne presahujú,
lebo majú `purpose: any` a neorezávajú sa. Absencia alfa kanála je tiež zámer:
maskable musí byť nepriehľadná a Apple priehľadnosť neodporúča.
**Nič z toho neopravuj.**

## A2. `src/app/manifest.ts`

Nový súbor:

```ts
import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/klub',
    name: 'Gladiator Gym',
    short_name: 'Gladiator',
    description: 'Členská aplikácia Gladiator Gym Lučenec',
    start_url: '/klub',
    scope: '/',
    display: 'standalone',
    background_color: '#0a0a0a',
    theme_color: '#0a0a0a',
    lang: 'sk',
    dir: 'ltr',
    categories: ['fitness', 'health', 'sports'],
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  }
}
```

- **`orientation` je zámerne vynechané.** Nepridávaj ho.
- `scope: '/'` a `id: '/klub'` ponechaj presne tak.
- Do `layout.tsx` sa nepíše nič — Next.js vloží `<link rel="manifest">`
  aj `<link rel="apple-touch-icon">` sám z konvenčných súborov.
- Ak TypeScript na niektorom poli protestuje, **to pole vynechaj** a napíš to do
  reportu. Neobchádzaj to cez `as any` ani `@ts-expect-error`.

## A3. Kontrola časti A

```
npm run lint
npm run build
git status --short
git diff --stat
```

- [ ] `npm run lint` bez chýb a warningov
- [ ] `npm run build` bez chýb
- [ ] v build outpute pribudol route `/manifest.webmanifest`
- [ ] `git diff --stat` prázdny
- [ ] `git status --short` ukazuje presne **5 nových súborov** + známy `.pptx`
- [ ] `rozbal-ikony.mjs` ani `gladiator-icons.json` **nie sú** v `git status`
- [ ] `package.json` a `package-lock.json` nezmenené
- [ ] `src/app/layout.tsx` nezmenený
- [ ] žiadny súbor s `sw`, `service-worker` alebo `workbox` v názve

### HTTP odpoveď manifestu

Pri bežiacom `npm run dev`:

```
curl -i http://localhost:3000/manifest.webmanifest
```

- [ ] status **200**
- [ ] `Content-Type` je `application/manifest+json`
- [ ] telo je platný JSON a **neobsahuje** kľúč `orientation`
- [ ] `start_url` = `/klub`, `scope` = `/`, `id` = `/klub`

Vypíš hlavičky aj celé telo.

### Manifest link v HTML

```
curl -s http://localhost:3000/ | grep -i -E "manifest|apple-touch-icon"
```

- [ ] Next.js **sám** vložil `<link rel="manifest">`
- [ ] Next.js **sám** vložil `<link rel="apple-touch-icon">`
- [ ] ani jeden nie je natvrdo v `layout.tsx`

Vypíš nájdené riadky doslovne.

### Ikony sa načítajú

```
curl -o /dev/null -s -w "%{http_code} %{content_type} %{size_download}\n" http://localhost:3000/icons/icon-192.png
curl -o /dev/null -s -w "%{http_code} %{content_type} %{size_download}\n" http://localhost:3000/icons/icon-512.png
curl -o /dev/null -s -w "%{http_code} %{content_type} %{size_download}\n" http://localhost:3000/icons/icon-maskable-512.png
```

- [ ] všetky tri vrátia **200** a `image/png`

### Chrome DevTools → Application

- [ ] **Manifest** — načíta sa, názov „Gladiator Gym", bez chyby
- [ ] **Manifest → Icons** — všetky tri sa načítajú, žiadna 404
- [ ] Chrome nehlási varovanie o chýbajúcej maskable ikone
- [ ] **Service Workers** — zoznam **prázdny** (správne)
- [ ] `/cennik` a `/admin/objednavky` vyzerajú a fungujú ako predtým

Vypíš doslovne každé varovanie, ktoré Chrome zobrazí.

---
---

# ČASŤ B — CI pipeline

**Až po dokončení časti A.** Vetvi z `main`, **nie** z `feat/pwa-shell`:

```
git checkout main
git checkout -b chore/ci
```

`chore/ci` vyjde z `64f2bac`, takže neobsahuje `/klub` ani PWA. To je zámer —
CI je nezávislá zmena a pôjde samostatným pull requestom.

## B1. `.github/workflows/ci.yml`

```yaml
name: CI

on:
  pull_request:
  push:
    branches: [main]

concurrency:
  group: ci-${{ github.ref }}
  cancel-in-progress: true

jobs:
  quality:
    runs-on: ubuntu-latest
    timeout-minutes: 15
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'

      - name: Install
        run: npm ci

      - name: Typecheck
        run: npx tsc --noEmit

      - name: Lint
        run: npm run lint

      - name: Build
        run: npm run build
        env:
          DATABASE_URL: postgresql://ci:ci@localhost:5432/ci
          DIRECT_URL: postgresql://ci:ci@localhost:5432/ci
          STRIPE_SECRET_KEY: sk_test_ci_dummy
          NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: pk_test_ci_dummy
          STRIPE_WEBHOOK_SECRET: whsec_ci_dummy
          NEXT_PUBLIC_SITE_URL: http://localhost:3000
          ADMIN_USER: ci
          ADMIN_PASSWORD: ci-dummy-not-a-real-password

  audit:
    runs-on: ubuntu-latest
    timeout-minutes: 10
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'
      - run: npm ci
      - name: Security audit
        run: npm audit --audit-level=high
        continue-on-error: true
```

**Pochop to, nekopíruj naslepo:**

- **Node 22, nie 26.** Lokálne máš 26, ale Vercel beží na 22. CI má zodpovedať
  produkcii, nie notebooku.
- **Dummy env premenné nie sú tajomstvá.** Sú zjavne falošné, aby build nespadol
  na chýbajúcej premennej. Nikdy sem nedávaj `secrets.*` ani reálnu hodnotu.
- **`DATABASE_URL` ukazuje na neexistujúci localhost zámerne.** Ak build spadne
  na pripojení k databáze, je to chyba v aplikačnom kóde, nie v CI —
  **zastav a nahlás to. Nič neopravuj.**
- **`npm audit` je `continue-on-error`** zámerne. Chceme najprv vedieť, čo hlási.

## B2. `.github/dependabot.yml`

```yaml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
      day: "monday"
    open-pull-requests-limit: 5
    groups:
      minor-and-patch:
        update-types: ["minor", "patch"]
    ignore:
      - dependency-name: "next"
        update-types: ["version-update:semver-major"]
      - dependency-name: "react"
        update-types: ["version-update:semver-major"]
      - dependency-name: "react-dom"
        update-types: ["version-update:semver-major"]

  - package-ecosystem: "github-actions"
    directory: "/"
    schedule:
      interval: "monthly"
```

## B3. Kontrola časti B

```
npm run lint
npm run build
git status --short
git diff --stat
```

- [ ] `git diff --stat` prázdny
- [ ] `git status --short` ukazuje presne **2 nové súbory** + známy `.pptx`
- [ ] žiadny súbor mimo `.github/`
- [ ] `package.json` a `package-lock.json` nezmenené
- [ ] YAML je syntakticky platný

Ak máš `yamllint` alebo `python -c "import yaml"`, over syntax.
**Neinštaluj ich, ak nie sú.**

---
---

## Spoločný report

Jeden report na konci, obe časti spolu:

```
## 0. VSTUPNÉ PODMIENKY        4 body + stav vetiev

## ČASŤ A — PWA
## A1. VÝSTUP SKRIPTU IKON     doslovne
## A2. VYTVORENÉ SÚBORY        5
## A3. LINT + BUILD            vrátane tabuľky routes
## A4. HTTP MANIFEST           hlavičky + celé telo
## A5. HTML LINKY              nájdené riadky doslovne
## A6. IKONY CEZ HTTP          3 riadky
## A7. CHROME DEVTOOLS         výsledok + doslovné varovania
## A8. CHECKLIST               všetky body ✅ / ❌
## A9. VYNECHANÉ POLIA         ak si niektoré pole manifestu vynechal, a prečo

## ČASŤ B — CI
## B1. VYTVORENÉ SÚBORY        2
## B2. LINT + BUILD
## B3. CHECKLIST

## SPOLOČNÉ
## R1. RIZIKÁ
## R2. NÁVRHY COMMITOV         dva, samostatne pre A a pre B
## R3. OTÁZKY                  max 3
```

Navrhované správy commitov (potvrď alebo navrhni lepšie):

```
A:  feat(pwa): add web app manifest and app icons
B:  chore(ci): add GitHub Actions pipeline and Dependabot
```

---

## Ukončenie

Po reporte **zastav**. Necommituj, nepushuj, neotváraj pull request, nemerguj.
Nezačínaj Etapu E.

Ak by ťa čokoľvek nútilo zmeniť existujúci súbor, doinštalovať balík alebo
upraviť ikonu — **zastav a opýtaj sa.**
