# PREVADZKA.md — príručka obsluhy

Ako projekt Gladiator Gym prevádzkovať, kontrolovať a opravovať.

Verzia 1.0 · 30. 7. 2026

> **Táto príručka popisuje iba to, čo dnes naozaj existuje.**
> Po každej etape do nej pribudne kapitola. Nič tu nie je „do budúcna".

---

## 0. Čo dnes existuje a čo nie

| Existuje | Neexistuje |
| --- | --- |
| verejný web, 14 stránok | používateľské účty |
| PWA — appka sa dá pridať na plochu | prihlasovanie |
| kostra `/klub` a `/sprava` s textom „Pripravuje sa" | roly member a admin |
| databáza Supabase — **prázdna, nula tabuliek** | rekordy, rebríček, výzvy |
| automatická kontrola kódu pri každej zmene | administrácia klubu |
| ochrana hlavnej vetvy | zálohy databázy |

**Dnes sa teda nedá nikam prihlásiť** — nie je kam. To príde v etape G.

Adresa `/admin/objednavky` existuje z pôvodného webu, ale vracia chybu 503,
lebo nemá nastavené heslo. Je to zámerné a bezpečné: keď chýba konfigurácia,
stránka sa **zamkne**, neotvorí.

---

## 1. Kde čo žije

| Vec | Kde | Identifikátor |
| --- | --- | --- |
| kód | GitHub | `maxperformmethod-oss/Gladiator` |
| beh webu | Vercel | projekt `gladiator` |
| verejná adresa | Vercel | `gladiator-ruby.vercel.app` |
| databáza | Supabase | projekt `Gladiator gym`, ref `dhuynypsdbqdkkaqjxwv`, Írsko |
| dokumentácia | v repozitári | priečinok `docs/` |

---

## 2. Vercel — čo beží na produkcii

**Produkcia** je to, čo vidí návštevník na `gladiator-ruby.vercel.app`.
Nasadzuje sa **výhradne** z vetvy `main`.

**Preview** je skúšobná verzia každej inej vetvy. Má vlastnú náhodnú adresu,
Google ju neindexuje a nikto sa na ňu náhodou nedostane.

### Ako zistiť, čo je nasadené

1. [vercel.com](https://vercel.com) → projekt **gladiator** → záložka **Deployments**
2. Zoznam je zoradený od najnovšieho. Hľadaj štítok:
   - **Production** — toto vidia ľudia
   - **Preview** — skúšobná verzia vetvy

Pri každom deployi je uvedený commit. Ten istý kód nájdeš na GitHube.

### Keď deploy zlyhá

Klikni na červený deploy → **Building** → prečítaj posledné riadky logu.
Skoro vždy je príčina v poslednom commite.

**Nerieš to sám.** Pošli mi tie riadky.

### Čo NIKDY nerob vo Vercel dashboarde

- nemeň **Production Branch** — musí zostať `main`
- nemaž environment premenné
- nespúšťaj **Redeploy to Production** bez dôvodu
- nepripájaj iný repozitár

---

## 3. GitHub Actions — automatická kontrola

Pri každom pull requeste sa spustí kontrola s názvom **`quality`**.
Robí tri veci, v tomto poradí:

| Krok | Čo overuje | Keď zlyhá, znamená to |
| --- | --- | --- |
| **Typecheck** | typy v TypeScripte | niekde sa používa premenná zle |
| **Lint** | štýl a bežné chyby | kód porušuje pravidlá projektu |
| **Build** | či sa web dá vôbec zostaviť | **toto je najvážnejšie** |

Ak `quality` svieti načerveno, **pull request sa nedá zmergovať.** Nie preto,
že by ti to niekto zakazoval — GitHub to jednoducho neumožní.

### Ako sa pozrieť na výsledok

**V prehliadači:** GitHub → repozitár → záložka **Actions** → klikni na beh →
klikni na job `quality` → rozbaľ krok, ktorý má červený krížik.

**V termináli:**

```
gh pr checks           # stav kontrol aktuálnej vetvy
gh run list --limit 5  # posledných päť behov
gh run view --log      # celý log
```

### Druhá kontrola — `audit`

Hľadá známe zraniteľnosti v balíkoch. **Dnes je vždy zelená, aj keď niečo
nájde** — je nastavená tak zámerne, aby nezablokovala prácu.

Preto ju neber ako dôkaz, že je všetko v poriadku. Keď odstránime zvyšné
zraniteľnosti, prepneme ju na skutočnú podmienku.

---

## 4. Supabase — pohľad do databázy

### Čo tam dnes je

**Nič.** Schéma `public` má nula tabuliek. Žiadny používateľ. Žiadna migrácia.

To nie je chyba — tak to má byť, kým nedokončíme návrh schémy.

### Ako sa pozrieť

1. [supabase.com](https://supabase.com) → projekt **Gladiator gym**
2. **Table Editor** — tabuľky a ich obsah, ako v Exceli
3. **SQL Editor** — na dotazy. Užitočné:

```sql
-- aké tabuľky existujú
select tablename from pg_tables where schemaname = 'public';

-- koľko je registrovaných používateľov
select count(*) from auth.users;
```

4. **Authentication → Users** — zoznam účtov *(dnes prázdny)*
5. **Logs** — čo sa v databáze dialo

### Tento projekt je STAGING

Slúži na vývoj a skúšanie. **Produkčný projekt vznikne samostatne** pred
spustením naostro.

Preto sem nikdy nedávaj reálne osobné údaje členov.

### Čo NIKDY nerob v Supabase

- nespúšťaj `DROP TABLE` ani `TRUNCATE`
- nemeň heslo databázy bez toho, aby si to povedal
- nezapínaj nové rozšírenia
- nemaž nič z priečinka **Authentication**

Ak si čímkoľvek neistý — **odfoť obrazovku a pošli mi ju.** Databázu sa dá
pokaziť za tri sekundy a opravovať tri dni.

---

## 5. Vetvy a pull requesty

### Prečo sa nedá pushovať priamo do `main`

`main` je to, čo beží na produkcii. Ochrana je zapnutá zámerne, aby ti jeden
unavený príkaz nezhodil web klienta.

Každá zmena musí prejsť touto cestou:

```
nová vetva  →  commit  →  push  →  pull request  →  quality zelený  →  merge
```

### Aké vetvy dnes existujú

| Vetva | Čo v nej je |
| --- | --- |
| `main` | to, čo beží na produkcii |
| `feat/pwa-shell` | PWA a kostra `/klub`, zatiaľ nepushnutá |

Vetvy `dependabot/...`, ktoré si videl, boli automatické návrhy aktualizácií.
Všetky sú vyriešené.

### Užitočné príkazy

```
git status              # čo je rozrobené
git branch --show-current   # na ktorej vetve som
git log --oneline -5    # posledných päť zmien
gh pr list              # otvorené pull requesty
```

---

## 6. Keď sa niečo pokazí

### Zásada číslo jeden

**Neopravuj to sám a nemaž nič.** Väčšina škôd v projektoch nevznikne
z pôvodnej chyby, ale z unáhlenej opravy.

### Čo spraviť

1. Odfoť alebo skopíruj celú chybovú hlášku, nie len poslednú vetu
2. Zapíš si, čo si robil tesne predtým
3. Spusti `git status` a pošli mi výstup
4. **Nespúšťaj** `git reset`, `git push --force` ani `npm audit fix`

### Ako sa vracia zmena späť

Každý commit sa dá vrátiť jedným príkazom:

```
git revert <hash-commitu>
```

Vytvorí nový commit, ktorý zmenu zruší. **História zostane** — vidno, že sa
niečo skúsilo a vrátilo. Práve preto robíme malé commity: vrátiť sa dá presne
jedna vec.

Ak je pokazený deploy na produkcii, dá sa vo Vercel dashboarde pri staršom
deployi kliknúť **Promote to Production**. Web sa vráti do predošlého stavu
za pár sekúnd.

---

## 7. Slovník

| Pojem | Po ľudsky |
| --- | --- |
| **commit** | uložená zmena s popisom, čo sa zmenilo |
| **vetva** | samostatná verzia projektu, kde sa dá pracovať bez rizika |
| **pull request** | návrh na zlúčenie vetvy do `main`, ktorý prejde kontrolou |
| **merge** | zlúčenie schválenej vetvy do `main` |
| **CI** | automatická kontrola pri každom pull requeste |
| **deploy** | nasadenie novej verzie na server |
| **staging** | skúšobné prostredie, kde sa nič nerozbije |
| **migrácia** | zmena štruktúry databázy |
| **RLS** | pravidlá v databáze, kto smie vidieť ktoré riadky |
| **env premenná** | tajné nastavenie mimo kódu, napr. heslo k databáze |

---

## 8. Denná rutina — čo si všímať

**Raz za týždeň, päť minút:**

- [ ] GitHub → **Actions** — je posledný beh na `main` zelený?
- [ ] GitHub → **Pull requests** — nečakajú tam nové Dependabot návrhy?
- [ ] Vercel → **Deployments** — je posledný Production deploy úspešný?
- [ ] otvor `gladiator-ruby.vercel.app` a preklikaj pár stránok

**Keď príde e-mail z GitHubu:** e-maily chodia s oneskorením a nemusia
zodpovedať skutočnosti. Skutočný stav vždy over príkazom `gh pr view` alebo
priamo na webe GitHubu.

---

## 9. Čo pribudne v ďalších etapách

| Etapa | Kapitola, ktorá sem pribudne |
| --- | --- |
| prvá migrácia | ako čítať tabuľky a čo v nich je |
| prihlasovanie | ako sa prihlásiť, ako si nastaviť admin účet, ako resetovať heslo |
| členské funkcie | ako appka funguje z pohľadu člena |
| administrácia | ako schvaľovať výsledky a spravovať cviky |
| testovanie | zoznam kontrol, ktoré musia prejsť pred spustením |
| produkcia | ako prepnúť na ostrú databázu a čo overiť pred spustením |
