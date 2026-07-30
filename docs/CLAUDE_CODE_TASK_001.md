# CLAUDE_CODE_TASK_001 — Read-only inventúra repozitára

Verzia: 1.0 · Dátum: 2026-07-30 · Etapa: **A0**
Vykonáva: Claude Code · Schválil: čaká na potvrdenie majiteľa

---

## REŽIM: IBA ČÍTANIE

Táto úloha **nepovoľuje žiadnu zmenu**. Konkrétne je zakázané:

- vytvárať, upravovať, premenovávať, presúvať alebo mazať akýkoľvek súbor,
- spúšťať `npm install`, `npm ci`, `npm update`, `npx prisma migrate`,
  `npx prisma db push`, `npx prisma generate`, `npm run build`, `npm run dev`,
- pripájať sa k databáze alebo k Supabase,
- meniť Git stav — žiadny `add`, `commit`, `checkout`, `stash`, `merge`, `pull`,
- meniť Vercel konfiguráciu,
- vypisovať hodnoty tajných premenných z `.env`, `.env.local` alebo odkiaľkoľvek.

Povolené sú **výhradne** čítacie operácie: `ls`, `cat`, `find`, `grep`,
`git status`, `git log`, `git branch`, `git remote -v`, `wc`.

Ak si pri ktorejkoľvek úlohe nie si istý, či je operácia čítacia — **nevykonaj ju
a napíš to do reportu.**

---

## Kontext

Priečinok projektu nebol dostupný pri tvorbe `docs/PROJECT_CONTEXT.md`. Ten
dokument obsahuje veľa položiek označených ako ASSUMPTION. Cieľom tejto úlohy je
premeniť ich na overené fakty alebo ich opraviť.

**Nič neopravuj v kóde. Iba zisti a nahlás.**

---

## Úlohy

### 1. Strom projektu

Vypíš úplný strom repozitára do hĺbky 4, s vynechaním `node_modules`, `.next`,
`.git`, `public/Fotky gym`.

Uveď počet súborov v `src/` podľa prípony (`.tsx`, `.ts`, `.css`).

### 2. Routes

Vypíš **každý** súbor `page.tsx`, `layout.tsx`, `route.ts`, `template.tsx`,
`loading.tsx`, `error.tsx`, `not-found.tsx` v `src/app/` s jeho úplnou cestou.

Pre každý z nich uveď odvodenú URL.

Označ, ktoré sú Server Component a ktoré majú `'use client'`.

Označ, ktoré majú `export const dynamic`, `revalidate` alebo `fetchCache`.

### 3. Komponenty

Vypíš strom `src/components/` a `src/lib/`.

Pri každom súbore v `src/components/` uveď: má `'use client'`? áno/nie.

Vypíš exportované symboly z `src/lib/gym.ts` a `src/lib/pricing.ts` — **iba
názvy exportov a typy, nie obsah**.

### 4. Prisma

Vypíš **celý** obsah `prisma/schema.prisma`.

Vypíš obsah priečinka `prisma/migrations/` — názvy migrácií a ich poradie.
Uveď, či existuje `migration_lock.toml` a aký provider je v ňom.

Pre model `Clen` uveď: všetky stĺpce, a **ktoré iné modely naň majú relation**.

### 5. Middleware — KRITICKÉ

Vypíš **celý** obsah `src/middleware.ts` doslovne, vrátane `export const config`.

Explicitne odpovedz na tieto otázky:

- Aká je presná hodnota `matcher`?
- Chytá matcher cestu `/admin/klub`? áno/nie
- Chytá matcher cestu `/klub`? áno/nie
- Chytá matcher cestu `/sprava`? áno/nie
- Chytá matcher cestu `/api/stripe/webhook`? áno/nie
- Čo sa stane, ak `ADMIN_USER` alebo `ADMIN_PASSWORD` nie sú nastavené?

### 6. PWA

Odpovedz áno/nie s cestou k súboru, ak existuje:

- `public/manifest.json` alebo `public/manifest.webmanifest`
- `public/sw.js` alebo iný service worker
- ikony v `public/icons/` alebo podobne
- `<link rel="manifest">` kdekoľvek v `src/`
- `navigator.serviceWorker.register` kdekoľvek v `src/`
- `viewport` a `themeColor` export v `src/app/layout.tsx`

### 7. Styling

Vypíš obsah `src/app/globals.css` — **iba blok `@theme` a zoznam názvov
vlastných CSS tried**, nie celý súbor, ak má viac ako 200 riadkov.

Potvrď: existuje `tailwind.config.js` / `.ts` / `.mjs`? áno/nie

### 8. Environment premenné

Vypíš **iba názvy kľúčov** (ľavá strana od `=`) v týchto súboroch:
`.env`, `.env.local`, `.env.example`, `.env.production`, ak existujú.

**Nikdy nevypisuj hodnoty.** Ani skrátené, ani zahashované, ani prvé znaky.

Vypíš zoznam všetkých `process.env.X` výskytov v `src/` s cestou k súboru
a názvom premennej.

Označ, ktoré z nich sú použité v súbore s `'use client'`.

### 9. Git

Spusti a vypíš výstup:

```
git status --short --branch
git branch -a
git remote -v
git log --oneline -20
git log --all --full-history --name-only -- .env .env.local .env.production
```

Posledný príkaz je bezpečnostná kontrola. Ak vráti akýkoľvek výsledok,
**zvýrazni to v reporte ako kritické zistenie** — ale hodnoty nevypisuj.

Uveď, či je working tree čistý.

### 10. Vercel a build konfigurácia

Odpovedz áno/nie s cestou:

- `vercel.json`
- `.vercel/` priečinok
- `.github/workflows/`
- `next.config.ts` — vypíš celý obsah
- akýkoľvek `Dockerfile`, `railway.json`, `netlify.toml`

### 11. Závislosti a lockfile

Potvrď: existuje iba `package-lock.json`, alebo aj `pnpm-lock.yaml` /
`yarn.lock` / `bun.lockb`?

Vypíš verziu Node a npm v prostredí (`node -v`, `npm -v`).

Vyhľadaj v `src/` importy z balíkov, ktoré **nie sú** v `package.json`
dependencies ani devDependencies. Ak nejaké nájdeš, vypíš ich.

### 12. Hľadanie skrytých prekvapení

Vypíš výsledky týchto vyhľadávaní v `src/` (grep, iba zoznam súbor:riadok):

- `TODO`, `FIXME`, `HACK`, `XXX`
- `any` ako TypeScript typ (`: any`, `as any`)
- `@ts-ignore`, `@ts-expect-error`, `eslint-disable`
- `dangerouslySetInnerHTML`
- `localStorage`, `sessionStorage`
- `console.log`

---

## Formát výstupu

Vytvor odpoveď (v chate, **nie ako súbor v repozitári**) v tejto štruktúre:

```
## 1. ZISTENIA
   — po jednej sekcii na každú z 12 úloh vyššie

## 2. ROZDIELY OPROTI docs/PROJECT_CONTEXT.md
   — zoznam tvrdení v tom dokumente, ktoré sú NESPRÁVNE, s opravou

## 3. RIZIKÁ
   — čo si v projekte našiel, čo predstavuje riziko pri pridávaní
     autentifikácie, PWA a nových tabuliek
   — každé riziko: popis · závažnosť (nízka/stredná/vysoká/kritická) · dotknuté súbory

## 4. NAVRHOVANÉ SÚBORY
   — presný zoznam súborov a priečinkov, ktoré by si chcel vytvoriť alebo
     upraviť v Etape C
   — pri každom: NOVÝ alebo ÚPRAVA, a jednou vetou prečo
   — NIČ z toho nevytváraj

## 5. OTÁZKY
   — otázky, ktoré musíš mať zodpovedané pred Etapou C
   — zoradené podľa dôležitosti, maximálne 7
   — pri každej vysvetli jednou vetou, prečo tú informáciu potrebuješ

## 6. POTVRDENIE
   — výstup `git status --short` na dôkaz, že repozitár je nezmenený
   — veta: „Nevykonal som žiadnu zmenu v repozitári."
```

---

## Zakázané v reporte

- hodnoty environment premenných v akejkoľvek podobe,
- connection stringy, tokeny, heslá, API kľúče,
- celý obsah `package-lock.json`,
- návrhy kódu — v tejto etape sa nepíše kód, ani ako ukážka.

---

## Ukončenie

Po dokončení reportu **zastav**. Nezačínaj Etapu C. Nevytváraj žiadne súbory.
Nenavrhuj commit. Čakaj na písomné schválenie majiteľa.

Ak si počas úlohy narazil na niečo, čo si nemohol prečítať alebo čo si
nepochopil — napíš to do sekcie 5 (Otázky) namiesto toho, aby si to odhadol.
