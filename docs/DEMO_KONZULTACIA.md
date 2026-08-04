# DEMO_KONZULTACIA.md — scenár predvedenia

4. 8. 2026 · konzultácia o 5 dní · adresa: `https://gladiator-eight.vercel.app`

Cieľ: ukázať web aj členskú appku tak, aby nič nespadlo a aby bolo vidno,
čo je hotové a čo ešte príde.

---

## Pred odchodom — 15 minút prípravy

| # | Krok | Prečo |
| --- | --- | --- |
| 1 | Otvor `gladiator-eight.vercel.app` na notebooku aj na telefóne | over, že produkcia beží |
| 2 | Vercel → Deployments → posledný **Production** je zelený | keby nie, demo padne |
| 3 | Prihlás sa oboma účtami, každým v inom prehliadači | pozri §1 — potrebuješ dva |
| 4 | Ako CLEN si vytvor plán a odcvič **aspoň dva tréningy** | prázdna appka nič nepredá |
| 5 | Over, že v rebríčku je aspoň jeden schválený zápis | inak je tabuľka prázdna |
| 6 | Pridaj appku na plochu telefónu | ukazuje sa to zle, keď to hľadáš pred klientom |
| 7 | Skontroluj, že máš nabitý telefón a funguje ti dáta/wifi | appka beží online |

---

## 1. Dva účty — bez toho to nejde

Databáza **zakazuje, aby ten istý človek zápis podal aj schválil**
(obmedzenie `vyzvazapis_ziadne_samoschvalenie`). Preto:

| Účet | Rola | V demu hrá |
| --- | --- | --- |
| `maximmalovec8@gmail.com` | **CLEN** | člena, ktorý trénuje a posiela výsledok |
| `maxperformmethod@gmail.com` | **ADMIN** | obsluhu gymu, ktorá schvaľuje |

Prakticky: **jeden účet v bežnom okne, druhý v anonymnom okne.** Tréningové
dáta sú v prehliadači, takže sa nemiešajú a prepínanie je okamžité.

---

## 2. Scenár — v tomto poradí

### Časť A — verejný web (2 minúty)

Domov → O gyme → Cenník → Kontakt.

**Čo povedať:** dizajn vychádza z ich identity, žiadna šablóna. Obsah, ktorý
zatiaľ nie je potvrdený, je viditeľne označený — ceny, kontakt, tréneri.
Nič sme si nevymysleli.

**Na čo si dať pozor:** označenia „údaje čakajú na potvrdenie" sú zámerné.
Povedz to skôr, než sa spýtajú.

### Časť B — appka na telefóne (5 minút, toto je vrchol)

1. Otvor `/appka` → ukáž návod na inštaláciu
2. Spusti appku **z plochy telefónu** — otvorí sa rovno členská zóna,
   bez adresného riadka a bez hlavičky webu
3. **Prehľad** — ring týždenného cieľa, séria dní, objem
4. **Tréning** → plán s cvikmi, kde má **každá séria vlastnú váhu aj opakovania**
5. **Začať tréning** → odškrtni sériu → naskočí **časovač odpočinku**
6. **Ukončiť** → súhrn: objem, nový osobný rekord
7. **Rekordy** → odhad 1RM, najťažšia séria, najlepší objem série

**Čo povedať:** appka funguje aj bez signálu — dáta sú v telefóne. Rekordy
sa nezapisujú, **počítajú sa** z toho, čo človek naozaj odcvičil.

### Časť C — výzva a rebríček (3 minúty)

1. Ako **ADMIN** ukáž `/sprava/vyzvy` — založenie mesačnej výzvy
2. Prepni na **CLEN** → `/klub/vyzva` → hodnota je **predvyplnená z jeho
   tréningov**, vidno z ktorých → odošle
3. Späť na **ADMIN** → schváli
4. `/klub/rebricek` → člen je v tabuľke

**Čo povedať:** výsledky si zapisujú členovia sami a **obsluha ich potvrdzuje** —
je to vedomé rozhodnutie, v appke priznané. Pri budúcich QR vstupoch sa minúty
budú merať automaticky a schvaľovanie odpadne.

### Časť D — administrácia (2 minúty)

`/sprava` → **Cviky** (katalóg podľa partií) a **Výzvy**.

**Čo povedať:** dnes obsluha spravuje katalóg cvikov a výzvy. Úprava textov
a fotiek na webe je pripravená ako ďalší krok.

---

## 3. Čo nesľubovať

| Otázka, ktorá príde | Pravdivá odpoveď |
| --- | --- |
| „Kedy to spustíme naostro?" | po právnej kontrole podmienok a GDPR a po zaplatení domény |
| „Môžeme brať platby?" | Stripe je v **testovacom režime**; produkčné platby blokuje právna kontrola |
| „Vidím tréningy členov?" | **nie** — dáta sú v telefóne člena, server o nich nevie |
| „Čo keď si člen zmení telefón?" | príde o históriu; záloha je export do súboru. Synchronizácia je možná, ale je to ďalšia práca |
| „Môžeme si sami meniť texty a fotky?" | ešte nie — je to pripravené ako ďalšia etapa |
| „Chodia e-maily?" | až po kúpe domény; teraz doručujú len na jednu adresu |
| „Máte zálohy?" | zatiaľ nie — patria k produkčnému spusteniu |

**Nesľubuj termín, ktorý si neoveril.** Radšej „to ti potvrdím do dvoch dní".

---

## 4. Čo sa môže pokaziť a čo s tým

| Problém | Riešenie na mieste |
| --- | --- |
| appka je prázdna | prihlásil si sa druhým účtom — dáta sú viazané na účet |
| rebríček je prázdny | zápis nie je schválený, alebo si ho schvaľoval sám sebou |
| „Schváliť" nič nerobí | schvaľuješ vlastný zápis — prepni na druhý účet |
| appka sa otvorí ako webstránka | nespustil si ju z plochy, ale z prehliadača |
| stránka nenačíta | over signál; appka potrebuje internet na prihlásenie |

**Keď niečo padne: nezachraňuj to naživo.** Povedz „to si pozriem" a choď ďalej.

---

## 5. Po konzultácii

1. **Zmeň heslá** oboch testovacích účtov — boli poslané v chate (riziko R-5)
2. Zapíš požiadavky z konzultácie, kým sú čerstvé
3. Rozhodni s klientom: doména, administrácia obsahu, výzva na objem podľa partie
4. Založ **staging Supabase projekt** skôr, než dostane prístup ktokoľvek
   mimo teba — dnes je databáza len naša a preto sú migrácie bez rizika
