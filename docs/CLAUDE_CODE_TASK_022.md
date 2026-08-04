# CLAUDE_CODE_TASK_022 — odhlásenie a cesta do administrácie

4. 8. 2026 · nová vetva `fix/odhlasenie-admin-nav` z aktuálneho `main`

**Regresia z H2c.** Pôvodná stránka `/klub` mala tlačidlá „Správa" a „Odhlásiť
sa". H2c ju prepísala a obidve zmizli. Dnes sa z členskej zóny **nedá odhlásiť**
a **nedá sa dostať do administrácie** inak než napísaním adresy.

Konzultácia je o 4 dni. Toto je krátke zadanie, nie etapa.

---

## Rozsah čítania

Tento súbor · `src/components/klub/KlubShell.tsx` · `src/app/klub/layout.tsx`
· `src/app/sprava/**` · `src/server/auth.ts` · `src/server/actions/auth.ts`
· `src/components/klub/ui/**` · `docs/PREVADZKA.md`

**Nerob audit repozitára.**

## ZAKÁZANÉ

- `prisma/schema.prisma`, migrácie, `DROP`, `TRUNCATE`
- `src/middleware.ts`, platobný kód, `src/app/admin/**`
- `npm install`
- meniť lokálnu vrstvu `src/lib/klub/**`
- nové farby mimo tokenov v `globals.css`

---

## A — odhlásenie v členskej zóne

Akcia `odhlas` v `src/server/actions/auth.ts` **existuje a funguje** — pôvodná
`/klub/page.tsx` ju používala. Znovu ju zapoj.

- **desktop:** dole v bočnej navigácii, pod „Nastavenia", oddelené čiarou
- **mobil:** spodná lišta je plná — daj odhlásenie na `/klub/nastavenia`
  ako posledná položka, výrazne oddelená, a v hlavičke appky nech je ikona
  profilu, ktorá tam vedie
- nad odhlásením zobraz **prezývku prihláseného člena** (ak ju nemá, e-mail
  nezobrazuj — napíš „Člen")
- po odhlásení presmeruj na `/` (verejný web)

## B — odkaz do administrácie pre admina

`src/app/klub/layout.tsx` dnes podáva do `KlubShell` len `clenId` a `katalog`.
**Doplň `rola` a `prezyvka`.**

V `KlubShell` zobraz položku **Správa** s odkazom na `/sprava` **len keď
`rola === 'ADMIN'`**. Vizuálne oddelená od členských položiek — je to iná zóna.

Bežný člen nesmie tú položku vidieť ani v HTML. **Nestačí ju skryť cez CSS** —
nevykresli ju vôbec.

## C — z administrácie späť do appky

V `/sprava` (rozcestník aj podstránky) daj do hlavičky odkaz **„← Späť do
appky"** na `/klub` a **odhlásenie**. Dnes sa z administrácie tiež nedá odísť
inak než adresným riadkom.

## D — schvaľovanie výziev nech je vidieť

Dnes sa k schvaľovaniu dostaneš len tak, že v `/sprava/vyzvy` klikneš na výzvu
a potom na „Zápisy (N)". Skráť to:

1. Na rozcestníku `/sprava` pri dlaždici **Výzvy** zobraz počet zápisov, ktoré
   **čakajú na posúdenie** (stav `CAKA`) — napr. „Výzvy · 2 čakajú".
   Keď je nula, počet nezobrazuj.
2. V zozname výziev nech tlačidlo **Zápisy (N)** rozlíši čakajúce od
   posúdených — napr. „Zápisy · 2 čakajú · 5 posúdených".

## E — rekordy sa neschvaľujú, a nech to je jasné

Osobné rekordy sa **počítajú** z odcvičených sérií v prehliadači člena.
Nie je čo schvaľovať a admin ich nikdy neuvidí.

- na `/klub/rekordy` pod tabuľku doplň vetu: „Rekordy sa počítajú z tvojich
  tréningov automaticky. Neschvaľuje ich nikto."
- na rozcestníku `/sprava` napíš, čo admin **naozaj** spravuje: katalóg cvikov
  a výzvy. Nič iné.

## F — dokumentácia

`docs/PREVADZKA.md` §3: doplň, kde je odhlásenie, kde sa admin dostane do
administrácie a **kde presne sa schvaľujú zápisy výzvy** (`/sprava/vyzvy` →
výzva → Zápisy). Napíš aj to, že **rekordy sa neschvaľujú**.

---

## Kontrola pred reportom

- `tsc --noEmit` ✓ · `npm run lint` ✓ · `npm run build` ✓ — uveď presný počet
  stránok a rozdiel oproti 50. Ak nesedí, napíš to, nedovysvetľuj.
- `curl` bez prihlásenia: `/klub`, `/klub/nastavenia` → 307; `/sprava` → 404
- **Over v zdrojáku stránky ako CLEN, že odkaz `/sprava` v HTML vôbec nie je.**
  Ak sa prihlásiť nevieš, napíš to a neoznačuj to ✅.

## Manuálna tabuľka (preklikne Maxim)

| # | Krok | Očakávané |
| --- | --- | --- |
| 1 | `/klub` ako CLEN | dole v navigácii prezývka + **Odhlásiť sa** |
| 2 | odhlásenie | vráti na `/`, `/klub` už 307 na prihlásenie |
| 3 | `/klub` ako ADMIN | navyše položka **Správa** |
| 4 | `/klub` ako CLEN | **položka Správa nikde, ani v zdrojáku stránky** |
| 5 | `/sprava` | vidno „← Späť do appky" aj odhlásenie |
| 6 | `/sprava` s čakajúcim zápisom | pri dlaždici Výzvy je počet „čakajú" |
| 7 | `/sprava/vyzvy` | tlačidlo rozlíši čakajúce a posúdené |
| 8 | `/klub/rekordy` | veta, že rekordy nikto neschvaľuje |
| 9 | mobil | odhlásenie sa dá nájsť do dvoch ťuknutí |

Riadok 4 je bezpečnostný.

## Formát reportu

1. Tabuľka 9 riadkov — **neoznačuj ✅ nič, čo si nespustil**
2. Zoznam zmenených súborov
3. Presný počet stránok
4. Kam si dal odhlásenie na mobile a prečo
5. Výsledky kontrol

**Commitni, pushni, otvor PR do `main`.** Nemení schému ani `middleware.ts` —
ak sú CI zelené, môžeš zmergovať sám.
