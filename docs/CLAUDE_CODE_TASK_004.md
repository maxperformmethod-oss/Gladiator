# CLAUDE_CODE_TASK_004 — CI, kontrola závislostí a ochrana vetvy

Verzia 1.0 · 2026-07-30 · Typ: infraštruktúra, **nie aplikačný kód**

---

## Prečo táto úloha

Projekt sa ide predávať. Dnes neexistuje nič, čo by zachytilo pokazený build
skôr, než sa dostane na produkciu — okrem toho, že si to niekto spomenie spustiť
ručne. Táto úloha to nahradí automatikou.

Nulové náklady, nulové nové závislosti, dva konfiguračné súbory.

---

## ZAKÁZANÉ

- **`npm install` — ZAKÁZANÝ.** Žiadny nový balík.
- Žiadny existujúci súbor sa nemení, nepresúva ani nemaže.
- `src/`, `prisma/`, `public/` — nedotýkať sa vôbec.
- Nemeniť Vercel nastavenia.
- Necommitovať bez schválenia.

---

## Vstupné podmienky

- [ ] posledný commit na `feat/pwa-shell` je `ad004ff feat(pwa): add auth, member and admin route skeletons`
- [ ] `main` je stále na `64f2bac` a je nedotknutý
- [ ] `git status --short` ukazuje iba známy untracked `.pptx`
- [ ] `git diff --stat` prázdny

**TASK_003 (PWA) ešte nie je hotový — to je v poriadku.** Táto úloha je od neho
úplne nezávislá a beží súbežne.

Vetvi z `main`, **nie** z `feat/pwa-shell`:

```
git checkout main
git checkout -b chore/ci
```

Dôvod: CI nemá nič spoločné s PWA. Samostatná vetva = samostatný pull request,
ktorý sa dá zmergovať skôr alebo neskôr než PWA, podľa toho, čo prejde.

Pozor: `chore/ci` vyjde z `64f2bac`, takže **neobsahuje** stránky `/klub`
a `/sprava` z TASK_002. To je zámer — CI overuje samo seba na stave `main`.

---

## Súbory na vytvorenie (2)

### 1. `.github/workflows/ci.yml`

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

**Poznámky, ktoré musíš pochopiť, nie len skopírovať:**

- **Node 22, nie 26.** Lokálne máš Node 26, ale Vercel beží na 22. CI má
  zodpovedať produkcii, nie tvojmu notebooku. Ak by to na 22 padlo, chcem to
  vedieť teraz.
- **Dummy env premenné nie sú tajomstvá.** Sú to zjavne falošné hodnoty, aby
  build nespadol na chýbajúcej premennej. Žiadna reálna hodnota sem nepatrí.
  Nikdy sem nedávaj `secrets.*`.
- **Build nesmie potrebovať bežiacu databázu.** `DATABASE_URL` ukazuje na
  neexistujúci localhost zámerne. Ak build spadne na pripojení k DB, je to
  chyba v kóde, nie v CI — **zastav a nahlás mi to.**
- **`npm audit` je zatiaľ `continue-on-error`.** Nechceme, aby jedna
  tranzitívna zraniteľnosť zablokovala všetku prácu. Až budeme vedieť, čo hlási,
  sprísnime to.

### 2. `.github/dependabot.yml`

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

Zoskupenie minor a patch aktualizácií do jedného pull requestu znamená jeden PR
týždenne namiesto pätnástich. Major verzie Next a React sú vynechané zámerne —
tie sa robia ručne a s testovaním.

---

## Kontrola

```
npm run lint
npm run build
git status --short
git diff --stat
```

- [ ] `git diff --stat` prázdny
- [ ] `git status --short` ukazuje presne 2 nové súbory (plus známy `.pptx`)
- [ ] `package.json` a `package-lock.json` nezmenené
- [ ] žiadny súbor mimo `.github/`
- [ ] YAML je syntakticky platný

Ak máš `yamllint` alebo `python -c "import yaml"` k dispozícii, over syntax.
**Neinštaluj ich, ak nie sú.**

### Overenie, že CI naozaj funguje

CI sa dá overiť až po pushnutí. Postup **až po mojom schválení**:

1. push vetvy `chore/ci`
2. otvor pull request do `main`
3. počkaj na dobehnutie oboch jobov
4. nahlás mi výsledok — vrátane toho, či `npm audit` niečo našiel

**Pull request nemerguj.**

---

## Formát reportu

```
## 1. VYTVORENÉ SÚBORY
## 2. VÝSTUP KONTROL
## 3. CHECKLIST
## 4. RIZIKÁ
## 5. NÁVRH COMMITU        napr. chore(ci): add GitHub Actions pipeline and Dependabot
## 6. OTÁZKY               max 3
```

---

## Ukončenie

Po reporte **zastav**. Necommituj, nepushuj, neotváraj pull request.
Čakaj na schválenie.
