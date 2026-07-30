# CLAUDE_CODE_TASK_002 — Etapa C: prázdna štruktúra

Verzia 1.0 · 2026-07-30 · Predchádza: TASK_001 (audit, DONE)

---

## Cieľ

Vytvoriť kostru nových sekcií `/klub`, `/sprava` a prihlasovacích stránok.
**Iba prázdne stránky s textom „Pripravuje sa".**

Zmyslom tejto etapy je jediné: overiť, že nová štruktúra spolunažíva
s existujúcim webom a že `build` aj `lint` prejdú. Nič viac.

---

## ZAKÁZANÉ v tejto etape

- **`src/middleware.ts` — NEMENIŤ.** Ani matcher, ani logiku. Autentifikácia
  príde až v Etape G. Placeholder stránky sú zatiaľ verejné.
- **`prisma/schema.prisma` — NEMENIŤ.** Žiadny nový model.
- **`npm install` — ZAKÁZANÝ.** Žiadny nový balík. Ani `zod`, ani `@supabase/*`.
- **`src/app/layout.tsx` — NEMENIŤ.**
- **`src/app/globals.css` — NEMENIŤ.** Žiadna nová CSS trieda, žiadny nový token.
- **Žiadny existujúci súbor sa nemení, nepresúva ani nemaže.**
- Žiadna migrácia, žiadne pripojenie k databáze, žiadne Supabase.
- Žiadny Stripe kód sa nedotýka.
- Žiadny commit bez môjho schválenia.

Jediná povolená operácia: **vytváranie nových súborov** na cestách uvedených
nižšie.

---

## Súbory na vytvorenie — presný zoznam

### Prihlasovacie stránky (4)

```
src/app/registracia/page.tsx
src/app/prihlasenie/page.tsx
src/app/obnova-hesla/page.tsx
src/app/nove-heslo/page.tsx
```

### Členská sekcia (6)

```
src/app/klub/layout.tsx
src/app/klub/page.tsx
src/app/klub/profil/page.tsx
src/app/klub/rekordy/page.tsx
src/app/klub/rebricek/page.tsx
src/app/klub/vyzva/page.tsx
```

### Administrácia klubu (6)

```
src/app/sprava/layout.tsx
src/app/sprava/page.tsx
src/app/sprava/clenovia/page.tsx
src/app/sprava/cviky/page.tsx
src/app/sprava/vyzvy/page.tsx
src/app/sprava/vysledky/page.tsx
```

### Vrstva 2 — zatiaľ len jeden súbor (1)

```
src/server/README.md
```

Obsah: tri vety o tom, že sem patrí business logika a autorizácia, že každý
súbor tu bude začínať `import 'server-only'`, a že komponenty sem nikdy
neimportujú Prismu priamo. Prázdny priečinok sa do Gitu nedostane, preto
tento súbor.

**Spolu 17 nových súborov. Žiadny iný.**

---

## Ako majú stránky vyzerať

Server Components. Žiadny `'use client'`. Žiadny stav, žiadny formulár,
žiadne volanie dát.

Každá stránka: nadpis + veta „Pripravuje sa." Použi **existujúce** komponenty
zo `src/components/ui/` (`Section`, `SectionHeading`, prípadne `Notice`), aby
sedeli s webom. Ak niektorý z nich nemá vhodné API, radšej použi obyčajný
`<main>` s Tailwind triedami z existujúcich tokenov — **nevytváraj nové
komponenty a nepridávaj nové CSS triedy.**

### Layouty `klub` a `sprava`

Oba obsahujú:

```ts
export const metadata = {
  robots: { index: false, follow: false },
}
```

Dôvod: rozpracované stránky nesmú skončiť v Google. Toto je jediná „logika",
ktorú layouty v tejto etape majú — inak len prepošlú `children`.

**Žiadny guard, žiadna kontrola prihlásenia.** Príde v Etape G.

### Prihlasovacie stránky

Tiež `robots: { index: false }` — dokým nefungujú, nemajú byť vo vyhľadávaní.

---

## Kontrola pred odovzdaním

Spusti a vypíš výstup:

```
npm run lint
npm run build
git status --short
git diff --stat
```

Musí platiť **všetko** z tohto zoznamu:

- [ ] `npm run lint` prejde bez chýb a bez warningov
- [ ] `npm run build` prejde bez chýb
- [ ] `git status --short` ukazuje **iba 17 nových súborov** (plus known untracked `.pptx`)
- [ ] `git diff --stat` je **prázdny** — žiadny sledovaný súbor nie je zmenený
- [ ] `package.json` a `package-lock.json` sú nezmenené
- [ ] `src/middleware.ts` je nezmenený
- [ ] `prisma/schema.prisma` je nezmenený
- [ ] v build outpute sa objavili nové routes `/klub`, `/sprava`, `/prihlasenie`, …
- [ ] všetkých 14 pôvodných verejných routes je v build outpute stále prítomných
- [ ] žiadna nová závislosť

Ak ktorýkoľvek bod neplatí — **nepokračuj a napíš mi to.**

---

## Formát reportu

```
## 1. VYTVORENÉ SÚBORY
   zoznam s cestami, počet

## 2. VÝSTUP KONTROL
   lint · build (vrátane tabuľky routes) · git status --short · git diff --stat

## 3. CHECKLIST
   všetkých 11 bodov vyššie s ✅ / ❌

## 4. RIZIKÁ
   čokoľvek, čo ťa pri práci zarazilo

## 5. NÁVRH COMMITU
   jedna riadková commit message, NEcommituj

## 6. OTÁZKY
   max 3
```

---

## Ukončenie

Po reporte **zastav**. Necommituj. Nespúšťaj `git add`. Nezačínaj Etapu D.
Čakaj na moje písomné schválenie.

Ak by ťa niečo nútilo zmeniť existujúci súbor — **zastav a opýtaj sa.**
Neexistuje dôvod, prečo by táto etapa mala meniť čokoľvek existujúce.
