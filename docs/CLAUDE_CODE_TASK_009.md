# CLAUDE_CODE_TASK_009 — Etapa E: úprava databázovej schémy

Verzia 1.0 · 31. 7. 2026 · Prvá zmena aplikačnej vrstvy

---

## Cieľ

Upraviť `prisma/schema.prisma` podľa `docs/DATABASE.md`.

**Iba súbor schémy. Žiadna migrácia sa nespúšťa. Databáza sa nemení.**

---

## ZAKÁZANÉ

**Zakázané príkazy — ani jeden:**

```
npx prisma migrate      (dev, deploy, reset, resolve, diff, status)
npx prisma db push / db pull / db execute / db seed
npx prisma studio
npm install
```

**Povolené príkazy Prismy** (nedotýkajú sa databázy):

```
npx prisma format
npx prisma validate
npx prisma generate
```

**Zakázané zmeny:** `src/`, `public/`, `.github/`, `package.json`,
`package-lock.json`, `.env*`

Jediný súbor, ktorý sa mení, je `prisma/schema.prisma`.

Necommituj a nepushuj bez schválenia.

---

## Vstupné podmienky

- [ ] `main` je na `2b9cd3c`
- [ ] pracovný strom čistý
- [ ] `docs/DATABASE.md` existuje v repozitári

```
git checkout main && git pull
git checkout -b feat/schema-klub
```

**Najprv si prečítaj `docs/DATABASE.md` celý.** Nižšie je presné znenie zmien,
ale kontext a zdôvodnenie sú tam.

---

## ČASŤ A — úpravy existujúceho modelu `Clen`

### A1. Nové polia

Do `model Clen` pridaj:

```prisma
  authUserId    String?  @unique @db.Uuid
  prezyvka      String?
  prezyvkaNorm  String?  @unique
  rola          Rola     @default(CLEN)
  aktivny       Boolean  @default(true)
```

### A2. Zmena existujúceho poľa

```prisma
  email  String  @unique     // PRED
  email  String? @unique     // PO
```

Overené v TASK_006: `Clen` sa v aplikačnom kóde nepoužíva vôbec, takže táto
zmena nemôže nič rozbiť. V PostgreSQL viacero `NULL` unikátnosť neporušuje.

### A3. Nové spätné vzťahy

Do `model Clen` pridaj:

```prisma
  rekordy          Rekord[]     @relation("RekordyClena")
  posudeneRekordy  Rekord[]     @relation("PosudeneRekordy")
  zapisy           VyzvaZapis[] @relation("ZapisyClena")
  posudeneZapisy   VyzvaZapis[] @relation("PosudeneZapisy")
  adminLogy        AdminLog[]
```

### A4. Index

```prisma
  @@index([rola, aktivny])
```

---

## ČASŤ B — politika mazania

V schéme dnes **nie je ani jedno `onDelete`**. Doplň ich presne takto:

| Model | Pole vzťahu | Doplniť |
| --- | --- | --- |
| `Objednavka` | `clen` | `onDelete: SetNull` |
| `Permanentka` | `clen` | `onDelete: Cascade` |
| `QRToken` | `clen` | `onDelete: Cascade` |
| `VstupHistoria` | `clen` | `onDelete: Cascade` |
| `Clen` | `pobocka` | `onDelete: SetNull` |

Príklad zápisu:

```prisma
  clen Clen @relation(fields: [clenId], references: [id], onDelete: Cascade)
```

**`Objednavka` je zámerne iná než ostatné.** Objednávka je účtovný doklad
a nesmie zmiznúť pri výmaze člena — stratí len väzbu na osobu.
Toto **nezameň**.

Ostatných vzťahov v schéme sa nedotýkaj.

---

## ČASŤ C — nové enumy

```prisma
enum Rola {
  CLEN
  ADMIN
}

enum Jednotka {
  KG
  OPAKOVANIA
  SEKUNDY
}

enum VyzvaStav {
  NAVRH
  AKTIVNA
  UZAVRETA
}

enum VysledokStav {
  SUKROMNY
  CAKA
  SCHVALENE
  ZAMIETNUTE
}
```

---

## ČASŤ D — päť nových modelov

```prisma
model Cvik {
  id        String   @id @default(cuid())
  slug      String   @unique
  nazov     String
  popis     String?
  jednotka  Jednotka
  aktivny   Boolean  @default(true)
  poradie   Int      @default(0)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  rekordy Rekord[]
  vyzvy   Vyzva[]

  @@index([aktivny, poradie])
}

model Rekord {
  id                String       @id @default(cuid())
  clenId            String
  cvikId            String
  hodnota           Decimal      @db.Decimal(8, 2)
  dosiahnute        DateTime     @db.Date
  poznamka          String?
  stav              VysledokStav @default(SUKROMNY)
  posudilId         String?
  posudene          DateTime?
  dovodZamietnutia  String?
  createdAt         DateTime     @default(now())
  updatedAt         DateTime     @updatedAt

  clen    Clen  @relation("RekordyClena", fields: [clenId], references: [id], onDelete: Cascade)
  cvik    Cvik  @relation(fields: [cvikId], references: [id], onDelete: Restrict)
  posudil Clen? @relation("PosudeneRekordy", fields: [posudilId], references: [id], onDelete: SetNull)

  @@index([clenId, cvikId, dosiahnute])
  @@index([cvikId, stav, hodnota])
}

model Vyzva {
  id        String    @id @default(cuid())
  slug      String    @unique
  nazov     String
  popis     String?
  cvikId    String
  zaciatok  DateTime  @db.Date
  koniec    DateTime  @db.Date
  stav      VyzvaStav @default(NAVRH)
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt

  cvik   Cvik         @relation(fields: [cvikId], references: [id], onDelete: Restrict)
  zapisy VyzvaZapis[]

  @@index([stav, zaciatok])
}

model VyzvaZapis {
  id                String       @id @default(cuid())
  vyzvaId           String
  clenId            String
  hodnota           Decimal      @db.Decimal(8, 2)
  stav              VysledokStav @default(CAKA)
  posudilId         String?
  posudene          DateTime?
  dovodZamietnutia  String?
  createdAt         DateTime     @default(now())
  updatedAt         DateTime     @updatedAt

  vyzva   Vyzva @relation(fields: [vyzvaId], references: [id], onDelete: Cascade)
  clen    Clen  @relation("ZapisyClena", fields: [clenId], references: [id], onDelete: Cascade)
  posudil Clen? @relation("PosudeneZapisy", fields: [posudilId], references: [id], onDelete: SetNull)

  @@unique([vyzvaId, clenId])
  @@index([vyzvaId, stav, hodnota])
}

model AdminLog {
  id            String   @id @default(cuid())
  aktorId       String?
  aktorPrezyvka String
  akcia         String
  cielTyp       String
  cielId        String?
  detail        Json?
  createdAt     DateTime @default(now())

  aktor Clen? @relation(fields: [aktorId], references: [id], onDelete: SetNull)

  @@index([createdAt])
  @@index([aktorId, createdAt])
}
```

Umiestni ich **na koniec súboru**, za existujúce modely. Existujúce modely
nepresúvaj ani nepreusporadúvaj — chcem čitateľný diff.

Ku každému novému modelu pridaj krátky slovenský komentár, čo je zač,
v štýle existujúcich komentárov v súbore.

---

## ČASŤ E — kontrola

```
npx prisma format
npx prisma validate
npx prisma generate
npm run lint
npm run build
git diff --stat
git status --short
```

Musí platiť:

- [ ] `npx prisma validate` hlási platnú schému
- [ ] `npx prisma generate` prejde bez chýb
- [ ] `npm run lint` bez chýb
- [ ] `npm run build` bez chýb, **40/40 stránok**
- [ ] `git diff --stat` ukazuje **iba** `prisma/schema.prisma`
- [ ] `git status --short` neukazuje žiadny neočakávaný súbor
- [ ] `package.json` a `package-lock.json` nezmenené
- [ ] v celej schéme je presne **15 modelov** a **10 enumov**

**Ak `npx prisma format` prepíše aj časti súboru, ktorých sme sa nedotkli**
(napr. zarovnanie stĺpcov v starých modeloch), je to v poriadku — ale
**napíš mi to** a vypíš, ktorých modelov sa to týka.

---

## Report

```
## 1. PREČÍTANÉ            potvrď, že si prešiel docs/DATABASE.md
## 2. ZMENY V Clen         doslovný výpis modelu Clen po úprave
## 3. onDelete             tabuľka: model · pole · politika
## 4. NOVÉ ENUMY           zoznam
## 5. NOVÉ MODELY          potvrdenie, že sedia so zadaním
## 6. VÝSTUP KONTROL       validate · generate · lint · build · diff --stat
## 7. FORMÁTOVACÍ ŠUM      ktorých starých modelov sa dotkol prisma format
## 8. CHECKLIST            všetky body ✅ / ❌
## 9. POČTY                koľko modelov a enumov je v schéme
## 10. RIZIKÁ
## 11. NÁVRH COMMITU       napr. feat(db): extend schema for club membership
## 12. OTÁZKY              max 3
```

---

## Ukončenie

Po reporte **zastav**. Necommituj, nepushuj, neotváraj PR.

**Migráciu nespúšťaj.** Prvá migrácia je samostatná etapa a pôjde najprv proti
staging databáze, po samostatnom schválení.

Ak by ťa čokoľvek nútilo zmeniť iný súbor než `prisma/schema.prisma` —
**zastav a opýtaj sa.**
