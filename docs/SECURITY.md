# SECURITY.md — Gladiator Gym PWA v1

Verzia: 1.0 · Dátum: 2026-07-30 · Stav: **plán, nie implementácia**

> Tento dokument popisuje, ako má bezpečnosť vyzerať. **Nič z toho zatiaľ nie je
> implementované.** Aplikácia sa v žiadnom bode neoznačuje za bezpečnú alebo
> produkčne pripravenú bez testovania a externej kontroly.

---

## 0. Okamžité zistenia — riešiť pred ďalším postupom

### S-1 · `.env` a `.env.local` sú v projektových znalostiach Claude · STREDNÁ až VYSOKÁ

**Zistenie:** Súbory `.env` (DB connection stringy) a `.env.local` (Stripe kľúče,
admin heslo) boli nahraté do projektových znalostí Claude.ai.

**Čo som overil** — porovnaním hodnôt bez ich zobrazenia:

| Kľúč | Zistenie |
| --- | --- |
| `STRIPE_SECRET_KEY` | **zhodné s `.env.example`** → placeholder |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | zhodné s `.env.example` → placeholder |
| `STRIPE_WEBHOOK_SECRET` | zhodné s `.env.example` → placeholder |
| `NEXT_PUBLIC_SITE_URL` | zhodné s `.env.example` → placeholder |
| `ADMIN_USER` | zhodné s `.env.example` → placeholder |
| **`ADMIN_PASSWORD`** | **líši sa od `.env.example`** → môže byť reálne |
| **`DATABASE_URL`** (v `.env`) | líši sa od `.env.example` |
| **`DIRECT_URL`** (v `.env`) | líši sa od `.env.example` |

**Odporúčané kroky:**

1. Odstrániť `.env` a `.env.local` z projektových znalostí. Do znalostí patrí
   iba `.env.example`.
2. Ručne skontrolovať, či `ADMIN_PASSWORD`, `DATABASE_URL` a `DIRECT_URL`
   obsahujú reálne hodnoty.
3. Ak áno: **zmeniť admin heslo** a **rotovať heslo databázy** v Supabase
   dashboarde, potom aktualizovať Vercel env premenné a lokálne súbory.
4. Overiť, že nikdy neboli commitnuté:
   ```
   git log --all --full-history -- .env .env.local
   ```
   Ak vrátia výsledok, kľúče sú v Git histórii natrvalo → rotácia je povinná
   a je potrebné zvážiť prepis histórie.

**Poznámka:** `.gitignore` je nastavený správne (`.env*` s výnimkou
`!.env.example`), takže commit je nepravdepodobný — ale musí sa overiť, nie
predpokladať.

### S-2 · Admin ochrana stojí na jedinom hesle v env premennej · STREDNÁ

Existujúci `/admin/objednavky` je chránený HTTP Basic Auth. To je pre interný
prehľad objednávok akceptovateľné, ale:

- neexistuje rate limiting → možný brute force,
- heslo je zdieľané, nie personálne → nedá sa zistiť, kto čo urobil,
- Basic Auth credentials si prehliadač pamätá a posiela pri každom requeste.

**Odporúčanie:** ponechať pre v1 (nedotýkať sa existujúceho kódu), ale zaradiť
do Etapy K ako kandidáta na nahradenie Supabase admin rolou.

---

## 1. Plán autentifikácie

### Mechanizmus

Supabase Auth, e-mail + heslo. Session v HTTP-only cookies spravovaná cez
`@supabase/ssr`. Žiadne tokeny v `localStorage`.

### Funkcie v1

| Funkcia | Poznámka |
| --- | --- |
| Registrácia | e-mail, heslo, nickname |
| Potvrdenie e-mailu | povinné pred prvým prihlásením |
| Prihlásenie | e-mail + heslo |
| Obnovenie hesla | e-mailový odkaz s časovo obmedzeným tokenom |
| Odhlásenie | zruší session + **vyprázdni PWA cache** |

**Nie je v v1:** sociálne prihlasovanie, magic link, 2FA, „zapamätaj si ma"
nad rámec štandardnej session.

### Pravidlá pre chybové hlásenia

- Prihlásenie s neexistujúcim e-mailom a prihlásenie so zlým heslom vracajú
  **identickú** hlášku. Inak sa dá zistiť, kto je registrovaný.
- Registrácia s už existujúcim e-mailom nesmie prezradiť, že účet existuje —
  posiela sa neutrálna správa „Skontroluj si e-mail".
- Serverové chyby sa nikdy nezobrazujú s technickým detailom (stack trace,
  SQL, názvy tabuliek).

### Politika hesiel

Minimálne 10 znakov. Kontrola proti zoznamu najbežnejších hesiel na strane
Supabase (ak je dostupná). Žiadne vynútené špeciálne znaky — dĺžka je účinnejšia.

---

## 2. Role member a admin

### Kde je uložená rola

V tabuľke `profiles`, stĺpec `role`, typ enum (`member` | `admin`).

**Nie** v JWT app_metadata ako jediný zdroj pravdy — token môže byť zastaraný po
zmene role. Rola sa číta z databázy pri každom serverovom overení privilegovanej
operácie.

*(Ak sa časom ukáže, že to je výkonnostný problém, dá sa doplniť cache — ale
nikdy nie za cenu toho, že sa zablokovaný člen dostane dnu.)*

### Ako sa rola prideľuje

- Pri registrácii sa **na serveri** nastaví natvrdo `'member'`. Hodnota z
  klientského requestu sa **ignoruje** — nečíta sa vôbec.
- Admin sa prideľuje manuálne v Supabase dashboarde (rozhodnutie D-09) so
  zápisom do `admin_logs`.
- Žiadne UI na povýšenie role v v1.

### Ako sa zabráni zmene role používateľom

Tri nezávislé vrstvy:

1. **Aplikačná:** `server/data/profiles.ts` má funkciu `updateOwnProfile()`,
   ktorá má pevný whitelist upravovateľných polí. `role` a `active` v ňom nie sú.
2. **Databázová (RLS):** UPDATE policy na `profiles` povoľuje zmenu len vlastného
   riadku a **len ak `role` a `active` zostávajú nezmenené**
   (`WITH CHECK (role = OLD.role AND active = OLD.active)` — realizované cez
   trigger alebo column-level policy).
3. **Trigger:** `BEFORE UPDATE` trigger, ktorý zvráti zmenu `role`, ak ju
   nevykonáva `service_role` alebo overený admin.

Tri vrstvy preto, že rozhodnutie D-02 (Prisma-primárne) znamená, že RLS
neplatí pre Prisma spojenie — trigger platí vždy.

### Ochrana `/sprava` (admin rozhranie)

Overenie prebieha na **štyroch** miestach, nezávisle:

1. `middleware.ts` — rýchle odmietnutie neprihlásených (UX, nie bezpečnosť),
2. `src/app/sprava/layout.tsx` — serverové `requireAdmin()` pred renderom,
3. **každá** Server Action a Route Handler v admin doméne — `requireAdmin()`
   na začiatku,
4. RLS policy na úrovni databázy.

**Skryté tlačidlo, `hidden` CSS trieda ani klientský redirect sa nikdy
nepovažujú za ochranu.**

Hlavička odpovede pre `/sprava/**`: `X-Robots-Tag: noindex, nofollow`,
`Cache-Control: no-store, private`.

---

## 3. Návrh RLS

> Platí za predpokladu rozhodnutia D-02 = možnosť B. V tom prípade je RLS
> **druhá vrstva obrany**, nie primárna. Primárnou je serverová autorizácia.
> Napriek tomu sa RLS zapína na všetkých tabuľkách s používateľskými dátami.

`ALTER TABLE ... ENABLE ROW LEVEL SECURITY;` na všetkých šiestich tabuľkách.
Žiadna tabuľka nezostane bez RLS „lebo je verejná".

| Tabuľka | SELECT | INSERT | UPDATE | DELETE |
| --- | --- | --- | --- | --- |
| `profiles` | vlastný riadok; ostatní vidia iba `nickname` cez view `leaderboard_public` | len cez server pri registrácii | vlastný riadok, bez `role` a `active`; admin všetko | nikto (deaktivácia namiesto mazania) |
| `exercises` | každý prihlásený | len admin | len admin | len admin |
| `personal_records` | `user_id = auth.uid()`; admin všetko | `user_id = auth.uid()` vynútené vo `WITH CHECK` | vlastné, do 24 h od vytvorenia; admin všetko | vlastné; admin všetko |
| `challenges` | každý prihlásený vidí `active` a `closed`; `draft` len admin | len admin | len admin | len admin |
| `challenge_entries` | vlastné + `approved` cudzie; admin všetko | `user_id = auth.uid()` a `status = 'pending'` vynútené | **member vôbec nie**; len admin mení `status` | len admin |
| `admin_logs` | len admin | len server (`service_role`) | nikto | nikto |

### Kritické `WITH CHECK` pravidlá

- `personal_records` INSERT: `WITH CHECK (user_id = auth.uid())` — zabráni
  zápisu pod cudzím `user_id`.
- `challenge_entries` INSERT: `WITH CHECK (user_id = auth.uid() AND status = 'pending')`
  — zabráni samoschváleniu už na úrovni databázy.
- `challenge_entries` UPDATE: žiadna policy pre `authenticated` rolu bez admin
  kontroly — member nemá cestu, ako `status` zmeniť.

### Zákaz samoschválenia

Okrem RLS aj aplikačná kontrola: admin nemôže schváliť **vlastný** výsledok.
`challenge_entries.reviewed_by != challenge_entries.user_id` vynútené
CHECK constraintom aj v Server Action.

### Leaderboard

Nikdy sa nečíta priamo z `profiles` join `challenge_entries` v klientskom kóde.
Vytvorí sa databázový **view** alebo serverová funkcia, ktorá vracia výhradne
`nickname` a `hodnota` — žiadny `user_id`, žiadny e-mail, žiadny timestamp
registrácie.

---

## 4. Ochrana pred manipuláciou so vstupmi

| Útok | Ochrana |
| --- | --- |
| zápis pod cudzím `user_id` | `user_id` sa berie **výhradne** zo session, nikdy z requestu |
| samoschválenie výsledku | `status` sa z requestu nečíta; server nastavuje `'pending'` natvrdo |
| povýšenie na admin | `role` nie je v whitelistoch upravovateľných polí + DB trigger |
| duplicitný nickname | UNIQUE index (case-insensitive, D-08) + kontrola v Server Action |
| hodnota rekordu mimo zmyslu (napr. 10 000 kg) | rozsahová validácia v `server/validation/schemas.ts` |
| dátum rekordu v budúcnosti | validácia proti `now()` na serveri |
| mass assignment | explicitný whitelist polí, nikdy `...body` do Prisma `data` |
| CSRF | Next.js Server Actions majú vstavanú ochranu; Route Handlers vyžadujú kontrolu `Origin` |
| enumerácia účtov | identické chybové hlášky (viď §1) |
| brute force prihlásenia | Supabase Auth rate limit; overiť a doladiť v Etape G |

---

## 5. Environment premenné

### Pravidlá

| Pravidlo | Vynútenie |
| --- | --- |
| `service_role` kľúč **nikdy** v `NEXT_PUBLIC_*` | v v1 sa `service_role` vôbec nezavádza (D-02 možnosť B ho nepotrebuje) |
| `service_role` kľúč nikdy v klientskom kóde | `import 'server-only'` vo všetkých serverových moduloch |
| `.env*` sa nikdy necommituje | `.gitignore` (už nastavené správne) |
| `.env.example` obsahuje iba placeholdery | kontrola pri review |
| Reálne hodnoty sa nikdy nepíšu do `docs/` | pravidlo v `CLAUDE.md` |

### Očakávaný stav premenných po Etape F

| Premenná | Prostredie | Citlivosť |
| --- | --- | --- |
| `DATABASE_URL` | server | **tajné** |
| `DIRECT_URL` | server, len migrácie | **tajné** |
| `STRIPE_SECRET_KEY` | server | **tajné** |
| `STRIPE_WEBHOOK_SECRET` | server | **tajné** |
| `ADMIN_PASSWORD` | server | **tajné** |
| `NEXT_PUBLIC_SUPABASE_URL` | klient | verejné |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | klient | verejné (ale RLS musí platiť) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | klient | verejné |
| `NEXT_PUBLIC_SITE_URL` | klient | verejné |
| `ADMIN_USER` | server | citlivé |

**Poznámka k `NEXT_PUBLIC_SUPABASE_ANON_KEY`:** anon key je navrhnutý ako
verejný, ale je bezpečný **iba vtedy, ak RLS skutočne platí**. Pri rozhodnutí
D-02 možnosť B sa anon key používa výlučne na Auth operácie, nie na čítanie dát.

---

## 6. Staging a production

| | Staging | Production |
| --- | --- | --- |
| Vercel | preview deploye z vetvy `develop` | `main` |
| Supabase | **samostatný projekt** (D-11) | existujúci projekt |
| Stripe | test kľúče | test kľúče do právnej kontroly (viď `TODO.md` §2) |
| Dáta | syntetické, žiadne reálne osobné údaje | reálne |
| Migrácie | spúšťajú sa **vždy najprv sem** | až po overení na stagingu |

**Železné pravidlo:** `prisma migrate reset` sa nikdy nespustí proti produkčnej
databáze. Pred každou produkčnou migráciou sa vytvorí záloha a overí sa, že sa
dá obnoviť.

---

## 7. PWA a bezpečnosť

| Riziko | Ochrana |
| --- | --- |
| service worker cachne autentifikovanú stránku | denylist `/klub`, `/sprava`, `/admin`, `/api`, `(auth)`; všetko ostatné okrem statických assetov je network-only |
| cudzia session viditeľná zo zdieľaného zariadenia | pri odhlásení sa vyprázdnia **všetky** cache aj `caches.keys()` |
| zastaraná verzia aplikácie po bezpečnostnej oprave | SW s `updateViaCache: 'none'`; kill-switch SW pripravený vopred |
| offline zápis dát | **nezavádza sa v v1** |

---

## 8. Osobné údaje a GDPR

| Údaj | Ukladá sa? | Kde |
| --- | --- | --- |
| e-mail | áno | výhradne `auth.users` (Supabase), **nie** v `profiles` |
| heslo | áno, hashované | Supabase Auth |
| nickname | áno, verejný | `profiles` |
| osobné rekordy | áno | `personal_records`, viditeľné len vlastníkovi a adminovi |
| meno, priezvisko | **nie** | mimo rozsah v1 |
| telefón, adresa, dátum narodenia | **nie** | zakázané zadaním |
| zdravotné údaje | **nie** | zakázané zadaním; boli by to údaje osobitnej kategórie podľa GDPR |
| IP adresa | Supabase/Vercel logy | mimo našej kontroly, spomenúť v podmienkach |

**Otvorené GDPR úlohy (Etapa K):**

- doba uchovávania údajov člena po deaktivácii účtu,
- postup na výmaz účtu na žiadosť (právo na zabudnutie),
- informácia o spracúvaní pre členov — rozšírenie `/podmienky` alebo nová stránka,
- existujúce právne texty sú podľa `TODO.md` §2 **iba návrh bez právnej kontroly**.

---

## 9. Oblasti vyžadujúce externý audit

Toto sú miesta, kde moja kontrola nestačí a odporúčam nezávislé posúdenie pred
produkčným spustením:

1. **Právne texty** — obchodné podmienky a GDPR sú podľa `TODO.md` len návrh.
   Blokujú aj prepnutie Stripe do produkcie. **Vyžaduje právnika.**
2. **RLS policies** — chyba v jedinej policy môže odhaliť dáta všetkých členov.
   Odporúčam nezávislé prečítanie SQL niekým, kto RLS reálne používal.
3. **Autorizačná vrstva** — pri rozhodnutí D-02/B je to jediná skutočná obrana.
   Odporúčam cielené penetračné testovanie rolí.
4. **Stripe webhook** — overenie podpisu a idempotencia. Chyba znamená falošne
   zaplatené objednávky.
5. **Rotácia tajných údajov** — po zistení S-1.
6. **Konfigurácia Supabase Auth** — nastavenie redirect URL, expirácia tokenov,
   e-mailové šablóny. Zle nastavená redirect URL umožňuje krádež tokenu.
7. **Zálohovanie a obnova** — otestovať skutočnou obnovou, nie predpokladom.

---

## 10. Čo tento dokument netvrdí

- Netvrdí, že aplikácia je bezpečná. Nič z tohto nie je implementované.
- Netvrdí, že existujúci web je bezpečný. Nevidel som jeho zdrojový kód.
- Netvrdí, že tento plán je úplný. Je to východisko, ktoré sa bude dopĺňať
  po Etape A0 a po každej ďalšej etape.
