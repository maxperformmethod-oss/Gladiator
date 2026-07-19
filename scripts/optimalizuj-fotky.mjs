/**
 * Optimalizácia fotiek z Instagram screenshotov → public/fotky/*.jpg
 *
 * Zdroje v `public/Fotky gym/` sú IG screenshoty (status bar, hlavička
 * profilu, badge „1/3", ikona stlmenia). Tento skript ich oreže na čistý
 * záber, skonvertuje na progresívny JPEG (mozjpeg) a dá im čisté názvy.
 *
 * Spustenie:  node scripts/optimalizuj-fotky.mjs
 * (Originály sa necommitujú — sú v .gitignore; commitujú sa len výstupy.)
 */
import sharp from 'sharp'
import { mkdirSync } from 'node:fs'
import path from 'node:path'

const SRC = 'public/Fotky gym'
const OUT = 'public/fotky'

// crop = { left, top, width, height } v pixeloch originálu.
const ULOHY = [
  // ── Wide zábery priestorov / akcie ─────────────────────────────────────
  { in: 'krasny obrazok celeho gymmu z hora.PNG', out: 'hero-arena.jpg', crop: { left: 0, top: 140, width: 1150, height: 749 }, quality: 82 },
  { in: 'chlap cvici ako gladiator obleceny.PNG', out: 'brand-gladiator.jpg', crop: { left: 0, top: 145, width: 1291, height: 1010 }, quality: 82 },
  { in: 'chlap co cvici.PNG', out: 'trening-osobny.jpg', crop: { left: 0, top: 155, width: 1140, height: 1215 } },
  { in: 'funkcna miestnost a box.PNG', out: 'skupinova-lekcia.jpg', crop: { left: 0, top: 8, width: 1140, height: 852 } },
  { in: 'Spinneri.PNG', out: 'spinning.jpg', crop: { left: 0, top: 170, width: 1140, height: 850 } },
  { in: 'dumbells.PNG', out: 'zona-volne-vahy.jpg', crop: { left: 0, top: 145, width: 1140, height: 1495 } },
  { in: 'strojova zona na vrch.PNG', out: 'zona-stroje.jpg', crop: { left: 0, top: 12, width: 1130, height: 855 } },
  { in: 'Majitel Logo a Bodybuilder.PNG', out: 'zona-sprint-draha.jpg', crop: { left: 0, top: 145, width: 1291, height: 1020 } },
  { in: 'velka funkcna zona alebo na footwork.PNG', out: 'zona-funkcna.jpg', crop: { left: 0, top: 5, width: 1140, height: 845 } },
  { in: 'tlaky na lavicke a dav.PNG', out: 'event-dav.jpg', crop: { left: 0, top: 10, width: 1140, height: 850 } },
  { in: 'Majitelia a znamy bodybuilder michal krizo.PNG', out: 'majitelia-krizo.jpg', crop: { left: 0, top: 25, width: 1140, height: 845 } },
  { in: 'znamy rekorder na biceps.PNG', out: 'rekorder.jpg', crop: { left: 0, top: 135, width: 1290, height: 1830 } },
]

// Tréneri: IG story karty 1290×2796 — jednotný template.
// „karta" = celý brandovaný poster (hviezdy + meno + citát) pre detail,
// „tvár"  = štvorcový orez hlavy/ramien pre karty prehľadu.
const TRENERI = [
  { in: 'Trener Sebo Dirbák.PNG', slug: 'sebastian-dirbak' },
  { in: 'Trénerka Mimi Krnáčová.PNG', slug: 'mimi-krnacova' },
  { in: 'trener Lukas figa.PNG', slug: 'lukas-figa' },
  { in: 'KLaudia deakova.PNG', slug: 'klaudia-deakova' },
  { in: 'trener Ján Nemčok.PNG', slug: 'jan-nemcok' },
]
for (const t of TRENERI) {
  ULOHY.push({
    in: t.in,
    out: `trener-${t.slug}-karta.jpg`,
    crop: { left: 0, top: 330, width: 1290, height: 2210 },
    width: 900,
  })
  ULOHY.push({
    in: t.in,
    out: `trener-${t.slug}.jpg`,
    crop: { left: 245, top: 560, width: 800, height: 800 },
    width: 600,
  })
}

mkdirSync(OUT, { recursive: true })

for (const u of ULOHY) {
  const vstup = path.join(SRC, u.in)
  const vystup = path.join(OUT, u.out)
  const img = sharp(vstup)
  const meta = await img.metadata()

  // Bezpečné orezanie — clamp na hranice originálu.
  const left = Math.max(0, Math.min(u.crop.left, meta.width - 1))
  const top = Math.max(0, Math.min(u.crop.top, meta.height - 1))
  const width = Math.min(u.crop.width, meta.width - left)
  const height = Math.min(u.crop.height, meta.height - top)

  const info = await img
    .extract({ left, top, width, height })
    .resize({ width: u.width ?? undefined, withoutEnlargement: true })
    .jpeg({ quality: u.quality ?? 80, mozjpeg: true, progressive: true })
    .toFile(vystup)

  console.log(
    `${u.out}: ${info.width}x${info.height}, ${(info.size / 1024).toFixed(0)} KB (zdroj ${meta.width}x${meta.height})`
  )
}
console.log(`\nHotovo — ${ULOHY.length} výstupov v ${OUT}/`)
