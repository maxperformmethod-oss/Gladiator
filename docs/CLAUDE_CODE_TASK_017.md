# CLAUDE_CODE_TASK_017 — Etapa H2: členské obrazovky

3. 8. 2026 · nová vetva `feat/klub-treningy` z **aktuálneho `main`** (základ potvrdí Maxim)

Cieľ: po tejto etape si člen vie zapísať tréning a vidieť, ako sa zlepšuje.
Až tu appka po prvý raz dáva zmysel používať.

---

## Predpoklad

**PR #30 (H1) musí byť v `main`.** Ak nie je, ZASTAV a nahlás — bez tabuliek
`Trening` a `Seria` sa H2 postaviť nedá. Vetvu zakladaj z aktuálneho `main`,
nie z `feat/training-model` (žiadne stacked PR — SPOLUPRACA §5).

## Rozsah čítania

`docs/CLAUDE_CODE_TASK_017.md` (tento súbor), `docs/ETAPA_H_KONCEPT.md`,
`prisma/schema.prisma` (len čítanie), `src/app/klub/**`, `src/app/sprava/**`,
`src/server/auth.ts`, `src/server/actions/treningy.ts`, `src/components/ui/**`,
`src/lib/validate.ts`. **Nerob audit repozitára.**

## ZAKÁZANÉ

- `prisma/schema.prisma` — **H2 nemení schému.** Ak zistíš, že niečo bez zmeny
  schémy nejde, ZASTAV a nahlás; nemeň ju.
- nová migrácia, `prisma migrate reset`, `DROP`, `TRUNCATE`
- `src/middleware.ts`, platobný kód, `src/app/admin/**`
- `npm install` — vystač si s tým, čo je v projekte (žiadna knižnica na grafy;
  grafy sú H3)
- merge akejkoľvek PR
- nové farby mimo tokenov v `globals.css`; obchádzanie `MotionConfig`

---

## Bezpečnostné pravidlo, ktoré platí v každom riadku tejto etapy

**RLS policies je nula.** Databáza nechráni nič. Jediná ochrana dát je
aplikačná vrstva. Preto:

- každá server action začína `await requireClen()` (alebo `requireAdmin()`)
- **každý zápis aj čítanie cudzích dát je filtrované cez `clenId` prihláseného
  člena** — nikdy nie cez ID z `formData`
- pri úprave/mazaní používaj `updateMany` / `deleteMany` s `where` obsahujúcim
  `clenId`, a over `res.count`; nikdy `update({ where: { id } })` samotné
- `Seria` sa viaže na `Trening` — over, že ten tréning patrí prihlásenému členovi,
  než čokoľvek zapíšeš

Ak niektorá akcia toto pravidlo nespĺňa, je to chyba, nie detail.

---

## Časť A — rozcestník a odstránenie `/sprava/plany`

### A1. Rozhodnutie majiteľa zo 4. 8. 2026 — plány patria členom, nie adminovi

**Admin plány nespravuje.** Člen si ich zakladá sám v appke, ako vo vzore
MAXPERFORM. Admin má v celej aplikácii **dve** úlohy:

1. udržiavať katalóg **globálnych cvikov** (`/sprava/cviky`)
2. **schvaľovať** — výsledky vo výzvach a v scoreboarde (etapa H3)

Nič viac. `/sprava/plany` bola nedorozumenie z H1 a **ruší sa**.

### A2. Zmazať `/sprava/plany`

- zmaž `src/app/sprava/plany/page.tsx`
- zmaž `src/components/sprava/PlanForm.tsx`
- zmaž akciu `vytvorPlan` zo `src/server/actions/treningy.ts` (zvyšok súboru —
  `vytvorCvik`, `upravCvik`, `slugify` — nechaj)
- over, že na `vytvorPlan` ani `PlanForm` nikde nezostala referencia

Dáta sa nestrácajú: v `TreningPlan` aj `PlanCvik` je **0 riadkov** (overené
v DB 4. 8.). **Schému nemeníš** — tabuľky zostávajú, budú ich napĺňať členovia.

### A3. `/sprava` — rozcestník

Dnes je tam len „Pripravuje sa." a **na `/sprava/cviky` sa nedá preklikať** —
Maxim musí adresu písať ručne. Oprav to.

`src/app/sprava/page.tsx`: zoznam odkazov. **Cviky** je živý odkaz; **Členovia**,
**Výzvy**, **Výsledky** zobraz ako neaktívne s poznámkou „Pripravuje sa".
Použi existujúce `Card` / `ButtonLink`, žiadne nové komponenty.

### A4. `/klub` — navigácia členskej zóny

Podľa `ETAPA_H_KONCEPT.md` sú obrazovky štyri: **Prehľad · Tréning · História ·
Výzva**. Dnešné stubby `/klub/profil`, `/klub/rebricek`, `/klub/rekordy`
konceptu nezodpovedajú (Rekordy patria do Histórie, Progres do Prehľadu).

- `/klub` = **Prehľad** (časť D)
- `/klub/trening` = **Tréning** (časť B) — nová
- `/klub/historia` = **História** (časť C) — nová
- `/klub/vyzva` = **Výzva** — ponechaj ako stub „Pripravuje sa" (obsah je H3)
- zmaž stubby `/klub/profil`, `/klub/rebricek`, `/klub/rekordy`
- navigáciu daj do `src/app/klub/layout.tsx` (pod guardom `requireClen`),
  aktívna položka nech je vizuálne odlíšená

**Počet stránok v builde sa tým zmení.** Nepredpokladám presné číslo — v reporte
uveď skutočný počet a rozdiel oproti 44 vysvetli.

---

## Časť B — `/klub/trening`

### B1. Plány člena

**Toto je jediné miesto v aplikácii, kde vznikajú plány.** Člen vidí svoje
(`TreningPlan` s `clenId` = jeho) a vie si založiť nový: názov + výber
z aktívnych globálnych cvikov (`Cvik` kde `clenId = null AND aktivny = true`),
pri každom `cielSerie` a `cielOpakovania`.

Ďalej musí vedieť plán **premenovať** a **zmazať** (kaskádne zmaže `PlanCvik`;
`Trening.planId` je `SET NULL`, takže odcvičené tréningy prežijú). Bez toho je
prvý omylom založený plán navždy na obrazovke.

Formulár nech je zrozumiteľný: zaškrtávacie políčko cviku a polia
`série × opakovania` musia byť viditeľne prepojené a tlačidlo **Vytvoriť plán**
nesmie byť schované pod dlhým zoznamom — daj ho aj hore, alebo nechaj lepkavé.

Vlastné cviky člena (`Cvik.clenId` = jeho) schéma umožňuje. **Do H2 ich nedávaj** —
zbytočne rozširujú rozsah. Stĺpec nechaj pripravený.

### B2. Priebeh tréningu

| Akcia | Čo sa stane |
| --- | --- |
| **Začať tréning** | vytvorí `Trening` (`clenId`, `planId` alebo `null`, `nazov`, `zaciatok = now()`, `koniec = null`) |
| **Pridať sériu** | vytvorí `Seria` (`treningId`, `cvikId`, `hmotnost`, `opakovania`, `poradie`) |
| **Ukončiť tréning** | nastaví `koniec = now()` |

Pravidlá:

- **naraz smie byť otvorený najviac jeden tréning** (`koniec = null`). Ak už
  jeden otvorený je, „Začať tréning" ho neduplikuje — ponúkne pokračovať v ňom.
- pri otvorenom tréningu sa zobrazujú už zapísané série a formulár na ďalšiu
- ak má tréning plán, predvyplň cviky z `PlanCvik` v poradí; člen môže pridať
  sériu aj k cviku mimo plánu
- **žiadne stopky na obrazovke** — dĺžka sa dopočíta zo `zaciatok`/`koniec`
- `hmotnost` je `Decimal(6,2)` — validuj rozsah (0–999.99) a `opakovania` (1–500)
- séria sa dá zmazať, kým tréning nie je ukončený (`deleteMany` s kontrolou
  vlastníctva cez `Trening.clenId`)

### B3. Súbory

- `src/server/actions/klub.ts` — nový: `vytvorMojPlan`, `premenujPlan`,
  `zmazPlan`, `zacniTrening`, `pridajSeriu`, `zmazSeriu`, `ukonciTrening`
- `src/app/klub/trening/page.tsx`
- `src/components/klub/*` — formuláre podľa vzoru `src/components/sprava/CvikForm.tsx`

Server actions používaj s `useActionState` a typom `SpravaState` (alebo
ekvivalentným) — rovnaký vzor ako `treningy.ts`, neprinášaj nový.

---

## Časť C — `/klub/historia`

### C1. Odcvičené tréningy

Zoznam ukončených tréningov člena, od najnovšieho: dátum, názov, **dĺžka**
(`koniec − zaciatok`), počet sérií, **objem** (Σ `opakovania × hmotnost`).
Rozkliknutím sa zobrazia série.

### C2. Osobné rekordy — POČÍTANÉ, nie zapísané

Za každý cvik, ktorý má člen odcvičený, zobraz:

| Ukazovateľ | Vzorec |
| --- | --- |
| Najťažšia séria | `max(hmotnost)` |
| Odhad 1RM (Epley) | `max(hmotnost × (1 + opakovania / 30))` |
| Najlepší objem série | `max(opakovania × hmotnost)` |

**Nezapisuj to nikam** — počíta sa pri každom zobrazení. Model `Rekord` v schéme
existuje, ale **v H2 ho nepoužívaš** (je pre výzvy, H3).

`hmotnost` je Prisma `Decimal`. **Nepočítaj s ňou cez `Number` bez kontroly
presnosti** — buď použi `Decimal` API, alebo prepočítaj v SQL cez
`prisma.$queryRaw` a výsledok zaokrúhli na 1 desatinné miesto pri zobrazení.
Uveď v reporte, ktorý spôsob si zvolil a prečo.

---

## Časť D — `/klub` (Prehľad)

Bez grafov (tie sú H3). Štyri dlaždice:

| Dlaždica | Obsah |
| --- | --- |
| Tréningy tento týždeň | počet ukončených tréningov od pondelka |
| Séria dní | koľko dní po sebe má člen aspoň jeden tréning |
| Objem za 30 dní | Σ `opakovania × hmotnost` za posledných 30 dní |
| Posledný tréning | dátum, názov, dĺžka, objem |

Ak člen nemá žiadny tréning, zobraz zrozumiteľný prázdny stav s odkazom na
„Začať tréning" — **nie prázdne nuly.**

Tlačidlo **Správa** pre admina a **Odhlásiť sa** zachovaj.

---

## Obsah a vizuál

- Žiadne vymyslené fakty. Texty krátke, sebavedomé, bez gýču.
- Len tokeny z `globals.css` — čierna / antracit / zlatá.
- Mobile-first. Zápis série musí byť pohodlný na telefóne **jednou rukou**
  (veľké dotykové ciele, číselné klávesnice cez `inputMode="decimal"` / `"numeric"`).
- Animácie jemné, cez `framer-motion` pod existujúcim `MotionConfig`.
- Stránky pod `/klub` sú dynamické (čítajú DB) — over, že build nevyžaduje
  bežiacu databázu.

---

## Zastavenia

Zastav a nahlás, ak:

- PR #30 nie je v `main`
- niečo by si potreboval doriešiť zmenou schémy
- `Decimal` aritmetika nedáva zmysluplné výsledky
- build spadne na chýbajúcej databáze
- počet stránok sa zmení inak, než vieš vysvetliť

---

## Kontrola pred reportom

- `npx prisma validate` ✓
- `tsc --noEmit` ✓
- `npm run lint` ✓
- `npm run build` ✓ — uveď skutočný počet stránok a rozdiel oproti 44
- `npm run dev` a over cez `curl`, čo sa overiť dá: `/klub`, `/klub/trening`,
  `/klub/historia` bez prihlásenia → 307 na `/prihlasenie`; `/sprava` ako CLEN → 404

## Manuálna tabuľka overenia (preklikne Maxim)

| # | Krok | Očakávané |
| --- | --- | --- |
| 1 | `/sprava` ako ADMIN | rozcestník s funkčným odkazom na Cviky; **Plány už neexistujú** |
| 2 | `/sprava/plany` ako ADMIN | **404** — stránka je zrušená |
| 3 | `/klub` ako CLEN bez tréningov | prázdny stav, žiadne nuly, odkaz na Tréning |
| 4 | `/klub/trening` → založ plán z 3 cvikov | plán sa zobrazí, v DB `TreningPlan` + 3 `PlanCvik` |
| 5 | premenuj a zmaž plán | zmena sa prejaví, po zmazaní zmiznú aj `PlanCvik` |
| 6 | „Začať tréning" → 3 série → „Ukončiť" | `Trening` má `koniec`, 3× `Seria` v DB |
| 7 | druhý raz „Začať tréning" pri otvorenom | neduplikuje, ponúkne pokračovať |
| 8 | `/klub/historia` | tréning s dĺžkou a objemom, 1RM sedí s Epley vzorcom |
| 9 | `/klub` po tréningu | dlaždice ukazujú reálne čísla |
| 10 | druhý účet (CLEN) | **nevidí cudzie tréningy ani plány** |

Riadok 10 je bezpečnostný — ak zlyhá, je to vážna chyba, nie kozmetika.

---

## Formát reportu

1. Tabuľka 10 riadkov s tým, čo si vedel overiť sám (`curl`, DB) a čo nie —
   **neoznačuj ✅ nič, čo si nespustil**
2. Zoznam vytvorených a zmenených súborov
3. Počet stránok v builde + vysvetlenie rozdielu
4. Ako si vyriešil `Decimal` aritmetiku
5. Výsledky štyroch kontrol

**Commitni, pushni, otvor PR do `main`.**
PR **nemení schému ani `middleware.ts`** — ak sú CI zelené a nič zakázané
v diffe nie je, **môžeš ju zmergovať sám** (SPOLUPRACA §1). Manuálnu tabuľku
preklikne Maxim; ak by v nej niečo zlyhalo, opravuje sa novou PR.
