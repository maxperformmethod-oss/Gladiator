/**
 * GLADIATOR GYM — jediný zdroj pravdy pre obsah webu (Fáza 1, bez CMS).
 * Neskôr sa tento obsah presunie do DB (tabuľky Pobocka/Trener/Sluzba) —
 * komponenty preto čítajú výhradne odtiaľto, nič nie je hardcodnuté v JSX.
 *
 * Položky označené `overene: false` = ÚDAJE ČAKAJÚCE NA POTVRDENIE.
 */

export const BRAND = {
  nazov: 'Gladiator Gym',
  pobocka: 'Lučenec',
  claim: 'Osloboď to najlepšie zo samého seba',
  tagline: 'Body Building Factory',
  zalozene: '2023',
} as const

export const KONTAKT = {
  adresa: 'Námestie Artézskych prameňov 2924, 984 01 Lučenec',
  telefon: '+421 948 303 354',
  telefonHref: 'tel:+421948303354',
  email: 'info@gladiatorgym.sk',
  emailHref: 'mailto:info@gladiatorgym.sk',
  mapaUrl:
    'https://www.google.com/maps/search/?api=1&query=N%C3%A1mestie+Art%C3%A9zskych+prame%C5%88ov+2924+Lu%C4%8Denec',
  /** ÚDAJE ČAKAJÚCE NA POTVRDENIE */
  overene: false,
} as const

export const OTVARACIE_HODINY = {
  polozky: [
    { dni: 'Pondelok – Piatok', cas: '6:00 – 21:00' },
    { dni: 'Sobota – Nedeľa', cas: '8:00 – 21:00' },
  ],
  /** ÚDAJE ČAKAJÚCE NA POTVRDENIE */
  overene: false,
} as const

export interface Trener {
  slug: string
  meno: string
  /** Fáza 1: bio čaká na podklady od majiteľa */
  bio: string | null
  specializacia: string | null
  /** Štvorcový orez tváre pre karty prehľadu. */
  foto: string
  /** Brandovaná karta (hviezdy + meno + citát) pre detail. */
  fotoKarta: string
}

/**
 * Mená z podkladov — POBOČKA NIE JE OVERENÁ, zobrazovať s upozornením.
 */
export const TRENERI_OVERENI = false

export const TRENERI: Trener[] = [
  { slug: 'sebastian-dirbak', meno: 'Sebastián Dirbák', bio: null, specializacia: null, foto: '/fotky/trener-sebastian-dirbak.jpg', fotoKarta: '/fotky/trener-sebastian-dirbak-karta.jpg' },
  { slug: 'mimi-krnacova', meno: 'Mimi Krnáčová', bio: null, specializacia: null, foto: '/fotky/trener-mimi-krnacova.jpg', fotoKarta: '/fotky/trener-mimi-krnacova-karta.jpg' },
  { slug: 'lukas-figa', meno: 'Lukáš Figa', bio: null, specializacia: null, foto: '/fotky/trener-lukas-figa.jpg', fotoKarta: '/fotky/trener-lukas-figa-karta.jpg' },
  { slug: 'klaudia-deakova', meno: 'Klaudia Deáková', bio: null, specializacia: null, foto: '/fotky/trener-klaudia-deakova.jpg', fotoKarta: '/fotky/trener-klaudia-deakova-karta.jpg' },
  { slug: 'jan-nemcok', meno: 'Ján Nemčok', bio: null, specializacia: null, foto: '/fotky/trener-jan-nemcok.jpg', fotoKarta: '/fotky/trener-jan-nemcok-karta.jpg' },
]

export interface Sluzba {
  slug: string
  nazov: string
  popis: string
  /** Cesta k fotke (public/fotky) — null = fotka zatiaľ neexistuje. */
  foto: string | null
  /** object-position pre cover crop (dôležitý objekt mimo stredu). */
  fotoPozicia?: string
}

export const SLUZBY: Sluzba[] = [
  {
    slug: 'osobny-trening',
    nazov: 'Osobný tréning',
    popis:
      'Individuálne vedenie 1 na 1 — technika, plán aj motivácia prispôsobené presne tvojmu cieľu.',
    foto: '/fotky/trening-osobny.jpg',
  },
  {
    slug: 'skupinove-lekcie',
    nazov: 'Skupinové lekcie',
    popis:
      'Tréning v skupine, ktorá ťa potiahne. Energia, disciplína a spoločný progres.',
    foto: '/fotky/skupinova-lekcia.jpg',
  },
  {
    slug: 'spinning',
    nazov: 'Spinning',
    popis:
      'Kardio na stacionárnych bicykloch pod vedením inštruktora — intenzita, ktorú si riadiš sám.',
    foto: '/fotky/spinning.jpg',
  },
  {
    slug: 'funkcna-zona',
    nazov: 'Funkčná zóna',
    popis:
      'Priestor pre funkčný tréning — sila, mobilita a kondícia v jednom.',
    foto: '/fotky/zona-funkcna.jpg',
  },
  {
    slug: 'solarium',
    nazov: 'Solárium',
    popis: 'Doplnok k tréningu priamo v gyme.',
    foto: null, // fotka solária zatiaľ neexistuje
  },
]

export interface Zona {
  slug: string
  nazov: string
  popis: string
  /** Cesta k fotke (public/fotky) — null = fotka zatiaľ neexistuje. */
  foto: string | null
  fotoPozicia?: string
}

export const VYBAVENIE_ZONY: Zona[] = [
  {
    slug: 'volne-vahy',
    nazov: 'Voľné váhy',
    popis:
      'Činky, osy a stojany pre základ silového tréningu — od prvého tréningu po ťažké série.',
    foto: '/fotky/zona-volne-vahy.jpg',
    fotoPozicia: 'object-[50%_65%]',
  },
  {
    slug: 'stroje',
    nazov: 'Stroje',
    popis:
      'Izolované aj komplexné stroje pre bezpečné a cielené zaťaženie každej partie.',
    foto: '/fotky/zona-stroje.jpg',
  },
  {
    slug: 'kardio',
    nazov: 'Kardio zóna',
    popis: 'Bežecké pásy, bicykle a ďalšie kardio vybavenie.',
    foto: null, // fotka kardio zóny zatiaľ neexistuje
  },
  {
    slug: 'sprint-draha',
    nazov: 'Sprint dráha',
    popis: 'Dráha pre šprinty, sane a dynamický tréning.',
    foto: '/fotky/zona-sprint-draha.jpg',
    fotoPozicia: 'object-top',
  },
]

/**
 * Galéria — editorial výber optimalizovaných záberov. Galéria je centrálna
 * zbierka fotiek, preto sa tu zábery zámerne opakujú s inými sekciami.
 * Rozmery = skutočné rozmery súborov (masonry layout bez layout shiftu).
 */
export interface GaleriaFotka {
  src: string
  popis: string
  sirka: number
  vyska: number
}

export const GALERIA: GaleriaFotka[] = [
  { src: '/fotky/hero-arena.jpg', popis: 'Aréna z výšky', sirka: 1150, vyska: 749 },
  { src: '/fotky/brand-gladiator.jpg', popis: 'Gladiator v akcii', sirka: 1290, vyska: 1010 },
  { src: '/fotky/zona-volne-vahy.jpg', popis: 'Zóna voľných váh', sirka: 1140, vyska: 1495 },
  { src: '/fotky/zona-stroje.jpg', popis: 'Strojová zóna', sirka: 1130, vyska: 855 },
  { src: '/fotky/trening-osobny.jpg', popis: 'Tréning na strojoch', sirka: 1140, vyska: 1215 },
  { src: '/fotky/spinning.jpg', popis: 'Spinning miestnosť', sirka: 1140, vyska: 850 },
  { src: '/fotky/skupinova-lekcia.jpg', popis: 'Skupinový tréning', sirka: 1140, vyska: 852 },
  { src: '/fotky/zona-funkcna.jpg', popis: 'Funkčná zóna a dráha', sirka: 1140, vyska: 845 },
  { src: '/fotky/event-dav.jpg', popis: 'Event v aréne', sirka: 1140, vyska: 850 },
  { src: '/fotky/zona-sprint-draha.jpg', popis: 'Sprint dráha', sirka: 1290, vyska: 1020 },
  { src: '/fotky/majitelia-krizo.jpg', popis: 'Komunita Gladiator Gymu', sirka: 1140, vyska: 845 },
  { src: '/fotky/rekorder.jpg', popis: 'Hostia v aréne', sirka: 1290, vyska: 1830 },
]

export interface EventItem {
  slug: string
  nazov: string
  datum: string | null
  popis: string
}

/** Fáza 1: žiadne potvrdené eventy — stránka zobrazí prázdny stav. */
export const EVENTY: EventItem[] = []

/** USP — bez vymyslených čísel (žiadne m², počty strojov). */
export const USP = [
  {
    nazov: 'Tréningová aréna',
    popis:
      'Industriálny priestor stavaný na tvrdý tréning — voľné váhy, stroje, kardio aj sprint dráha pod jednou strechou.',
  },
  {
    nazov: 'Pre každého',
    popis:
      'Seriózni cvičenci, začiatočníci, študenti aj seniori. Zvýhodnené vstupy a permanentky.',
  },
  {
    nazov: 'Otvorené 7 dní v týždni',
    popis: 'Cez týždeň od 6:00 rána. Tréning si naplánuješ tak, ako ti vyhovuje.',
  },
  {
    nazov: 'Tréneri',
    popis:
      'Osobné vedenie aj skupinové lekcie pod dohľadom trénerov.',
  },
] as const

/** Navigácia — jediný zdroj pre Header/Footer. */
export const NAV = [
  { href: '/', label: 'Domov' },
  { href: '/o-gyme', label: 'O gyme' },
  { href: '/cennik', label: 'Cenník' },
  { href: '/treneri', label: 'Tréneri' },
  { href: '/sluzby', label: 'Služby' },
  { href: '/vybavenie', label: 'Vybavenie' },
  { href: '/galeria', label: 'Galéria' },
  { href: '/eventy', label: 'Eventy' },
  { href: '/kontakt', label: 'Kontakt' },
] as const

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
