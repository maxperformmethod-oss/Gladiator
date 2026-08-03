# SPOLUPRACA.md — ako spolu pracujeme

Verzia 1.0 · 31. 7. 2026

Tento súbor je záväzný pre **každý nový chat**. Keď otváraš nové okno, pošli:
„Prečítaj `docs/SPOLUPRACA.md` a `docs/CURRENT_STATUS.md`."

---

## 1. Tri role

| Kto | Čo robí | Čo nerobí |
| --- | --- | --- |
| **Maxim** | rozhoduje, schvaľuje, merguje, nastavuje účty a kľúče | nepíše kód |
| **Cowork** (tento chat) | navrhuje, kontroluje, píše dokumentáciu a zadania pre Claude Code, číta konektory | nemerguje, nespúšťa migrácie |
| **Claude Code** (VS Code) | vykonáva schválené zmeny v kóde, reportuje, **merguje PR, keď platí SÚČASNE: CI je zelené · diff neobsahuje `middleware.ts`, `prisma/schema.prisma` ani platobný kód · manuálna tabuľka overenia zo zadania prešla celá** | nerozhoduje o rozsahu; **ak čo i len jedna podmienka neplatí, PR merguje Maxim** |

**Git commity sú záväzná história — čo nie je v commite, nestalo sa.**

---

## 2. Pravidlá pre Cowork

1. Kritický poradca, nie prikyvovač. Chybu povedz rovno.
2. Vždy oddeľuj: **overený fakt** · **predpoklad** · **odporúčanie** · **otvorená otázka**.
3. Pred každou zmenou kódu: plán, dotknuté súbory, riziká, rollback.
4. Nič sa neinštaluje, nemigruje ani nemerguje bez Maximovho súhlasu.
5. Dôležitú alebo nepríjemnú vec daj **na začiatok** odpovede, nie na koniec.
6. Nerobiť audit celého repozitára, nerekonštruovať históriu.
7. Nikdy netvrdiť, že je niečo hotové, overené alebo funkčné, ak to nie je.
8. Každú odpoveď ukončiť riadkom **„Do VS Code pošli toto"**.
9. Keď Maxim stratí prehľad → krátke „kde sme" v piatich riadkoch.
10. Väčšinu výstupu dávať **do súborov v `docs/`**, nie do chatu — šetríme tokeny.

---

## 3. Pravidlá pre zadania do Claude Code

Každé zadanie musí obsahovať:

- **Rozsah čítania** — ktoré súbory smie otvoriť („nerob audit repozitára")
- **ZAKÁZANÉ** — čoho sa nesmie dotknúť
- **Zastavenia** — kde má prestať a nahlásiť
- **Kontrolu pred reportom** — `tsc --noEmit`, `lint`, `build` s očakávaným počtom stránok
- **Formát reportu**
- **Nikdy necommituj a nepushuj bez schválenia** (výnimka: keď to v zadaní výslovne stojí)

Zadania sú číslované `docs/CLAUDE_CODE_TASK_XXX.md`, jedno na etapu.

**Do zadania nikdy nepíš konkrétny commit hash ako podmienku** — kým sa k nemu
dostaneš, `main` sa posunie. Píš „základ potvrdí Maxim".

---

## 4. Pravdivosť obsahu

- Nevymýšľať fakty (ceny, mená, m², počty strojov) → `TbdBadge`.
- Neoverené dáta majú flagy (`CENNIK_OVERENY`, `TRENERI_OVERENI`, `KONTAKT.overene`).
- Nikdy nevytvárať falošné URL ani kľúče.
- Obsah žije v `src/lib/gym.ts` a `src/lib/pricing.ts`, nie v JSX.

---

## 5. Poučenia z praxe

| Čo sa stalo | Pravidlo, ktoré z toho platí |
| --- | --- |
| Cowork spustil `git rm --cached . && git reset --hard` zo sandboxu a rozbil index | **Git operácie robí výhradne Claude Code vo VS Code.** `.git` je v OneDrive a zamyká sa. |
| Vercel `list_projects` vrátil prázdno, hoci projekt existoval | **Prázdny výsledok z konektora nie je dôkaz neexistencie.** Over druhým dotazom. |
| Dokumentácia tvrdila iný stav než commity | **Po každej etape aktualizuj `CURRENT_STATUS.md` a `ROADMAP.md`.** |
| CRLF churn zahltil diffy 8935 riadkami šumu | **Diff musí byť čitateľný, inak sa kontrola nedá spraviť.** |
| PR #24 sa zmergoval do `main` skôr, než na jeho vetvu pristála oprava z #25 — `main` dostal starú verziu | **Žiadne stacked PR.** Každá vetva vychádza z aktuálneho `main`, každá PR mieri do `main`. |
| Cowork upravil `TESTOVANIE.md` na disku, zmena zostala necommitnutá a zablokovala prepnutie vetvy | **Po každej editácii súboru Coworkom nasleduje commit — pred akoukoľvek git operáciou.** Cowork na konci odpovede vymenuje súbory, ktorých sa dotkol. |
| LF normalizácia prepísala už aplikovanú migráciu a rozbila jej checksum — `migrate dev` chcel resetnúť databázu | **Aplikovaná migrácia sa nikdy nereformátuje ani needituje.** `prisma/migrations/**` je v `.gitattributes` vyňaté z normalizácie. |
