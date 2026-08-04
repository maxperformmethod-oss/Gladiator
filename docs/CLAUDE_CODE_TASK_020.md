# CLAUDE_CODE_TASK_020 — Etapa H3: mesačná výzva a scoreboard

4. 8. 2026 · nová vetva `feat/vyzva-scoreboard` z aktuálneho `main` (po merge #33)

Posledná etapa pred testovacou fázou. Po nej sa už len ladí podľa toho,
čo povie posilka.

---

## Kontext, ktorý musí byť jasný

Tréningové dáta člena žijú **v jeho prehliadači** (`localStorage`, etapa H2c).
Server o nich nevie nič. Výzva a scoreboard sú **jediné**, čo ide na server.

Z toho vyplýva:

- **Hodnotu do výzvy pošle člen sám**, z vlastných lokálnych dát.
- Je to teda **údaj na čestné slovo** — člen si môže napísať čokoľvek.
- **Preto výsledky schvaľuje admin.** To je jediná kontrola, ktorú máme,
  a je to zámerné rozhodnutie majiteľa, nie nedostatok.
- V UI to nezakrývaj: pri odosielaní aj v rebríčku napíš, že výsledky
  potvrdzuje obsluha gymu.

**Schému nemeníš — je pripravená.** `Vyzva`, `VyzvaZapis` aj enumy
(`VyzvaTyp`, `VyzvaStav`, `VysledokStav`) existujú. Hodnoty enumov si prečítaj
z `prisma/schema.prisma`, nehádaj ich.

---

## Rozsah čítania

Tento súbor · `docs/ETAPA_H_KONCEPT.md` · `prisma/schema.prisma` (len čítanie) ·
`src/app/sprava/**` · `src/app/klub/**` · `src/components/klub/**` ·
`src/lib/klub/**` · `src/server/auth.ts` · `src/server/actions/treningy.ts` ·
`src/lib/validate.ts`

**Nerob audit repozitára.**

## ZAKÁZANÉ

- `prisma/schema.prisma`, akákoľvek migrácia, `DROP`, `TRUNCATE`
- `src/middleware.ts`, platobný kód, `src/app/admin/**`
- `npm install` — nič nové netreba
- meniť lokálnu vrstvu `src/lib/klub/**` inak než čítaním
- model `Rekord` — **nepoužívaš ho**, osobné rekordy sú lokálne a počítané

## Bezpečnosť

- `/sprava/vyzvy` → `requireAdmin()`; `/klub/**` → `requireClen()`
- člen smie meniť **výhradne svoj** `VyzvaZapis` — `updateMany` s `clenId`
  vo `where` + kontrola `res.count`
- **schvaľovať smie len admin**; `posudilId` sa berie zo session, nikdy z formulára
- **v rebríčku sa NIKDY nezobrazuje e-mail.** Zobrazuje sa prezývka; ak ju člen
  nemá, zobraz „Člen" a poradové číslo. E-mail nesmie opustiť server.

---

## Časť A — admin: správa výziev (`/sprava/vyzvy`)

Založenie a úprava výzvy:

| Pole | Poznámka |
| --- | --- |
| `nazov`, `popis` | text |
| `typ` | `SILOVA` alebo `CASOVA` |
| `cvikId` | **povinné pri `SILOVA`**, musí byť `null` pri `CASOVA` |
| `zaciatok`, `koniec` | dátumy; `koniec` nesmie byť pred `zaciatok` |
| `stav` | podľa enumu `VyzvaStav` |
| `slug` | odvoď z názvu rovnakou funkciou ako pri cviku; **pri úprave nemeň** |

**Naraz smie byť aktívna najviac jedna výzva.** Pri pokuse aktivovať druhú
vráť zrozumiteľnú chybu, neaktivuj ju.

Do rozcestníka `/sprava` pridaj živý odkaz na Výzvy (dnes je tam ako stub).

## Časť B — admin: schvaľovanie (`/sprava/vyzvy/[id]`)

Zoznam zápisov k výzve: prezývka člena, hodnota, stav, dátum.
Pri každom **Schváliť** / **Zamietnuť**; pri zamietnutí je
`dovodZamietnutia` **povinný** (člen musí vedieť prečo).

Pri rozhodnutí zapíš `posudilId` zo session a `posudene = now()`.
Rozhodnutie sa dá zmeniť (preklik späť na čakajúce).

Zoradenie: čakajúce hore, potom podľa hodnoty zostupne.

## Časť C — člen: výzva (`/klub/vyzva`)

Nahradí dnešný stub. Klientska stránka nad `AppProvider` (potrebuje lokálne dáta).

### C1. Keď žiadna výzva nebeží

Prázdny stav: „Momentálne nebeží žiadna výzva." Nič viac.

### C2. Keď výzva beží

Zobraz názov, popis, typ, obdobie a **koľko dní zostáva**.

**Predvyplnenie hodnoty z lokálnych dát** — toto je jadro použiteľnosti:

| Typ | Predvyplní sa |
| --- | --- |
| `SILOVA` | najťažšia séria daného cviku z tréningov **v období výzvy** (podľa názvu cviku, case-insensitive a trimované, ako `previousPerformance` v `calc.ts`) |
| `CASOVA` | súčet minút tréningov ukončených **v období výzvy** (`durationSec` / 60, zaokrúhli nadol) |

Hodnota je **editovateľná** — člen ju môže opraviť. Pod poľom napíš, odkiaľ
sa vzala („z tvojich tréningov od … do …").

Ak člen nemá v období žiadne dáta, pole nechaj prázdne a napíš to.

### C3. Stav zápisu člena

| Stav | Čo vidí člen |
| --- | --- |
| ešte neodoslal | tlačidlo **Odoslať do výzvy** |
| čaká | „Čaká na potvrdenie obsluhou." + môže hodnotu **prepísať** |
| schválený | hodnota + poradie v rebríčku; **zlepšenie sa dá poslať znova** (vráti stav na čakajúci) |
| zamietnutý | dôvod zamietnutia + možnosť odoslať znova |

Zápis je jeden na člena a výzvu (`@@unique([vyzvaId, clenId])`) — používaj
`upsert`, nie `create`.

## Časť D — scoreboard (`/klub/rebricek`)

Nová stránka, do navigácie členskej zóny.

- **len schválené zápisy** aktuálnej výzvy, zoradené zostupne podľa hodnoty
- stĺpce: poradie · prezývka · hodnota (kg alebo minúty podľa typu)
- **riadok prihláseného člena vizuálne zvýrazni**
- pri zhode hodnôt: skorší zápis vyššie
- pod tabuľkou veta: „Výsledky si zapisujú členovia sami a potvrdzuje ich
  obsluha gymu."
- prepínač na **ukončené výzvy** (archív) — rovnaká tabuľka
- prázdny stav, keď ešte nikto nemá schválený zápis

Rebríček je **serverová stránka** — číta z DB, nie z `localStorage`.

## Časť E — dokumentácia

Po dokončení uprav:

- `docs/CURRENT_STATUS.md` — nová verzia, etapa H3 hotová, čo zostáva
- `docs/PREVADZKA.md` — §12 (checklist pred testovacím spustením) aktualizuj;
  do §0 doplň, že tréningové dáta sú lokálne a čo to znamená
- `TODO.md` — čo z H3 zostalo otvorené

Nepíš do nich nič, čo nie je pravda. Neoznačuj hotové to, čo nie je overené.

---

## Vzhľad

Rovnaké pravidlá ako v H2c: farby len z tokenov, nadpisy Oswald uppercase,
veľké tabuľkové číslice pri hodnotách a poradí, dotykové ciele 44 px,
vstupy min. 16 px, `inputMode` podľa typu hodnoty, `aria-label` všade.

Rebríček musí byť čitateľný na telefóne — prvé tri miesta odlíš (zlatá,
striebro, bronz sa dá naznačiť odtieňmi zlatej, nie novými farbami).

---

## Zastavenia

Zastav a nahlás, ak:

- by si potreboval zmeniť schému alebo spustiť migráciu
- by si potreboval nový balík
- hodnoty enumov v schéme nezodpovedajú tomu, čo zadanie predpokladá
- by sa e-mail člena mal dostať do klientskeho kódu rebríčka

---

## Kontrola pred reportom

- `npx prisma validate` ✓ · `tsc --noEmit` ✓ · `npm run lint` ✓
- `npm run build` ✓ — uveď **presný** počet stránok a rozdiel oproti 48.
  **Ak čísla nesedia, napíš to rovno — nedovysvetľuj ich.**
- `curl` bez prihlásenia: `/klub/vyzva`, `/klub/rebricek` → 307;
  `/sprava/vyzvy` ako neprihlásený → 404

## Manuálna tabuľka overenia (preklikne Maxim)

| # | Krok | Očakávané |
| --- | --- | --- |
| 1 | admin založí časovú výzvu na tento mesiac | uloží sa, je aktívna |
| 2 | admin skúsi aktivovať druhú výzvu | odmietne s hláškou |
| 3 | člen otvorí `/klub/vyzva` | vidí výzvu, minúty predvyplnené z jeho tréningov |
| 4 | člen odošle | stav „čaká na potvrdenie" |
| 5 | admin zamietne bez dôvodu | odmietne — dôvod je povinný |
| 6 | admin zamietne s dôvodom | člen vidí dôvod |
| 7 | člen odošle znova | stav sa vráti na čakajúci |
| 8 | admin schváli | člen vidí poradie |
| 9 | `/klub/rebricek` | člen je v tabuľke, jeho riadok zvýraznený |
| 10 | rebríček druhým účtom | vidí prezývky, **žiadny e-mail** |
| 11 | silová výzva na Bench press | predvyplní najťažšiu sériu z obdobia |
| 12 | člen bez tréningov | prázdne pole a vysvetlenie, nie nula |
| 13 | archív ukončených výziev | zobrazí sa |
| 14 | celé na iPhone | čitateľné, ovládateľné palcom |

Riadok 10 je bezpečnostný.

## Formát reportu

1. Tabuľka 14 riadkov — **neoznačuj ✅ nič, čo si nespustil**
2. Zoznam nových a zmenených súborov
3. Presný počet stránok; ak nesedí s očakávaním, napíš „nesedí a neviem prečo"
4. Potvrdenie, že schéma ani migrácie sa nezmenili
5. Ktoré dokumenty si aktualizoval a čo v nich pribudlo
6. Výsledky kontrol

**Commitni, pushni, otvor PR do `main`.**
PR nemení schému ani `middleware.ts` — ak sú CI zelené, môžeš ju zmergovať
sám (SPOLUPRACA §1).
