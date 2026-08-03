# TESTOVANIE.md — ručný testovací scenár

Verzia 1.2 · 1. 8. 2026 · pokrýva Etapy G2 a G3

---

## Výsledky behu 1. 8. 2026 · vetva `fix/signup-redirect` @ `4c0bb66`

Prešiel Cowork cez prehliadač + Supabase. **Žiadna bezpečnostná chyba.**

| # | Test | Výsledok |
| --- | --- | --- |
| 1 | Prezývka `admin` odmietnutá | ✅ |
| 1 | Registrácia → `/registracia/hotovo` | ✅ |
| 1 | `auth.users` riadok, e-mail **nepotvrdený** | ✅ |
| 1 | `Clen`: `Testovač` → `prezyvkaNorm = testovac`, `rola = CLEN`, `aktivny = true` | ✅ |
| 3 | Zlé heslo → „Nesprávny e-mail alebo heslo." | ✅ |
| 3 | **Neexistujúci e-mail → tá istá veta, znak po znaku** | ✅ |
| 4 | Registrácia s **existujúcim e-mailom** → `/registracia/hotovo`, žiadny druhý `Clen` | ✅ |
| 4 | `TESTOVAC` proti `Testovač` → „Túto prezývku už niekto používa." | ✅ |
| 7 | `/admin/objednavky` neprístupné bez hesla | ✅ |
| 7 | `/`, `/cennik`, `/klub`, `/sprava` fungujú | ✅ |
| 2 | **Potvrdzovací e-mail → `/klub`, prihlásený** | ✅ `last_sign_in_at` 09:57:46 |
| 5 | Obnova hesla | ✅ prešla |
| 6 | Voľba prezývky pri chýbajúcom `Clen` | ⬜ neotestované |

**Záver: Etapa G2 je overená end-to-end.** Registrácia → e-mail → callback →
session → `/klub` → záznam `Clen` (`testovac2`, `rola = CLEN`, `aktivny = true`).

### E-maily — vyriešené 1. 8. 2026

Vstavaný mailer Supabase (2 e-maily/hod) nestačil. Prešli sme na **Resend**
cez custom SMTP, limit zdvihnutý na 30/hod.

**Obmedzenie, kým nemáme overenú doménu:** odosielateľ `onboarding@resend.dev`
doručuje **len na `maxperformmethod@gmail.com`** — adresu, ktorou je Resend
účet registrovaný. Testovacie účty preto zakladaj na túto adresu.
Overenie domény `gladiatorgym.sk` je v `TODO.md`, rieši sa pred spustením.

### Nálezy — žiadny nie je bezpečnostný

| # | Nález | Závažnosť |
| --- | --- | --- |
| **A** | Na `/prihlasenie` **nie je odkaz na obnovu hesla**. Stránka `/obnova-hesla` existuje, ale používateľ sa k nej nedostane. | **vysoká** |
| **B** | Nepotvrdený e-mail + správne heslo → „Nesprávny e-mail alebo heslo." Bezpečnostne správne, ale používateľ uviazne — myslí si, že si pomýlil heslo. Riešenie: trvalá poznámka na stránke (nie podmienená), napr. „Ak si sa práve zaregistroval, najprv potvrď e-mail." Nič neprezradí, lebo sa zobrazuje vždy. | **vysoká** |
| **C** | Zakázaná prezývka `admin` vráti „Skontroluj e-mail, heslo (aspoň 10 znakov) a prezývku (3–20 znakov)." — `admin` má 5 znakov, používateľ chybu nepochopí. | stredná |
| **D** | Po chybe sa **vymažú všetky polia** vrátane e-mailu a hesla. | stredná |

---

Tento súbor rastie s projektom. Každá etapa doplní vlastnú sekciu.
Prejdi ho celý vždy, keď mergneš niečo, čo sa dotýka prihlasovania.

**Kde testovať:** výhradne `http://localhost:3000` cez `npm run dev`.
Na Vercel Preview to nepôjde — Supabase allowlist má zatiaľ len localhost.
To nie je chyba, je to rozhodnutie.

---

## Príprava

```
git checkout <vetva s testovanou zmenou> && git pull
npm run dev
```

**Testuje sa vetva z PR, nie `main`.** Zmysel testu je zachytiť chybu
**pred** mergnutím. Po mergnutí je už neskoro.

Otvor si v druhom okne Supabase dashboard, projekt **Gladiator gym**:

- **Authentication → Users** — účty (`auth.users`)
- **Table Editor → Clen** — členovia (naša tabuľka)

**Dve tabuľky, dve rôzne veci.** `auth.users` spravuje Supabase a drží e-mail
a heslo. `Clen` je náš — drží prezývku, rolu a všetko ostatné. Spája ich
`Clen.authUserId`. Toto je najdôležitejšia vec, ktorú si z testovania odnes.

---

## G2 — scenár

Použi reálnu e-mailovú adresu, na ktorú sa vieš dostať.

### 1. Registrácia

| Krok | Očakávané |
| --- | --- |
| Otvor `/registracia` | formulár: e-mail, heslo, prezývka |
| Heslo kratšie než 10 znakov | zablokuje prehliadač (`minLength`), formulár sa neodošle |
| Prezývka `admin` | odmietnutá — server vracia **jednu spoločnú vetu** „Skontroluj e-mail, heslo (aspoň 10 znakov) a prezývku (3–20 znakov)." |
| Prezývka `ab` | odmietnutá, tá istá veta |
| Platné údaje | presmerovanie na `/registracia/hotovo`, nadpis „Skontroluj si e-mail" |

**Over v Supabase:**

- `auth.users` → nový riadok, stĺpec potvrdenia e-mailu **prázdny**
- `Clen` → nový riadok s tvojou prezývkou, `rola = CLEN`, `prezyvkaNorm`
  malými písmenami bez diakritiky

### 2. Potvrdenie e-mailu

| Krok | Očakávané |
| --- | --- |
| Klikni na odkaz v e-maile | pristaneš na `/klub`, si prihlásený |
| Skontroluj adresný riadok | prešlo to cez `/api/auth/callback` |

**Over v Supabase:** v `auth.users` je teraz e-mail potvrdený.

**Ak pristaneš na domovskej stránke a si odhlásený** → `emailRedirectTo`
v `signUp` chýba alebo je zlé.

### 3. Prihlásenie a chybové hlásenia

Toto je bezpečnostná časť. **Všetky tri musia vrátiť rovnakú vetu.**

| Vstup | Očakávané |
| --- | --- |
| správny e-mail + zlé heslo | „Nesprávny e-mail alebo heslo." |
| **neexistujúci** e-mail | **tá istá veta, znak po znaku** |
| správne údaje | presmerovanie na `/klub` |

Ak sa hlášky líšia čo i len o slovo, útočník vie zistiť, kto je u nás
registrovaný. To je únik údajov, nie kozmetika.

### 4. Duplicity

| Krok | Očakávané |
| --- | --- |
| Registruj sa znova s **tým istým e-mailom** | presmerovanie na `/registracia/hotovo` — rovnako ako pri úspechu, žiadne „účet už existuje" |
| Registruj sa s **tou istou prezývkou**, iný e-mail | odmietnuté, zrozumiteľná chyba |
| Prezývka s diakritikou, ktorá sa po normalizácii zhoduje (napr. `Žéňo` vs `zeno`) | odmietnutá |

### 5. Obnova hesla

| Krok | Očakávané |
| --- | --- |
| `/obnova-hesla`, existujúci e-mail | „Ak účet existuje, poslali sme e-mail." |
| `/obnova-hesla`, **neexistujúci** e-mail | **tá istá veta** |
| Klikni na odkaz v e-maile | pristaneš na `/nove-heslo` |
| Zadaj heslo kratšie než 10 znakov | „Heslo musí mať aspoň 10 znakov." |
| Zadaj platné heslo | presmerovanie na `/prihlasenie` |
| Prihlás sa **novým** heslom | funguje |
| Prihlás sa **starým** heslom | odmietnuté |

Ak odkaz z e-mailu skončí chybou o nepovolenom presmerovaní, chýba
v Supabase Redirect URLs zápis `http://localhost:3000/api/auth/callback**`.

### 6. Voľba prezývky pri chýbajúcom `Clen`

Poistka pre prípad, že registrácia spadne medzi vytvorením účtu
a vytvorením člena.

| Krok | Očakávané |
| --- | --- |
| V Supabase zmaž svoj riadok z tabuľky `Clen` (účet v `auth.users` nechaj) | — |
| Prihlás sa | pristaneš na `/registracia/prezyvka`, nie na `/klub` |
| Zvoľ prezývku | vytvorí sa nový `Clen`, ideš na `/klub` |

**Nikdy nesmieš dostať automaticky vygenerovanú prezývku** typu `user_a3f9`.
Ak áno, je to chyba.

### 7. Regresia — admin sa nesmel odomknúť

| Cesta | Očakávané |
| --- | --- |
| `/admin/objednavky` | **pýta heslo** (Basic Auth) alebo vráti 503 |
| `/` | funguje |
| `/cennik` | ceny sa zobrazujú |

Toto je najdôležitejší riadok celej tabuľky. G2 menila `middleware.ts`,
ktorý stráži admin. Ak sa `/admin/objednavky` otvorí bez hesla, **okamžite
stop a hlás to.**

---

## G3 — scenár

Ochrana ciest cez layouty (`requireClen` / `requireAdmin`). `middleware.ts` sa
v G3 **nemenil** — chráni len `/admin/objednavky` ako predtým.

**Nastavenie roly na test:** v Supabase otvor **SQL Editor** a spusti:

```sql
update public."Clen" set "rola"='ADMIN' where email='maxperformmethod@gmail.com';
```

**Nepoužívaj Table Editor** — ak po prepísaní bunky klikneš mimo nej bez
potvrdenia (Enter/✓), zmenu **ticho zahodí** a rola ostane `CLEN`.
**Po teste rolu vráť na `CLEN`** (ten istý príkaz s `'CLEN'`).

Tabuľka A5 (`npm run dev`, testuj v tomto poradí):

| # | Stav | Cesta | Očakávané |
| --- | --- | --- | --- |
| 1 | odhlásený | `/klub` | presmerovanie na `/prihlasenie` |
| 2 | odhlásený | `/sprava` | **404**, nie presmerovanie |
| 3 | prihlásený člen | `/klub` | zobrazí sa (+ tlačidlo „Odhlásiť sa") |
| 4 | prihlásený člen (rola `CLEN`) | `/sprava` | **404** |
| 5 | prihlásený člen | `/klub` → „Odhlásiť sa" | ide na `/`, potom `/klub` presmeruje |
| 6 | ktokoľvek | `/`, `/cennik` | bez zmeny, staticky renderované |
| 7 | ktokoľvek | `/admin/objednavky` | **stále pýta heslo** (Basic Auth) |

Admin (po nastavení roly `ADMIN`) vidí na `/klub` odkaz „Správa" → `/sprava`,
a `/sprava` sa mu zobrazí. Hlavička ukazuje „Klub" pre všetkých rovnako
(žiadny server dotaz — verejné stránky preto ostávajú statické).

> **Neoverené:** „expirovaná session vedie na `/prihlasenie`, nie na 500" sme
> zatiaľ netestovali.

---

## Po teste

Zmaž testovací účet z **oboch** miest — najprv riadok z `Clen`, potom
používateľa z `auth.users`. V opačnom poradí ti databáza odmietne
zmazanie kvôli cudziemu kľúču.

---

## Čo pribudne neskôr

| Etapa | Sekcia |
| --- | --- |
| G3 | ✅ doplnené (sekcia „G3 — scenár"); ostáva **expirovaná session** — neoverené |
| H | member nevidí cudzie rekordy · leaderboard len schválené · nikdy e-mail |
| I | admin operácie v `admin_logs` · admin si nemôže odobrať rolu |
