# CLAUDE_CODE_TASK_007 — dokumentácia do repozitára

Verzia 1.0 · 2026-07-30 · Malý, samostatný krok

---

## Cieľ

Presunúť projektovú dokumentáciu z chatu do repozitára, aby žila vedľa kódu
a dala sa otvoriť vo VS Code.

**Iba Markdown súbory. Žiadny aplikačný kód, žiadny balík, žiadna migrácia.**

---

## Vstupné podmienky

- [ ] `main` je na `58c1687`
- [ ] `feat/pwa-shell` je na `ec5bdd0`
- [ ] `git status --short` ukazuje iba známy `.pptx`

Vetvi z `main`:

```
git checkout main
git pull
git checkout -b docs/projekt
```

---

## ZAKÁZANÉ

- akákoľvek zmena mimo priečinka `docs/`
- `npm install`, `npx prisma`, pripojenie k databáze
- zmena `prisma/schema.prisma`, `src/`, `public/`, `.github/`
- push a commit bez schválenia

---

## Postup

### 1. Skopíruj priečinok `docs/`

Zdroj je mimo repozitára, v priečinku Coworku. Nájdi ho:

```powershell
Get-ChildItem -Path "$env:APPDATA\Claude","$env:LOCALAPPDATA\Packages" -Recurse -Filter "PROJECT_CONTEXT.md" -ErrorAction SilentlyContinue |
  Select-Object -First 1 -ExpandProperty DirectoryName
```

Ten priečinok skopíruj do koreňa repozitára ako `docs/`:

```powershell
Copy-Item "<nájdená cesta>" -Destination ".\docs" -Recurse -Force
```

### 2. Over obsah

V `docs/` musí byť **16 súborov**, všetky s príponou `.md`:

```
README.md
CURRENT_STATUS.md
ROADMAP.md
DECISIONS.md
ARCHITECTURE_PROPOSAL.md
DATABASE.md
SECURITY.md
PROJECT_CONTEXT.md
INFRASTRUKTURA.md
CLAUDE_CODE_TASK_001.md
CLAUDE_CODE_TASK_002.md
CLAUDE_CODE_TASK_003.md   ← nahradené 005, ponechané pre históriu
CLAUDE_CODE_TASK_004.md   ← nahradené 005, ponechané pre históriu
CLAUDE_CODE_TASK_005.md
CLAUDE_CODE_TASK_006.md
CLAUDE_CODE_TASK_007.md
```

Vypíš `ls docs/` a počet súborov.

Ak by tam bolo čokoľvek iné než `.md` — **zastav a nahlás to.**
Žiadne `.json`, žiadne `.mjs`, žiadne obrázky.

### 3. Over, že v dokumentoch nie sú tajomstvá

```powershell
Select-String -Path "docs\*.md" -Pattern "sk_live_|sk_test_|pk_live_|whsec_|postgres://|postgresql://|eyJ[A-Za-z0-9]" 
```

Očakávaný výsledok: **žiadny nález**, alebo len zjavné zástupné texty
(napr. `sk_test_ci_dummy` v ukážke CI workflow, `postgresql://ci:ci@localhost`).

Vypíš, čo našiel. **Ak nájdeš čokoľvek, čo vyzerá ako skutočný kľúč alebo
connection string — zastav a nahlás to. Necommituj.**

### 4. Kontrola

```
npm run lint
npm run build
git status --short
git diff --stat
```

- [ ] `npm run lint` bez chýb
- [ ] `npm run build` bez chýb, stále 24/24 stránok (si na `main`, bez PWA)
- [ ] `git diff --stat` prázdny
- [ ] `git status --short` ukazuje iba nové súbory v `docs/` + známy `.pptx`
- [ ] žiadny zmenený súbor mimo `docs/`
- [ ] `package.json`, `package-lock.json`, `prisma/schema.prisma` nezmenené

---

## Report

```
## 1. NÁJDENÁ ZDROJOVÁ CESTA
## 2. OBSAH docs/          ls + počet
## 3. KONTROLA TAJOMSTIEV  výstup Select-String
## 4. VÝSTUP KONTROL       lint · build · git status · git diff --stat
## 5. CHECKLIST
## 6. NÁVRH COMMITU        napr. docs: add project documentation
## 7. OTÁZKY               max 2
```

---

## Ukončenie

Po reporte **zastav**. Necommituj, nepushuj, neotváraj PR.

Poznámka: `feat/pwa-shell` sa v tejto úlohe **vôbec nedotýkaš**. Zostáva
nepushnutá na `ec5bdd0`.
