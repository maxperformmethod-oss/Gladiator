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
}

/**
 * Mená z podkladov — POBOČKA NIE JE OVERENÁ, zobrazovať s upozornením.
 */
export const TRENERI_OVERENI = false

export const TRENERI: Trener[] = [
  { slug: 'sebastian-dirbak', meno: 'Sebastián Dirbák', bio: null, specializacia: null },
  { slug: 'mimi-krnacova', meno: 'Mimi Krnáčová', bio: null, specializacia: null },
  { slug: 'lukas-figa', meno: 'Lukáš Figa', bio: null, specializacia: null },
  { slug: 'klaudia-deakova', meno: 'Klaudia Deáková', bio: null, specializacia: null },
  { slug: 'jan-nemcok', meno: 'Ján Nemčok', bio: null, specializacia: null },
]

export interface Sluzba {
  slug: string
  nazov: string
  popis: string
}

export const SLUZBY: Sluzba[] = [
  {
    slug: 'osobny-trening',
    nazov: 'Osobný tréning',
    popis:
      'Individuálne vedenie 1 na 1 — technika, plán aj motivácia prispôsobené presne tvojmu cieľu.',
  },
  {
    slug: 'skupinove-lekcie',
    nazov: 'Skupinové lekcie',
    popis:
      'Tréning v skupine, ktorá ťa potiahne. Energia, disciplína a spoločný progres.',
  },
  {
    slug: 'spinning',
    nazov: 'Spinning',
    popis:
      'Kardio na stacionárnych bicykloch pod vedením inštruktora — intenzita, ktorú si riadiš sám.',
  },
  {
    slug: 'funkcna-zona',
    nazov: 'Funkčná zóna',
    popis:
      'Priestor pre funkčný tréning — sila, mobilita a kondícia v jednom.',
  },
  {
    slug: 'solarium',
    nazov: 'Solárium',
    popis: 'Doplnok k tréningu priamo v gyme.',
  },
]

export interface Zona {
  slug: string
  nazov: string
  popis: string
}

export const VYBAVENIE_ZONY: Zona[] = [
  {
    slug: 'volne-vahy',
    nazov: 'Voľné váhy',
    popis:
      'Činky, osy a stojany pre základ silového tréningu — od prvého tréningu po ťažké série.',
  },
  {
    slug: 'stroje',
    nazov: 'Stroje',
    popis:
      'Izolované aj komplexné stroje pre bezpečné a cielené zaťaženie každej partie.',
  },
  {
    slug: 'kardio',
    nazov: 'Kardio zóna',
    popis: 'Bežecké pásy, bicykle a ďalšie kardio vybavenie.',
  },
  {
    slug: 'sprint-draha',
    nazov: 'Sprint dráha',
    popis: 'Dráha pre šprinty, sane a dynamický tréning.',
  },
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
