# TODO — Gladiator Gym Lučenec (Fáza 1)

Všetky miesta, kde čakáme na reálne dáta / rozhodnutia od majiteľa, na jednom
mieste. Po dodaní údajov je pri každom bode uvedené, KDE v kóde sa mení.

## 1. Údaje čakajúce na potvrdenie od majiteľa

| Čo chýba | Kde v kóde |
| --- | --- |
| **Presná zlatá farba z loga** (teraz `#D4AF37` rozsah) | `src/app/globals.css` → `--color-gold*` |
| **Cenník — finálne potvrdenie cien** | `src/lib/pricing.ts` → po potvrdení prepni `CENNIK_OVERENY = true` (zmizne banner na /cennik) |
| **Cena Premium Solárko** | `src/lib/pricing.ts` → `premium-solarko`: doplň `cenaCenty`, prípadne `kupitelneOnline: true` |
| **Cena Premium Protein** | `src/lib/pricing.ts` → `premium-protein`: doplň `cenaCenty`, prípadne `kupitelneOnline: true` |
| **Kontakt + otváracie hodiny — potvrdenie** | `src/lib/gym.ts` → `KONTAKT.overene = true`, `OTVARACIE_HODINY.overene = true` |
| **Tréneri — overenie pobočky LC + bio + špecializácia + fotky** | `src/lib/gym.ts` → `TRENERI` (doplň `bio`, `specializacia`), `TRENERI_OVERENI = true` |
| **Fakty o gyme: m², počet strojov, značky vybavenia** | `src/app/o-gyme/page.tsx`, `src/app/vybavenie/page.tsx` (TBD badge) |
| **Fakturačné údaje: IČO / DIČ / IČ DPH / právna forma** | `src/app/podmienky/page.tsx` + Stripe metadata v `src/app/api/checkout/route.ts` |
| **Reálne fotky/video pobočky LC** | všetky `<PlaceholderImage>` — hero (`src/components/sections/Hero.tsx`), galéria, služby, vybavenie, tréneri, o-gyme |
| **Eventy — prvé reálne akcie** | `src/lib/gym.ts` → `EVENTY` |
| **Mapa — rozhodnúť o Google Maps embede** (teraz len odkaz, kvôli GDPR/cookies) | `src/app/kontakt/page.tsx` |

## 2. Právne — BLOKUJE reálne platby

- [ ] **Obchodné podmienky + GDPR: PRÁVNA KONTROLA** — `src/app/podmienky/page.tsx`
      je len NÁVRH. Bez schválenia právnikom NESPÚŠŤAŤ produkčné platby.
- [ ] Doba uchovávania osobných údajov (GDPR bod) — doplní právnik.
- [ ] Podmienky odstúpenia od zmluvy a reklamácií — doplní právnik.

## 3. Infraštruktúra — čo treba nakonfigurovať

### 3a. Supabase (databáza) — RUČNÉ KROKY

> **Prečo Supabase (nie Neon):** Fáza 2 = členský systém s QR vstupom.
> Supabase má natívny **auth** (členské účty) a **realtime** (live overenie
> vstupu na recepcii) — s Neonom by sme to neskôr prerábali. Menili sme len
> DB providera; Prisma schéma a modely ostali nezmenené.

1. Vytvor projekt na https://supabase.com (Free tier stačí; región `eu-central-1`
   / Frankfurt — najbližšie k SR). Ulož si **Database Password**.
2. V projekte klikni **Connect** (hore) a skopíruj DVA stringy:
   - **Transaction pooler** (port 6543) → `DATABASE_URL` — pridaj na koniec
     `?pgbouncer=true&connection_limit=1`
   - **Direct connection** (port 5432) → `DIRECT_URL`
3. Vlož oba do **`.env`** (NIE `.env.local` — Prisma CLI číta iba `.env`;
   formát pozri `.env.example`).
4. **Zastav dev server**, ak beží (drží zamknutý Prisma engine — na Windows by
   migrácia spadla na EPERM), a spusti:
   ```bash
   npx prisma migrate dev --name init
   ```
   Vytvorí všetky tabuľky (Pobocka, Trener, Sluzba, Cennik, Clen, Objednavka, Dopyt).
5. Auth/realtime z dashboardu teraz NEzapínaj ani nekonfiguruj — Fáza 2.

### 3b. GitHub ↔ Vercel prepojenie — RUČNÉ KROKY

> Vercel projekt `gladiator` vznikol priamym uploadom súborov, takže `git push`
> zatiaľ NEspúšťa deploy. Repo je pripravené (build je čistý `next build`,
> `postinstall` generuje Prisma klienta, žiadny `vercel.json` netreba —
> Next.js sa autodetekuje). Prepojenie:

1. https://vercel.com → projekt **gladiator** → **Settings → Git**
2. Klikni **Connect Git Repository** → **GitHub**
3. Ak GitHub org `maxperformmethod-oss` nie je v zozname: **Add GitHub Account /
   Configure GitHub App** → povoľ prístup pre org `maxperformmethod-oss`
   (stačí len repo `Gladiator`)
4. Vyber repo **maxperformmethod-oss/Gladiator** → Connect
5. Over **Production Branch = `main`** (Settings → Git → Production Branch)
6. Hotovo — každý push na `main` = automatický production deploy;
   push na inú vetvu / PR = preview deploy
7. Test: sprav malý commit, pushni a sleduj Deployments tab

### 3c. Env premenné vo Vercel dashboarde — RUČNÉ KROKY

Projekt **gladiator** → **Settings → Environment Variables** → pridaj všetky
nižšie (Environment: **Production** — pokojne zaškrtni aj Preview) → potom
**Redeploy**, aby sa prejavili:

| Premenná | Hodnota | Načo je |
| --- | --- | --- |
| `DATABASE_URL` | Supabase **Transaction pooler** string (port 6543, s `?pgbouncer=true&connection_limit=1`) | DB pripojenie aplikácie (objednávky, dopyty) |
| `DIRECT_URL` | Supabase **Direct connection** string (port 5432) | Používa len `prisma migrate`; vo Verceli pre istotu |
| `STRIPE_SECRET_KEY` | `sk_test_...` z https://dashboard.stripe.com/test/apikeys | Server-side Stripe (vytváranie Checkout Sessions) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_test_...` (tamtiež) | Verejný Stripe kľúč (rezerva pre budúce použitie) |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` zo Stripe webhooku (krok 3d) | Overenie podpisu webhookov |
| `NEXT_PUBLIC_SITE_URL` | `https://gladiator-ruby.vercel.app` (neskôr vlastná doména) | Stripe success/cancel redirecty + metadata |
| `ADMIN_USER` | napr. `recepcia` | Basic Auth login pre `/admin/objednavky` |
| `ADMIN_PASSWORD` | SILNÉ heslo (nie slovníkové) | Basic Auth heslo pre `/admin/objednavky` |

> Kým premenné nie sú nastavené, web gracefully degraduje: statické stránky
> fungujú, `/api/checkout` vráti čitateľnú JSON chybu, `/admin/objednavky`
> zobrazí vysvetľujúcu stránku (503) — nič nepadá.

### 3d. Stripe webhook — RUČNÉ KROKY

- [ ] **Lokálne**: `stripe listen --forward-to localhost:3000/api/stripe/webhook`
      → vypísaný `whsec_...` do `STRIPE_WEBHOOK_SECRET` v `.env.local`.
- [ ] **Produkčne**: Stripe dashboard → Developers → Webhooks → Add endpoint
      `https://gladiator-ruby.vercel.app/api/stripe/webhook`, eventy
      `checkout.session.completed` + `checkout.session.expired` → signing
      secret do Vercel env (`STRIPE_WEBHOOK_SECRET`).

## 4. Prepnutie Stripe TEST → PRODUKCIA (checklist)

> Vykonať AŽ PO splnení sekcie 2 (právna kontrola) a doplnení IČO/DIČ.

1. Stripe: aktivovať účet (business údaje, bankový účet na výplaty).
2. Vygenerovať **live** kľúče (`sk_live_`, `pk_live_`) → vymeniť na Verceli
   (`STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`).
3. Vytvoriť **live webhook** endpoint (live mód má vlastný signing secret) →
   vymeniť `STRIPE_WEBHOOK_SECRET`.
4. V Stripe nastaviť email potvrdenky (Settings → Emails → „Successful payments")
   + doplniť business info (názov na výpise z karty, podpora).
5. Odstrániť info banner „testovací režim" na `/cennik`
   (`src/app/cennik/page.tsx`).
6. Testovacia objednávka malou sumou + kontrola: potvrdenie, email zo Stripe,
   objednávka PAID v `/admin/objednavky`, peniaze v Stripe dashboarde.

## 5. Vedomé rozhodnutia Fázy 1 (nie je zabudnuté)

- **Email s číslom objednávky**: Stripe receipt neobsahuje naše číslo
  objednávky (zákazník ho vidí na stránke potvrdenia). Vlastný email
  (Resend/SMTP) = kandidát na Fázu 2.
- **Mesačná permanentka** sa predáva ako jednorazová platba (nie subscription).
- **Žiadne QR/čip** — schéma `Objednavka` má pripravené prázdne stĺpce
  `redemptionMethod` + `redeemedAt` (doplnenie logiky nevyžaduje migráciu).
- **Žiadny rate-limiting formulárov** — zvážiť pri reálnej prevádzke.
- **Obsah v `lib/`** (gym.ts, pricing.ts) namiesto DB — presun do DB/CMS až
  v ďalšej fáze (tabuľky už existujú v `prisma/schema.prisma`).
