# PRIRUCKA_SUPABASE.md — účty, databáza, čo sa deje pod kapotou

Verzia 1.0 · 4. 8. 2026 · učebná príručka pre Maxima

Cieľ: aby si vedel sám založiť účet, zmeniť rolu, pozrieť sa do databázy
a hlavne **rozumel, prečo to funguje tak, ako to funguje**.

---

## 1. Čo je Supabase a čo z neho používame

Supabase je **PostgreSQL databáza** s pár službami navrch. Ponúka databázu,
prihlasovanie, úložisko súborov, realtime a serverové funkcie.

**My používame dve veci:**

| Služba | Na čo | Používame? |
| --- | --- | --- |
| **Database** (Postgres) | naše tabuľky — `Clen`, `Cvik`, `Vyzva`… | áno |
| **Authentication** | účty, heslá, e-mailové odkazy | áno |
| Storage | súbory a obrázky | nie *(príde s administráciou obsahu)* |
| Realtime | živé zmeny | nie *(Fáza 2 — QR vstupy)* |
| Edge Functions | serverový kód | nie |

Projekt: **`Gladiator gym`**, ref `dhuynypsdbqdkkaqjxwv`, región Írsko.
**Je to staging** — skúšobné prostredie. Produkčný projekt zatiaľ neexistuje.

---

## 2. Najdôležitejšia vec: účet nie je jedna tabuľka, ale dve

Toto býva zdroj zmätku, tak pomaly.

Keď sa niekto zaregistruje, vzniknú **dva záznamy v dvoch rôznych miestach**:

| Kde | Čo tam je | Kto to spravuje |
| --- | --- | --- |
| `auth.users` | e-mail, zahashované heslo, či je e-mail potvrdený | **Supabase** — my tam nesiahame |
| `public."Clen"` | prezývka, rola, nastavenia, väzby na tréningy | **naša aplikácia** |

Prepojené sú cez `Clen.authUserId`, ktoré ukazuje na `auth.users.id`.

**Prečo dve?** Lebo Supabase spravuje heslá a bezpečnosť prihlásenia sám —
to nechceme písať my. Ale naše veci (rola, prezývka, cviky) do jeho tabuľky
patriť nemôžu. Preto máme vlastnú.

**Dôsledok, ktorý si zapamätaj:** keď zmažeš účet v `Authentication → Users`,
riadok v `Clen` tam zostane osirený. A naopak. Vždy rieš obidve strany.

### Ako sa `Clen` vytvorí

Nevytvára ho Supabase. Vytvára ho naša aplikácia pri prvom prihlásení —
funkcia `zabezpecClena()` v `src/server/auth.ts`. Pozrie sa, či pre daného
`auth.users.id` už `Clen` existuje; ak nie, založí ho s rolou `CLEN`.

Preto: **nový účet je vždy najprv obyčajný člen.** Admina z neho spravíš ty.

---

## 3. Ako založiť účet — tri spôsoby

### Spôsob A — cez appku (normálny, používaj tento)

1. `https://gladiator-eight.vercel.app/registracia`
2. Vyplň e-mail a heslo
3. Prihlás sa

Účet je použiteľný **okamžite**, lebo máme dočasne vypnuté potvrdzovanie
e-mailu (pozri §5).

### Spôsob B — cez Supabase dashboard

Keď potrebuješ účet bez toho, aby si poznal heslo majiteľa.

1. Supabase → **Authentication → Users** → **Add user** → *Create new user*
2. Zadaj e-mail a heslo, zaškrtni **Auto Confirm User**
3. Riadok v `Clen` vznikne **až pri prvom prihlásení** — dovtedy tam nebude

### Spôsob C — cez SQL

**Nerob to.** Heslá sa v `auth.users` ukladajú zahashované a ručne to
nespravíš správne. SQL používaj len na *úpravu* existujúcich účtov, nie
na zakladanie.

---

## 4. Rola — ako spraviť z člena admina

Supabase → **SQL Editor** → nová query:

```sql
update public."Clen"
set "rola" = 'ADMIN'
where email = 'adresa@example.com';
```

Povolené hodnoty: `CLEN`, `ADMIN`. Nič iné — je tam databázové obmedzenie
a čokoľvek iné odmietne.

**Kontrola:**

```sql
select email, prezyvka, rola from public."Clen" order by "createdAt";
```

Po zmene sa **musí človek odhlásiť a znova prihlásiť** — rola sa načíta
pri vytvorení relácie.

### Kto je dnes kto

| Účet | Prezývka | Rola |
| --- | --- | --- |
| `maxperformmethod@gmail.com` | testovac2 | **ADMIN** |
| `maximmalovec8@gmail.com` | Testovač | **CLEN** |

---

## 5. E-maily — čo nefunguje a prečo

**Nemáme vlastnú doménu.** Resend (služba na odosielanie e-mailov) bez
overenej domény doručí **len na adresu vlastníka účtu**, teda
`maxperformmethod@gmail.com`. Na žiadnu inú adresu e-mail nedôjde.

### Čo to znamená v praxi

| Funkcia | Stav | Prečo |
| --- | --- | --- |
| registrácia | **funguje** | potvrdzovanie e-mailu je vypnuté |
| prihlásenie | **funguje** | e-mail netreba |
| obnova hesla | **nefunguje pre cudzie adresy** | odkaz sa nedoručí |
| potvrdzovací e-mail | **vypnutý** | inak by sa nikto nezaregistroval |

Je to **otestované** — obnova hesla na `maxperformmethod@gmail.com` prešla.
Nie je to rozbité, len obmedzené doménou.

### Ako to obísť pri testovaní

Účet zostal nepotvrdený? Potvrď ho ručne:

```sql
update auth.users
set email_confirmed_at = now(), updated_at = now()
where email = 'adresa@example.com' and email_confirmed_at is null;
```

Treba zmeniť heslo? **Authentication → Users** → tri bodky pri používateľovi →
*Reset password* alebo *Send magic link*.

### Čo urobiť, keď bude doména

1. Overiť doménu v Resende (pridať DNS záznamy, ktoré ti dá)
2. Supabase → **Authentication → Providers → Email** → **Confirm email = ON**
3. Supabase → **Authentication → URL Configuration** → Site URL a Redirect URLs
   prepnúť na novú doménu
4. Vercel → doména sa pripojí k projektu `gladiator` pod účtom RPS-2022

**Až potom** začne obnova hesla fungovať pre všetkých.

---

## 6. RLS — prečo máme nula pravidiel a je to v poriadku

**RLS (Row Level Security)** sú pravidlá priamo v databáze: „tento používateľ
smie vidieť len tieto riadky".

U nás:

- RLS je **zapnuté na všetkých 20 tabuľkách**
- **policies (pravidiel) je nula**

Zapnuté RLS bez jediného pravidla znamená: **cez verejné REST API sa
nedostane nikto k ničomu.** Je to zamknuté nadoraz.

**Ako sa teda appka k dátam dostane?** Nechodí cez verejné API. Chodí cez
Prismu s tajným pripojovacím reťazcom zo servera, ktorý RLS obchádza.

**Dôsledok, ktorý musíš poznať:** dáta chráni **výhradne naša aplikácia** —
súbor `src/server/auth.ts` a to, že každá akcia filtruje cez `clenId`
prihláseného člena. Ak by tam vznikla chyba, databáza ju nezachytí.
V dokumentácii je to riziko **R-2**.

---

## 7. Migrácie — a jedna pasca, ktorá nás už raz stála večer

**Migrácia** je súbor, ktorý mení štruktúru databázy (pridá tabuľku, stĺpec…).
Žijú v `prisma/migrations/`. Dnes sú štyri:

```sql
select migration_name, finished_at, rolled_back_at
from public._prisma_migrations order by started_at;
```

### Pasca s checksumom

Každá migrácia má v databáze uložený **odtlačok súboru (checksum)**.
Keď sa súbor zmení čo i len o koniec riadku, odtlačok prestane sedieť
a Prisma navrhne **reset celej databázy** — teda zmazať všetko.

Stalo sa nám to: Git prepísal konce riadkov a migrácia `init` prestala sedieť.

**Poistky, ktoré už máme:**

- `.gitattributes` obsahuje `prisma/migrations/** -text` — Git ich už nemení
- už aplikovaná migrácia sa **nikdy needituje**, vždy sa pridá nová

**Keď Prisma navrhne reset: zastav, nič nepotvrdzuj, napíš mi.**

---

## 8. Prehliadka dashboardu — kam klikať

| Sekcia | Na čo |
| --- | --- |
| **Table Editor** | tabuľky a ich obsah, ako Excel. Dobrý na pozeranie, opatrne na úpravy |
| **SQL Editor** | dotazy. Sem patrí všetko z tejto príručky |
| **Authentication → Users** | zoznam účtov, potvrdenie, reset hesla, mazanie |
| **Authentication → Providers → Email** | zapnutie/vypnutie potvrdzovania e-mailu |
| **Authentication → URL Configuration** | Site URL a Redirect URLs |
| **Database → Migrations** | *nie je to naše* — my používame Prisma migrácie |
| **Logs** | čo sa v databáze dialo. Sem sa pozri, keď niečo padá |
| **Settings → Database** | pripojovacie reťazce (pooler a direct) |

---

## 9. Kuchárka — dotazy, ktoré budeš potrebovať

```sql
-- kto sú členovia a akú majú rolu
select c.email, c.prezyvka, c.rola,
       u.email_confirmed_at is not null as potvrdeny
from public."Clen" c
left join auth.users u on u.email = c.email
order by c."createdAt";

-- spraviť z niekoho admina
update public."Clen" set "rola" = 'ADMIN' where email = 'adresa@example.com';

-- vrátiť ho späť na člena
update public."Clen" set "rola" = 'CLEN' where email = 'adresa@example.com';

-- potvrdiť účet ručne (keď e-mail nedôjde)
update auth.users set email_confirmed_at = now(), updated_at = now()
where email = 'adresa@example.com' and email_confirmed_at is null;

-- globálny katalóg cvikov
select nazov, partia, aktivny, slug
from public."Cvik" where "clenId" is null order by partia, poradie;

-- aktívna výzva a jej zápisy
select v.nazov, v.typ, v.stav, z.hodnota, z.stav as stav_zapisu, c.prezyvka
from public."Vyzva" v
left join public."VyzvaZapis" z on z."vyzvaId" = v.id
left join public."Clen" c on c.id = z."clenId"
where v.stav = 'AKTIVNA';

-- aplikované migrácie
select migration_name, finished_at, rolled_back_at
from public._prisma_migrations order by started_at;
```

---

## 10. Prečo admin nemôže schváliť vlastný zápis

V databáze je obmedzenie **`vyzvazapis_ziadne_samoschvalenie`**: `posudilId`
sa nesmie rovnať `clenId`. Kto zápis podal, ten ho nesmie schváliť.

Zistili sme to tak, že „Schváliť" ticho nefungovalo — admin skúšal schváliť
sám seba a databáza to odmietla. Aplikácia to teraz vysvetlí namiesto toho,
aby mlčala.

**Praktický dôsledok:** na predvedenie rebríčka potrebuješ **dva účty** —
z jedného sa zápis podá, z druhého sa schváli.

---

## 11. Ako to súvisí s Vercelom

Vercel je server, kde beží web. K databáze sa dostane cez premenné prostredia:

| Premenná | Odkiaľ | Na čo |
| --- | --- | --- |
| `DATABASE_URL` | Supabase → Settings → Database → **Transaction pooler** (port 6543) | bežný chod appky |
| `DIRECT_URL` | tamtiež → **Direct connection** (port 5432) | len migrácie |
| `NEXT_PUBLIC_SUPABASE_URL` | Settings → API | prihlasovanie v prehliadači |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Settings → API | tamtiež |

`DATABASE_URL` **musí** končiť na `?pgbouncer=true&connection_limit=1`.
Bez toho sa spojenia vyčerpajú a začnú padať chyby typu
„Server has closed the connection".

Zmena premennej sa prejaví **až pri ďalšom nasadení** — po úprave treba
vo Verceli spustiť **Redeploy**.

---

## 12. Čo v Supabase NIKDY nerob

- `DROP TABLE`, `TRUNCATE`, `prisma migrate reset` — zmažeš dáta
- nemeň heslo databázy bez toho, aby si to povedal — rozbiješ Vercel
- nezapínaj nové rozšírenia
- nemaž nič z **Authentication** bez toho, aby si vyriešil aj `Clen`
- nedávaj sem reálne osobné údaje členov — **je to staging**

Keď si neistý: **odfoť obrazovku a pošli mi ju.** Databázu pokazíš za tri
sekundy a opravovať sa dá tri dni.

---

## 13. Slovník

| Pojem | Po ľudsky |
| --- | --- |
| **Postgres** | druh databázy, ktorý Supabase používa |
| **`auth.users`** | tabuľka Supabase s účtami a heslami |
| **`public."Clen"`** | naša tabuľka s prezývkou, rolou a nastaveniami |
| **RLS** | pravidlá v databáze, kto smie vidieť ktoré riadky |
| **policy** | konkrétne takéto pravidlo. Máme ich nula |
| **migrácia** | súbor, ktorý mení štruktúru databázy |
| **checksum** | odtlačok migračného súboru; keď nesedí, Prisma chce reset |
| **pooler** | rozdeľovač pripojení; appka ide cezeň, migrácie nie |
| **staging** | skúšobné prostredie, kde sa nič vážne nerozbije |
| **env premenná** | tajné nastavenie mimo kódu, napr. heslo k databáze |
