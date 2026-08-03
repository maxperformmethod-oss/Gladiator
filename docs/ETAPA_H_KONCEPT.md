# ETAPA_H_KONCEPT.md — členská aplikácia podľa vzoru MAXPERFORM

Verzia 2.0 · 3. 8. 2026 · **nahrádza v1.0**

Vzor: `https://m-ax-app.vercel.app/` — prešiel som Prehľad, Tréning, Progres
aj Rekordy. Gladiator bude postavený rovnako, len s tematikou ťažkého
tréningu a v čierno-zlatom vizuáli.

---

## Rozhodnutia od Maxima (3. 8. 2026)

| Vec | Rozhodnutie |
| --- | --- |
| Role | **len `CLEN` a `ADMIN`** — žiadni tréneri |
| Tréningy a rekordy | **člen si ich spravuje sám**, admin do nich nezasahuje |
| Schvaľuje admin | **len výsledky vo výzvach** |
| Výzva | mesačná, silová **alebo** časová (minúty v posilke) |
| Scoreboard | neskôr, prenos výziev do rekordov sa dorieši |

---

## Najdôležitejšie zistenie zo vzoru

**Rekordy sa nezapisujú — počítajú sa.** Člen zapíše sériu (cvik, váha,
opakovania) a aplikácia z toho sama odvodí:

| Ukazovateľ | Vzorec |
| --- | --- |
| Najťažšia séria | najvyššia hmotnosť dokončenej série |
| Odhad 1RM | Epley: `váha × (1 + opakovania / 30)` |
| Objem jednej série | `opakovania × hmotnosť` |

Tým padá celý problém so schvaľovaním rekordov — nie je čo schvaľovať,
lebo si nikto nezapisuje výsledok, len to, čo naozaj odcvičil.
Presne to, čo si chcel: **admin do rekordov nezasahuje.**

---

## POZOR — H si vyžiada zmenu schémy a migráciu

Toto je najdôležitejšia veta celého dokumentu. Súčasná schéma **nemá tabuľky
na tréningy a série**:

| Existuje | Chýba |
| --- | --- |
| `Cvik`, `Rekord`, `Vyzva`, `VyzvaZapis` | `TreningPlan`, `Trening`, `Seria` |

Bez nich sa vzor MAXPERFORM postaviť nedá — graf progresu ani rekordy nemajú
z čoho počítať.

Ďalej treba dve úpravy existujúcich modelov:

- **`Cvik.partia`** — svalová partia (nohy, hruď, chrbát, ramená, ruky,
  jadro, nezaradené). Vzor podľa nej robí graf „objem podľa partie".
- **`Vyzva.cvikId` musí byť nepovinné** — časová výzva („minúty v posilke")
  sa neviaže na žiadny cvik. Pribudne `Vyzva.typ` = `SILOVA` / `CASOVA`.

**Dôsledok:** H bude **prvá migrácia od Etapy F**, a stále nemáme oddelený
staging projekt (rozhodnutie D-11, nesplnené). Databáza je zatiaľ prázdna,
takže riziko je nízke — ale toto je posledný moment, kedy to platí.

---

## Štyri obrazovky pod `/klub`

Maxim 3. 8. 2026: **Rekordy zlúčiť do Histórie, Progres do Prehľadu.**
Zo šiestich obrazoviek vzoru zostávajú štyri.

| Obrazovka | Obsah |
| --- | --- |
| **Prehľad** | tréningy tento týždeň · séria dní · objem za 30 dní · posledný tréning · aktuálna výzva · **grafy progresu** (max váha / odhad 1RM, objem po týždňoch, objem podľa partie) |
| **Tréning** | zoznam plánov s cvikmi a cieľom `série × opakovania`; „Začať tréning" / „Ukončiť tréning" |
| **História** | odcvičené tréningy (dátum, dĺžka, objem) · **osobné rekordy** za každý cvik (odhad 1RM, najťažšia séria, objem série) |
| **Výzva** | aktuálna mesačná výzva, môj zápis, stav schválenia |

`Nastavenia` a `Časovač` do H nedávame.

### Svalové partie

`NOHY · HRUD · CHRBAT · RAMENA · BICEPS · TRICEPS · CORE · NEZARADENE`

Termín **core**, nie „jadro" — tak to v posilke aj tak každý volá.

### Meranie času tréningu

Bez stopiek na obrazovke. Člen dá **„Začať tréning"** (uloží sa čas začiatku)
a **„Ukončiť tréning"** (uloží sa čas konca). Dĺžka sa dopočíta.
Z toho sa sčítavajú aj minúty do časovej výzvy.

---

## Výzvy — jediné miesto, kde vstupuje admin

Mesačná, jedna naraz, vypisuje ju admin v `/sprava`.

| Typ | Čo sa meria | Kto zapisuje | Overenie |
| --- | --- | --- | --- |
| **Silová** | výkon v jednom cviku (napr. bench press max) | člen | admin schváli |
| **Časová** | minúty v posilke za mesiac | **počíta sa z tréningov člena** | admin schváli súčet |

Časová výzva je zaujímavá tým, že si ju člen nemusí zapisovať zvlášť —
sčíta sa z dĺžok jeho tréningov. A keď vo Fáze 2 pribudnú QR vstupy, minúty
sa začnú merať automaticky a schvaľovanie odpadne úplne.

`VyzvaZapis` už v schéme existuje aj so stavom a poľom `posudilId` —
na toto ju použijeme bezo zmeny.

---

## Návrh delenia na tri kroky

H je príliš veľká na jedno zadanie. Navrhujem:

| Krok | Obsah | Prečo takto |
| --- | --- | --- |
| **H1** | zmena schémy + migrácia + `Cvik` a plány cez `/sprava` | dáta musia stáť skôr než obrazovky |
| **H2** | zápis tréningu, História, Rekordy, Prehľad | jadro — po ňom má appka zmysel používať |
| **H3** | Progres (grafy) + Výzva + schvaľovanie v `/sprava` | nadstavba, dá sa testovať samostatne |

Po H2 už môžu majitelia reálne skúšať. H3 pridá to, čo ich udrží.

---

## Čo do H nejde

Časovač · nastavenia · kalórie · fotky · komentáre · notifikácie ·
tréningové plány od trénera · viac výziev naraz · scoreboard.

Scoreboard a prenos výziev do rekordov si necháme na samostatnú etapu,
až keď uvidíme reálne dáta.

---

## Rozhodnuté 3. 8. 2026

| Otázka | Rozhodnutie |
| --- | --- |
| Zoznam cvikov | **desať pevných**, vlastné cviky člena zatiaľ nie — doplníme, ak si to testovanie vyžiada |
| Dĺžka tréningu | **zo začiatku a konca**, žiadne stopky |
| Staging databáza | **zatiaľ nie** — ideme na jediný projekt |

### Staging — kedy sa k tomu vrátiť

Maxim rozhodol staging nezakladať. Súhlasím s odôvodnením: databáza je
prázdna a sme dvaja vývojári, nie prevádzka.

**Ale platí to len dovtedy, kým sú v databáze naše testovacie účty.**
Vo chvíli, keď si prvý majiteľ zapíše prvý tréning, prestáva to platiť —
od toho momentu je každá migrácia zásah do cudzích dát bez zálohy.

Preto: **staging projekt sa zakladá pred tým, než dostane prístup prvý
človek mimo nás dvoch.** Zapísané v `TODO.md` ako blokér testovacej fázy,
nie ako „niekedy neskôr".
