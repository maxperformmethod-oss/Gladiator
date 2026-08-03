# MAXPERFORM_VZOR.md — čo presne kopírujeme

4. 8. 2026 · zdroj: `Pracovná plocha\Ap` (MAXPERFORM, Vite + React 19 SPA)
Prečítané: `README.md`, `src/types/index.ts`, `src/utils/calc.ts`,
`src/pages/WorkoutActive.tsx`, `src/components/workout/InlineStepper.tsx`

Tento súbor je **referencia**, nie zadanie. Zadanie je `CLAUDE_CODE_TASK_018.md`.
Claude Code nemusí otvárať zdrojáky MAXPERFORMu — všetko podstatné je tu.

---

## 1. Čo z MPM preberáme a čo nie

| Preberáme | Nepreberáme |
| --- | --- |
| tok obrazoviek a spôsob ovládania | `localStorage` ako úložisko |
| dátový model plánu, tréningu, série | absenciu účtov |
| všetky vzorce (objem, 1RM, streak, rekordy) | zdieľanie plánu cez URL + QR |
| časovač odpočinku | zdieľateľnú kartu výsledku (canvas) |
| súhrn po tréningu | demo dáta, export/import JSON |
| vizuál **NIE** — Gladiator má vlastnú čierno-zlatú identitu | odhad kalórií (voliteľné) |

### Prečo sa nedá skopírovať doslova

**MAXPERFORM nemá backend.** Všetky dáta sú v `localStorage` prehliadača,
žiadne účty, žiadna databáza. Preto v ňom scoreboard neexistuje a existovať
nemôže — rebríček naprieč členmi potrebuje server.

Gladiator má Postgres, autentifikáciu a roly. Preto:

| Vrstva | Obsah | Ukladá sa? |
| --- | --- | --- |
| **1. globálna** | katalóg cvikov (`Cvik` s `clenId = null`) | áno, spoločné |
| **2. člen** | `TreningPlan`, `PlanCvik`, `Trening`, `Seria` | **áno, len jeho** |
| **3. odvodená** | rekordy, 1RM, objem, streak, progres, scoreboard | **nie — počíta sa** |

Vrstva 3 sa **nikdy neukladá do tabuliek**. MPM to robí rovnako — rekordy
počíta z histórie pri každom zobrazení.

---

## 2. Dátový model MPM (doslovne zo `types/index.ts`)

### Plán

```ts
PlannedSet   { id, reps: number, weight: number }
PlanExercise { id, name, note?, muscleGroup?, sets: PlannedSet[] }
WorkoutPlan  { id, name, exercises: PlanExercise[], createdAt, updatedAt }
```

> **Toto je najdôležitejší rozdiel oproti dnešnému Gladiatoru.**
> Plán nedrží „4 série × 8 opakovaní". Drží **zoznam sérií, každá s vlastnou
> váhou aj opakovaniami** — napr. rozcvička 60×10, potom 80×5, 80×5, 80×3.

### Aktívny tréning

```ts
ActiveSet      { id, reps, weight, done: boolean }
ActiveExercise { id, name, note?, muscleGroup?, sets: ActiveSet[] }
ActiveWorkout  { planId: string | null, name, startedAt, exercises: ActiveExercise[] }
```

Série sú **predgenerované z plánu** a odškrtávajú sa (`done`). Váhu aj
opakovania sa dá meniť priamo počas tréningu.

### História

```ts
SessionSet      { reps, weight }
SessionExercise { name, note?, muscleGroup?, sets: SessionSet[] }
WorkoutSession  { id, planId, name, startedAt, finishedAt, durationSec,
                  exercises: SessionExercise[], volume }
```

Do histórie idú **len dokončené série** (`activeToSessionExercises` filtruje
`s.done`). Nedokončené sa zahodia.

### Preferencie

```ts
Preferences { restSec: number, soundOn: boolean, onboarded: boolean, weeklyGoal: number }
```

---

## 3. Vzorce — doslovne z `utils/calc.ts`

| Ukazovateľ | Vzorec |
| --- | --- |
| Objem cviku | `Σ (opakovania × hmotnosť)` cez všetky série |
| Objem tréningu | `Σ` objemov cvikov |
| Odhad 1RM (Epley) | `hmotnosť × (1 + opakovania / 30)`; `0` ak váha ≤ 0 alebo opak. ≤ 0 |
| Kalórie (orientačné) | `round(trvanie_sekundy / 60 × 6)` |
| Postup v tréningu | `dokončené série / všetky série` |

### Séria aktívnych dní (streak)

Počet po sebe idúcich dní s dokončeným tréningom, končiacich **dnes alebo
včera**. Dnešný deň sériu neruší, kým neskončí. Ak nie je tréning ani dnes ani
včera → `0`.

### Osobný rekord (jednoduchý)

Najvyššia hmotnosť dokončenej série daného cviku. **Pri zhode hmotnosti
rozhoduje vyšší počet opakovaní.** Série s `hmotnosť ≤ 0` sa preskakujú.

### Rekordný riadok cviku (stránka Rekordy) — tri nezávislé metriky

| Metrika | Ako |
| --- | --- |
| `best1RM` | najvyšší Epley spomedzi všetkých dokončených sérií |
| `heaviestSet` | najvyššia hmotnosť; pri zhode viac opakovaní |
| `bestSetVolume` | najvyšší `opakovania × hmotnosť` jednej série |

Série s `hmotnosť ≤ 0` alebo `opakovania ≤ 0` sa preskakujú. Riadky sa radia
zostupne podľa `best1RM`. Partia sa preberá z **najnovšieho** výskytu cviku,
ktorý ju má priradenú.

### Nové rekordy v tréningu

Porovnaj najlepšiu sériu každého cviku v tomto tréningu s najlepšou sériou toho
cviku **zo starších tréningov**. Ak je vyššia (alebo starší rekord neexistuje),
je to nový rekord — zobraz v súhrne.

### Posledný výkon cviku

Najnovší tréning, ktorý daný cvik obsahuje → jeho najťažšia séria.
Porovnanie mien je **case-insensitive a trimované**.

### Týždeň

Týždeň začína **pondelkom**: `(date.getDay() + 6) % 7`.

---

## 4. Obrazovky MPM

| Obrazovka | Obsah |
| --- | --- |
| **Prehľad** | dnešný odporúčaný tréning · **ring týždenného cieľa** · séria aktívnych dní · objem za 30 dní · týždenná konzistentnosť (po–ne) · posledný tréning · ďalší krok |
| **Tréningy** | zoznam plánov, vytvorenie a úprava (cviky, série, opakovania, hmotnosti, poznámka, partia, zmena poradia) |
| **Aktívny tréning** | uplynutý čas · odškrtávanie sérií · úprava váh a opakovaní za behu · automatický odpočinok · súhrn |
| **História** | mesačný kalendár s odtrénovanými dňami + detail tréningu |
| **Progres** | grafy: max váha / 1RM pre max. 3 cviky · objem a počet tréningov po týždňoch · konzistentnosť · objem podľa partie · najčastejšie cviky |
| **Rekordy** | tabuľka troch metrík pre každý cvik |
| **Časovač** | 30/60/90/120 s + vlastný, pauza, reset, ±15 s, zvuk |
| **Nastavenia** | týždenný cieľ, predvolený odpočinok, zvuk |

---

## 5. Ako sa ovláda aktívny tréning (kľúčové detaily)

Zo `WorkoutActive.tsx`:

- **Lepkavá hlavička** — názov tréningu, `uplynutý čas · dokončené/všetky sérií`,
  pod tým prúžok postupu. Čas tiká každú sekundu.
- **Aktuálny cvik** = prvý cvik s nedokončenou sériou.
- **Odškrtnutie série → automaticky štartuje odpočinok** na `prefs.restSec`.
  Odškrtnutie je *toggle* — dá sa vrátiť.
- **Späť neukončí tréning** — tlačidlo má popisok „Späť (tréning beží ďalej)".
- **Zrušiť** aj **Ukončiť** majú potvrdzovací dialóg.
- Ukončiť s nulou dokončených sérií **nejde** — hláška
  „Označ aspoň jednu dokončenú sériu."
- Po ukončení sa ide rovno na **detail tréningu so súhrnom**.

### InlineStepper — ovládanie čísel palcom

Riadok série má `−` · číselné pole · `+`. Vlastnosti, ktoré treba zachovať:

- výška 40 px, tlačidlá 32 px široké — **dotykové ciele pre palec**
- `inputMode="decimal"` → na iOS vyskočí číselná klávesnica
- prijíma **čiarku aj bodku** (`e.target.value.replace(',', '.')`)
- hodnota sa orezáva do `min`–`max` a zaokrúhľuje na 2 desatinné miesta
- `tnum` (tabuľkové číslice) — čísla neposkakujú pri zmene
- každé tlačidlo aj pole má `aria-label`

---

## 6. Čo NEROBIŤ pri kopírovaní

- **Nekopírovať vizuál MPM.** Gladiator má vlastnú identitu: čierna `#0A0A0A`,
  antracit `#1A1A1A`, zlatá `#D4AF37`, Oswald pre nadpisy (uppercase,
  kondenzovaný), Inter pre text. Preberáme **spôsob ovládania**, nie farby.
- **Nekopírovať `localStorage` vrstvu.** Gladiator ukladá do Postgresu, cez
  server actions, vždy filtrované cez `clenId` prihláseného člena.
- **Nekopírovať zdieľanie plánu cez URL/QR a kartu výsledku.** Neskôr, ak vôbec.
- **Neukladať odvodené hodnoty** (rekordy, 1RM, objem) do tabuliek.
  Model `Rekord` v schéme existuje — je pre **výzvy**, nie pre toto.
