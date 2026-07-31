# docs/ — dokumentácia projektu Gladiator Gym

Posledná aktualizácia: 31. 7. 2026

**Kde sme práve teraz → `CURRENT_STATUS.md`**

---

## Ktorý dokument na čo

| Súbor | Na čo je | Kedy ho otvoriť |
| --- | --- | --- |
| **`CURRENT_STATUS.md`** | čo je hotové, čo beží, čo je ďalej | **keď stratíš prehľad — začni tu** |
| **`PREVADZKA.md`** | ako projekt ovládať — Vercel, CI, Supabase, Git, čo robiť pri chybe | **keď niečo nefunguje alebo si niečím neistý** |
| `SPOLUPRACA.md` | pravidlá spolupráce, role, formát zadaní | na začiatku každého nového chatu |
| `SKOLA.md` | učebný plán obsluhy projektu pre Maxima | keď sa chceš naučiť projekt ovládať sám |
| `ROADMAP.md` | etapy A až K, podmienky dokončenia každej | keď chceš vidieť celú cestu |
| `DECISIONS.md` | všetky rozhodnutia a ich dôvody | keď sa pýtaš „prečo sme to spravili takto" |
| `ARCHITECTURE_PROPOSAL.md` | tri vrstvy, priečinky, routes, dátové toky | pri práci na štruktúre kódu |
| `DATABASE.md` | návrh schémy — tabuľky, stĺpce, väzby, obmedzenia | pred prácou s Prismou |
| `SECURITY.md` | autentifikácia, roly, RLS, osobné údaje, GDPR | pri čomkoľvek okolo bezpečnosti |
| `PROJECT_CONTEXT.md` | overený stav projektu, stack, rozsah v1 | keď potrebuješ fakty o projekte |
| `INFRASTRUKTURA.md` | GitHub, Vercel, Supabase, zálohy — kroky mimo kódu | pri nastavovaní účtov a služieb |
| `CLAUDE_CODE_TASK_*.md` | zadania pre Claude Code, jedno na etapu | keď posielaš prácu do VS Code |

`TASK_003` a `TASK_004` boli nahradené spoločným `TASK_005`. Zostávajú
v priečinku len ako história — nespúšťaj ich.

---

## Ako to funguje

**Cowork** navrhuje, dokumentuje a píše zadania.
**Claude Code** vykonáva schválené zmeny v kóde.
**Git commity** sú záväzná história — čo nie je v commite, nestalo sa.

Pred každou etapou je schválenie. Po každej etape report: čo sa urobilo,
ktoré súbory sa zmenili, aké testy prešli, aké riziká zostali.

---

## Hotové etapy

| Etapa | Čo | Commit |
| --- | --- | --- |
| A0 | read-only audit repozitára | — |
| A | dokumentácia | `45ff000` |
| A1 | CI, Dependabot, ochrana `main` | `58c1687` |
| A2 | odstránenie zraniteľností Next.js | `3e6f5ef` |
| C | kostra `/klub`, `/sprava`, prihlasovanie | `2b9cd3c` |
| D | PWA manifest a ikony | `2b9cd3c` |
| — | príručka obsluhy | `cf63bd6` |
| E | schéma databázy | `0025618` |
| F | prvá migrácia na staging | `b9eb39d` |
| G1 | Supabase klienty | `a1f1c45` |
| — | normalizácia line endings na LF | `b3212e7` (v PR #22) |

## Otvorené

1. **PR #22** (`chore/line-endings`) — čaká na merge
2. **Etapa G2** — prihlasovanie (`docs/CLAUDE_CODE_TASK_013.md`), potom G3
3. `overrides` pre `postcss`/`sharp` pod `next` + odstránenie `continue-on-error`
   z jobu `audit` (keď bude 0 zraniteľností)
4. Sentry v aplikácii, Vercel env premenné, produkčný Supabase projekt so zálohami — zapísané, neskôr
5. právna kontrola podmienok a GDPR — paralelne
