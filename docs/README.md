# docs/ — dokumentácia projektu Gladiator Gym

Posledná aktualizácia: 30. 7. 2026

**Kde sme práve teraz → `CURRENT_STATUS.md`**

---

## Ktorý dokument na čo

| Súbor | Na čo je | Kedy ho otvoriť |
| --- | --- | --- |
| **`CURRENT_STATUS.md`** | čo je hotové, čo beží, čo je ďalej | **keď stratíš prehľad — začni tu** |
| **`PREVADZKA.md`** | ako projekt ovládať — Vercel, CI, Supabase, Git, čo robiť pri chybe | **keď niečo nefunguje alebo si niečím neistý** |
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
| A | dokumentácia | — |
| A1 | CI, Dependabot, ochrana `main` | `58c1687` |
| C | kostra `/klub`, `/sprava`, prihlasovanie | `0343443` |
| D | PWA manifest a ikony | `ec5bdd0` |

## Otvorené

1. **12 high zraniteľností** v závislostiach — pred prihlasovaním
2. Etapa E — úprava `prisma/schema.prisma` podľa `DATABASE.md`
3. Etapa F — prvá migrácia na staging
4. Etapa G — prihlasovanie
5. Sentry, Vercel premenné, produkčný Supabase projekt — zapísané, neskôr
