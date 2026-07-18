# CLAUDE.md — GLADIATOR

React + Vite + TypeScript + Tailwind v4 aplikácia. Jazyk obsahu: SK. Tmavý „nočný" režim je jediný a predvolený.

## Stack / konvencie

- **React 19** + **react-router-dom 7**, **Vite 8** (+ vite-plugin-pwa), **TypeScript 6**.
- **Tailwind v4 CSS-first**: dizajn tokeny v `src/index.css` cez `@theme`. **Žiadny `tailwind.config.js`.** Nepridávať náhodné farby mimo tokenov.
- **Lint**: `oxlint` (`npm run lint`). Pravidlá v `.oxlintrc.json`.
- **framer-motion** na animácie: jemné (300–600 ms, ease-out), `prefers-reduced-motion` fallback povinný.
- Ikony: **lucide-react**.

## Príkazy

- `npm run dev` — dev server
- `npm run build` — `tsc -b && vite build` (build musí prejsť bez TS chýb)
- `npm run lint` — oxlint (0 chýb pred commitom)
- `npm run preview` — náhľad produkčného buildu

## Autor / git

- Autor: **Maxim Malovec** · maximmalovec8@gmail.com
- Pred commitom: `npm run lint` + `npm run build` bez chýb.

## Deploy

- **Vercel**, SPA rewrite (`vercel.json` + `public/_redirects`) — všetky cesty → `/index.html`.

## Poznámky

- Obsah je zatiaľ prázdny skeleton (`src/App.tsx`) — čistý štart. Doplň štruktúru (pages/, components/, state/, utils/) podľa potreby.
