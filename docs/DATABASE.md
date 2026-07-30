# DATABASE.md — návrh schémy PWA v1

**Verzia 3.0 · Etapa E · NÁVRH — čaká na schválenie** · 2026-07-30

> Tento dokument nič nemení. Žiadny SQL sa nespustil, `prisma/schema.prisma`
> zostáva nedotknutý. Toto je návrh na papieri podľa bodu 7 zadania.

---

## 1. Východiskový stav — overený

| | |
| --- | --- |
| Supabase projekt | `Gladiator gym` · ref `dhuynypsdbqdkkaqjxwv` |
| Región | eu-west-1 (Írsko) |
| PostgreSQL | 17.6.1 |
| Tabuľky v `public` | **0** |
| Migrácie | **0** |
| Používatelia v `auth.users` | **0** |
| `prisma/schema.prisma` | 10 modelov, 6 enumov, žiadna migrácia nikdy nebežala |

**Dôsledok:** meníme návrh, nie existujúcu databázu. Nič sa nemigruje, nič sa
nestráca. Toto je posledný moment, kedy je zmena schémy zadarmo.

---

## 2. Kľúčové rozhodnutie: `Clen` sa rozšíri

Zadanie žiadalo novú tabuľku `profiles`. **Neodporúčam ju.**

`Clen` má povinné cudzie kľúče z `Permanentka`, `QRToken` a `VstupHistoria`,
a voliteľný z `Objednavka`. Nová `profiles` by znamenala dva záznamy pre toho
istého človeka — a ty si chcel jedného člena, ktorý sa zaregistruje na webe
a je prihlásený aj v PWA.

Jedna tabuľka. Jedno prihlásenie. Jeden človek.

### Zmeny v `Clen`

```prisma
model Clen {
  id            String    @id @default(cuid())
  authUserId    String?   @unique @db.Uuid      // NOVÉ — väzba na auth.users.id
  email         String?   @unique               // ZMENA — bolo String @unique
  prezyvka      String?                          // NOVÉ — zobrazovaná podoba
  prezyvkaNorm  String?   @unique                // NOVÉ — malé písmená, unikátnosť
  rola          Rola      @default(CLEN)         // NOVÉ
  aktivny       Boolean   @default(true)         // NOVÉ
  meno          String?                          // existujúce
  telefon       String?                          // existujúce
  pobockaId     String?                          // existujúce
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // existujúce vzťahy — nedotknuté
  pobocka       Pobocka?  @relation(...)
  objednavky    Objednavka[]
  permanentky   Permanentka[]
  qrTokeny      QRToken[]
  vstupy        VstupHistoria[]

  // nové vzťahy
  rekordy          Rekord[]     @relation("RekordyClena")
  posudeneRekordy  Rekord[]     @relation("PosudeneRekordy")
  zapisy           VyzvaZapis[] @relation("ZapisyClena")
  posudeneZapisy   VyzvaZapis[] @relation("PosudeneZapisy")
  adminLogy        AdminLog[]

  @@index([rola, aktivny])
}
```

### Prečo `authUserId` a nie `id`

`Clen.id` je `cuid` (textový), `auth.users.id` je `uuid`. Zmeniť primárny kľúč
by znamenalo prepísať štyri existujúce väzby. `authUserId` je samostatný stĺpec —
nula rizika, rovnaký efekt.

Je **nepovinný** zámerne: recepcia môže zapísať člena, ktorý appku nikdy
nenainštaluje. Taký člen nemá Supabase účet, a teda ani `authUserId`.

### `email` zostáva unikátny

Overené v TASK_006: `Clen` sa v aplikačnom kóde **nepoužíva vôbec** — žiadny
`create`, `upsert`, `findUnique`, žiadne čítanie `clen.email`. Zmena
`String` → `String?` teda nemôže nič rozbiť.

`@unique` zostáva. V PostgreSQL viacero `NULL` hodnôt unikátnosť neporušuje
(`NULL ≠ NULL`), takže desiatky členov bez e-mailu vedľa seba obstoja. Zároveň
to zabráni tomu, aby recepcia omylom založila dvoch členov s tou istou adresou.

Unikátne budú tri nezávislé stĺpce: `email`, `authUserId`, `prezyvkaNorm`.

### Prečo `email` prestáva byť povinný

Zdrojom pravdy pre e-mail je `auth.users`. V `Clen` zostáva voliteľne, pre
členov bez online účtu. Zadanie explicitne hovorí, že e-mail sa nemá zbytočne
kopírovať do verejnej tabuľky.

### Politika mazania — doplní sa teraz

Overené v TASK_006: **v celej schéme dnes nie je ani jedno `onDelete`.**
Platia teda Prisma defaulty, čo pri povinných vzťahoch znamená `Restrict` —
člena s permanentkou by sa nedalo vymazať vôbec. To je v rozpore s právom na
výmaz podľa GDPR.

Doplniť to treba **teraz**, kým migrácia nikdy nebežala. Neskôr by to znamenalo
meniť constrainty na živej databáze.

| Vzťah | Politika | Prečo |
| --- | --- | --- |
| `Permanentka` → `Clen` | `Cascade` | bez člena nemá význam |
| `QRToken` → `Clen` | `Cascade` | bez člena nemá význam |
| `VstupHistoria` → `Clen` | `Cascade` | bez člena nemá význam |
| `Rekord` → `Clen` | `Cascade` | osobné dáta člena |
| `VyzvaZapis` → `Clen` (autor) | `Cascade` | osobné dáta člena |
| **`Objednavka` → `Clen`** | **`SetNull`** | **objednávka je účtovný doklad a nesmie zmiznúť** |
| `Rekord.posudil` → `Clen` | `SetNull` | posúdenie prežije výmaz admina |
| `VyzvaZapis.posudil` → `Clen` | `SetNull` | posúdenie prežije výmaz admina |
| `AdminLog.aktor` → `Clen` | `SetNull` | audit stopa prežije, prezývka je uložená ako kópia |
| `Clen` → `Pobocka` | `SetNull` | zrušenie pobočky nemaže členov |

Rozdiel medzi `Objednavka` a ostatnými je zámerný a dôležitý. Osobné tréningové
dáta pri výmaze účtu odídu. Účtovný doklad zostane, len stratí väzbu na osobu —
presne to zákon o účtovníctve vyžaduje a GDPR umožňuje.

### Prečo dva stĺpce na prezývku

`prezyvka` = ako to člen napísal („Gladiator"). `prezyvkaNorm` = malými písmenami
bez diakritiky („gladiator"), unikátny index.

Bez toho by v rebríčku existovali „Gladiator" aj „gladiator" a nikto by ich
nerozlíšil — čo je pozvánka na predstieranie cudzej identity.

Alternatívou je rozšírenie `citext` alebo funkčný index nad `lower()`. Oboje
funguje, ale Prisma ani jedno nevie vyjadriť v schéme — musel by sa ručne
upravovať SQL migrácie. Dva stĺpce sú menej elegantné, ale plne typované
a nerozbijú sa pri ďalšej migrácii.

`prezyvkaNorm` nastavuje **výhradne server** pri vytvorení a zmene prezývky.
Nikdy sa neobjaví v zozname upravovateľných polí a nikdy sa nečíta z requestu.
Klient posiela len `prezyvka`.

**Pravidlá pre prezývku (vynucuje serverová validácia):**
dĺžka 3–20 · povolené `a-z 0-9 _ -` po normalizácii · zakázané `admin`,
`gladiator`, `recepcia`, `sprava`, `system`.

---

## 3. Nové modely — päť

Slovenské názvy, konzistentne s `Pobocka`, `Trener`, `Objednavka`.
Anglické `exercises` / `personal_records` by rozdvojili konvenciu schémy.

### Enumy

```prisma
enum Rola          { CLEN  ADMIN }
enum Jednotka      { KG  OPAKOVANIA  SEKUNDY }
enum VyzvaStav     { NAVRH  AKTIVNA  UZAVRETA }
enum VysledokStav  { SUKROMNY  CAKA  SCHVALENE  ZAMIETNUTE }
```

`VysledokStav` je spoločný pre `Rekord` aj `VyzvaZapis`. Jeden enum, jedna
logika schvaľovania, jeden kus kódu v `src/server/`.

Hodnota `SUKROMNY` dáva zmysel iba pri `Rekord`. Pri `VyzvaZapis` ju zakazuje
databázové obmedzenie — zápis do výzvy je z definície odoslaný, nie súkromný.

### `Cvik`

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

  rekordy   Rekord[]
  vyzvy     Vyzva[]

  @@index([aktivny, poradie])
}
```

`jednotka` určuje, ako sa hodnota zobrazuje a porovnáva. Pri `SEKUNDY` je nižšia
hodnota lepšia — to rieši aplikácia, nie databáza.

### `Rekord`

```prisma
model Rekord {
  id                String        @id @default(cuid())
  clenId            String
  cvikId            String
  hodnota           Decimal       @db.Decimal(8, 2)
  dosiahnute        DateTime      @db.Date
  poznamka          String?
  stav              VysledokStav  @default(SUKROMNY)
  posudilId         String?
  posudene          DateTime?
  dovodZamietnutia  String?
  createdAt         DateTime      @default(now())
  updatedAt         DateTime      @updatedAt

  clen     Clen  @relation("RekordyClena", fields: [clenId], references: [id], onDelete: Cascade)
  cvik     Cvik  @relation(fields: [cvikId], references: [id], onDelete: Restrict)
  posudil  Clen? @relation("PosudeneRekordy", fields: [posudilId], references: [id], onDelete: SetNull)

  @@index([clenId, cvikId, dosiahnute])
  @@index([cvikId, stav, hodnota])
}
```

`Decimal(8,2)` = maximum 999 999,99. Postačuje na kilogramy, opakovania aj
sekundy. **Nie `Float`** — pri váhach sa nepresnosť desatinnej čiarky prejaví.

`onDelete: Cascade` na členovi je zámer: pri výmaze účtu na žiadosť podľa GDPR
odídu aj rekordy.

#### Ako funguje overovanie rekordu

Rekord je **v prvom rade súkromný tréningový denník**. Zapíše sa okamžite,
vidí ho len jeho autor, žiadne čakanie.

Až keď ho chce člen dostať do verejného rebríčka, sám ho prihlási — a vtedy
ide adminovi na schválenie.

```
SUKROMNY    ← východiskový stav, vidí len autor
   ↓ člen sám prihlási do rebríčka
CAKA        ← čaká na admina, autor to vidí ako „čaká na overenie"
   ↓ admin
SCHVALENE   ← objaví sa v rebríčku
   alebo
ZAMIETNUTE  ← s dôvodom; člen môže upraviť a prihlásiť znova → CAKA
```

**Prečo takto, a nie so schvaľovaním všetkého:** pri 60 aktívnych členoch,
ktorí si zapíšu dva rekordy týždenne, by vzniklo 120 schvaľovaní týždenne pre
jedného človeka. To sa nezrúti pri testovaní s piatimi ľuďmi — zrúti sa
v treťom mesiaci prevádzky, keď fronta zamrzne a členovia prestanú vidieť
vlastné záznamy. Admin takto schvaľuje len to, čo niekto chce zverejniť, a to
je zlomok objemu.

**Prechody stavov vynucuje server, nie klient:**

| Z | Do | Kto smie |
| --- | --- | --- |
| `SUKROMNY` | `CAKA` | vlastník záznamu |
| `CAKA` | `SUKROMNY` | vlastník (stiahnutie prihlášky) |
| `CAKA` | `SCHVALENE` / `ZAMIETNUTE` | **iba admin** |
| `ZAMIETNUTE` | `CAKA` | vlastník po úprave |
| čokoľvek | `SCHVALENE` | **nikdy nie člen** |

Pri vytvorení sa `stav` z requestu **nečíta vôbec** — server ho nastaví
natvrdo na `SUKROMNY`.

### `Vyzva`

```prisma
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

  cvik    Cvik         @relation(fields: [cvikId], references: [id], onDelete: Restrict)
  zapisy  VyzvaZapis[]

  @@index([stav, zaciatok])
}
```

„Jedna mesačná výzva" **nie je** databázové obmedzenie. Je to aplikačné pravidlo:
pri aktivácii výzvy sa overí, že neexistuje iná `AKTIVNA` s prekrývajúcim
obdobím. Databázový constraint by zablokoval budúce rozšírenie na viac
súbežných výziev.

### `VyzvaZapis`

```prisma
model VyzvaZapis {
  id                String     @id @default(cuid())
  vyzvaId           String
  clenId            String
  hodnota           Decimal    @db.Decimal(8, 2)
  stav              VysledokStav @default(CAKA)
  posudilId         String?
  posudene          DateTime?
  dovodZamietnutia  String?
  createdAt         DateTime   @default(now())
  updatedAt         DateTime   @updatedAt

  vyzva    Vyzva @relation(fields: [vyzvaId], references: [id], onDelete: Cascade)
  clen     Clen  @relation("ZapisyClena", fields: [clenId], references: [id], onDelete: Cascade)
  posudil  Clen? @relation("PosudeneZapisy", fields: [posudilId], references: [id], onDelete: SetNull)

  @@unique([vyzvaId, clenId])
  @@index([vyzvaId, stav, hodnota])
}
```

`@@unique([vyzvaId, clenId])` — jeden zápis na člena a výzvu. Databáza to
vynúti, aj keby aplikácia zlyhala.

### `AdminLog`

```prisma
model AdminLog {
  id             String   @id @default(cuid())
  aktorId        String?
  aktorPrezyvka  String              // snapshot — prežije výmaz účtu
  akcia          String              // napr. "vyzva.schvalenie"
  cielTyp        String              // napr. "VyzvaZapis"
  cielId         String?
  detail         Json?
  createdAt      DateTime @default(now())

  aktor Clen? @relation(fields: [aktorId], references: [id], onDelete: SetNull)

  @@index([createdAt])
  @@index([aktorId, createdAt])
}
```

`aktorPrezyvka` je uložená kópia, nie vzťah. Dôvod: ak sa účet admina raz
vymaže podľa GDPR, `aktorId` sa vynuluje — ale záznam „kto schválil tento
výsledok" zostane čitateľný. Auditovateľnosť a právo na výmaz sa takto nebijú.

Tabuľka je **iba na zápis**. Žiadny UPDATE, žiadny DELETE z aplikácie.

---

## 4. Databázové obmedzenia navyše

Prisma ich nevie vyjadriť v schéme — doplnia sa ako SQL na koniec vygenerovanej
migrácie:

```sql
-- admin nesmie schváliť vlastný výsledok, v oboch tabuľkách
ALTER TABLE "Rekord"
  ADD CONSTRAINT "rekord_ziadne_samoschvalenie"
  CHECK ("posudilId" IS NULL OR "posudilId" <> "clenId");

ALTER TABLE "VyzvaZapis"
  ADD CONSTRAINT "vyzvazapis_ziadne_samoschvalenie"
  CHECK ("posudilId" IS NULL OR "posudilId" <> "clenId");

-- zápis do výzvy nemôže byť súkromný
ALTER TABLE "VyzvaZapis"
  ADD CONSTRAINT "vyzvazapis_nie_sukromny"
  CHECK ("stav" <> 'SUKROMNY');

-- posúdenie musí mať posudzovateľa aj čas
ALTER TABLE "Rekord"
  ADD CONSTRAINT "rekord_posudenie_uplne"
  CHECK (
    ("stav" IN ('SUKROMNY','CAKA') AND "posudilId" IS NULL AND "posudene" IS NULL)
    OR ("stav" IN ('SCHVALENE','ZAMIETNUTE') AND "posudene" IS NOT NULL)
  );

-- kladné hodnoty
ALTER TABLE "Rekord"     ADD CONSTRAINT "rekord_hodnota_kladna" CHECK ("hodnota" > 0);
ALTER TABLE "VyzvaZapis" ADD CONSTRAINT "zapis_hodnota_kladna"  CHECK ("hodnota" > 0);

-- platné obdobie výzvy
ALTER TABLE "Vyzva"
  ADD CONSTRAINT "vyzva_platne_obdobie" CHECK ("koniec" >= "zaciatok");
```

Najdôležitejšie sú prvé dva: **nikto nemôže schváliť vlastný výsledok** — a nie
preto, že to aplikácia nezabudne skontrolovať, ale preto, že to databáza odmietne.

Štvrtý constraint chráni pred polovičným stavom, kde je výsledok schválený, ale
nie je zaznamenané kým a kedy. Bez neho by sa `AdminLog` a skutočný stav dát
mohli rozísť.

Kontrola „dátum nie je v budúcnosti" sa v `CHECK` urobiť nedá (`now()` nie je
immutable). Rieši ju serverová validácia.

## 4b. Rebríček — z čoho sa počíta

Dve samostatné tabuľky, žiadne nové modely:

| Kde | Zdroj | Dotaz |
| --- | --- | --- |
| `/klub/rebricek` | najlepší **schválený** rekord na člena a cvik, bez časového obmedzenia | `Rekord` kde `stav = SCHVALENE` a `clen.aktivny = true` |
| `/klub/vyzva` | poradie v prebiehajúcej výzve | `VyzvaZapis` kde `stav = SCHVALENE` |

Obe vracajú **výhradne `prezyvka` a `hodnota`**. Nikdy e-mail, nikdy `id`,
nikdy `authUserId`. Index `[cvikId, stav, hodnota]` na `Rekord` je presne pre
prvý dotaz.

Pri cvikoch s jednotkou `SEKUNDY` je nižšia hodnota lepšia — smer zoradenia
určuje aplikácia podľa `Cvik.jednotka`.

## 5. RLS — a prečo nebudeme písať ani jednu policy

Overený fakt: v projekte beží event trigger `public.rls_auto_enable()`, ktorý
**automaticky zapne RLS na každej novej tabuľke** v schéme `public`.

Prisma sa pripája privilegovaným používateľom cez pooler, takže RLS ju
neobmedzuje — aplikácia funguje normálne.

Pre `anon` a `authenticated` roly cez PostgREST platí:
**RLS zapnuté + nula policies = úplné odopretie prístupu.**

To je najsilnejšia možná pozícia a nestojí nás nič. Nepíšeme policies, ktoré by
sa dali napísať zle. Verejné REST API k dátam členov jednoducho neexistuje.

**Overiť po prvej migrácii:**

```sql
SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';
SELECT tablename, policyname FROM pg_policies WHERE schemaname = 'public';
```

Očakávané: `rowsecurity = true` na všetkých tabuľkách, druhý dotaz vráti
prázdny výsledok.

**Ak by sme niekedy chceli čítať dáta cez supabase-js**, policies sa dopíšu
vtedy — nie preventívne.

Skutočná ochrana dát je teda `src/server/auth.ts`. Jeden súbor, ktorý sa dá
prečítať a otestovať na jednom mieste. Tomu zodpovedá aj testovací zoznam
v Etape J.

---

## 6. Ako vznikne člen pri registrácii

```
1. formulár: e-mail, heslo, prezývka
2. server: validácia + kontrola, že prezyvkaNorm je voľná
3. Supabase Auth signUp()  → vznikne auth.users záznam, odíde e-mail
4. Prisma: create Clen { authUserId, prezyvka, prezyvkaNorm, rola: CLEN }
5. „Skontroluj si e-mail"
```

`rola: CLEN` je v kóde natvrdo. Z requestu sa **nečíta**.

**Čo ak krok 4 zlyhá?** Vznikne Supabase účet bez záznamu `Clen`. Riešenie je
jednoduché a nepotrebuje transakcie naprieč dvoma systémami: pri každom
prihlásení sa zavolá `zabezpecClena()`, ktorá záznam doplní, ak chýba.
Idempotentné, samoopravné.

**Admin rolu nastavuješ ručne** v Supabase SQL editore (rozhodnutie D-09).
Žiadne UI na povyšovanie v v1 neexistuje — nie je čo zneužiť.

---

## 7. Prvá migrácia — postup

Baseline so všetkými **15 modelmi** naraz (10 existujúcich + 5 nových).

1. upraviť `prisma/schema.prisma` podľa tohto návrhu
2. `npx prisma format` a `npx prisma validate`
3. `npx prisma migrate dev --name init --create-only` — **iba vygeneruje SQL,
   nespustí ho**
4. **prečítať vygenerované SQL riadok po riadku** a doplniť `CHECK` constrainty
   zo sekcie 4
5. zastaviť dev server (Windows + OneDrive zamykajú Prisma engine)
6. `npx prisma migrate deploy`
7. spustiť overovacie dotazy zo sekcie 5

Krok 3 s `--create-only` je dôležitý. Chceme SQL najprv vidieť, nie ho spustiť
naslepo.

Schéma `auth` **nepatrí Prisme**. `Clen.authUserId` je obyčajný UUID stĺpec bez
Prisma relácie na `auth.users`. Žiadny cudzí kľúč cez hranicu schém — Prisma by
sa pri každej ďalšej migrácii pokúšala `auth` tabuľky „opraviť".

---

## 8. Otvorené body pred spustením migrácie

| # | Otázka | Prečo je dôležitá |
| --- | --- | --- |
| 1 | Vytvára dnes nejaký kód záznamy `Clen`? | ak áno, zmena `email` na nepovinný by ho mohla ovplyvniť — **musí overiť Claude Code** |
| 2 | Ide prvá migrácia na tento projekt, alebo najprv na staging? | dnes máš jeden projekt a je prázdny; odporúčam migrovať sem a druhý projekt založiť až pre produkciu |
| 3 | Súhlasíš so slovenskými názvami modelov? | konzistentné so schémou, ale odchýlka od zadania |
| 4 | Súhlasíš s dvomi stĺpcami na prezývku? | alternatívou je ručná úprava SQL migrácie pri každej zmene |

---

## 8b. Validácia — rozšírime `validate.ts`, `zod` nepridávame

Súčasný `src/lib/validate.ts` má tri funkcie: `reqString`, `optString`,
`isEmail`. Vie typovú kontrolu, `trim`, povinnosť a maximálnu dĺžku.

**Nevie:** minimálnu dĺžku · číselné rozsahy · dátumy · enum hodnoty ·
regulárne výrazy · štruktúrované chyby po poliach.

Pre PWA v1 potrebujeme päť nových funkcií:

```
minMaxString(value, min, max)      → prezývka 3–20 znakov
matchesPattern(value, regex)       → povolené znaky prezývky
numberInRange(value, min, max)     → hodnota rekordu
pastDate(value)                    → dátum nie je v budúcnosti
oneOf(value, allowed[])            → enum hodnoty
```

**Rozhodnutie: rozšíriť `validate.ts`, `zod` nepridávať.**

Dôvod: päť funkcií po piatich riadkoch je menej práce než ďalšia závislosť —
a práve sme v projekte našli 12 zraniteľností v balíkoch, ktoré už máme.
Existujúci súbor navyše určuje štýl, ktorý má zmysel dodržať.

**Kedy toto rozhodnutie prehodnotiť:** ak počet formulárov prekročí pätnásť,
alebo ak začneme potrebovať vnorené objekty a chyby po poliach.

---

## 9. Čo tento návrh zámerne NEOBSAHUJE

Trénerskú rolu · platby · predplatné · QR vstupy · rezervácie · chat · komentáre ·
fotky · videá · upload súborov · zdravotné údaje · dátum narodenia · adresu ·
notifikácie · viacero súbežných výziev · tímy · komentáre pod rekordmi.

Tabuľky `Permanentka`, `QRToken` a `VstupHistoria` zostávajú v schéme
**nedotknuté a nepoužívané**, tak ako doteraz.
