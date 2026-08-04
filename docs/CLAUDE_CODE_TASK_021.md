# CLAUDE_CODE_TASK_021 — opravy pred konzultáciou + oddelenie appky

4. 8. 2026 · nová vetva `feat/opravy-konzultacia` z aktuálneho `main`

**Konzultácia je o 5 dní.** Toto zadanie je zoradené podľa priority. Ak by čas
nestačil, časti A a B musia byť hotové; C až F sú to, čo uvidí každý na prvý
pohľad; G je dokumentácia.

Zdroj nálezov: Cowork preklikal produkciu `gladiator-eight.vercel.app` 4. 8. 2026
ako ADMIN a overil výsledky priamo v databáze.

---

## Rozsah čítania

Tento súbor · `src/server/actions/vyzvy.ts` · `src/components/sprava/ZapisRozhodnutie.tsx`
· `src/app/sprava/vyzvy/**` · `src/components/klub/**` · `src/app/klub/**`
· `src/lib/klub/**` · `src/app/globals.css` · `public/manifest.*` (alebo kde je
manifest) · `src/app/layout.tsx` · `docs/CURRENT_STATUS.md` · `docs/PREVADZKA.md`

**Nerob audit repozitára.**

## ZAKÁZANÉ

- `prisma/schema.prisma`, akákoľvek migrácia, `DROP`, `TRUNCATE`
- `src/middleware.ts`, platobný kód, `src/app/admin/**`
- `npm install`
- nové farby mimo tokenov v `globals.css`
- administrácia obsahu webu (texty, obrázky) — **rieši sa až po konzultácii**

---

## A — BLOKÁTOR: „Schváliť" vo výzve nefunguje

### Čo sa deje

Na `/sprava/vyzvy/[id]` tlačidlo **Schváliť** neurobí nič. Overené dvakrát
a potvrdené v databáze: zápis zostáva `stav = CAKA`, `posudilId` je `NULL`,
`posudene` je `NULL`. Žiadna chybová hláška sa nezobrazí.

**Zamietnutie funguje** — validácia „Pri zamietnutí je dôvod povinný." sa
zobrazí správne. Akcia sa teda spúšťa; nefunguje vetva schválenia.

**Dôsledok:** rebríček sa nikdy nenaplní. `/klub/rebricek` trvalo hlási
„Zatiaľ nemá schválený zápis nikto."

### Čo sprav

Nájdi príčinu — s najväčšou pravdepodobnosťou obidve tlačidlá odosielajú ten
istý formulár a akcia nevie rozlíšiť, ktoré bolo stlačené (chýbajúci alebo
neprenášaný `name`/`value` na submit tlačidle, prípadne vetva schválenia
spadne do rovnakej validácie ako zamietnutie).

**Nehádaj — over.** Po oprave sprav dôkaz priamo v DB:

```sql
select stav, "posudilId" is not null as posudene, posudene
from public."VyzvaZapis";
```

Musí vrátiť `SCHVALENE`, `true`, dátum. **Do reportu vlož výsledok toho dotazu.**

Zároveň: **žiadna akcia nesmie zlyhať ticho.** Keď server action vráti chybu,
musí sa zobraziť. Prejdi akcie vo `vyzvy.ts` a over, že každá vetva vracia buď
`message`, alebo `error`, a že UI obidve zobrazuje.

---

## B — cviky podľa partií + koniec tichého zlyhania vo výzve

### Rozhodnutie majiteľa (4. 8. 2026)

- **Katalóg cviky sa triedi podľa svalových partií.** Člen si vyberie partiu
  a v nej si napíše alebo vyberie presný cvik.
- **Vo výzve je vždy jeden konkrétny cvik** — nie partia. Rebríček musí
  porovnávať porovnateľné.
- **Hlavná metrika sú minúty v posilke** — čas strávený na tréningoch,
  sčítaný za obdobie výzvy. Silová výzva na jeden cvik zostáva ako druhá
  možnosť.

### B1. Katalóg podľa partií

Enum `Partia` už v schéme existuje: `NOHY · HRUD · CHRBAT · RAMENA · BICEPS ·
TRICEPS · CORE · NEZARADENE`. `Cvik.partia` tiež existuje. **Schému nemeníš** —
len to zobraz.

- `/sprava/cviky`: cviky **zoskupené podľa partie**, nadpis partie nad skupinou,
  `NEZARADENE` posledné
- **v editore plánu v `/klub/trening`:** najprv výber partie, potom cvik —
  ponuka cvikov z katalógu **filtrovaná na zvolenú partiu**, a člen si smie
  **napísať aj vlastný názov** (voľný text zostáva, model MAXPERFORMu sa nemení)
- keď člen napíše vlastný cvik, partia sa uloží tá, ktorú si vybral

### B2. Časová výzva — over a zviditeľni výpočet

Sčítanie minút z tréningov **už funguje** (overené na produkcii 4. 8.).
Nemeň logiku, len ju zviditeľni: pod predvyplnenou hodnotou vypíš, **z ktorých
tréningov sa to sčítalo** (dátum + trvanie, max 5 najnovších + „a ďalších N").
Člen musí vidieť, odkiaľ číslo je.

### B3. Silová výzva — koniec tichého zlyhania

Výzva sa viaže na cvik z katalógu (server), ale člen si cvik v pláne píše ako
voľný text (lokálne). Keď sa názvy nezhodujú, predvyplnenie ticho nevyjde.

1. **Porovnávanie názvov znormalizuj** — bez ohľadu na veľkosť písmen,
   diakritiku a okrajové medzery. Použi rovnakú normalizáciu ako
   `normalizujPrezyvku` v `src/lib/validate.ts` (alebo ekvivalent v `lib/klub`).
   „Bench press", „bench Press" aj „Bench pres " musia sadnúť na jeden cvik.
2. **Keď sa cvik nenájde**, nezobrazuj prázdne pole bez vysvetlenia:
   - veta „V tvojich tréningoch sme cvik **{názov}** nenašli."
   - **rozbaľovacie pole s vlastnými cvikmi člena** z jeho lokálnej histórie,
     nech si vyberie, ktorý sa do výzvy počíta
   - po výbere sa hodnota predvyplní z najťažšej série toho cviku v období výzvy
   - ak nemá v histórii nič, napíš to a nechaj pole prázdne
3. Rovnaké vysvetlenie doplň aj pri časovej výzve bez tréningov.

### B4. Čo do tohto zadania NEIDE

Výzva na **objem (kg) podľa partie** by potrebovala novú hodnotu v enume
`VyzvaTyp`, teda migráciu. **Nerob to.** Zapíš do `TODO.md` ako rozhodnutie
po konzultácii.

---

## C — členská zóna má byť appka, nie podstránka webu

Dnes je nad `/klub/**` marketingová hlavička webu (O GYME, CENNÍK, GALÉRIA,
REZERVÁCIA…). Appka tak vyzerá ako stránka. Majiteľ to chce oddelené.

### C1. Vlastný shell

`/klub/**` **nesmie** vykresľovať marketingovú hlavičku ani pätu webu. Vlastný
layout: bočná navigácia na desktope, spodná na mobile (už existuje `KlubShell`),
hore len logo Gladiator a odhlásenie. Odkaz „← Späť na web" ponechaj.

Rovnako uprav `/sprava/**` — administrácia tiež nepotrebuje marketingovú hlavičku.

### C2. PWA sa inštaluje, nie prehliada

Manifest nastav na členskú zónu:

- `start_url: "/klub"`
- `scope: "/klub"`
- `display: "standalone"`
- `name` / `short_name`, `theme_color` a `background_color` z tokenov
  (čierna `#0A0A0A`)

Po nainštalovaní na plochu sa musí otvoriť rovno `/klub` **bez adresného
riadka a bez marketingovej hlavičky**.

### C3. Stránka `/appka`

Nová verejná stránka, do hlavnej navigácie webu:

- krátko čo appka vie (tréningový denník, rekordy, progres, výzva, rebríček)
- **Android/desktop:** tlačidlo **Nainštalovať**, ktoré použije zachytenú
  udalosť `beforeinstallprompt`. Ak udalosť nepríde, tlačidlo nezobrazuj —
  ukáž návod.
- **iPhone:** `beforeinstallprompt` Safari nepodporuje. Zobraz návod krok za
  krokom: **Zdieľať → Pridať na plochu**. Bez toho to ľudia nenájdu.
- rozpoznaj platformu a ukáž relevantný návod ako prvý

---

## D — vzhľad: zelená nepatrí do palety

Odškrtnuté série a tlačidlo „Dokončiť tréning" sú **zelené**. Identita je
čierna `#0A0A0A` / antracit `#1A1A1A` / **zlatá `#D4AF37`** / biela typografia.

Prejdi členskú zónu a nahraď zelenú tokenmi. Odškrtnutá séria = zlatá.
Hlavné potvrdzovacie tlačidlo = zlaté. Červená pri zamietnutí a mazaní môže
zostať (je to varovná farba, nie dekorácia).

---

## E — drobnosti, ktoré vidno na prvý pohľad

1. **Zoznam plánov ukazuje „3×10"** pri sériách 10/5/5 s váhami 60/80/80.
   Skrýva to práve to, čo appku odlišuje. Zobraz reálny súhrn — napr.
   `3 série · 60–80 kg`, alebo vypíš série `10×60 · 5×80 · 5×80`. Vyber
   variant, ktorý sa zmestí na mobil, a v reporte napíš ktorý a prečo.
2. **Dátumy v slovenskom formáte.** Členovi sa nikde nesmie zobraziť
   `2026-08-01` — patrí tam `1. 8. 2026`. Prejdi výzvu, rebríček aj históriu.
3. **Prúžok postupu v tréningu** je pri 0/3 sériách čiastočne vyplnený.
   Pri nule má byť prázdny.

---

## F — katalóg cvikov je pomiešaný (len zápis, neopravuj dáta)

V databáze má cvik s názvom „predkopy" slug `cvik-drep` a „adduktory" má
`cvik-bench-press`. **Nie je to chyba kódu** — je to dôsledok rozhodnutia
nemeniť slug pri premenovaní cviku.

**Dáta neopravuj** (sú testovacie, majiteľ si ich prepíše). Sprav dve veci:

1. V `/sprava/cviky` zobraz pri každom cviku jeho **slug ako needitovateľný
   údaj** s poznámkou „slug sa pri premenovaní nemení".
2. Zapíš to do `docs/PREVADZKA.md` k správe cvikov.

---

## G — dokumentácia si odporuje

Po H3 zostali v dokumentoch staré sekcie vedľa nových:

- `docs/CURRENT_STATUS.md` → „Čo neexistuje" tvrdí, že členské obrazovky
  a výzvy neexistujú (existujú); „Najbližší krok" hlása Etapu H2 (je hotová);
  „Neuzavreté z H1" odkazuje na `/sprava/plany`, ktoré sme zmazali; stav
  databázy hovorí o 3 migráciách, sú 4
- `docs/PREVADZKA.md` → §3 tvrdí, že `/sprava` je prázdna bez odkazov
  a spomína `/sprava/plany`; §5 hovorí o 3 migráciách, §0 o 4

Zjednoť to. **Nič nedopisuj, čo nie je pravda** — ak si niečo neoveril,
napíš „neoverené".

---

## Kontrola pred reportom

- `npx prisma validate` ✓ · `tsc --noEmit` ✓ · `npm run lint` ✓
- `npm run build` ✓ — uveď **presný** počet stránok a rozdiel oproti 49.
  Ak nesedí, napíš „nesedí a neviem prečo". Nedovysvetľuj to.
- `curl` bez prihlásenia: `/klub`, `/klub/vyzva`, `/klub/rebricek` → 307;
  `/sprava/vyzvy` → 404; `/appka` → 200
- **SQL dôkaz k časti A** (povinný, vyššie)

## Manuálna tabuľka (preklikne Maxim)

| # | Krok | Očakávané |
| --- | --- | --- |
| 1 | admin schváli zápis | stav sa zmení, člen vidí poradie |
| 2 | `/klub/rebricek` | člen je v tabuľke, jeho riadok zvýraznený |
| 3 | silová výzva na cvik, ktorý člen nemá | vysvetlenie + výber z vlastných cvikov |
| 4 | cvik napísaný malými písmenami bez diakritiky | sadne, hodnota sa predvyplní |
| 4b | `/sprava/cviky` | cviky zoskupené podľa partií |
| 4c | editor plánu: vyber partiu | ponuka cvikov sa zúži, vlastný názov sa dá napísať |
| 4d | časová výzva | pod hodnotou vidno, z ktorých tréningov sa minúty sčítali |
| 5 | `/klub` | **žiadna marketingová hlavička** |
| 6 | `/appka` na iPhone | návod Zdieľať → Pridať na plochu |
| 7 | appka pridaná na plochu | otvorí sa `/klub`, bez adresného riadka |
| 8 | zoznam plánov | reálny súhrn sérií, nie „3×10" |
| 9 | dátumy v appke | slovenský formát |
| 10 | odškrtnutá séria | **zlatá, nie zelená** |

## Formát reportu

1. Tabuľka 13 riadkov — **neoznačuj ✅ nič, čo si nespustil**
2. **Príčina chyby A** a SQL dôkaz opravy
3. Zoznam zmenených súborov
4. Presný počet stránok
5. Ktorý variant súhrnu plánu si zvolil a prečo
6. Potvrdenie, že schéma ani migrácie sa nezmenili
7. Výsledky kontrol

**Commitni, pushni, otvor PR do `main`.** PR nemení schému ani `middleware.ts`
— ak sú CI zelené, môžeš ju zmergovať sám (SPOLUPRACA §1).
