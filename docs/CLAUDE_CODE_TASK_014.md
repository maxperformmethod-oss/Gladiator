# CLAUDE_CODE_TASK_014 — Etapa G3: ochrana ciest a dokončenie prihlasovania

Verzia 1.0 · 1. 8. 2026 · Cieľ: **`/klub` je len pre členov, `/sprava` len pre adminov**

---

## Rozsah čítania

Prečítaj iba: `CLAUDE.md`, `docs/CURRENT_STATUS.md`, `docs/TESTOVANIE.md`
a toto zadanie. **Nerob audit repozitára, nerekonštruuj históriu.**

Ďalšie súbory otváraj len tie, ktoré priamo meníš.

---

## Východisko

G2 je hotová a **overená end-to-end** (registrácia, prihlásenie, potvrdenie
e-mailu, reset hesla, voľba prezývky). Testovanie odhalilo štyri nálezy —
tri z nich rieši táto etapa.

```
git checkout main && git pull        → základ potvrdí Maxim
git checkout -b feat/route-guards
```

---

## Tri časti, jedno zastavenie

> Pôvodne „dve zastavenia" (po A a po B). **Maxim 1. 8. 2026 rozhodol robiť
> A, B aj C v jednom behu** — jedno zastavenie až na konci.

| Časť | Čo | Po nej |
| --- | --- | --- |
| A | ochrana `/klub` a `/sprava` + odhlásenie | pokračuj |
| B | nálezy A, B, C, D z testovania | pokračuj |
| C | logovanie dôvodu zlyhania v callbacku | **ZASTAV + report** |

---

## ZAKÁZANÉ v celej úlohe

- žiadna zmena `prisma/schema.prisma`, žiadna migrácia
- žiadny `npm install` — vrátane Sentry, ten príde samostatne
- `src/app/globals.css`, `src/lib/gym.ts`, `src/lib/pricing.ts` — nedotýkať sa
- `src/middleware.ts` — **nedotýkať sa**, ochrana ide cez layouty (rozhodnutie z G2)
- verejné stránky mimo hlavičky — nedotýkať sa
- žiadne `as any`, `@ts-expect-error`, `eslint-disable`
- necommituj a nepushuj bez schválenia

---

# ČASŤ A — ochrana ciest

## A1. `src/app/klub/layout.tsx`

Zavolaj `requireClen()` z `src/server/auth.ts`. Neprihlásený → `/prihlasenie`.
Prihlásený bez `Clen` → `/registracia/prezyvka`. Neaktívny člen → `/prihlasenie`.

To všetko už `requireClen()` vie — **nepíš tú logiku znova**, len ju zavolaj.

## A2. `src/app/sprava/layout.tsx`

Zavolaj `requireAdmin()`. Pripomínam pravidlo z G2: **`notFound()`, nie
`redirect()`** — člen ani cudzí človek sa nemá dozvedieť, že `/sprava` existuje.

## A3. Odkaz v hlavičke

`src/components/layout/Header.tsx` — pridaj jednu položku podľa stavu:

| Stav | Zobraz |
| --- | --- |
| neprihlásený | „Prihlásenie" → `/prihlasenie` |
| prihlásený člen | „Klub" → `/klub` |
| prihlásený admin | „Klub" + „Správa" → `/sprava` |

Rolu čítaj **zo servera**, nie z klienta. Ak je Header client komponent,
stav mu odovzdaj z rodiča ako prop — **nevytváraj nový klientsky Supabase
dotaz v hlavičke.**

Vizuál drž v existujúcom štýle. Žiadne nové CSS triedy, žiadne zmeny
`globals.css`.

## A4. Odhlásenie

`odhlas()` už existuje v `src/server/actions/auth.ts`, ale nie je nikde
zapojená. Pridaj tlačidlo „Odhlásiť sa" do `/klub` — zatiaľ stačí na stránke
klubu, nie v hlavičke.

## A5. Overenie — povinné, ručne

`npm run dev`, testuj v tomto poradí:

| Stav | Cesta | Očakávané |
| --- | --- | --- |
| odhlásený | `/klub` | presmerovanie na `/prihlasenie` |
| odhlásený | `/sprava` | **404**, nie presmerovanie |
| prihlásený člen | `/klub` | zobrazí sa |
| prihlásený člen | `/sprava` | **404** |
| prihlásený člen | `/klub` → Odhlásiť sa | ide na `/`, potom `/klub` presmeruje |
| ktokoľvek | `/`, `/cennik` | bez zmeny |
| ktokoľvek | `/admin/objednavky` | **stále pýta heslo** |

Testovací účet: `maxperformmethod@gmail.com`. Rolu `ADMIN` si nastav priamo
v tabuľke `Clen` a po teste vráť späť na `CLEN`.

Nahlás túto tabuľku (v závere — jedno zastavenie, pozri hore).

---

# ČASŤ B — nálezy z testovania

Podrobnosti v `docs/TESTOVANIE.md`, sekcia „Nálezy".

## B1. Nález A — chýba odkaz na obnovu hesla

Na `/prihlasenie` pridaj odkaz „Zabudol si heslo?" → `/obnova-hesla`.
Dnes sa na tú stránku nedá dostať inak než ručným napísaním adresy.

## B2. Nález B — nepotvrdený e-mail vyzerá ako zlé heslo

Chybovú hlášku **nemeň** — musí zostať „Nesprávny e-mail alebo heslo."
pre všetky prípady, inak prezradíme, kto je registrovaný.

Namiesto toho pridaj na `/prihlasenie` **trvalú poznámku** pod formulár,
zobrazenú **vždy**, nie podmienene:

> Ak si sa práve zaregistroval, najprv potvrď e-mail — odkaz sme ti poslali.

Keďže sa zobrazuje vždy, neprezradí nič o konkrétnom účte.

## B3. Nález C — nezrozumiteľná hláška pri zakázanej prezývke

`registruj()` vracia jednu spoločnú vetu aj pri zakázanej prezývke
(`admin`, `gladiator`, …). Používateľ vidí „prezývku (3–20 znakov)"
a nechápe, prečo mu `admin` neprešiel.

Rozdeľ na dve hlášky:

- zakázaná prezývka → „Túto prezývku nemôžeš použiť. Vyber si inú."
- ostatné → pôvodná spoločná veta

**Pozor:** toto sa týka len prezývky. Hlášky okolo e-mailu a hesla
**musia zostať spoločné a neutrálne**.

## B4. Nález D — po chybe sa vymažú všetky polia

Po neúspešnom odoslaní zostane e-mail a prezývka vyplnené. Heslo sa
z bezpečnostných dôvodov **vymaže vždy**.

Nahlás v závere (jedno zastavenie — pozri hore).

---

# ČASŤ C — logovanie v callbacku

`src/app/api/auth/callback/route.ts` dnes pri každom zlyhaní pošle
používateľa na `/prihlasenie` bez akéhokoľvek záznamu. Pri testovaní sa
dôvod dal zistiť len z Supabase logov.

Doplň `console.error` s dôvodom — chýbajúci `code`, chyba z
`exchangeCodeForSession`, chýbajúci `Clen`. Formát:

```
[auth/callback] <dôvod>
```

**Pre používateľa sa nemení nič** — stále neutrálne presmerovanie bez
detailu. Záznam ide len na server.

Toto je príprava na Sentry, ktoré príde v samostatnej etape.

---

## Kontrola pred reportom

```
npx tsc --noEmit
npm run lint
npm run build
git status --short
git diff --stat
```

- [ ] build **43/43** — G3 nepridáva žiadnu novú stránku
- [ ] `git diff` neobsahuje `globals.css`, `gym.ts`, `pricing.ts`,
      `prisma/`, `middleware.ts`
- [ ] `/admin/objednavky` stále pýta heslo
- [ ] žiadny nový balík

---

## Report

```
## A. OCHRANA CIEST    zoznam zmenených súborov
## A5. TABUĽKA         7 riadkov
## B. NÁLEZY A–D       doslovné znenie nových hlášok
## C. LOGOVANIE        zoznam dôvodov
## KONTROLY            tsc · lint · build · git
## RIZIKÁ
## NÁVRH COMMITU
## OTÁZKY              max 3
```

**Necituj celé súbory.** Stačí `git diff --stat` a doslovné znenie hlášok.

---

## Ukončenie

Po Časti C **zastav**. Necommituj, nepushuj.

Ak by ťa čokoľvek nútilo zmeniť `middleware.ts`, `globals.css` alebo schému —
**zastav a opýtaj sa.**
