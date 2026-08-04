# PREVADZKA.md — príručka obsluhy

Ako projekt Gladiator Gym prevádzkovať, kontrolovať a opravovať.

**Verzia 2.0 · 3. 8. 2026** · nahrádza v1.0 z 30. 7. (bola zastaraná o štyri etapy)

> **Táto príručka popisuje iba to, čo dnes naozaj existuje.**
> Nič tu nie je „do budúcna".

---

## 0. Čo dnes existuje a čo nie

| Existuje | Neexistuje |
| --- | --- |
| verejný web na produkcii | zálohy databázy |
| PWA — appka sa dá pridať na plochu | produkčný Supabase projekt |
| **registrácia, prihlásenie, obnova hesla** | Sentry v aplikácii (projekt existuje, nie je zapojený) |
| **roly `CLEN` a `ADMIN`**, ochrana `/klub` a `/sprava` | automatizované testy |
| **členská zóna** — tréning, história, progres, rekordy, časovač | vlastná doména |
| **mesačná výzva a rebríček** + admin schvaľovanie | právne schválené obchodné podmienky |
| **správa cvikov** v `/sprava` | server-side záloha tréningových dát člena |
| databáza — **20 tabuliek, 4 migrácie** | |
| automatická kontrola kódu pri každej zmene | |
| ochrana hlavnej vetvy | |

`/admin/objednavky` je stará stránka pôvodného webu s Basic Auth. Keď chýba
konfigurácia, **zamkne sa** (503) — je to zámerné a bezpečné.

> **Tréningové dáta člena sú lokálne (od H2c).** Plány, história tréningov,
> rekordy aj progres žijú **iba v prehliadači člena** (`localStorage`, kľúč
> `gladiator:klub:v1:<clenId>`), server o nich nevie. Dôsledky pre obsluhu:
> vymazanie údajov prehliadača = strata dát člena (jediná záloha je export JSON
> v Nastaveniach); na inom zariadení/prehliadači člen svoje dáta nevidí; server
> **nedokáže** obnoviť tréningy člena. Na server ide len **výzva a rebríček** —
> hodnotu do výzvy si člen pošle sám a **potvrdzuje ju admin** (údaj na čestné
> slovo, je to vedomé rozhodnutie majiteľa).

---

## 1. Kde čo žije

| Vec | Kde | Identifikátor |
| --- | --- | --- |
| kód | GitHub | `maxperformmethod-oss/Gladiator` |
| beh webu | Vercel | účet **RPS-2022**, projekt `gladiator` |
| verejná adresa | Vercel | **`gladiator-eight.vercel.app`** |
| databáza | Supabase | projekt `Gladiator gym`, ref `dhuynypsdbqdkkaqjxwv`, Írsko |
| chyby | Sentry | org `maxperformstudio`, projekt `gladiator-gym` *(nezapojené)* |
| e-maily | Resend | doručuje **len na `maxperformmethod@gmail.com`** (chýba doména) |
| dokumentácia | v repozitári | priečinok `docs/` |

> **Mŕtva duplicita:** pod osobným účtom `maximmalovec8-6717` existuje druhý
> Vercel projekt `gladiator-ruby.vercel.app`. **Nie je živý.** Ak niekde uvidíš
> túto adresu, je to chyba v dokumentácii — kanonický je `gladiator-eight`.

---

## 2. Účty a role

| Účet | Rola | Načo |
| --- | --- | --- |
| `maxperformmethod@gmail.com` | **ADMIN** | správa klubu, `/sprava` |
| `maximmalovec8@gmail.com` | **CLEN** | testovanie členskej strany |

### Ako zmeniť rolu

Supabase → **SQL Editor**:

```sql
update public."Clen" set "rola" = 'ADMIN' where email = 'adresa@example.com';
```

Povolené hodnoty: `CLEN`, `ADMIN`. Nič iné.

### Ako založiť testovací účet, keď e-mail nechodí

Resend bez overenej domény doručí **len na `maxperformmethod@gmail.com`**.
Preto je v Supabase dočasne **vypnuté „Confirm email"** — nová registrácia je
použiteľná okamžite bez potvrdzovacieho e-mailu.

Ak by predsa zostal účet nepotvrdený:

```sql
update auth.users set email_confirmed_at = now(), updated_at = now()
where email = 'adresa@example.com' and email_confirmed_at is null;
```

> **PRED PRODUKCIOU:** „Confirm email" vrátiť na **ON**. Zapísané v `TODO.md` §6.

### Kam vedú prihlasovacie stránky

| Adresa | Čo robí |
| --- | --- |
| `/registracia` | nový účet |
| `/prihlasenie` | prihlásenie |
| `/obnova-hesla` | žiadosť o reset |
| `/nove-heslo` | nastavenie nového hesla po kliknutí v e-maile |
| `/api/auth/callback` | spracuje odkaz z e-mailu — **nikdy neotváraj ručne** |

---

## 3. Členská a admin zóna — ako sa tam dostať

| Adresa | Kto | Čo tam je dnes |
| --- | --- | --- |
| `/klub` | prihlásený `CLEN` aj `ADMIN` | členská appka (tréning, história, progres, rekordy, časovač, výzva, rebríček) — vlastný layout bez hlavičky webu |
| `/sprava` | len `ADMIN` | rozcestník s odkazmi na podstránky |
| `/sprava/cviky` | len `ADMIN` | globálny katalóg cvikov — zoskupený podľa partie |
| `/sprava/vyzvy` | len `ADMIN` | zakladanie výziev a schvaľovanie zápisov |

> `/sprava` má **funkčný rozcestník** — na podstránky sa dá preklikať. Členská
> zóna aj administrácia majú **vlastný layout** (žiadna marketingová hlavička ani
> päta webu). `/sprava/plany` **už neexistuje** — plány si člen vytvára lokálne
> v `/klub/trening` (dáta žijú v jeho prehliadači, nie na serveri).

Kto nemá rolu `ADMIN`, dostane na `/sprava/*` **404** (nie 403 — zámerne, aby
sa nedalo zistiť, že tá stránka vôbec existuje).

### Odhlásenie a prechod medzi zónami

- **Odhlásenie (člen):** v `/klub` dole v bočnej navigácii (desktop) je prezývka
  a **Odhlásiť sa**; na mobile vedie k nemu **ikona profilu** v hlavičke appky →
  `/klub/nastavenia`, kde je odhlásenie posledná položka. Po odhlásení → `/`.
- **Do administrácie:** položku **Správa** (odkaz na `/sprava`) vidí v `/klub`
  **len admin** — bežný člen ju nedostane ani do HTML stránky. Na desktope je
  v bočnej navigácii, na mobile v `/klub/nastavenia`.
- **Z administrácie späť:** hlavička `/sprava` má **„← Späť do appky"** (`/klub`)
  a **Odhlásiť**.

### Kde sa schvaľujú zápisy výzvy

`/sprava` → dlaždica **Výzvy** (ukazuje, koľko zápisov **čaká**) → `/sprava/vyzvy`
→ pri konkrétnej výzve tlačidlo **Zápisy · N čakajú · M posúdených** →
detail výzvy, kde sa každý zápis **Schváli / Zamietne** (dôvod povinný) alebo
vráti späť na čakajúci. Vlastný zápis admin posúdiť nemôže — musí to iný admin.

> **Osobné rekordy sa NEschvaľujú.** Počítajú sa členovi automaticky z jeho
> odcvičených sérií v prehliadači — admin ich nikdy nevidí a nie je čo posudzovať.
> Schvaľujú sa **iba zápisy do výzvy** (hodnota na čestné slovo).

### Správa cvikov — slug sa pri premenovaní nemení

`/sprava/cviky` zobrazuje pri každom cviku aj jeho **slug** (needitovateľný).
Slug sa odvodí z názvu pri **prvom** založení a **pri premenovaní sa už nemení** —
je to vedomé rozhodnutie (stabilný identifikátor). Preto sa môže stať, že cvik
„Predkopy" má slug `cvik-drep`. Nie je to chyba; ak to prekáža, cvik deaktivuj
a založ nový so správnym názvom.

---

## 4. Vercel — čo beží na produkcii

**Produkcia** je to, čo vidí návštevník na `gladiator-eight.vercel.app`.
Nasadzuje sa **výhradne** z vetvy `main`.

**Preview** je skúšobná verzia každej inej vetvy — vlastná náhodná adresa,
Google ju neindexuje.

### Ako zistiť, čo je nasadené

1. [vercel.com](https://vercel.com) → účet **RPS-2022** → projekt **gladiator** → **Deployments**
2. Štítok **Production** = toto vidia ľudia · **Preview** = skúšobná verzia vetvy

### Keď deploy zlyhá

Klikni na červený deploy → **Building** → prečítaj posledné riadky logu.
Skoro vždy je príčina v poslednom commite. **Nerieš to sám** — pošli mi tie riadky.

### Čo NIKDY nerob vo Vercel dashboarde

- nemeň **Production Branch** — musí zostať `main`
- nemaž environment premenné
- nespúšťaj **Redeploy to Production** bez dôvodu
- nepripájaj iný repozitár

---

## 5. Supabase — pohľad do databázy

### Čo tam dnes je

**20 tabuliek**, 4 aplikované migrácie, 2 účty, 5 globálnych cvikov (overené 4. 8.).
RLS je zapnuté na všetkom a **policies je nula** — verejné REST API je úplne
zavreté. Dáta chráni **výhradne aplikačná vrstva** (`src/server/auth.ts`).

### Užitočné dotazy (SQL Editor)

```sql
-- aké migrácie sú aplikované
select migration_name, finished_at, rolled_back_at
from public._prisma_migrations order by started_at;

-- účty a ich role
select u.email, u.email_confirmed_at is not null as potvrdeny, c.rola
from auth.users u left join public."Clen" c on c.email = u.email;

-- globálne cviky
select nazov, partia, aktivny from public."Cvik" where "clenId" is null;
```

### Tento projekt je STAGING

**Produkčný projekt zatiaľ neexistuje.** Preto sem nikdy nedávaj reálne osobné
údaje členov.

**Blokér:** staging projekt sa zakladá **skôr, než dostane prístup prvý človek
mimo Maxima a Claude Code.** Kým je databáza len naša, migrácie sú bez rizika.
Vo chvíli, keď si prvý majiteľ zapíše prvý tréning, to prestáva platiť.

### Pri zakladaní KAŽDÉHO nového Supabase projektu

Spusti v SQL Editore:

```sql
REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM anon, authenticated, PUBLIC;
```

Nie je to Prisma migrácia zámerne — `rls_auto_enable()` je event trigger funkcia
Supabase platformy, nie náš objekt.

### Čo NIKDY nerob v Supabase

- nespúšťaj `DROP TABLE`, `TRUNCATE` ani `prisma migrate reset`
- nemeň heslo databázy bez toho, aby si to povedal
- nezapínaj nové rozšírenia
- nemaž nič z priečinka **Authentication**

Ak si čímkoľvek neistý — **odfoť obrazovku a pošli mi ju.**

---

## 6. Migrácie — čo sa naučilo na tvrdo

Migrácie sú súbory v `prisma/migrations/`. Každá má v databáze zapísaný
**checksum**. Keď sa súbor zmení čo i len o koniec riadku, checksum prestane
sedieť a `prisma migrate dev` navrhne **reset celej databázy**.

**Reset je zakázaný.** Prišli by sme o účty a dáta.

Poistky, ktoré už sú zavedené:

- `.gitattributes` obsahuje `prisma/migrations/** -text` — Git tie súbory
  nikdy neprepíše na iné konce riadkov
- migrácia, ktorá je už aplikovaná, sa **needituje** — vždy sa pridá nová

Keď `migrate dev` napriek tomu navrhne reset: **zastav, nič nepotvrdzuj,
napíš mi.** Opravuje sa cielene, jedným `UPDATE` v `_prisma_migrations`.

---

## 7. GitHub Actions — automatická kontrola

Pri každom pull requeste beží kontrola **`quality`**: Typecheck → Lint → Build.
Ak svieti načerveno, **pull request sa nedá zmergovať**.

Druhá kontrola **`audit`** hľadá zraniteľnosti v balíkoch. **Dnes je vždy zelená,
aj keď niečo nájde** — je tak nastavená zámerne. Neber ju ako dôkaz poriadku.

```
gh pr checks           # stav kontrol aktuálnej vetvy
gh run list --limit 5  # posledných päť behov
gh run view --log      # celý log
```

---

## 8. Vetvy a pull requesty

```
nová vetva  →  commit  →  push  →  pull request  →  quality zelený  →  merge
```

Do `main` sa nepushuje priamo — ochrana je zapnutá zámerne.

### Pravidlá, ktoré platia

- **Žiadne stacked PR.** Každá vetva vychádza z aktuálneho `main`, každá PR
  mieri do `main`. (PR #24 sa kedysi zmergovala skôr než oprava z #25 a `main`
  dostal starú verziu.)
- **PR, ktorá obsahuje `prisma/schema.prisma`, `src/middleware.ts` alebo
  platobný kód, merguje výhradne Maxim.** Claude Code ju nesmie zmergovať.
- Vetvy sa mažú až po merge. Pri **squash merge** ich Git neoznačí ako
  `--merged` — treba overiť stav PR (`gh pr view <číslo>`), nie stav vetvy.

```
git status                  # čo je rozrobené
git branch --show-current   # na ktorej vetve som
gh pr list                  # otvorené pull requesty
```

---

## 9. Keď sa niečo pokazí

### Zásada číslo jeden

**Neopravuj to sám a nemaž nič.** Väčšina škôd nevznikne z pôvodnej chyby, ale
z unáhlenej opravy.

### Čo spraviť

1. Skopíruj celú chybovú hlášku, nie len poslednú vetu
2. Zapíš si, čo si robil tesne predtým
3. Spusti `git status` a pošli mi výstup
4. **Nespúšťaj** `git reset`, `git push --force`, `npm audit fix` ani
   `prisma migrate reset`

### Ako sa vracia zmena späť

```
git revert <hash-commitu>
```

Vytvorí nový commit, ktorý zmenu zruší. História zostane.

Pokazený deploy na produkcii: Vercel → starší deploy → **Promote to Production**.

### Git operácie robí výhradne Claude Code vo VS Code

`.git` je v OneDrive a zamyká sa. Keď git príkazy bežali z iného prostredia,
rozbil sa index. **Cowork git príkazy nespúšťa.**

---

## 10. Slovník

| Pojem | Po ľudsky |
| --- | --- |
| **commit** | uložená zmena s popisom |
| **vetva** | samostatná verzia projektu, kde sa dá pracovať bez rizika |
| **pull request** | návrh na zlúčenie vetvy do `main`, ktorý prejde kontrolou |
| **merge** | zlúčenie schválenej vetvy do `main` |
| **squash merge** | všetky commity vetvy sa zlúčia do jedného |
| **CI** | automatická kontrola pri každom pull requeste |
| **deploy** | nasadenie novej verzie na server |
| **staging** | skúšobné prostredie, kde sa nič nerozbije |
| **migrácia** | zmena štruktúry databázy |
| **checksum** | odtlačok súboru migrácie — keď nesedí, Prisma chce reset |
| **RLS** | pravidlá v databáze, kto smie vidieť ktoré riadky |
| **RLS policy** | konkrétne pravidlo. Máme ich **nula** — dáta chráni appka |
| **env premenná** | tajné nastavenie mimo kódu |
| **1RM** | odhad maximálky na jedno opakovanie |

---

## 11. Denná rutina — čo si všímať

**Raz za týždeň, päť minút:**

- [ ] GitHub → **Actions** — je posledný beh na `main` zelený?
- [ ] GitHub → **Pull requests** — nečakajú tam Dependabot návrhy?
- [ ] Vercel (účet RPS-2022) → **Deployments** — je posledný Production deploy úspešný?
- [ ] otvor `gladiator-eight.vercel.app` a preklikaj pár stránok
- [ ] prihlás sa a over, že `/klub` funguje

**Keď príde e-mail z GitHubu:** e-maily chodia s oneskorením. Skutočný stav vždy
over cez `gh pr view` alebo na webe GitHubu.

---

## 12. Pred testovacím spustením — čo musí byť hotové

| # | Vec | Stav |
| --- | --- | --- |
| 1 | Supabase Site URL = produkčná adresa | ✅ hotové |
| 2 | Redirect URLs — úzky vzor na `/api/auth/callback**` | ✅ hotové |
| 3 | Confirm email dočasne OFF | ✅ hotové *(pred produkciou späť ON)* |
| 4 | `REVOKE EXECUTE` na `rls_auto_enable()` | ✅ hotové |
| 5 | členská zóna (H2/H2b/H2c) + výzva a rebríček (H3) | ✅ hotové (čaká ručné preklikanie) |
| 6 | staging Supabase projekt pred cudzím prístupom | ⬜ **blokér** |
| 7 | vlastná doména → Resend, Stripe live | ⬜ blokuje reálne e-maily |
| 8 | zálohy databázy (Supabase Pro) | ⬜ pred prvým reálnym členom |
| 9 | právna kontrola podmienok a GDPR | ⬜ blokuje reálne platby |
| 10 | Sentry zapojený do aplikácie | ⬜ |
| 11 | členom vysvetliť, že tréningové dáta sú lokálne (export = záloha) | ⬜ pred prvým reálnym členom |

---

## 13. Čo pribudne v ďalších etapách

| Etapa | Kapitola, ktorá sem pribudne |
| --- | --- |
| ~~H2~~ | ✅ členská zóna hotová (lokálna appka, H2c) |
| ~~H3~~ | ✅ výzva a schvaľovanie hotové — pozri nižšie |
| testovanie | zoznam kontrol pred spustením naostro |

### H3 — ako vypísať výzvu a schvaľovať výsledky (obsluha)

1. `/sprava` → **Výzvy** → *Nová výzva*: názov, popis, typ (**Silová** = kg pri
   konkrétnom cviku, **Časová** = minúty), obdobie, stav **Aktívna**. Naraz môže
   byť aktívna **len jedna** výzva — appka druhú nepustí.
2. Člen v `/klub/vyzva` uvidí výzvu, hodnota sa mu **predvyplní z jeho tréningov**
   v období, a odošle ju. Je to **údaj na čestné slovo**.
3. `/sprava/vyzvy/<výzva>` → zoznam zápisov. **Schváliť** / **Zamietnuť**
   (dôvod povinný). Schválené sa objavia v rebríčku `/klub/rebricek`.
4. Rozhodnutie sa dá kedykoľvek vrátiť späť na čakajúce.
| produkcia | ako prepnúť na ostrú databázu |
