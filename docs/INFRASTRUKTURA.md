# INFRASTRUKTURA.md — čo musíš nastaviť ty

2026-07-30 · Kroky, ktoré sa nedajú urobiť z kódu

---

## Prečo tento dokument

Tri z vecí, ktoré chránia projekt, nie sú v repozitári. Sú to nastavenia
v GitHube, Verceli a Supabase. Nikto ich nespraví za teba a bez nich je
automatika v `.github/` len polovičná.

Odhad času: **25 minút celkovo.**

---

## 1. Ochrana vetvy `main` — ✅ HOTOVÉ 30. 7. 2026

Bez tohto ti stačí jeden unavený `git push` a máš rozbitý web klienta.

1. GitHub → repozitár `maxperformmethod-oss/Gladiator`
2. **Settings → Rules → Rulesets → New ruleset → New branch ruleset**
3. Name: `main protection`, Enforcement status: **Active**
4. Target branches → **Add target → Include default branch**
5. Zaškrtni:
   - **Restrict deletions**
   - **Block force pushes**
   - **Require a pull request before merging**
     - Required approvals: `0` *(si sám — nula je v poriadku, dôležité je,
       že zmena prejde cez PR a teda cez CI)*
   - **Require status checks to pass**
     - pridaj **iba `quality`**
6. Create

### Prečo NIE `audit` ako required check

Job `audit` má `continue-on-error: true`, takže je **vždy zelený** bez ohľadu
na to, čo nájde. V prvom behu našiel **12 high zraniteľností** a napriek tomu
skončil ako „pass".

Ak by si ho nastavil ako required, dostal by si podmienku, ktorá sa nikdy
nespustí — teda falošný pocit istoty. Horšie než nemať ju vôbec.

`audit` sa stane required až po týchto dvoch krokoch, v tomto poradí:

1. odstránenie high zraniteľností (samostatná úloha, viď nižšie),
2. odstránenie `continue-on-error` z workflow.

### Prečo NIE `Vercel` ako required check

Vercel Preview je užitočná informácia, ale ako blokujúca podmienka robí
z externej služby single point of failure pre tvoj merge. Ak má Vercel výpadok,
nezmerguješ nič. Nechaj ho ako nezáväzný check.

### Otvorený bezpečnostný nález — 12 high zraniteľností

Z prvého behu CI, PR #1:

| Balík | Závažnosť | Typ | Oprava |
| --- | --- | --- | --- |
| `next` | **8× high** | **runtime** — SSRF v rewrites, cache confusion, DoS, odhalenie interných Server Function endpointov | non-breaking |
| `postcss` | high | build — XSS, path traversal, čítanie súborov | non-breaking |
| `sharp` | high | runtime — zdedené CVE z libvips | non-breaking |
| `brace-expansion` → `minimatch` → `eslint` | high | **iba dev**, nedostane sa k používateľovi | vyžaduje breaking zmenu |

**Prioritné sú CVE v `next`.** Týkajú sa presne tej časti frameworku, na ktorej
budeme stavať prihlasovanie a Server Actions. Musia byť vyriešené **pred**
Etapou G.

> **`npm audit fix --force` sa v tomto projekte nesmie spustiť nikdy.**
> Navrhuje nainštalovať `@eslint/eslintrc@0.1.0` — downgrade z verzie 3
> na 0.1.0, ktorý rozbije celú ESLint flat config.

## 2. Dependabot security alerts — ✅ HOTOVÉ 30. 7. 2026

Súbor `.github/dependabot.yml` z TASK_004 rieši aktualizácie verzií.
Bezpečnostné upozornenia sa zapínajú zvlášť:

1. GitHub → **Settings → Advanced Security**
2. Zapni **Dependabot alerts**
3. Zapni **Dependabot security updates**

---

## 3. Vercel ↔ Git — ✅ OVERENÉ 30. 7. 2026

Projekt `gladiator` **je** pripojený na `maxperformmethod-oss/Gladiator`.
Production sleduje `main`, Preview sleduje ostatné vetvy. PR #1 vytvoril
funkčný Preview deployment.

**Tvrdenie v `TODO.md` §3b, že `git push` nespúšťa deploy, je zastarané.**
Pri najbližšej úprave `TODO.md` ho oprav.

### Zistenie: Vercel nemá ani jednu vlastnú environment premennú

Aktívne sú iba systémové premenné Vercelu. Chýba `DATABASE_URL`, `DIRECT_URL`,
`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_SITE_URL`,
`ADMIN_USER`, `ADMIN_PASSWORD`.

Dnešný dôsledok na produkcii:

| Časť | Stav | Poznámka |
| --- | --- | --- |
| statické stránky | fungujú | |
| `/admin/objednavky` | vracia 503 | middleware je fail-closed — nedostupný, ale ani zraniteľný |
| `/api/checkout` | čitateľná JSON chyba | platby nefungujú, čo je v súlade s rozsahom |
| pripojenie na Supabase | **žiadne** | produkcia dnes na databázu neukazuje vôbec |

Práve preto sa dá existujúci Supabase projekt vyhlásiť za staging úplne čisto.

> ### PRAVIDLO — platí od Etapy F ďalej
>
> **Do Vercel Production sa nikdy nesmie dostať `DATABASE_URL` staging projektu
> `dhuynypsdbqdkkaqjxwv`.**
>
> Keď budeme prvýkrát nastavovať premenné, najpohodlnejší krok bude skopírovať
> ten istý connection string do Production aj Preview. Tým by sa staging
> a produkcia zliali do jednej databázy — a všetko by pritom fungovalo, takže
> by si si to nevšimol.
>
> Postup: **Preview** dostane staging string. **Production** zostane bez
> `DATABASE_URL` dovtedy, kým nevznikne produkčný Supabase projekt.

## 4. Zálohy databázy — ROZHODNUTÉ

Supabase projekt: `Gladiator gym`, ref `dhuynypsdbqdkkaqjxwv`, eu-west-1 (Írsko).

**Rozhodnutie majiteľa:** kúpiť **Supabase Pro pred spustením naostro**.
Pro obsahuje denné zálohy a point-in-time recovery.

Do vtedy pracujeme na prázdnej staging databáze, kde nie je čo stratiť.

**Podmienka pred prvým reálnym členom:**

- [ ] Pro plán aktívny na **produkčnom** projekte
- [ ] obnovu zálohy **raz reálne vyskúšať**, nie len predpokladať, že funguje

> Záloha, ktorú si nikdy neskúsil obnoviť, nie je záloha.

---

## 5. Staging a produkcia — ROZHODNUTÉ

**Rozhodnutie majiteľa:**

| Kedy | Projekt | Rola |
| --- | --- | --- |
| **teraz** | `Gladiator gym` (`dhuynypsdbqdkkaqjxwv`) | vývoj a staging |
| **pred spustením** | nový, zatiaľ neexistuje | produkcia |

Produkčný projekt vznikne **čistý**, s migráciami už overenými na stagingu —
nie ako niečo, na čom sa mesiace experimentovalo.

Na staging nepatria žiadne reálne osobné údaje ani produkčné Vercel premenné.

**Kontrolný zoznam pri vzniku produkčného projektu:**

- [ ] nový Supabase projekt, región eu-west-1 alebo eu-central-1
- [ ] Pro plán aktivovaný
- [ ] migrácie prehnané najprv na stagingu, až potom sem
- [ ] `DATABASE_URL` produkčného projektu do Vercel **Production**
- [ ] `DATABASE_URL` staging projektu do Vercel **Preview**
- [ ] overiť, že sa nepomiešali — dva rôzne stringy, nie jeden dvakrát
- [ ] obnova zálohy vyskúšaná

## Zhrnutie

| # | Krok | Stav |
| --- | --- | --- |
| 1 | Ochrana `main`, required check `quality` | ✅ hotové |
| 2 | Dependabot alerts + security updates | ✅ hotové |
| 3 | Vercel ↔ Git overené | ✅ hotové |
| 4 | Zálohy — Supabase Pro | rozhodnuté, kúpi sa pred spustením |
| 5 | Druhý Supabase projekt pre produkciu | rozhodnuté, vznikne pred spustením |
| 6 | **Odstrániť 12 high zraniteľností** | **otvorené — pred Etapou G** |
| 7 | Vercel env premenné (Preview) | otvorené — Etapa F |
| 8 | Sentry projekt + `@sentry/nextjs` | otvorené — čaká na schválenie závislosti |
