# CLAUDE_CODE_TASK_015 — Etapa H1: dátový model tréningov + správa cvikov

Verzia 1.0 · 3. 8. 2026 · Cieľ: **databáza vie uložiť tréning, sériu a plán**

---

## Rozsah čítania

Prečítaj iba: `CLAUDE.md`, `docs/CURRENT_STATUS.md`, `docs/ETAPA_H_KONCEPT.md`,
`prisma/schema.prisma` a toto zadanie. **Nerob audit repozitára.**

---

## Čo H1 je a čo nie je

H1 je **len dáta a admin rozhranie**. Žiadne členské obrazovky, žiadne grafy,
žiadny zápis tréningu z pohľadu člena — to je H2 a H3.

Po H1 musí platiť: admin vie v `/sprava` založiť cvik a tréningový plán,
a databáza má kam zapisovať tréningy a série.

```
git checkout main && git pull        → základ potvrdí Maxim
git checkout -b feat/training-model
```

---

## ZAKÁZANÉ

- **žiadna zmena existujúcich stĺpcov ani mazanie čohokoľvek zo schémy** —
  iba pridávanie. Jediná výnimka: `Vyzva.cvikId` sa mení na nepovinné.
- žiadny `npm install`
- `src/middleware.ts`, `src/app/globals.css`, `src/lib/gym.ts`,
  `src/lib/pricing.ts` — nedotýkať sa
- verejné stránky a `/klub` — nedotýkať sa, H1 sa ich netýka
- žiadne `as any`, `@ts-expect-error`, `eslint-disable`

---

# ČASŤ A — schéma

## A1. Nové enumy

```prisma
enum Partia {
  NOHY
  HRUD
  CHRBAT
  RAMENA
  BICEPS
  TRICEPS
  CORE
  NEZARADENE
}

enum VyzvaTyp {
  SILOVA
  CASOVA
}
```

## A2. Úpravy existujúcich modelov

| Model | Zmena |
| --- | --- |
| `Cvik` | pridaj `partia Partia @default(NEZARADENE)` |
| `Vyzva` | pridaj `typ VyzvaTyp @default(SILOVA)`; **`cvikId` zmeň na nepovinné** (`String?`) a reláciu na `Cvik?` |

`Vyzva.cvikId` musí byť nepovinné, lebo časová výzva („minúty v posilke")
sa neviaže na žiadny cvik.

## A3. Tri nové modely

Drž sa štýlu existujúcej schémy — `cuid()`, `createdAt`/`updatedAt`,
indexy, `onDelete` explicitne.

```
TreningPlan
  clenId → Clen (Cascade)      vlastník plánu
  nazov, poradie
  cviky PlanCvik[]
  treningy Trening[]

PlanCvik                        cvik v pláne + cieľ
  planId → TreningPlan (Cascade)
  cvikId → Cvik (Restrict)
  cielSerie Int, cielOpakovania Int, poradie

Trening                         jedno odcvičenie
  clenId → Clen (Cascade)
  planId → TreningPlan (SetNull, nepovinné)
  nazov
  zaciatok DateTime
  koniec   DateTime?            null = tréning ešte beží
  poznamka String?
  serie Seria[]

Seria                           jedna séria v tréningu
  treningId → Trening (Cascade)
  cvikId → Cvik (Restrict)
  hmotnost Decimal @db.Decimal(6,2)
  opakovania Int
  poradie Int
```

**Dĺžka tréningu sa neukladá** — počíta sa z `zaciatok` a `koniec`.
Neduplikuj údaj, ktorý sa dá odvodiť.

**Indexy, ktoré budú treba v H2/H3:**
`Trening(clenId, zaciatok)` · `Seria(treningId, poradie)` ·
`Seria(cvikId, hmotnost)` — posledný kvôli rekordom.

## A4. Migrácia

```
npx prisma format
npx prisma validate
npx prisma generate
npx prisma migrate dev --name training_model
```

**Pred migráciou vypíš vygenerovaný SQL a ZASTAV**, ak obsahuje čokoľvek
iné než `CREATE TABLE`, `CREATE INDEX`, `CREATE TYPE`, `ALTER TABLE ... ADD`
alebo `ALTER TABLE ... ALTER COLUMN ... DROP NOT NULL`.

Akékoľvek `DROP TABLE`, `DROP COLUMN` alebo `DELETE` = **zastav a opýtaj sa.**

---

# ČASŤ B — desať cvikov

Seed alebo migrácia s dátami — vyber si, čo je v tomto projekte čistejšie,
a zdôvodni to v reporte.

| Cvik | Partia |
| --- | --- |
| Drep | NOHY |
| Mŕtvy ťah | CHRBAT |
| Rumunský mŕtvy ťah | NOHY |
| Bench press | HRUD |
| Tlak nad hlavu | RAMENA |
| Príťahy v predklone | CHRBAT |
| Zhyby | CHRBAT |
| Bicepsový zdvih | BICEPS |
| Tricepsové extenzie | TRICEPS |
| Plank | CORE |

`jednotka` nastav podľa existujúceho enumu `Jednotka` — pozri, aké hodnoty
má. Zhyby a Plank nie sú na kilogramy.

`slug` odvoď z názvu bez diakritiky (`normalizujPrezyvku` v
`src/lib/validate.ts` robí presne to, čo potrebuješ).

---

# ČASŤ C — správa cvikov a plánov v `/sprava`

Minimálne rozhranie, žiadna krása. Server Actions, `requireAdmin()`.

## C1. `/sprava/cviky`

Zoznam cvikov + formulár na pridanie a úpravu: názov, partia, jednotka,
aktívny, poradie. Mazanie **nie** — cvik sa deaktivuje, nikdy nemaže
(sú naň naviazané série).

## C2. `/sprava/plany`

Zoznam tréningových plánov + založenie plánu: názov a cviky s cieľom
`série × opakovania`.

**Pozor na vlastníctvo:** `TreningPlan.clenId` je povinné. V H1 admin
zakladá plány **sám sebe** — zdieľané plány pre všetkých členov riešiť
nebudeme, to je rozhodnutie na neskôr. Ak ti to príde ako zlý návrh,
napíš to do reportu, ale schému nemeň.

Obe stránky použi existujúce komponenty z `src/components/ui/`.
Žiadne nové CSS.

---

## Kontrola pred reportom

```
npx prisma validate
npx tsc --noEmit
npm run lint
npm run build
git diff --stat
```

- [ ] build prejde, počet stránok = 43 + nové `/sprava/*`
- [ ] `git diff` neobsahuje `middleware.ts`, `globals.css`, `gym.ts`,
      `pricing.ts`, ani žiadnu zmenu verejných stránok
- [ ] migračný SQL neobsahuje `DROP` ani `DELETE`
- [ ] `/admin/objednavky` stále pýta heslo
- [ ] žiadny nový balík

### Ručné overenie

| Krok | Očakávané |
| --- | --- |
| `/sprava/cviky` ako ADMIN | zoznam 10 cvikov |
| `/sprava/cviky` ako CLEN | 404 |
| pridaj cvik | objaví sa v zozname aj v databáze |
| `/sprava/plany` ako ADMIN | dá sa založiť plán s cvikmi |
| `/klub` | funguje ako predtým, nič sa nezmenilo |

Rolu prepínaj cez Supabase SQL Editor, nie Table Editor
(pozri `docs/TESTOVANIE.md`).

---

## Report

```
## A. SCHÉMA           nové modely, zmenené polia
## A4. MIGRAČNÝ SQL    doslovne
## B. CVIKY            seed alebo migrácia + prečo
## C. SPRÁVA           zoznam nových súborov
## OVERENIE            tabuľka 5 riadkov
## KONTROLY            prisma · tsc · lint · build · git
## RIZIKÁ
## OTÁZKY              max 3
```

---

## Ukončenie

PR obsahuje `prisma/schema.prisma` → **merguje Maxim**, nie ty.
Po otvorení PR zastav.
