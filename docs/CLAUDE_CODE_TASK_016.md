# CLAUDE_CODE_TASK_016 — upratanie po H1

3. 8. 2026 · vetva `feat/training-model` (PR #30, `6f36586`) · **NEMERGOVAŤ**

Tri veci: odstrániť mínu v migráciách, zjednotiť git identitu, upratať vetvy.

---

## Rozsah čítania

`docs/CLAUDE_CODE_TASK_016.md` (tento súbor), `TODO.md`, `CLAUDE.md`,
`prisma/migrations/`. **Nerob audit repozitára, nerekonštruuj históriu.**

## ZAKÁZANÉ

- `src/**`, `src/middleware.ts`, `prisma/schema.prisma`, platobný kód
- `npm install`, `prisma migrate reset`, akýkoľvek `DROP TABLE` / `DROP COLUMN` / `DELETE` na aplikačných tabuľkách
- merge akejkoľvek PR
- mazanie vetvy `main` alebo `feat/training-model`

---

## KROK 0 — najprv commitni tento súbor

`docs/CLAUDE_CODE_TASK_016.md` napísal Cowork na disk. Podľa SPOLUPRACA §5 musí
byť commitnutý **pred akoukoľvek git operáciou**, inak zablokuje prepnutie vetvy.

```
git add docs/CLAUDE_CODE_TASK_016.md
git commit -m "docs: add task 016 (post-H1 cleanup)"
```

---

## KROK 1 — odstrániť migráciu `revoke_rls_auto_enable`

### Prečo (toto je zmena oproti tvojmu návrhu)

Tvoj návrh bol zverzovať `CREATE FUNCTION rls_auto_enable` do migrácie.
**Nesúhlasím.** Cowork si vytiahol definíciu z DB:

```
CREATE OR REPLACE FUNCTION public.rls_auto_enable()
 RETURNS event_trigger
 LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'pg_catalog'
```

Je to **event trigger funkcia Supabase platformy** (auto-zapínanie RLS na nových
tabuľkách v `public`) — nie náš aplikačný objekt. V `pg_trigger` nie je žiadny
záznam, lebo to nie je tabuľkový trigger. Zverzovať cudzí platformový objekt do
našich Prisma migrácií znamená, že by sme ho pri každom replayi prepisovali
vlastnou kópiou, ktorá sa rozíde s tým, čo Supabase spravuje.

Správne riešenie: migráciu **zrušiť** a `REVOKE` viesť ako **prevádzkový krok**
v `TODO.md` pre každé nové Supabase prostredie. Tým mizne aj shadow-DB mína,
ktorú si správne nahlásil — bez `CREATE FUNCTION`, bez `DO $$` obalu, bez
ďalšieho zásahu do checksumov.

Na stagingu je `REVOKE` už aplikovaný a **ostáva platný** — mažeme len jeho
zápis v Prisme, nie jeho účinok. Overené 3. 8.: `anon = false`,
`authenticated = false`.

### Čo sprav

1. Zmaž priečinok `prisma/migrations/20260803150729_revoke_rls_auto_enable/`
   (celý, aj `migration.sql`).
2. Zmaž jeho jediný riadok v `_prisma_migrations` na stagingu:

   ```sql
   DELETE FROM public._prisma_migrations
   WHERE migration_name = '20260803150729_revoke_rls_auto_enable';
   ```

   **Toto je jediný povolený DELETE v tejto úlohe.** Žiadny iný riadok, žiadna
   iná tabuľka. Ak dotaz zmaže iný počet riadkov než presne 1 → ZASTAV a nahlás.
3. Over, že `REVOKE` stále platí (musí vrátiť `false`, `false`):

   ```sql
   SELECT has_function_privilege('anon','public.rls_auto_enable()','EXECUTE'),
          has_function_privilege('authenticated','public.rls_auto_enable()','EXECUTE');
   ```
4. Over, že `_prisma_migrations` obsahuje presne tri migrácie:
   `20260731000000_init`, `20260803134512_training_model`,
   `20260803134702_seed_cviky` — všetky s `finished_at`, žiadna `rolled_back_at`.

### Zápis do `TODO.md`

V §6 prepíš bod o `REVOKE` na:

> - [x] `REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM anon, authenticated, PUBLIC`
>       — na stagingu `dhuynypsdbqdkkaqjxwv` aplikované 3. 8. 2026.
>       **Nie je to Prisma migrácia zámerne** — `rls_auto_enable()` je event
>       trigger funkcia Supabase platformy, nie náš objekt. V každom NOVOM
>       Supabase projekte (staging aj produkcia) treba tento príkaz spustiť
>       ručne cez SQL Editor ako súčasť zakladania prostredia.

Rovnaký príkaz pridaj do zoznamu krokov pre zakladanie produkčného projektu
(§6, bod o produkčnom Supabase).

---

## KROK 2 — zjednotiť git identitu na `maxperformmethod@gmail.com`

```
git config --global user.email "maxperformmethod@gmail.com"
git config --global user.name "Maxim Malovec"
```

Potom over a vypíš do reportu:

```
git config --global user.email
git config --global user.name
```

### Zápis do `CLAUDE.md`

V sekcii „Git / deploy" zmeň riadok o autorovi na:

> - Remote: `maxperformmethod-oss/Gladiator`, autor Maxim Malovec
>   (`maxperformmethod@gmail.com`). Deploy: Vercel (účet **RPS-2022**,
>   `gladiator-eight.vercel.app`).

**Staré commity neprepisuj** — žiadny `filter-branch`, žiadny `rebase` s
prepisom autora. História ostáva ako je.

### Upozornenie pre Maxima (daj do reportu)

Aby sa commity naviazali na GitHub profil, `maxperformmethod@gmail.com` musí byť
pridaný a **overený** v GitHub → Settings → Emails. Kým nie je, commity sa
zobrazia bez avatara a bez odkazu na účet.

---

## KROK 3 — upratať vetvy

Na git grafe je ~20 vetiev, väčšina Dependabot. Postup:

1. Aktualizuj referencie a zisti stav:

   ```
   git fetch --prune origin
   git branch -r --merged origin/main
   git branch -r --no-merged origin/main
   ```

2. **Vypíš do reportu obidva zoznamy** — zmergované aj nezmergované — než čokoľvek
   zmažeš.

3. Zmaž **iba vetvy zmergované do `origin/main`**, lokálne aj na remote:

   ```
   git push origin --delete <vetva>
   git branch -d <vetva>
   ```

   **NEMAŽ:** `main`, `feat/training-model` (živá PR #30), ani žiadnu vetvu zo
   zoznamu `--no-merged`.

4. Dependabot vetvy, ktoré NIE sú zmergované, nemaž ručne — ich PR treba buď
   zavrieť, alebo zmergovať. Len ich vypíš do reportu s číslom PR, Maxim rozhodne.

**Zastavenie:** ak by niektorá vetva zo zoznamu `--merged` obsahovala commit,
ktorý nie je v `main`, ZASTAV a nahlás. Nič nemaž „pre istotu".

---

## Kontrola pred reportom

- `npx prisma validate` ✓
- `tsc --noEmit` ✓
- `npm run lint` ✓
- `npm run build` — očakávam **44/44** stránok

---

## Formát reportu

1. **Krok 1:** počet zmazaných riadkov v `_prisma_migrations` (musí byť 1), výsledok
   oboch overovacích dotazov, zoznam zostávajúcich migrácií.
2. **Krok 2:** výpis `git config --global user.email` a `user.name`.
3. **Krok 3:** zoznam `--merged` (zmazané) a `--no-merged` (ponechané, s číslami PR).
4. Zoznam zmenených súborov.
5. Výsledky štyroch kontrol.

**Commitni a pushni na `feat/training-model`. NEMERGUJ** — PR #30 obsahuje
`prisma/schema.prisma`, merguje Maxim.

---

## Čo NEROBÍŠ v tejto úlohe

- Neoveruješ riadky 1/3/4 z A5 — **to preklikne Maxim v prehliadači** (má heslá,
  trvá to 2 minúty). Dedikovaný testovací účet s heslom v `.env.local` je
  rozumný nápad, ale patrí k zavedeniu Playwright E2E testov, nie sem.
- Nezačínaš H2. Koncept a zadanie H2 píše Cowork, až keď je #30 v `main`.
