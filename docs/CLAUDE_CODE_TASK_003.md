# CLAUDE_CODE_TASK_003 — Etapa D: PWA manifest a ikony

**Verzia 2.0 — finálna** · 2026-07-30
Predchádza: TASK_002 (Etapa C) · Stav: pripravená, **zatiaľ nespúšťať**

---

## 0. Vstupné podmienky — over PRED začatím

Ak ktorákoľvek neplatí, **zastav a napíš mi to.** Nič neopravuj sám.

- [ ] TASK_002 má **vlastný samostatný commit** so správou
      `feat(pwa): add auth, member and admin route skeletons`
- [ ] v tom commite **nie je** súbor `Gladiator_Gym_Community_Cult_Proposal_RESEARCH(2).pptx`
- [ ] `git status --short` ukazuje **iba** ten známy untracked `.pptx` a nič iné
- [ ] `git diff --stat` je prázdny

### Vetvenie

TASK_002 aj TASK_003 patria na **feature vetvu**, nie na `main`.

```
git checkout -b feat/pwa-shell
```

Ak už TASK_002 skončil na `main` a **nie je pushnutý**, prenes ho na feature
vetvu. Ak **už pushnutý je**, zastav a opýtaj sa — nepretáčaj históriu sám.

Dôvod: `main` je produkčná vetva. Placeholder stránky a nová PWA majú prejsť
Vercel Preview, nie produkciou.

---

## 1. Cieľ

Urobiť aplikáciu inštalovateľnou na plochu telefónu.
**Bez service workera** (rozhodnutie D-06).

Etapa je navrhnutá tak, že **nemení ani jeden existujúci súbor.**
Next.js 15 App Router si `<link>` tagy vygeneruje sám z konvenčných súborov.

---

## 2. ZAKÁZANÉ

- **`src/app/layout.tsx` — NEMENIŤ.** `viewport.themeColor` tam už je
  a je správny (`#0a0a0a`).
- **Žiadny service worker.** Žiadny `sw.js`, `next-pwa`, `serwist`, `workbox`.
- **`npm install` — ZAKÁZANÝ.**
- `src/middleware.ts`, `prisma/schema.prisma`, `src/app/globals.css`,
  `src/app/icon.svg` — nedotýkať sa.
- **Nepripájať Supabase.** Žiadny Supabase klient, kľúč ani env premenná.
- **Nemeniť žiadne produkčné nastavenie Vercelu ani Supabase.**
- **Nespúšťať produkčný deploy z `main`.**
- Žiadny existujúci súbor sa nemení, nepresúva ani nemaže.
- Necommitovať bez schválenia.

---

## 3. Ikony — over PRED kopírovaním

Dostal si štyri hotové PNG súbory. **Negeneruj ich, neupravuj, nekonvertuj,
nekomprimuj.**

Najprv over, že sedia s touto tabuľkou:

| Súbor | Rozmer | Formát | Alfa kanál | sha256 (prvých 16) |
| --- | --- | --- | --- | --- |
| `icon-192.png` | 192 × 192 | PNG, RGB | **nemá** | `c9aff9fda0b9906f` |
| `icon-512.png` | 512 × 512 | PNG, RGB | **nemá** | `7d4814567a56fa2c` |
| `icon-maskable-512.png` | 512 × 512 | PNG, RGB | **nemá** | `66435f63dab50c8f` |
| `apple-touch-icon.png` | 180 × 180 | PNG, RGB | **nemá** | `9ab5140c1143259a` |

Overenie:

```
python -c "from PIL import Image; [print(f, Image.open(f).size, Image.open(f).mode) for f in ['icon-192.png','icon-512.png','icon-maskable-512.png','apple-touch-icon.png']]"
sha256sum icon-192.png icon-512.png icon-maskable-512.png apple-touch-icon.png
```

Ak Pillow nie je nainštalovaný, **neinštaluj ho** — použi `file` alebo
`identify`, prípadne to over ručne vo vlastnostiach súboru.

### Bezpečná stredová zóna — platí IBA pre maskable

Android orezáva maskable ikonu do tvaru, ktorý si zvolí výrobca telefónu
(kruh, kvapka, štvorec so zaoblením). Obsah preto musí byť v strede, s rezervou.

**Overené pri tvorbe:** obsah `icon-maskable-512.png` má polomer **195 px**
od stredu, limit je **205 px** (80 % z 512 delené dvomi). Vyhovuje.

Ikony s `purpose: any` (`icon-192`, `icon-512`, `apple-touch-icon`) túto zónu
zámerne presahujú — **to je správne**, tie sa zobrazujú tak, ako sú, a neorezávajú
sa. Nepokúšaj sa ich „opraviť".

Absencia alfa kanála je tiež zámer: maskable musí byť nepriehľadná a Apple
priehľadnosť pri touch ikone neodporúča.

**Ak čokoľvek z tejto sekcie nesedí — zastav a nič neupravuj.**

---

## 4. Súbory na vytvorenie (5)

### Ikony — iba skopírovať na tieto cesty

```
public/icons/icon-192.png
public/icons/icon-512.png
public/icons/icon-maskable-512.png
src/app/apple-icon.png            ← apple-touch-icon.png premenovaný
```

`src/app/apple-icon.png` je konvencia Next.js — vygeneruje
`<link rel="apple-touch-icon">` automaticky, do layoutu sa nič nepíše.

### `src/app/manifest.ts`

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

**`orientation` je zámerne vynechané** — appka má fungovať na výšku aj na šírku.
Nepridávaj ho.

`scope: '/'` a `id: '/klub'` **ponechaj presne tak, ako sú.**

Ak TypeScript na niektorom poli protestuje (napr. `categories` nemusí byť
v type definícii tvojej verzie Next), **to pole vynechaj** — neobchádzaj to cez
`as any` ani `@ts-expect-error`. Napíš do reportu, ktoré si vynechal.

---

## 5. Kontrola

### Automatická

```
npm run lint
npm run build
git status --short
git diff --stat
```

- [ ] `npm run lint` bez chýb a warningov
- [ ] `npm run build` bez chýb
- [ ] v build outpute pribudol route `/manifest.webmanifest`
- [ ] `git diff --stat` prázdny — žiadny sledovaný súbor nezmenený
- [ ] `git status --short` ukazuje presne **5 nových súborov** (plus známy `.pptx`)
- [ ] `package.json` a `package-lock.json` nezmenené
- [ ] `src/app/layout.tsx` nezmenený
- [ ] žiadna nová závislosť
- [ ] žiadny súbor s `sw`, `service-worker` alebo `workbox` v názve

### HTTP odpoveď manifestu

Pri bežiacom `npm run dev`:

```
curl -i http://localhost:3000/manifest.webmanifest
```

- [ ] status **200**
- [ ] `Content-Type` je `application/manifest+json`
- [ ] telo je platný JSON a **neobsahuje** kľúč `orientation`
- [ ] `start_url` je `/klub`, `scope` je `/`, `id` je `/klub`

Vypíš celé telo odpovede aj hlavičky.

### Manifest link v HTML

```
curl -s http://localhost:3000/ | grep -i manifest
curl -s http://localhost:3000/ | grep -i apple-touch-icon
```

- [ ] Next.js **sám** vložil `<link rel="manifest" ...>` do `<head>`
- [ ] Next.js **sám** vložil `<link rel="apple-touch-icon" ...>`
- [ ] ani jeden z nich nie je natvrdo napísaný v `layout.tsx`

Vypíš nájdené riadky doslova.

### Chrome DevTools → Application

- [ ] **Manifest** — načíta sa, názov „Gladiator Gym", žiadna chyba
- [ ] **Manifest → Icons** — všetky tri sa načítajú, žiadna 404
- [ ] Chrome nehlási varovanie o chýbajúcej maskable ikone
- [ ] **Service Workers** — zoznam **prázdny** (správne)
- [ ] `/cennik` a `/admin/objednavky` vyzerajú a fungujú ako predtým

Vypíš doslovne každé varovanie, ktoré Chrome zobrazí.

---

## 6. Po kontrolách

Ak všetko prejde:

1. Navrhni commit message. **Necommituj**, čakaj na schválenie.
2. Po mojom schválení commitni na vetvu `feat/pwa-shell` — **samostatným
   commitom**, oddelene od TASK_002.
3. Potom môžeš navrhnúť push vetvy a **Vercel Preview** deploy.
   **Produkčný deploy z `main` je zakázaný.**

---

## 7. Formát reportu

```
## 0. VSTUPNÉ PODMIENKY   4 body + stav vetvy
## 1. OVERENIE IKON       rozmery · formát · alfa · sha256 · bezpečná zóna
## 2. VYTVORENÉ SÚBORY
## 3. VÝSTUP KONTROL      lint · build · git status · git diff --stat
## 4. HTTP MANIFEST       celé hlavičky + telo
## 5. HTML LINKY          nájdené riadky doslovne
## 6. CHROME DEVTOOLS     výsledok + doslovné varovania
## 7. CHECKLIST           všetky body s ✅ / ❌
## 8. VYNECHANÉ POLIA     ak si niektoré pole manifestu vynechal, a prečo
## 9. RIZIKÁ
## 10. NÁVRH COMMITU      jedna veta, NEcommituj
## 11. OTÁZKY             max 3
```

---

## 8. Ukončenie

Po reporte **zastav**. Necommituj. Nepushuj. Nezačínaj Etapu E.
Ak by ťa čokoľvek nútilo zmeniť existujúci súbor alebo doinštalovať balík —
**zastav a opýtaj sa.**
