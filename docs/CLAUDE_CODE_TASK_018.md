# CLAUDE_CODE_TASK_018 — H2b: tréning podľa vzoru MAXPERFORM

4. 8. 2026 · nová vetva `feat/trening-mpm-parita` z aktuálneho `main`

Cieľ: tréningový tok má fungovať **identicky ako MAXPERFORM**, len s ukladaním
do databázy namiesto `localStorage`. Vizuál zostáva Gladiator.

Výzva, scoreboard a grafy progresu **nie sú v tomto zadaní** — prídu v H3.

---

## Rozsah čítania

`docs/CLAUDE_CODE_TASK_018.md` (tento súbor), **`docs/MAXPERFORM_VZOR.md`
(povinné, obsahuje celý model aj vzorce)**, `prisma/schema.prisma`,
`src/app/klub/**`, `src/server/actions/klub.ts`, `src/server/auth.ts`,
`src/components/ui/**`, `src/components/klub/**`, `src/lib/validate.ts`,
`src/app/globals.css`.

Zdrojáky MAXPERFORMu otvárať **nemusíš** — všetko podstatné je vo vzore.
Ak by si predsa potreboval detail, sú v `Pracovná plocha\Ap\src`, len na čítanie.

**Nerob audit repozitára.**

## ZAKÁZANÉ

- `src/middleware.ts`, platobný kód, `src/app/admin/**`, `/sprava/**`
- `prisma migrate reset`, `DROP TABLE`, `TRUNCATE`
- **editovať už aplikované migrácie** — vždy len nová
- `npm install` **okrem** výslovne povolených balíkov (žiadne nie sú —
  časovač aj kruhový ukazovateľ sa robia bez knižnice; grafy sú H3)
- kopírovať vizuál MAXPERFORMu, pridávať farby mimo tokenov v `globals.css`
- zdieľanie plánu cez URL/QR, karta výsledku, demo dáta, export/import JSON

---

## Bezpečnostné pravidlo (platí v každom riadku)

**RLS policies je nula — databáza nechráni nič.** Jediná ochrana je aplikačná:

- každá server action začína `await requireClen()`
- filtruje sa **vždy** cez `clenId` prihláseného člena, nikdy cez ID z `formData`
- úpravy a mazanie cez `updateMany` / `deleteMany` s `clenId` vo `where`
  + kontrola `res.count`
- `Seria` sa smie zapísať až po overení, že jej `Trening` patrí prihlásenému členovi
- `PlanSeria` až po overení, že jej `PlanCvik → TreningPlan` patrí členovi

---

## Časť A — migrácia schémy

### A1. Najprv over, že sa nič nestratí

```sql
select
 (select count(*) from public."TreningPlan") as plany,
 (select count(*) from public."PlanCvik")    as plan_cviky,
 (select count(*) from public."Trening")     as treningy,
 (select count(*) from public."Seria")       as serie;
```

**Ak je ktorékoľvek číslo väčšie ako 0 → ZASTAV a nahlás.** Zadanie ráta
s prázdnymi tabuľkami. Nemaž dáta, aby si mohol pokračovať.

### A2. Zmeny v `prisma/schema.prisma`

**Nový model `PlanSeria`** — plánovaná séria s vlastnou váhou aj opakovaniami
(toto je jadro parity s MPM):

| Pole | Typ |
| --- | --- |
| `id` | `String @id @default(cuid())` |
| `planCvikId` | `String`, relácia na `PlanCvik`, `onDelete: Cascade` |
| `poradie` | `Int` |
| `opakovania` | `Int` |
| `hmotnost` | `Decimal @db.Decimal(6, 2)` |
| `createdAt` / `updatedAt` | ako v ostatných modeloch |

Index `[planCvikId, poradie]`.

**`PlanCvik`** — odstráň `cielSerie` a `cielOpakovania`, pridaj `serie PlanSeria[]`
a voliteľnú `poznamka String?`. (Tabuľka je prázdna, `DROP COLUMN` je tu bezpečný
a povolený — inak by ostali mŕtve stĺpce.)

**`Seria`** — pridaj `dokoncena Boolean @default(true)`.
Predvolená `true` kvôli spätnej kompatibilite; aktívny tréning ju zakladá `false`.

**`Clen`** — pridaj predvoľby člena:

| Pole | Typ |
| --- | --- |
| `tyzdennyCiel` | `Int @default(3)` |
| `odpocinokSek` | `Int @default(90)` |
| `zvuk` | `Boolean @default(true)` |

**Nič iné v schéme nemeň.** `Rekord`, `Vyzva`, `VyzvaZapis` sa nedotýkaj —
sú pre H3.

### A3. Migrácia

Vygeneruj **novú** migráciu (`prisma migrate dev --name trening_mpm_parita`).

**Zastavenia:**

- ak `migrate dev` navrhne **reset** alebo hlási **drift** → ZASTAV, nič
  nepotvrdzuj, nahlás. Reset by zmazal testovacie účty.
- ak by chcel zmazať čokoľvek nad rámec `PlanCvik.cielSerie`
  a `PlanCvik.cielOpakovania` → ZASTAV.

Po aplikovaní over v DB, že migrácia je zapísaná a `finished_at` nie je null.

---

## Časť B — plány (`/klub/trening`)

Plán = **šablóna**. Člen si ho skladá sám; admin do plánov nezasahuje.

- zoznam **svojich** plánov (`TreningPlan.clenId` = jeho), vytvoriť, premenovať, zmazať
- v pláne: pridať cvik z katalógu globálnych cvikov
  (`Cvik` kde `clenId = null AND aktivny = true`), zmeniť poradie cvikov,
  voliteľná poznámka, odobrať cvik
- **v každom cviku zoznam plánovaných sérií** — každá má vlastné
  `opakovania` a `hmotnost`; pridať sériu, odobrať sériu, duplikovať poslednú
- predvyplnenie novej série: skopíruj poslednú sériu toho cviku
  (typicky sa opakuje rovnaká váha) — ak žiadna nie je, `10 opakovaní, 0 kg`

Formulár musí byť použiteľný **jednou rukou na telefóne**: hlavné tlačidlo
nesmie byť schované pod dlhým zoznamom (lepkavé dole alebo aj hore).

---

## Časť C — aktívny tréning

Toto je srdce parity. Postupuj podľa `MAXPERFORM_VZOR.md` §5.

### C1. Začatie

„Začať tréning" z plánu:

1. vytvorí `Trening` (`clenId`, `planId`, `nazov` = názov plánu, `zaciatok = now()`)
2. **predgeneruje `Seria` zo všetkých `PlanSeria` plánu** s `dokoncena = false`,
   so správnym `cvikId` a `poradie`

Naraz smie byť otvorený **najviac jeden** tréning (`koniec = null`). Ak už je,
„Začať" ho neduplikuje — ponúkne pokračovať v ňom.

Musí ísť začať aj **prázdny tréning bez plánu** (`planId = null`) — cviky aj
série sa pridávajú za behu.

### C2. Priebeh

- **lepkavá hlavička**: názov · `uplynutý čas · dokončené/všetky sérií` ·
  prúžok postupu. Čas tiká každú sekundu (klientsky, z `zaciatok`).
- **aktuálny cvik** = prvý cvik s nedokončenou sériou, vizuálne zvýraznený
- **odškrtnutie série** prepne `dokoncena` (obojsmerne) a **spustí odpočinok**
  na `Clen.odpocinokSek`
- `opakovania` a `hmotnost` sa dajú meniť **počas tréningu**
- dá sa pridať séria navyše aj cvik mimo plánu
- odchod na inú stránku tréning **neukončí**

### C3. Ukončenie

- **Zrušiť** aj **Ukončiť** majú potvrdzovací dialóg
- ukončiť s nulou dokončených sérií **nejde** — hláška
  „Označ aspoň jednu dokončenú sériu."
- pri ukončení: `koniec = now()` a **zmaž všetky `Seria` s `dokoncena = false`**
  (MPM nedokončené série do histórie nedáva)
- „Zrušiť" zmaže celý `Trening` aj jeho série
- po ukončení presmeruj na **detail tréningu so súhrnom**

### C4. Časovač odpočinku

Bez knižnice. Plávajúci pruh dole:

- predvoľby 30 / 60 / 90 / 120 s + hodnota z `Clen.odpocinokSek`
- pauza, reset, ±15 s
- zvukové upozornenie cez Web Audio API, len ak `Clen.zvuk`
- beží ďalej pri prechode medzi stránkami v rámci `/klub`
- **rešpektuje `prefers-reduced-motion`** (existujúci `MotionConfig`)

---

## Časť D — súhrn a história

### D1. Detail tréningu (`/klub/historia/[id]`)

Dátum, názov, **trvanie**, **objem**, zoznam cvikov a ich dokončených sérií.
Keď sa naň príde hneď po ukončení, zobraz **súhrn**:

- celkový objem
- **nové osobné rekordy** dosiahnuté v tomto tréningu (`MAXPERFORM_VZOR.md` §3)
- porovnanie s posledným tréningom toho istého plánu

### D2. História (`/klub/historia`)

**Mesačný kalendár** s vyznačenými odtrénovanými dňami + zoznam tréningov pod
ním (dátum, názov, trvanie, počet sérií, objem). Preklik na detail.

### D3. Rekordy

Zostávajú v Histórii (samostatnú stránku nerobíme). Tabuľka pre každý cvik:
**odhad 1RM**, **najťažšia séria**, **najlepší objem série** — presne podľa
`MAXPERFORM_VZOR.md` §3. Radenie zostupne podľa 1RM.

### D4. Prehľad (`/klub`)

- **kruhový ukazovateľ týždenného cieľa** (`Clen.tyzdennyCiel`) — čisté SVG,
  žiadna knižnica
- séria aktívnych dní (streak podľa vzoru — dnes alebo včera)
- objem za 30 dní
- pásik konzistentnosti po–ne
- posledný tréning
- ak beží tréning → výrazné **„Pokračovať v tréningu"**
- ak člen nemá nič → zrozumiteľný prázdny stav s „Začať tréning", **nie nuly**

### D5. Nastavenia (`/klub/nastavenia`)

Týždenný cieľ, predvolený odpočinok, zvuk. Píše do `Clen`. Nič iné.

---

## Časť E — vzhľad a použiteľnosť

Toto je požiadavka majiteľa, nie kozmetika. Väčšina členov bude appku používať
**na telefóne, medzi sériami, jednou rukou.**

- **Veľké číslice.** Objem, váha, čas, počet sérií — Oswald, veľké, tabuľkové
  číslice (`font-variant-numeric: tabular-nums`), aby čísla neposkakovali.
- **Nadpisy a štítky uppercase** — Oswald, kondenzovaný, ako na zvyšku webu.
- **iOS:** `inputMode="decimal"` pri váhe, `inputMode="numeric"` pri
  opakovaniach; polia prijímajú **čiarku aj bodku**; `font-size` vstupov
  **minimálne 16 px**, inak Safari pri fokuse zoomne; rešpektuj
  `env(safe-area-inset-bottom)` pri spodnej lište a časovači.
- **Dotykové ciele minimálne 44 × 44 px.** Odškrtnutie série musí ísť palcom
  bez mierenia.
- Číselné polia rob ako **stepper `− [pole] +`** podľa `MAXPERFORM_VZOR.md` §5.
- Každé tlačidlo a pole má `aria-label`.
- Farby len z tokenov v `globals.css`. Animácie jemné, pod existujúcim
  `MotionConfig`.

---

## Kontrola pred reportom

- `npx prisma validate` ✓
- `tsc --noEmit` ✓
- `npm run lint` ✓
- `npm run build` ✓ — uveď skutočný počet stránok a rozdiel oproti 42
- `curl` bez prihlásenia: `/klub`, `/klub/trening`, `/klub/historia`,
  `/klub/nastavenia` → 307 na `/prihlasenie`

## Manuálna tabuľka overenia (preklikne Maxim)

| # | Krok | Očakávané |
| --- | --- | --- |
| 1 | plán: 2 cviky, prvý 3 série s rôznymi váhami | uloží sa presne, poradie sedí |
| 2 | zmena poradia cvikov a odobratie série | prejaví sa a drží po obnovení |
| 3 | „Začať tréning" | série sú predgenerované z plánu, všetky neodškrtnuté |
| 4 | odškrtni sériu | spustí sa odpočinok, prúžok postupu narastie |
| 5 | zmeň váhu počas tréningu | uloží sa, po obnovení drží |
| 6 | odíď na Prehľad a vráť sa | tréning beží ďalej, čas sedí |
| 7 | „Ukončiť" s 0 odškrtnutými | odmietne s hláškou |
| 8 | „Ukončiť" s 3 odškrtnutými zo 6 | v DB ostanú 3 série, súhrn ukáže objem a nové rekordy |
| 9 | História | kalendár označí dnešok, detail sedí |
| 10 | Rekordy | 1RM sedí s `hmotnosť × (1 + opak/30)` |
| 11 | Prehľad | ring, streak = 1, objem za 30 dní sedí |
| 12 | Nastavenia: cieľ 5, odpočinok 60 s | ring a časovač to rešpektujú |
| 13 | druhý účet (CLEN) | **nevidí cudzie plány ani tréningy** |
| 14 | celé na telefóne / iOS | ovládateľné palcom, klávesnica číselná, nič nezoomuje |

Riadok 13 je bezpečnostný — ak zlyhá, je to vážna chyba.

## Formát reportu

1. Tabuľka 14 riadkov — **neoznačuj ✅ nič, čo si nespustil**
2. Výsledok kontroly A1 (počty riadkov pred migráciou)
3. Názov migrácie + potvrdenie, že je zapísaná a `finished_at` nie je null
4. Zoznam vytvorených, zmenených a zmazaných súborov
5. Počet stránok v builde + vysvetlenie rozdielu
6. Ako si riešil `Decimal` aritmetiku a časovač
7. Výsledky štyroch kontrol

**Commitni, pushni, otvor PR do `main`. NEMERGUJ** — PR mení
`prisma/schema.prisma`, merguje Maxim (SPOLUPRACA §1).
