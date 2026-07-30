# ROADMAP.md — Gladiator Gym PWA v1

Verzia: 1.0 · Dátum: 2026-07-30

Legenda stavu: `TODO` · `IN PROGRESS` · `BLOCKED` · `DONE`

Pravidlo: **žiadna etapa sa nezačne bez písomného schválenia majiteľa.**
Po každej etape sa vypíše: čo sa urobilo, zmenené súbory, vykonané testy, známe
riziká, návrh commitu, ďalší krok — a čaká sa na schválenie.

---

## Prehľad

| Etapa | Názov | Stav | Blokované čím |
| --- | --- | --- | --- |
| A0 | Read-only inventúra repozitára | **IN PROGRESS** | prístup Claude Code k repu |
| A | Analýza a dokumentácia | **IN PROGRESS** | dokončenie A0 |
| A1 | Infraštruktúrna hygiena (Git ↔ Vercel, staging) | TODO | schválenie |
| B | Návrh cieľovej architektúry | **ČAKÁ NA SCHVÁLENIE** | rozhodnutia D-01 až D-04 |
| C | Základná štruktúra priečinkov a routes | TODO | schválenie B |
| D | PWA shell | TODO | schválenie C, rozhodnutie D-06 |
| E | Návrh Supabase databázy a RLS | TODO | rozhodnutia D-02, D-07 |
| F | Pripojenie Supabase | TODO | existencia Supabase projektu |
| G | Autentifikácia | TODO | dokončenie F |
| H | Member funkcie | TODO | dokončenie G |
| I | Admin rozhranie | TODO | dokončenie H |
| J | Testovanie a dokumentácia | TODO | dokončenie I |
| K | Produkčné spustenie | TODO | dokončenie J + externý audit |

---

## Etapa A0 — Read-only inventúra repozitára

**Stav: IN PROGRESS**

Prečo existuje: Cowork nemal prístup k zdrojovému kódu. Bez skutočnej inventúry
zostáva veľká časť `PROJECT_CONTEXT.md` na úrovni predpokladov.

**Vykonáva:** Claude Code podľa `docs/CLAUDE_CODE_TASK_001.md`. Iba čítanie.

**Kontrolný bod / podmienky dokončenia:**

- [ ] doručený report so skutočným stromom `src/`
- [ ] odcitovaný obsah `src/middleware.ts` vrátane `matcher`
- [ ] odcitovaný `prisma/schema.prisma` (modely, stĺpce, indexy)
- [ ] potvrdený zoznam existujúcich routes a API endpointov
- [ ] potvrdený stav `public/` (manifest / ikony / service worker)
- [ ] potvrdený Git stav (branch, remote, čistota working tree)
- [ ] žiadny súbor nebol zmenený (`git status` čistý)
- [ ] `PROJECT_CONTEXT.md` aktualizovaný — všetky ASSUMPTION prepnuté na
      VERIFIED alebo opravené

---

## Etapa A — Analýza a dokumentácia

**Stav: IN PROGRESS**

Vytvorené: `PROJECT_CONTEXT.md`, `ARCHITECTURE_PROPOSAL.md`, `ROADMAP.md`,
`DECISIONS.md`, `CURRENT_STATUS.md`, `SECURITY.md`, upravený `CLAUDE.md`,
`CLAUDE_CODE_TASK_001.md`.

**Kontrolný bod:**

- [x] dokumentačný balík vytvorený
- [ ] majiteľ prečítal a pripomienkoval
- [ ] A0 dokončená a dokumenty aktualizované
- [ ] žiadny aplikačný súbor nezmenený

---

## Etapa A1 — Infraštruktúrna hygiena

**Stav: TODO** · Nová etapa, v pôvodnom zadaní chýbala.

Prečo existuje: podľa `TODO.md` **`git push` dnes nespúšťa Vercel deploy**
(projekt vznikol priamym uploadom). Kým to platí, neexistuje auditovateľná
história nasadení a nedá sa oddeliť staging od produkcie. Robiť etapy C–J bez
toho znamená pracovať naslepo.

**Obsah (ručné kroky majiteľa, nie kód):**

1. Vercel → projekt `gladiator` → Settings → Git → Connect Git Repository →
   `maxperformmethod-oss/Gladiator`.
2. Production Branch = `main`.
3. Vytvoriť vetvu `develop` → automatické preview deploye.
4. Overiť, že env premenné sú vo Vercel nastavené pre Production **aj** Preview.
5. Rozhodnúť o staging Supabase projekte (D-11).
6. Overiť, že `.env` a `.env.local` nie sú v Git histórii
   (`git log --all --full-history -- .env .env.local`).

**Kontrolný bod:**

- [ ] testovací commit na `main` spustil production deploy
- [ ] commit na `develop` spustil preview deploy
- [ ] `.env*` nie sú nikde v Git histórii
- [ ] rozhodnuté staging riešenie

**Rollback:** odpojenie Git integrácie vo Vercel dashboarde. Bez dosahu na kód.

---

## Etapa B — Návrh cieľovej architektúry

**Stav: ČAKÁ NA SCHVÁLENIE**

Výstup: `ARCHITECTURE_PROPOSAL.md`. Žiadny kód.

**Kontrolný bod:**

- [ ] rozhodnuté D-01 (Stripe)
- [ ] rozhodnuté D-02 (Prisma vs. supabase-js) — **najdôležitejšie**
- [ ] rozhodnuté D-03 (názvy routes)
- [ ] rozhodnuté D-04 (middleware matcher, závisí od A0)
- [ ] majiteľ písomne schválil architektúru

---

## Etapa C — Základná štruktúra

**Stav: TODO** · Prvá etapa, ktorá sa dotýka `src/`.

Obsah: vytvorenie prázdnych priečinkov a placeholder stránok podľa schválenej
štruktúry. **Žiadna Supabase integrácia. Žiadna business logika. Žiadna DB.**

Stránky vracajú statický text „Pripravuje sa". Cieľom je overiť, že nová
štruktúra spolunažíva s existujúcim webom.

**Zakázané v tejto etape:**

- akákoľvek zmena existujúcich súborov okrem `src/middleware.ts` a
  `src/app/layout.tsx` (a aj tie len po samostatnom schválení),
- inštalácia balíkov,
- zmena `globals.css`.

**Kontrolný bod:**

- [ ] `npm run build` prejde bez chýb
- [ ] `npm run lint` prejde bez chýb
- [ ] všetky existujúce verejné stránky vyzerajú a fungujú identicky
      (vizuálne porovnanie pred/po)
- [ ] `/admin/objednavky` stále vyžaduje Basic Auth
- [ ] `/api/checkout` stále vracia funkčnú odpoveď
- [ ] `git diff --stat` neobsahuje žiadny neočakávaný súbor

**Rollback:** `git revert` jedného commitu.

---

## Etapa D — PWA shell

**Stav: TODO** · Blokované rozhodnutím D-06.

Obsah: `manifest.webmanifest`, ikony (192, 512, maskable), theme color,
`<link rel="manifest">` v root layoute, prípadne minimálny service worker
s denylistom podľa `ARCHITECTURE_PROPOSAL.md` sekcia 9.

**Kontrolný bod:**

- [ ] aplikácia sa dá pridať na plochu (Android Chrome + iOS Safari)
- [ ] žiadna autentifikovaná stránka nie je v cache (overené v DevTools →
      Application → Cache Storage po prihlásení a odhlásení)
- [ ] `/api/**` sa nikdy neobsluhuje z cache
- [ ] existujúci verejný web funguje aj po odregistrovaní SW
- [ ] Lighthouse PWA audit prejde základnou inštalovateľnosťou

**Rollback:** `git revert` + `navigator.serviceWorker.getRegistrations()` →
`unregister()`. **Pozor:** service worker prežije revert v prehliadačoch, ktoré
ho už majú nainštalovaný. Preto je potrebný „kill switch" SW pripravený vopred.

---

## Etapa E — Návrh databázy a RLS

**Stav: TODO** · Blokované D-02 a D-07.

Obsah: **iba návrh na papieri.** Tabuľky, stĺpce, typy, PK, FK, unique
constraints, indexy, status hodnoty, vzťahy, RLS policies. Žiadna migrácia sa
nespúšťa.

**Kontrolný bod:**

- [ ] majiteľ schválil kompletnú schému
- [ ] vyriešená kolízia `profiles` × `Clen`
- [ ] RLS policy pre každú tabuľku s používateľskými dátami
- [ ] popísaný postup zálohy pred prvou migráciou
- [ ] žiadny SQL sa nespustil

---

## Etapa F — Pripojenie Supabase

**Stav: TODO** · Blokované: Supabase projekt zatiaľ nemusí existovať.

Predtým sa majiteľa opýtame na: názov projektu, región, staging/production režim,
URL projektu, verejný anon/publishable key, spôsob systémových e-mailov, doménu.

**Nikdy sa nevytvárajú vymyslené URL ani falošné kľúče.**

**Kontrolný bod:**

- [ ] Supabase projekt existuje a je zdokumentovaný (bez tajných hodnôt)
- [ ] `.env.example` doplnený o nové kľúče, bez reálnych hodnôt
- [ ] migrácia prebehla najprv na **staging** databáze
- [ ] záloha produkčnej DB vytvorená pred akýmkoľvek zásahom
- [ ] `service_role` kľúč nikde v klientskom kóde ani v `NEXT_PUBLIC_*`

---

## Etapa G — Autentifikácia

**Stav: TODO**

Obsah: registrácia, prihlásenie, potvrdenie e-mailu, reset hesla, session
v middleware, `profiles` záznam pri registrácii, rola natvrdo `member`.

**Kontrolný bod:**

- [ ] registrácia + potvrdenie e-mailu funguje end-to-end
- [ ] reset hesla funguje end-to-end
- [ ] duplicitný nickname je odmietnutý
- [ ] rola sa nedá poslať z klienta
- [ ] neprihlásený používateľ je z `/klub` presmerovaný
- [ ] expirovaná session vedie na prihlásenie, nie na chybu 500
- [ ] chybové hlášky neprezrádzajú, či e-mail v systéme existuje

---

## Etapa H — Member funkcie

**Stav: TODO**

Obsah: profil, osobné rekordy, história, leaderboard, jedna mesačná výzva,
odoslanie výsledku na schválenie.

**Kontrolný bod:**

- [ ] member nevidí cudzie rekordy
- [ ] member nemôže zapísať rekord pod cudzím `user_id`
- [ ] member nemôže schváliť vlastný výsledok
- [ ] leaderboard zobrazuje iba `approved` výsledky
- [ ] leaderboard nikdy nevráti e-mail
- [ ] neplatné formuláre vracajú zrozumiteľnú chybu, nie 500

---

## Etapa I — Admin rozhranie

**Stav: TODO**

Obsah: `/sprava/**`, správa členov, cvikov, výziev, schvaľovanie výsledkov,
`admin_logs`.

**Kontrolný bod:**

- [ ] member dostane 403/404 na každej `/sprava/*` route
- [ ] admin sa overuje na serveri, nie len v middleware
- [ ] každá admin operácia zapíše záznam do `admin_logs`
- [ ] admin nemôže odobrať rolu sám sebe (uzamknutie sa vylúči)
- [ ] admin rola sa nedá získať cez registráciu ani cez UI
- [ ] `/sprava` má `noindex` a `no-store`

---

## Etapa J — Testovanie a dokumentácia

**Stav: TODO**

Povinný testovací zoznam (sekcia 13 zadania):

- [ ] neprihlásený používateľ
- [ ] prihlásený member
- [ ] admin
- [ ] pokus membera otvoriť admin route
- [ ] pokus membera meniť cudzie údaje
- [ ] pokus membera schváliť vlastný výsledok
- [ ] neplatné formuláre
- [ ] duplicitný nickname
- [ ] expirovaná session
- [ ] reset hesla
- [ ] základná mobilná použiteľnosť
- [ ] production build
- [ ] regresný test: existujúci Stripe checkout stále funguje
- [ ] regresný test: `/admin/objednavky` stále chránený

**Kontrolný bod:**

- [ ] všetky body vyššie prejdené a zdokumentované
- [ ] `docs/` aktualizované
- [ ] `CURRENT_STATUS.md` odráža realitu

---

## Etapa K — Produkčné spustenie

**Stav: TODO** · Nová etapa, v pôvodnom zadaní chýbala.

Prečo existuje: zadanie končí testovaním. Medzi „testy prešli" a „ide to na
produkciu s reálnymi osobnými údajmi" je samostatný súbor krokov.

**Kontrolný bod:**

- [ ] externá bezpečnostná kontrola (viď `SECURITY.md`, sekcia „Externý audit")
- [ ] GDPR: informácia o spracúvaní údajov členov doplnená do `/podmienky`
      alebo samostatnej stránky
- [ ] doba uchovávania údajov určená
- [ ] postup vymazania účtu na žiadosť člena
- [ ] plán zálohovania a obnovy DB overený skúšobnou obnovou
- [ ] monitoring chýb nastavený
- [ ] rollback plán pre produkčný deploy písomne
- [ ] **explicitné písomné schválenie majiteľa**

> Do tohto bodu sa aplikácia **neoznačuje** za bezpečnú ani produkčne pripravenú.

---

## Zmeny oproti pôvodnému zadaniu

| Zmena | Dôvod |
| --- | --- |
| pridaná **A0** | Cowork nemá prístup ku kódu; bez inventúry sú všetky ďalšie kroky postavené na predpokladoch |
| pridaná **A1** | podľa `TODO.md` `git push` nespúšťa deploy — bez toho nie je auditovateľná história ani staging |
| pridaná **K** | zadanie končí testovaním; produkčný štart s osobnými údajmi si vyžaduje samostatnú bránu |
| Etapa D presunutá **za** C | PWA shell potrebuje existujúce `/klub` routes, inak nie je čo inštalovať |
| do každej etapy doplnené **regresné testy existujúceho webu** | zadanie chráni frontend, ale nedefinovalo, ako sa overí, že je nedotknutý |
