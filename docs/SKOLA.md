# SKOLA.md — ako sa naučiť tento projekt obsluhovať sám

Verzia 1.0 · 31. 7. 2026

Cieľ: aby si po dokončení projektu vedel web prevádzkovať **bez Coworku aj bez
Claude Code**. Nie programovať — **obsluhovať**.

Referenčná príručka je `PREVADZKA.md`. Tento súbor je učebný plán k nej:
čo sa naučiť, v akom poradí, a ako si to overiť.

Pravidlo: **jedna lekcia na etapu.** Neposúvaj sa ďalej, kým „Skúška" nesedí.

---

## Lekcia 1 — Git bez strachu · **TERAZ**

Toto je jediná vec, kde si už raz prišiel o poriadok v repozitári. Preto prvá.

**Čo pochopiť**

| Pojem | Ľudsky |
| --- | --- |
| `main` | oficiálna verzia, z ktorej sa nasadzuje na produkciu |
| vetva (branch) | pracovná kópia, kde sa smie kaziť |
| commit | uložený, pomenovaný stav — **čo nie je v commite, neexistuje** |
| PR (pull request) | žiadosť o vloženie vetvy do `main`, tu prebehne kontrola |
| merge | schválenie PR — až teraz sa mení `main` a spúšťa sa produkčný deploy |

**Príkazy, ktoré si musíš pamätať**

```
git status --short      čo je zmenené a neuložené
git log --oneline -5    posledných 5 commitov
git branch              na akej vetve stojím
```

**Zlaté pravidlo:** keď nevieš, čo sa deje, spusti `git status --short`.
Prázdny výstup = všetko uložené, nič sa nestratí.

**Skúška:** povedz naspamäť, čo sa stane po merge PR #22 — s `main`,
s Vercelom a s produkčnou doménou.

---

## Lekcia 2 — Čítať PR a CI · pri merge PR #22

**Čo pochopiť:** PR má tri veci, ktoré sa pozerajú v tomto poradí:

1. **Checks** — zelené = lint, build a audit prešli. Červené = **nemergovať**.
2. **Files changed** — počet súborov musí sedieť s reportom Claude Code.
   Ak sedieť nebude, niečo sa dostalo dnu navyše.
3. **Vercel Preview** — odkaz na živú kópiu vetvy. Klikni a pozri sa očami.

**Skúška:** na PR #22 nájdi počet zmenených súborov a povedz, prečo ich je
toľko a či to sedí (nápoveda: line endings).

---

## Lekcia 3 — Vercel · po merge PR #22

**Čo pochopiť**

- **Production deployment** = to, čo vidia ľudia. Vzniká pri merge do `main`.
- **Preview deployment** = jedna adresa na každý PR. Sem chodíš kontrolovať.
- **Rollback** = návrat na predchádzajúce nasadenie, na dva kliky, bez Gitu.
  Toto je tvoja poistka pri každom probléme.
- **Environment Variables** = kľúče (Supabase, Stripe, Sentry). Nikdy nie v kóde.

**Prvá domáca úloha:** máš dva Vercel projekty na jednom repozitári. Nájdi ich,
urči, ktorý je živý, a ten druhý odpoj od GitHubu. Podrobnosti
v `CURRENT_STATUS.md`.

**Skúška:** urob rollback na predchádzajúce nasadenie a hneď zase späť.
Nauč sa to **skôr**, než to budeš potrebovať v strese.

---

## Lekcia 4 — Supabase · počas Etapy G2

**Čo pochopiť**

- **Table Editor** — tabuľky a riadky. Po G2 tu uvidíš prvého člena v `Clen`.
- **Authentication → Users** — účty. Iné než tabuľka `Clen`, pozor na rozdiel.
- **Authentication → URL Configuration** — Site URL a Redirect URLs.
  Bez správneho nastavenia nefunguje potvrdzovací e-mail. Toto nastavuješ ty.
- **RLS** — v tomto projekte zámerne bez policies. Nechaj tak,
  dôvod je v `DATABASE.md` §5.

**Skúška:** zaregistruj si testovací účet a nájdi ho na dvoch miestach —
v `auth.users` aj v tabuľke `Clen`. Vysvetli, prečo je na dvoch.

---

## Lekcia 5 — Keď sa niečo pokazí · Etapa H

Poradie krokov pri probléme. Vždy rovnaké:

```
1. Je to vidieť aj mne?          otvor produkčnú adresu
2. Čo hovorí Sentry?             maxperformstudio / gladiator-gym
3. Čo hovoria Vercel logy?       Deployments → posledný → Logs
4. Beží databáza?                Supabase → projekt → zelený stav
5. Ak zlomil posledný deploy →   ROLLBACK vo Verceli (Lekcia 3)
```

**Rollback je vždy prvá pomoc, nie posledná.** Vrátiť sa a potom v pokoji
hľadať príčinu je lepšie než hľadať príčinu pri padnutom webe.

**Skúška:** nájdi v Sentry testovaciu chybu a povedz, ktorý súbor a riadok ju spôsobil.

---

## Lekcia 6 — Prevádzka naostro · pred spustením

- zálohy databázy (Supabase Pro) a **overená obnova zo zálohy**
- oddelený produkčný Supabase projekt (dnes je jediný projekt = staging)
- Stripe z test módu do produkcie — až po právnej kontrole podmienok
- GDPR, zmluva o spracúvaní údajov
- kto má prístup kam a čo robiť, keď ho stratíš

**Skúška:** obnov databázu zo zálohy do testovacieho projektu.
Záloha, ktorú si nikdy neskúsil obnoviť, nie je záloha.

---

## Čo si nikdy nerob sám bez prípravy

| Vec | Prečo |
| --- | --- |
| `git push --force` | prepíše históriu, ktorú už niekto stiahol |
| merge s červeným CI | nasadíš rozbitý build na produkciu |
| zmena `src/middleware.ts` | stráži `/admin/objednavky` |
| migrácia rovno na produkciu | najprv staging, potom záloha, až potom produkcia |
| kľúč natvrdo v kóde | skončí na GitHube navždy, aj po zmazaní |

---

## Postup

| Lekcia | Kedy | Hotová |
| --- | --- | --- |
| 1 — Git | teraz | ☐ |
| 2 — PR a CI | pri merge PR #22 | ☐ |
| 3 — Vercel | po merge PR #22 | ☐ |
| 4 — Supabase | počas G2 | ☐ |
| 5 — Poruchy | Etapa H | ☐ |
| 6 — Prevádzka | pred spustením | ☐ |
