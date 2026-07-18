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

- [ ] **Neon Postgres**: vytvoriť projekt na https://neon.tech → skopírovať
      connection string do `DATABASE_URL` (lokálne `.env.local`, na Verceli env var)
      → spustiť `npx prisma migrate dev --name init` (vytvorí tabuľky).
- [ ] **Stripe TEST kľúče**: https://dashboard.stripe.com/test/apikeys →
      `STRIPE_SECRET_KEY` + `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` do `.env.local`.
- [ ] **Webhook lokálne**: `stripe listen --forward-to localhost:3000/api/stripe/webhook`
      → vypísaný `whsec_...` do `STRIPE_WEBHOOK_SECRET`.
- [ ] **Vercel**: prepojiť repo `maxperformmethod-oss/Gladiator`, nastaviť všetky
      env premenné z `.env.example`, `NEXT_PUBLIC_SITE_URL` = produkčná doména.
- [ ] **Webhook produkčne**: Stripe dashboard → Developers → Webhooks → endpoint
      `https://DOMENA/api/stripe/webhook`, event `checkout.session.completed`
      (+ `checkout.session.expired`) → signing secret do Vercel env.
- [ ] **Admin heslo**: silné `ADMIN_USER` / `ADMIN_PASSWORD` na Verceli
      (prehľad pre recepciu: `/admin/objednavky`).

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
