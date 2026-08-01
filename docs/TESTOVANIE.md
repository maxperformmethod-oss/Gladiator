# TESTOVANIE.md — ručný testovací scenár

Verzia 1.0 · 31. 7. 2026 · pokrýva Etapu G2

Tento súbor rastie s projektom. Každá etapa doplní vlastnú sekciu.
Prejdi ho celý vždy, keď mergneš niečo, čo sa dotýka prihlasovania.

**Kde testovať:** výhradne `http://localhost:3000` cez `npm run dev`.
Na Vercel Preview to nepôjde — Supabase allowlist má zatiaľ len localhost.
To nie je chyba, je to rozhodnutie.

---

## Príprava

```
git checkout main && git pull
npm run dev
```

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
| Heslo kratšie než 10 znakov | zrozumiteľná chyba, formulár sa neodošle |
| Prezývka `admin` | odmietnutá (zakázaný zoznam) |
| Prezývka `ab` | odmietnutá (min. 3 znaky) |
| Platné údaje | presmerovanie na `/registracia/hotovo` — „Skontroluj si e-mail" |

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
| Registruj sa znova s **tým istým e-mailom** | „Skontroluj si e-mail." — rovnako ako pri úspechu, žiadne „účet už existuje" |
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

## Po teste

Zmaž testovací účet z **oboch** miest — najprv riadok z `Clen`, potom
používateľa z `auth.users`. V opačnom poradí ti databáza odmietne
zmazanie kvôli cudziemu kľúču.

---

## Čo pribudne neskôr

| Etapa | Sekcia |
| --- | --- |
| G3 | neprihlásený na `/klub` · member na `/sprava` · expirovaná session |
| H | member nevidí cudzie rekordy · leaderboard len schválené · nikdy e-mail |
| I | admin operácie v `admin_logs` · admin si nemôže odobrať rolu |
