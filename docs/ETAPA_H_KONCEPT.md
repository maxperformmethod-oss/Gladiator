# ETAPA_H_KONCEPT.md — členské funkcie, návrh na schválenie

Verzia 1.0 · 1. 8. 2026 · **NÁVRH — nič z toho nie je rozhodnuté**

Cieľ: čo najjednoduchšia štruktúra, ktorá sa dá postaviť, otestovať a potom
prekopať podľa toho, čo povedia majitelia. Schéma v `prisma/schema.prisma`
už tabuľky (`Cvik`, `Rekord`, `Vyzva`, `VyzvaZapis`) obsahuje — **nemeníme ju**,
len ju začneme používať.

---

## Poziciovanie — vstup od Maxima

Klasický bodybuilding ako móda slabne. Gladiator smeruje skôr k **ťažkým
strojom, sile a prémiovému prostrediu** než k pózovaniu. Návrh to zohľadňuje:
výzvy stavané na **sile a pravidelnosti**, nie na vzhľade. Žiadne váženie,
žiadne fotky postavy, žiadne percentá tuku.

---

## Tri obrazovky, nič viac

| Obrazovka | Čo tam je |
| --- | --- |
| `/klub` | rozcestník: moja prezývka, aktuálna výzva, tlačidlo „Zapísať výkon", odhlásenie |
| `/klub/rekordy` | moje osobné rekordy — tabuľka cvik × hodnota × dátum × stav |
| `/klub/rebricek` | rebríček aktuálnej výzvy |

`/klub/profil` a `/klub/vyzva` zatiaľ nechať ako sú. Menej obrazoviek =
rýchlejšie k testovaniu.

---

## 1. Cviky — návrh štartovacej päťky

Fixný zoznam, nie voľný text. Admin ich bude vedieť meniť až v Etape I.

| Cvik | Jednotka | Prečo |
| --- | --- | --- |
| Drep | kg | základ, každý ho pozná |
| Bench press | kg | najčastejšie porovnávaný |
| Mŕtvy ťah | kg | tretí z veľkej trojky |
| Zhyby | opakovania | nevyžaduje činku, zvládne aj začiatočník |
| Plank | sekundy | úplne pre každého, nulová bariéra |

Prvé tri oslovia silových, posledné dva začiatočníkov. Bez toho druhého
sa polovica členov na rebríček ani nepozrie.

**Na potvrdenie majiteľom:** sedí táto päťka? Chýba niečo, čo v Lučenci
ľudia reálne merajú?

---

## 2. Rekord — čo sa zapisuje

```
cvik · hodnota · dátum · stav (ČAKÁ / SCHVÁLENÝ / ZAMIETNUTÝ)
```

Člen zapíše, admin alebo tréner schváli. **Do rebríčka ide len schválené.**

Bez schvaľovania si každý zapíše 300 kg a rebríček je za týždeň na smiech.
Toto je jediná vec v celej Etape H, na ktorej sa nedá šetriť.

---

## 3. Výzva — dva varianty, treba vybrať jeden

Mesačná, jedna naraz, vypisuje ju admin.

### Variant A — „Cvik mesiaca"

August = bench press. Kto zdvihne najviac, vyhráva.

- **Pre:** jasný víťaz, ľahko sa schvaľuje (tréner to vidí), vytvára rozruch
- **Proti:** vyhráva stále ten istý najsilnejší, začiatočníci sa nezapoja

### Variant B — „Nazbieraj objem"

Za mesiac nazbieraj čo najviac — buď **minút v posilke**, alebo
**celkových zdvihnutých kg**.

- **Pre:** zapojí každého, odmeňuje pravidelnosť namiesto genetiky,
  presne to, čo gym chce — aby ľudia chodili
- **Proti:** ťažšie sa overuje, dá sa nadsadiť, viac zápisov = viac
  schvaľovania

### Odporúčanie

**Variant B s minútami**, a to z jedného obchodného dôvodu: gym nezarába na
tom, kto zdvihne najviac, ale na tom, kto chodí pravidelne. Výzva má tlačiť
k dochádzke.

Overovanie vyriešime jednoducho — člen zapíše tréning, recepcia raz za čas
prejde zoznam. V Fáze 2, keď pribudnú QR vstupy, sa minúty budú počítať samy
a schvaľovanie odpadne. **Návrh je teda zároveň prípravou na to.**

**Na rozhodnutie:** A alebo B? Ak B, minúty alebo kilogramy?

---

## 4. Rebríček — čo je vidieť

| Návrh | Dôvod |
| --- | --- |
| len **prezývka**, nikdy meno ani e-mail | preto prezývka vôbec existuje |
| len **schválené** zápisy | inak nemá zmysel |
| jeden spoločný, **bez kategórií** | delenie podľa pohlavia a váhy až keď bude dosť ľudí; pri dvadsiatich členoch je päť kategórií po štyroch ľuďoch trápne |
| účasť **dobrovoľná** — v profile prepínač „byť v rebríčku" | nie každý sa chce porovnávať, a bez tejto možnosti časť ľudí radšej nezapíše nič |

Ten posledný bod je aj vec ochrany osobných údajov — nikoho neverejňujeme
bez jeho súhlasu.

---

## Čo sa NEROBÍ v Etape H

Fotky · komentáre · lajky · notifikácie · história váhy · tréningové plány ·
chat · viac výziev naraz · kategórie rebríčka.

Všetko sú to veci, ktoré vyzerajú lákavo a každá z nich pridá týždeň.
Do testovacej fázy ideme s minimom, ktoré má zmysel používať.

---

## Otvorené otázky pre majiteľov

1. Sedí štartovacia päťka cvikov?
2. Kto schvaľuje zapísaný výkon — tréner, recepcia, alebo ktokoľvek z tímu?
3. Výzva: variant A („cvik mesiaca") alebo B („nazbieraj objem")?
4. Ak B — minúty v posilke, alebo celkové kilogramy?
5. Rebríček dobrovoľný (prepínač v profile), alebo automaticky pre všetkých?

Bez odpovedí na 2 a 3 sa Etapa H nedá začať. Zvyšok sa dá doplniť za pochodu.
