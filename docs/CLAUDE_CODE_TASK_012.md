# CLAUDE_CODE_TASK_012 — Etapa G1: pripojenie Supabase Auth

Verzia 1.0 · 31. 7. 2026 · **prvý z troch krokov prihlasovania**

---

## Rozdelenie Etapy G

| Krok | Čo | Kedy |
| --- | --- | --- |
| **G1** | balíky, klienti, premenné prostredia — **žiadne UI, nič sa nepripája** | táto úloha |
| G2 | middleware, registrácia, prihlásenie, obnova hesla | ďalšia |
| G3 | ochrana `/klub` a `/sprava`, admin rola, odkaz v menu | posledná |

G1 je zámerne malý. Pripraví nástroje, ale nič nimi ešte nerobí. Cieľom je
overiť, že sa dajú pridať bez toho, aby čokoľvek na weboch prestalo fungovať.

---

## ZAKÁZANÉ

- **`src/middleware.ts` — NEMENIŤ.** Príde v G2.
- **`src/app/layout.tsx` — NEMENIŤ.**
- žiadna zmena existujúcich stránok, komponentov ani `globals.css`
- žiadna zmena `prisma/schema.prisma`, žiadna migrácia
- žiadny iný `npm install` než ten uvedený nižšie
- necommituj a nepushuj bez schválenia

---

## Vstupné podmienky

```
git checkout main && git pull
git log --oneline -1        → musí byť b9eb39d
git checkout -b feat/auth-setup
```

---

## KROK 1 — pridanie dvoch balíkov

Toto je **jediný povolený install** v tejto úlohe:

```
npm install @supabase/supabase-js @supabase/ssr
```

Žiadne iné balíky. Žiadne `--force`, žiadny `npm audit fix`.

Potom over dopad:

```
git diff package.json
npm audit --audit-level=high
npm ls @supabase/supabase-js @supabase/ssr
```

Nahlás:

- ktoré verzie sa nainštalovali,
- ako sa zmenil `package.json`,
- **či sa zmenil počet high zraniteľností** (bolo 12).

Ak počet stúpne, **ZASTAV a nahlás.** Nič neopravuj.

---

## KROK 2 — premenné prostredia

### 2a. Doplň do `.env.example`

Tento súbor **sa commituje**, preto do neho patria iba zástupné hodnoty:

```
# ── Supabase Auth ────────────────────────────────────────────────
# Verejné hodnoty — dostanú sa do prehliadača, to je v poriadku.
# Nájdeš ich v Supabase: Project Settings → API.
NEXT_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-public-key>
```

**Žiadnu skutočnú hodnotu sem nedávaj.**

### 2b. `.env.local` doplním ja

Ty ho **nemeníš a neotváraš**. Po tom, ako ho doplním, iba overíš — bez
vypísania hodnôt:

```powershell
Select-String -Path .env.local -Pattern "^NEXT_PUBLIC_SUPABASE_URL=" -Quiet
Select-String -Path .env.local -Pattern "^NEXT_PUBLIC_SUPABASE_ANON_KEY=" -Quiet
Select-String -Path .env.local -Pattern "NEXT_PUBLIC_SUPABASE_URL=.*dhuynypsdbqdkkaqjxwv" -Quiet
```

Všetky tri musia byť `True`. Ak nie — **ZASTAV a napíš mi to.**

### 2c. Poznámka k `service_role`

Kľúč `service_role` sa v tomto projekte **nezavádza vôbec**. Nepýtaj si ho,
nepridávaj ho do žiadneho súboru. Ak ho niekde uvidíš, nahlás to.

---

## KROK 3 — dva klientske súbory

### `src/lib/supabase.ts` — prehliadač

```ts
import { createBrowserClient } from '@supabase/ssr'

/** Supabase klient pre kód bežiaci v prehliadači. Používa iba verejný anon kľúč. */
export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

### `src/lib/supabase-server.ts` — server

```ts
import 'server-only'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

/** Supabase klient pre serverový kód. Session drží v HTTP-only cookies. */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server Component nesmie zapisovať cookies.
            // Obnovu session rieši middleware — doplní sa v G2.
          }
        },
      },
    }
  )
}
```

**Poznámka k `server-only`:** balík `server-only` je súčasťou Next.js, netreba
ho inštalovať. Ak by import zlyhal, **ZASTAV a nahlás** — neodstraňuj ho.

**API `@supabase/ssr` sa medzi verziami menilo.** Ak nainštalovaná verzia
očakáva iný tvar (napr. `get`/`set`/`remove` namiesto `getAll`/`setAll`),
**uprav to podľa jej dokumentácie a napíš mi presne, čo si zmenil a prečo.**
Nepoužívaj `as any` ani `@ts-expect-error`.

---

## KROK 4 — kontrola

```
npx tsc --noEmit
npm run lint
npm run build
git status --short
git diff --stat
```

- [ ] `tsc --noEmit` bez chýb
- [ ] `npm run lint` bez chýb a warningov
- [ ] `npm run build` **40/40 stránok**
- [ ] `git status` ukazuje: 2 nové súbory v `src/lib/`, zmenené
      `package.json`, `package-lock.json`, `.env.example`
- [ ] **nič iné** — žiadna zmena v `src/app/`, `src/components/`,
      `src/middleware.ts`, `prisma/`
- [ ] `.env.local` **nie je** v `git status`

### Overenie, že sa nič nerozbilo

Spusti `npm run dev` a otvor:

- `/` — hero, menu, animácie
- `/cennik` — ceny sa zobrazujú
- `/klub` — „Pripravuje sa"
- `/admin/objednavky` — musí pýtať heslo alebo vrátiť 503

Nové súbory zatiaľ **nikto neimportuje**, takže do bundlu sa nedostanú.
Over to v build outpute — veľkosť stránok by sa nemala zmeniť.

---

## Report

```
## 1. NAINŠTALOVANÉ BALÍKY   verzie + diff package.json
## 2. ZRANITEĽNOSTI          pred a po, bolo 12
## 3. .env.example           doplnený blok
## 4. .env.local             3 kontroly, iba True/False
## 5. VYTVORENÉ SÚBORY       2
## 6. ÚPRAVY API @supabase/ssr   ak si musel niečo zmeniť, presne čo a prečo
## 7. VÝSTUP KONTROL         tsc · lint · build · git status · git diff --stat
## 8. RUČNÉ OVERENIE         4 stránky
## 9. CHECKLIST
## 10. RIZIKÁ
## 11. NÁVRH COMMITU         napr. feat(auth): add supabase clients
## 12. OTÁZKY                max 3
```

---

## Ukončenie

Po reporte **zastav**. Necommituj, nepushuj, neotváraj PR.
**G2 nezačínaj** — dostaneš samostatné zadanie.

Ak by ťa čokoľvek nútilo zmeniť `src/middleware.ts`, `src/app/layout.tsx`
alebo ktorúkoľvek existujúcu stránku — **zastav a opýtaj sa.**
