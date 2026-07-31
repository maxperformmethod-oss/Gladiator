# CLAUDE_CODE_TASK_011 — Etapa F, časť 2: spustenie prvej migrácie

Verzia 1.0 · 31. 7. 2026

> **SQL som prečítal celé a schvaľujem ho.** Táto úloha ho spustí proti
> **staging** databáze. Je to prvý nevratný krok v projekte.

---

## Vstupné podmienky

- [ ] si na vetve `feat/migration-init`
- [ ] `prisma/migrations/20260731000000_init/migration.sql` existuje
- [ ] `prisma/migrations/migration_lock.toml` existuje
- [ ] `.env` prešiel kontrolou z predošlej úlohy (body 1–6)
- [ ] dev server **nebeží**

---

## KROK 1 — odstránenie BOM

Súbor začína UTF-8 BOM. Postgres by na začiatku videl neplatné znaky
a migrácia môže spadnúť na syntaktickej chybe.

```powershell
$p = "prisma\migrations\20260731000000_init\migration.sql"
$content = Get-Content -Raw -Path $p
[System.IO.File]::WriteAllText((Resolve-Path $p), $content, (New-Object System.Text.UTF8Encoding($false)))
```

Over, že BOM je preč a obsah nedotknutý:

```powershell
$bytes = [System.IO.File]::ReadAllBytes((Resolve-Path $p))
"Prve 3 bajty: $($bytes[0]), $($bytes[1]), $($bytes[2])"
```

Očakávam `45, 45, 32` — čiže `-- ` v ASCII. Ak je tam `239, 187, 191`,
BOM sa neodstránil. **Nemeň v SQL ani jeden znak.**

```powershell
(Get-Content $p | Measure-Object -Line).Lines
Select-String -Path $p -Pattern "ADD CONSTRAINT" | Measure-Object | Select-Object Count
```

Počet `ADD CONSTRAINT` musí byť **21** (13 cudzích kľúčov + 8 CHECK).

---

## KROK 2 — stav databázy PRED migráciou

```
npx prisma migrate status
```

Očakávam hlásenie, že databáza je prázdna a čaká jedna nepoužitá migrácia.

**Ak hlási, že už niečo aplikované je — ZASTAV a nahlás.**

---

## KROK 3 — spustenie migrácie

Toto je nevratný krok.

```
npx prisma migrate deploy
```

**Iba `deploy`.** Nie `migrate dev`, nie `db push`, nie `--force`,
nie `migrate reset`.

Vypíš celý výstup doslovne.

### Ak zlyhá

**Nespúšťaj to znova a nič neopravuj.** Skopíruj celú chybu a zastav.
Čiastočne aplikovaná migrácia je stav, ktorý treba riešiť rozvážne.

---

## KROK 4 — overenie výsledku

```
npx prisma migrate status
npx prisma generate
```

Potom overovacie dotazy. Použi Supabase SQL Editor **alebo**:

```
npx prisma db execute --url "$env:DIRECT_URL" --file overenie.sql
```

Ak si vytvoríš pomocný súbor, **po skončení ho zmaž.**

Dotazy, ktoré potrebujem — a ich výstupy vypíš celé:

```sql
-- 1. Koľko tabuliek vzniklo (očakávam 15 + _prisma_migrations = 16)
select count(*) from pg_tables where schemaname = 'public';

-- 2. Zoznam tabuliek a či majú zapnuté RLS
select tablename, rowsecurity from pg_tables
where schemaname = 'public' order by tablename;

-- 3. Koľko RLS policies existuje (očakávam 0)
select count(*) from pg_policies where schemaname = 'public';

-- 4. Naše CHECK obmedzenia (očakávam 8)
select conname, conrelid::regclass as tabulka
from pg_constraint
where contype = 'c'
  and connamespace = 'public'::regnamespace
  and conname not like '%_not_null'
order by conname;

-- 5. Politika mazania na väzbách na Clen — KRITICKÉ
select conname, confdeltype
from pg_constraint
where contype = 'f'
  and confrelid = '"Clen"'::regclass
order by conname;

-- 6. Zapísaná migrácia
select migration_name, finished_at from _prisma_migrations;
```

### Ako čítať výsledok dotazu 5

`confdeltype` je jedno písmeno:

| Hodnota | Znamená |
| --- | --- |
| `c` | CASCADE |
| `n` | SET NULL |
| `r` | RESTRICT |
| `a` | NO ACTION |

**`Objednavka_clenId_fkey` musí mať `n` (SET NULL).**
Ak má `c`, je to chyba — objednávky by pri výmaze člena zmizli.

`Permanentka`, `QRToken`, `VstupHistoria`, `Rekord`, `VyzvaZapis` majú
mať `c`. Posudzovatelia a `AdminLog` majú mať `n`.

### Ak RLS nie je zapnuté

V projekte beží Supabase trigger `rls_auto_enable()`, ktorý ho má zapnúť
automaticky pri vytvorení tabuľky. Ak dotaz 2 ukáže `rowsecurity = false`
na niektorej tabuľke — **ZASTAV a nahlás to. Nezapínaj ho sám.**

---

## KROK 5 — build a commit

```
npm run lint
npm run build
git status --short
git diff --stat
```

- [ ] build 40/40 stránok
- [ ] `git status` ukazuje iba `prisma/migrations/`
- [ ] žiadny pomocný súbor typu `overenie.sql` nezostal

Potom:

```
git add prisma/migrations
git commit -m "feat(db): add initial migration with integrity constraints"
git push -u origin feat/migration-init
gh pr create --base main --head feat/migration-init ^
  --title "feat(db): add initial migration with integrity constraints" ^
  --body "Prvá migrácia — 15 tabuliek, 10 enum typov, 13 cudzích kľúčov a 8 databázových obmedzení. Obsahuje zákaz samoschválenia výsledku, kontrolu úplnosti posúdenia, kladné hodnoty výkonov a platné obdobie výzvy. Aplikované proti staging databáze."
gh pr checks --watch
```

**NEMERGUJ. ZASTAV.**

---

## Report

```
## 1. BOM               prvé tri bajty pred a po
## 2. POČET CONSTRAINT  musí byť 21
## 3. STAV PRED         výstup migrate status
## 4. VÝSTUP MIGRÁCIE   doslovne, celý
## 5. STAV PO           výstup migrate status
## 6. DOTAZ 1           počet tabuliek
## 7. DOTAZ 2           tabuľka: názov + rowsecurity
## 8. DOTAZ 3           počet policies
## 9. DOTAZ 4           zoznam CHECK obmedzení
## 10. DOTAZ 5          väzby na Clen + confdeltype, s prekladom
## 11. DOTAZ 6          zapísaná migrácia
## 12. BUILD A COMMIT
## 13. RIZIKÁ
## 14. OTÁZKY           max 3
```

---

## Zakázané

`migrate dev` · `migrate reset` · `db push` · `--force` · opakované spustenie
po zlyhaní · ručné zásahy do databázy · zmena `.env` · zmena `schema.prisma`
· zmena čohokoľvek v `src/`

---

## Ukončenie

Po reporte **zastav**. PR nemerguj.

Výsledok si nezávisle overím aj ja cez Supabase — mám k projektu prístup.
