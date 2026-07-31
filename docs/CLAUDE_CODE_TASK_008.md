# CLAUDE_CODE_TASK_008 — bezpečnostné aktualizácie závislostí

Verzia 1.0 · 2026-07-30 · Etapa A2 · **pred Etapou E**

---

## Cieľ

Odstrániť 12 high zraniteľností posúdením Dependabot pull requestov.
Major verzie zavrieť, nie zmergovať.

**`npm audit fix` ani `npm audit fix --force` sa v tejto úlohe nespúšťa.**
Všetky zmeny prídu cez Dependabot PR, ktoré prešli CI.

---

## Vstupné podmienky

- [ ] PR #10 (`docs/projekt`) je zelený
- [ ] pracovný strom čistý
- [ ] `feat/pwa-shell` na `ec5bdd0`, nepushnutá

Každý merge do `main` spustí produkčný deploy na Verceli. To je v poriadku —
`main` neobsahuje PWA ani nové stránky, mení sa len `package-lock.json`.

---

## Rozdelenie PR

| PR | Zmena | Typ | Rozhodnutie |
| --- | --- | --- | --- |
| #10 | docs | naše | **merge — prvé** |
| #2 | `next` 15.5.20 → 15.5.21 | patch, **bezpečnostná** | **merge — druhé** |
| #5 | minor-and-patch group (5 balíkov) | minor/patch | **merge po overení obsahu** |
| #4 | `actions/checkout` 4 → 7 | major, iba CI | **merge** |
| #3 | `actions/setup-node` 4 → 7 | major, iba CI | **merge** |
| #6 | `typescript` 5.9.3 → 7.0.2 | **major** | **zavrieť** |
| #7 | `@prisma/client` 6 → 7 | **major** | **zavrieť** |
| #8 | `prisma` 6 → 7 | **major** | **zavrieť** |
| #9 | `stripe` 18 → 22 | **major** | **zavrieť** |

### Prečo sa major verzie zatvárajú

- **Prisma 6 → 7** — práve ideme meniť `schema.prisma`. Meniť ORM uprostred
  návrhu schémy je zbytočné riziko. Vrátime sa k tomu po prvej migrácii.
- **TypeScript 5 → 7** — nový kompilátor. Nemá to nič spoločné s bezpečnosťou.
- **Stripe 18 → 22** — platieb sa v tejto fáze vôbec nedotýkame.
- Žiadny z nich nerieši ani jednu z 12 zraniteľností.

---

## Postup — zastav po každom KROKU

### KROK 1 — merge dokumentácie

```
gh pr merge 10 --squash --delete-branch
git checkout main && git pull
```

Nahlás `git log --oneline -3`. **ZASTAV.**

---

### KROK 2 — bezpečnostná oprava Next.js

Toto je najdôležitejší merge v celej úlohe.

```
gh pr view 2
gh pr checks 2
```

Over, že check `quality` je zelený. Ak nie je — **zastav a nahlás.**

```
gh pr merge 2 --squash --delete-branch
git checkout main && git pull
npm ci
```

Potom over dopad:

```
npm audit --audit-level=high
npm ls next
```

Nahlás:

- koľko high zraniteľností zostalo (bolo 12),
- ktoré balíky ešte hlási,
- akú verziu `next` má teraz `package-lock.json`.

**ZASTAV.**

---

### KROK 3 — skupinová aktualizácia

```
gh pr view 5
```

**Vypíš, ktorých päť balíkov PR obsahuje a z akej na akú verziu.**
Toto potrebujem vidieť pred merge — v skupine môže byť čokoľvek.

Ak je medzi nimi major bump ktoréhokoľvek balíka — **zastav a nahlás.**
Skupina má obsahovať iba minor a patch.

Ak sú všetky minor/patch a `quality` je zelený:

```
gh pr merge 5 --squash --delete-branch
git checkout main && git pull
npm ci
npm audit --audit-level=high
```

Nahlás nový počet zraniteľností. **ZASTAV.**

---

### KROK 4 — aktualizácia GitHub Actions

Tieto menia iba CI, nie aplikáciu. Riešia varovanie
„Node.js 20 is deprecated".

```
gh pr merge 4 --squash --delete-branch
gh pr merge 3 --squash --delete-branch
git checkout main && git pull
```

Nahlás, či CI na `main` po týchto zmenách stále beží zelene:

```
gh run list --branch main --limit 3
```

**ZASTAV.**

---

### KROK 5 — zatvorenie major PR

Zavri štyri PR s vysvetlením. **Nemerguj ich.**

```
gh pr close 6 --comment "Odložené. TypeScript 7 je major zmena kompilátora bez súvisu s bezpečnosťou. Vrátime sa k tomu po dokončení PWA v1."
gh pr close 7 --comment "Odložené. Prisma 7 je major zmena a práve prebieha návrh databázovej schémy. Vrátime sa k tomu po prvej migrácii."
gh pr close 8 --comment "Odložené. Prisma 7 je major zmena a práve prebieha návrh databázovej schémy. Vrátime sa k tomu po prvej migrácii."
gh pr close 9 --comment "Odložené. Platby nie sú v rozsahu tejto fázy, Stripe sa nedotýkame."
```

**ZASTAV.**

---

### KROK 6 — Dependabot prestane navrhovať major verzie

Nová vetva z `main`:

```
git checkout main && git pull
git checkout -b chore/dependabot-majors
```

V `.github/dependabot.yml` **nahraď** celý blok `ignore:` v sekcii `npm`
týmto:

```yaml
    ignore:
      - dependency-name: "*"
        update-types: ["version-update:semver-major"]
```

Ostatné časti súboru nechaj bezo zmeny.

Dôvod: major verzie sa budú riešiť vedome a jednotlivo, nie ako automatický
návrh. Minor a patch aktualizácie vrátane bezpečnostných chodia ďalej.

**Poznámka:** bezpečnostné aktualizácie Dependabotu týmto **nezaniknú** — ak
sa objaví zraniteľnosť riešiteľná len major verziou, Dependabot ju aj tak
navrhne.

Potom:

```
npm run lint
npm run build
git add .github/dependabot.yml
git commit -m "chore(deps): ignore major version bumps by default"
git push -u origin chore/dependabot-majors
gh pr create --base main --head chore/dependabot-majors ^
  --title "chore(deps): ignore major version bumps by default" ^
  --body "Major verzie sa budú riešiť vedome a jednotlivo. Bezpečnostné aktualizácie Dependabotu zostávajú aktívne."
gh pr checks --watch
```

**PR NEMERGUJ. ZASTAV a nahlás.**

---

### KROK 7 — preloženie PWA vetvy

Až po mojom schválení KROKU 6.

```
git checkout feat/pwa-shell
git rebase main
npm ci
npm run lint
npm run build
```

Build musí naďalej vypísať **40/40** stránok.
Pri konflikte — **zastav a nahlás. Nič neriešiaj sám.**

Nepushuj, neotváraj PR. **ZASTAV.**

---

## Zakázané v celej úlohe

- `npm audit fix` a `npm audit fix --force` — za žiadnych okolností
- ručná úprava `package.json` alebo `package-lock.json`
- merge ktoréhokoľvek PR, ktorý nemá zelený check `quality`
- zmena `prisma/schema.prisma`, `src/`, `public/`
- preskočenie ktoréhokoľvek **ZASTAV**

---

## Po dokončení

Ak `npm audit --audit-level=high` hlási **nula** zraniteľností, pripravím
samostatnú úlohu na odstránenie `continue-on-error` z CI a doplnenie `audit`
medzi povinné checky.

Ak niečo zostane, nahlás čo — a rozhodneme, či sa to dá odstrániť bez
prelomovej zmeny.
