# CLAUDE_CODE_TASK_006 — read-only kontrola modelu `Clen`

Verzia 1.0 · 2026-07-30 · Etapa E, prípravný krok

---

## REŽIM: IBA ČÍTANIE

**Nič neupravuj. Nič nevytváraj. Nič nemaž. Necommituj.**

Zakázané: akákoľvek zmena súboru · `npm install` · `npx prisma` v akejkoľvek
podobe · pripojenie k databáze · `git add` / `commit` / `checkout` / `stash` ·
zmena Vercel alebo Supabase nastavení.

Povolené: `ls`, `cat`, `grep`, `rg`, `find`, `git status`, `git log`, `wc`.

Táto úloha nemení vetvu. Zostaň tam, kde si.

---

## Prečo

Chystám sa v `prisma/schema.prisma` zmeniť model `Clen`:

- `email` prestane byť povinný (`String` → `String?`)
- pribudnú `authUserId`, `prezyvka`, `prezyvkaNorm`, `rola`, `aktivny`
- pribudnú štyri nové vzťahy

Kým neviem, či dnešný kód s `Clen` vôbec pracuje, tú zmenu neurobím.
Zmena povinného stĺpca na nepovinný je bezpečná len vtedy, ak nikde nespolieha
na to, že je vždy vyplnený.

---

## Úlohy

### 1. Kde sa `Clen` používa v kóde

Prehľadaj `src/` (bez `node_modules`, `.next`) a vypíš **každý** výskyt
s cestou a číslom riadku:

```
prisma.clen
prisma.Clen
\.clen\.
clenId
Clen
```

Pri každom nájdenom mieste uveď:

- súbor a riadok,
- o akú operáciu ide (`create`, `createMany`, `upsert`, `update`, `delete`,
  `findUnique`, `findMany`, `connect`, `connectOrCreate`, iné),
- **doslovne odcituj celý blok kódu** okolo (5 riadkov pred a po).

### 2. Vytvára dnes niečo záznam `Clen`?

Odpovedz jednoznačne **áno / nie**:

- [ ] existuje kdekoľvek `prisma.clen.create` alebo `createMany`?
- [ ] existuje `prisma.clen.upsert`?
- [ ] existuje `connectOrCreate` na vzťahu, ktorý ukazuje na `Clen`?
- [ ] vytvára sa `Clen` nepriamo cez vnorený `create` v inom modeli
      (napr. `prisma.objednavka.create({ data: { clen: { create: ... } } })`)?

Ak je čokoľvek z toho **áno**, odcituj to celé a zvýrazni, či sa tam
nastavuje `email`.

### 3. Spolieha sa niečo na to, že `Clen.email` je vždy vyplnený?

- [ ] existuje kód, ktorý číta `clen.email` bez kontroly na `null`?
- [ ] existuje `findUnique({ where: { email } })` na `Clen`?
- [ ] posiela sa `clen.email` niekam ďalej (Stripe metadata, e-mail, JSX)?

Pri každom výskyte odcituj kód a napíš, čo by sa stalo, keby bol `email`
`null`.

### 4. Kolízie názvov nových polí

Over, či sa v `prisma/schema.prisma` **kdekoľvek** (v ktoromkoľvek modeli)
už nevyskytuje niektorý z týchto názvov:

```
authUserId · prezyvka · prezyvkaNorm · rola · aktivny
Cvik · Rekord · Vyzva · VyzvaZapis · AdminLog
Rola · Jednotka · VyzvaStav · VysledokStav
```

Vypíš každý nález s modelom a riadkom. Ak žiadny — napíš to výslovne.

### 5. Presný súčasný stav modelu `Clen`

Odcituj z `prisma/schema.prisma` **doslovne**:

- celý blok `model Clen { ... }`
- každý model, ktorý má vzťah na `Clen` — iba tie riadky so vzťahom a FK,
  vrátane `onDelete` / `onUpdate`, ak sú uvedené

### 6. Používa sa `Trener` alebo `Pobocka` v súvislosti s členmi?

`Clen.pobockaId` existuje. Over, či sa niekde nastavuje, alebo je vždy `null`.

### 7. Kontrola `src/lib/validate.ts`

Odcituj **celý obsah** tohto súboru.

Potrebujem vedieť, čo vie, než rozhodnem, či pridávame `zod` (rozhodnutie D-05).
Zaujíma ma najmä: overuje typy, dĺžky, rozsahy, e-mailové formáty? Vracia
chyby po poliach, alebo len boolean?

---

## Formát reportu

```
## 1. VÝSKYTY Clen           tabuľka súbor:riadok + operácia, potom citácie
## 2. VYTVÁRA SA Clen?       4 otázky, áno/nie + dôkaz
## 3. ZÁVISLOSŤ NA email     3 otázky + dopad prípadného null
## 4. KOLÍZIE NÁZVOV         zoznam alebo „žiadne"
## 5. MODEL Clen             doslovná citácia + vzťahy
## 6. pobockaId              používa sa? áno/nie
## 7. validate.ts            celý obsah + moje zhrnutie, čo vie
## 8. ZÁVER                  je zmena `email` na nepovinný bezpečná? áno/nie/s výhradou
## 9. OTÁZKY                 max 3
## 10. POTVRDENIE            git status --short + „Nevykonal som žiadnu zmenu."
```

---

## Ukončenie

Po reporte **zastav**. Nemeň `prisma/schema.prisma`. Nespúšťaj migráciu.
Nenavrhuj commit.

Ak niečo nevieš prečítať alebo si niečím nie si istý — napíš to do sekcie 9
namiesto toho, aby si to odhadol.
