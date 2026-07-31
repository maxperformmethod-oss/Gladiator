# CLAUDE_CODE_TASK_010 — Etapa F, časť 1: príprava prvej migrácie

Verzia 1.0 · 31. 7. 2026

> **Táto úloha migráciu NESPÚŠŤA.** Iba vygeneruje SQL, doplní doň obmedzenia
> a zastaví. Aplikovanie je samostatná úloha po mojom prečítaní SQL.

---

## Prečo taká opatrnosť

Doteraz sa dalo všetko vrátiť cez `git revert`. Migrácia sa vrátiť nedá —
raz vytvorené tabuľky treba mazať ručne. Preto ju rozdeľujeme na dve časti
a medzi nimi si SQL prečítam.

---

## ČASŤ 0 — merge schémy

```
gh pr merge 18 --squash --delete-branch
git checkout main && git pull
git log --oneline -3
git checkout -b feat/migration-init
```

---

## ČASŤ 1 — overenie, že mierime na správnu databázu · KRITICKÉ

Toto je najdôležitejšia kontrola v celej úlohe. Migrácia proti nesprávnej
databáze je najhoršia vec, ktorá sa v tomto projekte môže stať.

### 1a. Existuje `.env`?

```powershell
Test-Path .env
Test-Path .env.local
```

### 1b. Aké kľúče v `.env` sú

**Vypíš iba názvy kľúčov, nikdy hodnoty:**

```powershell
Select-String -Path .env -Pattern "^[A-Za-z_]+" | ForEach-Object { ($_ -split "=")[0] }
```

Musí obsahovať `DATABASE_URL` aj `DIRECT_URL`.

### 1c. Ukazujú na staging projekt?

Staging Supabase projekt má referenciu **`dhuynypsdbqdkkaqjxwv`**.

Over, že sa tento reťazec v `.env` nachádza — **bez vypísania celého riadku**:

```powershell
if (Select-String -Path .env -Pattern "dhuynypsdbqdkkaqjxwv" -Quiet) { "OK - staging" } else { "NESEDI" }
```

Ďalej over porty, opäť bez hodnôt:

```powershell
if (Select-String -Path .env -Pattern "DATABASE_URL=.*:6543" -Quiet) { "DATABASE_URL: pooler 6543 OK" } else { "DATABASE_URL: NIE JE pooler" }
if (Select-String -Path .env -Pattern "DIRECT_URL=.*:5432" -Quiet) { "DIRECT_URL: direct 5432 OK" } else { "DIRECT_URL: NIE JE direct" }
```

**Ak čokoľvek z tejto sekcie nesedí — ZASTAV a napíš mi to.**
Nepokúšaj sa `.env` opraviť ani doplniť.

### 1d. Overenie, že databáza je prázdna

```
npx prisma db execute --url "$env:DIRECT_URL" --stdin
```

Radšej použi jednoduchšiu cestu — vypíš mi, či existuje priečinok:

```powershell
Test-Path prisma\migrations
```

Očakávam **False**. Ak existuje, **ZASTAV** — niekto už migroval.

---

## ČASŤ 2 — vygenerovanie SQL

**Najprv zastav bežiaci dev server**, ak beží. Na Windows a OneDrive drží
zamknutý Prisma engine a migrácia by spadla na EPERM.

```
npx prisma migrate dev --name init --create-only
```

`--create-only` znamená: **vygeneruj SQL, ale nespúšťaj ho.**

Vznikne priečinok `prisma/migrations/<timestamp>_init/migration.sql`
a súbor `prisma/migrations/migration_lock.toml`.

### Ak príkaz zlyhá na shadow databáze

Supabase niekedy nepovolí vytvorenie dočasnej shadow databázy. Chyba
obsahuje `shadow database` alebo `permission denied to create database`.

V takom prípade **neopravuj oprávnenia**. Použi náhradný postup, ktorý
databázu vôbec nepotrebuje:

```powershell
New-Item -ItemType Directory -Force -Path "prisma\migrations\20260731000000_init"
npx prisma migrate diff --from-empty --to-schema-datamodel prisma\schema.prisma --script | Out-File -Encoding utf8 "prisma\migrations\20260731000000_init\migration.sql"
@"
provider = "postgresql"
"@ | Out-File -Encoding utf8 "prisma\migrations\migration_lock.toml"
```

Napíš mi, ktorý z dvoch postupov si použil.

### Ak zlyhá na EPERM alebo zamknutom súbore

Zastav všetky bežiace `node` procesy a skús znova. Ak to nepomôže,
**ZASTAV a nahlás.**

---

## ČASŤ 3 — doplnenie obmedzení do SQL

Na **koniec** súboru `migration.sql` pridaj presne toto:

```sql

-- ─────────────────────────────────────────────────────────────────
-- Obmedzenia, ktoré Prisma nevie vyjadriť v schéme.
-- Zdroj: docs/DATABASE.md, sekcia 4.
-- ─────────────────────────────────────────────────────────────────

-- Nikto nesmie schváliť vlastný výsledok — vynútené databázou,
-- nie len aplikačným kódom.
ALTER TABLE "Rekord"
  ADD CONSTRAINT "rekord_ziadne_samoschvalenie"
  CHECK ("posudilId" IS NULL OR "posudilId" <> "clenId");

ALTER TABLE "VyzvaZapis"
  ADD CONSTRAINT "vyzvazapis_ziadne_samoschvalenie"
  CHECK ("posudilId" IS NULL OR "posudilId" <> "clenId");

-- Zápis do výzvy je z definície odoslaný, nikdy súkromný.
ALTER TABLE "VyzvaZapis"
  ADD CONSTRAINT "vyzvazapis_nie_sukromny"
  CHECK ("stav" <> 'SUKROMNY');

-- Posúdený výsledok musí mať zaznamenané, kedy bol posúdený.
ALTER TABLE "Rekord"
  ADD CONSTRAINT "rekord_posudenie_uplne"
  CHECK (
    ("stav" IN ('SUKROMNY','CAKA') AND "posudilId" IS NULL AND "posudene" IS NULL)
    OR ("stav" IN ('SCHVALENE','ZAMIETNUTE') AND "posudene" IS NOT NULL)
  );

ALTER TABLE "VyzvaZapis"
  ADD CONSTRAINT "vyzvazapis_posudenie_uplne"
  CHECK (
    ("stav" = 'CAKA' AND "posudilId" IS NULL AND "posudene" IS NULL)
    OR ("stav" IN ('SCHVALENE','ZAMIETNUTE') AND "posudene" IS NOT NULL)
  );

-- Výkon nemôže byť nulový ani záporný.
ALTER TABLE "Rekord"
  ADD CONSTRAINT "rekord_hodnota_kladna" CHECK ("hodnota" > 0);

ALTER TABLE "VyzvaZapis"
  ADD CONSTRAINT "vyzvazapis_hodnota_kladna" CHECK ("hodnota" > 0);

-- Výzva nemôže skončiť skôr, než začne.
ALTER TABLE "Vyzva"
  ADD CONSTRAINT "vyzva_platne_obdobie" CHECK ("koniec" >= "zaciatok");
```

**Pozor na názvy enumov v SQL.** Prisma generuje enum typy s vlastnými
názvami. Over vo vygenerovanom SQL, ako sa enum `VysledokStav` skutočne
volá a či porovnanie `"stav" <> 'SUKROMNY'` bude fungovať. Ak Prisma
použije iný zápis, **uprav porovnania podľa skutočnosti a napíš mi to.**

Ak si nie si istý, radšej to **nechaj tak a opýtaj sa** — SQL prečítam ja.

---

## ČASŤ 4 — kontrola a STOP

```
npx prisma validate
npm run lint
npm run build
git status --short
git diff --stat
```

- [ ] `prisma validate` platná schéma
- [ ] `npm run build` 40/40 stránok
- [ ] `git status` ukazuje iba nové súbory v `prisma/migrations/`
- [ ] `prisma/schema.prisma` **nezmenený** oproti `main`
- [ ] žiadny súbor mimo `prisma/migrations/`

---

## Report — a potom TVRDÝ STOP

```
## 1. MERGE #18            git log --oneline -3
## 2. KONTROLA .env        výstupy z Časti 1, BEZ hodnôt
## 3. POUŽITÝ POSTUP       migrate dev --create-only alebo migrate diff?
## 4. CELÝ OBSAH migration.sql   ← doslovne, celý súbor, vrátane doplnených CHECK
## 5. NÁZVY ENUM TYPOV     ako ich Prisma pomenovala v SQL
## 6. VÝSTUP KONTROL
## 7. CHECKLIST
## 8. OTÁZKY               max 3
```

**Sekcia 4 je najdôležitejšia — vypíš celý súbor `migration.sql` doslovne.**
Prečítam ho riadok po riadku, než sa čokoľvek spustí.

---

## Ukončenie

**Migráciu NESPÚŠŤAJ.** Žiadny `migrate deploy`, `migrate dev` bez
`--create-only`, `db push` ani `db execute`.

Necommituj, nepushuj, neotváraj PR.

Aplikovanie migrácie je samostatná úloha, ktorú dostaneš až po tom, ako
prečítam SQL.
