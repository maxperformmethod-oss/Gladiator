# GLADIATOR

React + Vite + TypeScript + Tailwind v4 aplikácia.

## Vývoj

```bash
npm install      # inštalácia závislostí
npm run dev      # dev server (Vite)
npm run build    # tsc -b && vite build
npm run preview  # náhľad produkčného buildu
npm run lint     # oxlint
```

## Stack

- **React 19** + **react-router-dom 7**
- **Vite 8** (+ vite-plugin-pwa)
- **TypeScript 6**
- **Tailwind v4** (CSS-first cez `@theme` v `src/index.css`, žiadny `tailwind.config.js`)
- **oxlint** na linting
- **framer-motion**, **lucide-react**

Deploy: Vercel (SPA rewrite v `vercel.json` / `public/_redirects`).
