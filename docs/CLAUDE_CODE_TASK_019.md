# CLAUDE_CODE_TASK_019 — H2c: členská zóna ako lokálna appka (port MAXPERFORM)

4. 8. 2026 · nová vetva `feat/klub-lokalne` z aktuálneho `main` (po merge #32)

Rozhodnutie majiteľa: **tréningové dáta žijú v prehliadači člena, nie na serveri.**
Server rieši **iba scoreboard a mesačnú výzvu** (etapa H3).

Toto je **port MAXPERFORMu**, nie nová implementácia. Zdroj je na disku:
`Pracovná plocha\Ap\src` — číta sa, neupravuje. Referencia modelu a vzorcov:
`docs/MAXPERFORM_VZOR.md`.

---

## Prečo takto

Doterajší postup robil serverový round-trip pri každom kliknutí. Cez Supabase
Free pooler to padalo (`Server has closed the connection`) a bolo pomalé.
MAXPERFORM je svižný preto, že na server nechodí vôbec.

| | Doteraz | Po tejto etape |
| --- | --- | --- |
| úprava plánu | server action pri každej zmene | v pamäti + `localStorage` |
| odškrtnutie série | server action | okamžite, bez siete |
| beh tréningu | DB | `localStorage`, prežije obnovenie aj výpadok |
| server sa použije | 30× za tréning | **0× za tréning** |

---

## Rozsah čítania

Tento súbor · `docs/MAXPERFORM_VZOR.md` · `Pracovná plocha\Ap\src\**`
(**len na čítanie**) · `src/app/klub/**` · `src/app/globals.css` ·
`src/components/ui/**` · `src/server/auth.ts` · `src/components/Providers.tsx`

**Nerob audit repozitára.**

## ZAKÁZANÉ

- `prisma/schema.prisma`, akákoľvek migrácia, `DROP`, `TRUNCATE`
- `src/middleware.ts`, platobný kód, `src/app/admin/**`, `/sprava/**`
- upravovať čokoľvek v `Pracovná plocha\Ap` — je to cudzí projekt, len zdroj
- kopírovať vizuál MAXPERFORMu (farby, fonty) — Gladiator má vlastnú identitu
- portovať zdieľanie plánu cez URL/QR, kartu výsledku, demo dáta

### Povolený `npm install`

**Iba `recharts`** — grafy na Progrese, rovnako ako v MAXPERFORME, lenivo
načítané (`next/dynamic`, `ssr: false`). Nič iné neinštaluj.

---

## Časť A — čo sa z MAXPERFORMu portuje takmer doslovne

Tieto súbory prenes s minimálnymi úpravami (Slovenské názvy nechaj tak, ako sú
v zdroji, aby sa dalo porovnávať):

| Zdroj v `Ap/src` | Cieľ v Gladiatore | Zmena |
| --- | --- | --- |
| `types/index.ts` | `src/lib/klub/types.ts` | partie zosúlaď s enumom `Partia` |
| `utils/calc.ts` | `src/lib/klub/calc.ts` | bez zmeny |
| `utils/format.ts`, `utils/id.ts` | `src/lib/klub/` | bez zmeny |
| `storage/storage.ts` | `src/lib/klub/storage.ts` | **kľúč — pozri A1** |
| `state/AppContext.tsx` | `src/components/klub/AppProvider.tsx` | `'use client'` |
| `state/TimerContext.tsx`, `ToastContext.tsx` | `src/components/klub/` | `'use client'` |
| `components/workout/InlineStepper.tsx` | `src/components/klub/Stepper.tsx` | vizuál Gladiator |
| `components/dashboard/*`, `components/timer/*`, `components/charts/*` | `src/components/klub/` | vizuál Gladiator |

Logiku **nevymýšľaj nanovo.** Ak sa niečo dá skopírovať, skopíruj to.

### A1. Kľúč v localStorage — POZOR, toto MAXPERFORM riešiť nemusel

MAXPERFORM nemá účty, preto mu stačí jeden kľúč. Gladiator účty má, a na jednom
telefóne (recepcia, spoločný tablet) sa môžu prihlásiť dvaja ľudia.

**Kľúč musí byť viazaný na člena:** `gladiator:klub:v1:<clenId>`.

`clenId` prihláseného člena podaj z layoutu do `AppProvider` ako prop.
Pri odhlásení sa dáta **nemažú** (člen sa vráti a nájde ich), ale iný člen
na tom istom prehliadači **nesmie vidieť cudzie dáta**. Toto je bezpečnostná
požiadavka, nie detail.

---

## Časť B — obrazovky

Všetko pod `/klub`. Guard `requireClen()` zostáva **serverový, v layoute** —
`src/app/klub/layout.tsx` je server komponent, ktorý načíta člena a obalí
obsah klientskym `AppProvider`.

| Cesta | Obrazovka | Zdroj v MPM |
| --- | --- | --- |
| `/klub` | **Prehľad** | `pages/Dashboard.tsx` |
| `/klub/trening` | **Tréningy** (zoznam a editor plánov) | `TrainingList.tsx` + `TrainingEditor.tsx` |
| `/klub/trening/aktivny` | **Aktívny tréning** | `WorkoutActive.tsx` |
| `/klub/historia` | **História** (kalendár) | `History.tsx` |
| `/klub/historia/[id]` | **Detail + súhrn** | `HistoryDetail.tsx` |
| `/klub/progres` | **Progres** (grafy) | `Progress.tsx` |
| `/klub/rekordy` | **Rekordy** | `Records.tsx` |
| `/klub/casovac` | **Časovač** | `TimerPage.tsx` |
| `/klub/nastavenia` | **Nastavenia** | `Settings.tsx` |
| `/klub/vyzva` | **Výzva** — stub „Pripravuje sa" | H3 |

Spodná navigácia na mobile (ako `AppLayout.tsx` v MPM), bočná na desktope.

### B1. Editor plánu — toto doteraz nefungovalo

Musí ísť: pridať cvik, **pridať sériu s vlastnou váhou a opakovaniami**,
duplikovať poslednú sériu, odobrať sériu, zmeniť poradie cvikov, poznámka,
partia. Všetko **okamžite, bez siete**.

Nová séria sa predvyplní kópiou poslednej série toho cviku; ak žiadna nie je,
`8 opakovaní, 0 kg`.

### B2. Katalóg cvikov

Globálne cviky spravuje admin v `/sprava/cviky` (to zostáva na serveri).
Layout ich načíta **raz** (je ich pár) a podá do `AppProvider` ako zoznam
návrhov. Člen si smie napísať **aj vlastný názov cviku** — presne ako v MPM,
kde sú cviky voľný text.

Katalóg si ulož do `localStorage` ako cache, nech appka funguje aj offline.

### B3. Nastavenia

Týždenný cieľ, predvolený odpočinok, zvuk, **export a import JSON**,
vymazanie všetkých dát (s potvrdením).

**Export/import je jediná záloha, ktorú člen má** — v Nastaveniach to napíš
otvorene: „Dáta sú uložené len v tomto prehliadači. Vymazanie údajov
prehliadača ich odstráni. Zálohu si sprav exportom."

---

## Časť C — čo sa maže

Serverová vrstva tréningov z H2/H2b je nahradená:

- zmaž `src/server/actions/klub.ts`
- zmaž komponenty z H2b, ktoré nahrádza port (`AktivnyTrening.tsx`,
  `CasovacOdpocinku.tsx`, staré `Ring.tsx`, `Stepper.tsx`, `KlubNav.tsx`)
- staré `/klub/**` stránky prepíš

**Tabuľky v databáze NEMAŽ.** `TreningPlan`, `PlanCvik`, `PlanSeria`,
`Trening`, `Seria` zostanú prázdne a nepoužívané — sú rezervované pre neskoršiu
synchronizáciu. Rovnaký prístup ako pri `Permanentka` / `QRToken` vo Fáze 2.
**Schému nemeníš, migráciu netvoríš.**

---

## Časť D — vzhľad a použiteľnosť

Funkčne identické s MAXPERFORMom, vizuálne Gladiator.

- **Farby len z tokenov** `globals.css`: čierna `#0A0A0A`, antracit `#1A1A1A`,
  zlatá `#D4AF37`.
- **Nadpisy a štítky uppercase**, Oswald, kondenzovaný.
- **Veľké číslice** pri objeme, váhe, čase, sérii dní — tabuľkové
  (`font-variant-numeric: tabular-nums`), aby neposkakovali.
- **iOS:** `inputMode="decimal"` pri váhe, `"numeric"` pri opakovaniach;
  polia prijímajú **čiarku aj bodku**; `font-size` vstupov **min. 16 px**
  (inak Safari pri fokuse zoomne); `env(safe-area-inset-bottom)` pri spodnej
  navigácii a časovači.
- **Dotykové ciele min. 44 × 44 px.** Odškrtnutie série musí ísť palcom.
- Animácie pod existujúcim `MotionConfig reducedMotion="user"`.
- Každé tlačidlo a pole má `aria-label`.

---

## Zastavenia

Zastav a nahlás, ak:

- by si potreboval zmeniť schému alebo spustiť migráciu
- by si potreboval iný balík než `recharts`
- sa `localStorage` nedá viazať na `clenId` bez zásahu do guardu
- build vyžaduje bežiacu databázu

---

## Kontrola pred reportom

- `tsc --noEmit` ✓ · `npm run lint` ✓ · `npm run build` ✓ (uveď počet stránok)
- `curl` bez prihlásenia: `/klub`, `/klub/trening`, `/klub/historia`,
  `/klub/progres`, `/klub/nastavenia` → 307 na `/prihlasenie`
- **`npm run dev` a over v prehliadači, čo sa dá bez prihlásenia** — ak sa
  prihlásiť nevieš, napíš to, ale neoznačuj neoverené riadky ✅

## Manuálna tabuľka overenia (preklikne Maxim)

| # | Krok | Očakávané |
| --- | --- | --- |
| 1 | plán „Nohy": cvik + 3 série 60×10, 80×5, 80×5 | uloží sa okamžite, bez čakania na server |
| 2 | obnov stránku (F5) | plán tam je |
| 3 | vypni sieť (DevTools offline) a uprav plán | funguje ďalej, žiadna chyba |
| 4 | „Začať tréning" z plánu | série predgenerované, žiadna odškrtnutá |
| 5 | odškrtni sériu | okamžite, naskočí odpočinok |
| 6 | zmeň váhu počas tréningu, obnov stránku | tréning aj zmena držia |
| 7 | „Ukončiť" s 0 odškrtnutými | odmietne s hláškou |
| 8 | „Ukončiť" s 3 zo 6 | súhrn: objem, nové rekordy |
| 9 | História | kalendár označí dnešok, detail sedí |
| 10 | Rekordy | 1RM = `hmotnosť × (1 + opak/30)` |
| 11 | Progres | grafy sa vykreslia, nepadajú pri prázdnych dátach |
| 12 | Nastavenia → export JSON → vymazať dáta → import | dáta sa vrátia |
| 13 | **odhlás sa, prihlás druhým účtom** | **nevidí dáta prvého člena** |
| 14 | celé na iPhone | palcom, číselná klávesnica, nič nezoomuje |

Riadok 13 je bezpečnostný. Riadok 14 je dôvod, prečo to celé robíme.

## Formát reportu

1. Tabuľka 14 riadkov — **neoznačuj ✅ nič, čo si nespustil**
2. Zoznam portovaných, nových a zmazaných súborov
3. Ktoré súbory sú kópia z MAXPERFORMu a čo si v nich menil
4. Počet stránok v builde + vysvetlenie rozdielu oproti 43
5. Potvrdenie, že schéma ani migrácie sa nezmenili
6. Výsledky kontrol

**Commitni, pushni, otvor PR do `main`.**
PR nemení schému ani `middleware.ts` — ak sú CI zelené, **môžeš ju zmergovať
sám** (SPOLUPRACA §1). Manuálnu tabuľku preklikne Maxim.
