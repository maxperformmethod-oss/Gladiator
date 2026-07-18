/**
 * Cenník — jediný zdroj pravdy (Fáza 1, bez CMS).
 * VŠETKY CENY = ÚDAJE ČAKAJÚCE NA POTVRDENIE od majiteľa.
 *
 * `kupitelneOnline: false` → položka sa zobrazí bez tlačidla „Kúpiť online"
 * (čipová záloha sa platí fyzicky na recepcii; položky bez ceny sú
 * „cena na vyžiadanie").
 *
 * Stripe produkty sa NEvytvárajú ručne — checkout používa `price_data`
 * priamo z týchto hodnôt.
 */

export type ProduktTyp = 'VSTUP' | 'PERMANENTKA' | 'BALIK' | 'INE'

export interface CennikPolozka {
  kluc: string
  nazov: string
  popis?: string
  typ: ProduktTyp
  /** V centoch (500 = 5,00 €). null = cena na vyžiadanie. */
  cenaCenty: number | null
  kupitelneOnline: boolean
  platnost?: string
  poznamka?: string
}

/** ÚDAJE ČAKAJÚCE NA POTVRDENIE — cenník LC z podkladov. */
export const CENNIK_OVERENY = false

export const CENNIK: CennikPolozka[] = [
  // ── Jednorazové vstupy ────────────────────────────────────────────────
  {
    kluc: 'vstup-jednorazovy',
    nazov: 'Jednorazový vstup',
    typ: 'VSTUP',
    cenaCenty: 500,
    kupitelneOnline: true,
  },
  {
    kluc: 'vstup-student',
    nazov: 'Jednorazový vstup — študent',
    typ: 'VSTUP',
    cenaCenty: 350,
    kupitelneOnline: true,
    poznamka: 'Platný študentský preukaz pri vstupe.',
  },
  {
    kluc: 'vstup-student-po-17',
    nazov: 'Jednorazový vstup — študent po 17:00',
    typ: 'VSTUP',
    cenaCenty: 450,
    kupitelneOnline: true,
    poznamka: 'Platný študentský preukaz pri vstupe.',
  },
  {
    kluc: 'vstup-senior-ztp',
    nazov: 'Jednorazový vstup — senior / ZŤP',
    typ: 'VSTUP',
    cenaCenty: 350,
    kupitelneOnline: true,
  },

  // ── Permanentky ───────────────────────────────────────────────────────
  {
    kluc: 'permanentka-mesacna',
    nazov: 'Mesačná permanentka',
    typ: 'PERMANENTKA',
    cenaCenty: 4000,
    kupitelneOnline: true,
    platnost: '1 mesiac',
  },
  {
    kluc: 'permanentka-mesacna-student',
    nazov: 'Mesačná permanentka — študent',
    typ: 'PERMANENTKA',
    cenaCenty: 3500,
    kupitelneOnline: true,
    platnost: '1 mesiac',
    poznamka: 'Platný študentský preukaz pri vstupe.',
  },
  {
    kluc: 'permanentka-mesacna-senior-ztp',
    nazov: 'Mesačná permanentka — senior / ZŤP',
    typ: 'PERMANENTKA',
    cenaCenty: 3500,
    kupitelneOnline: true,
    platnost: '1 mesiac',
  },

  // ── Balíky vstupov ────────────────────────────────────────────────────
  {
    kluc: 'balik-10-vstupov',
    nazov: '10 vstupov',
    typ: 'BALIK',
    cenaCenty: 3600,
    kupitelneOnline: true,
    platnost: '2 mesiace',
  },
  {
    kluc: 'balik-25-vstupov',
    nazov: '25 vstupov',
    typ: 'BALIK',
    cenaCenty: 7500,
    kupitelneOnline: true,
    platnost: '3 mesiace',
  },
  {
    kluc: 'balik-25-vstupov-student',
    nazov: '25 vstupov — študent',
    typ: 'BALIK',
    cenaCenty: 5500,
    kupitelneOnline: true,
    platnost: '3 mesiace',
    poznamka: 'Platný študentský preukaz pri vstupe.',
  },

  // ── Ostatné ───────────────────────────────────────────────────────────
  {
    kluc: 'zaloha-cipova-karta',
    nazov: 'Záloha za čipovú kartu',
    typ: 'INE',
    cenaCenty: 200,
    kupitelneOnline: false,
    poznamka: 'Fyzická záloha na recepcii — neplatí sa online.',
  },
  {
    kluc: 'premium-solarko',
    nazov: 'Premium Solárko',
    typ: 'INE',
    cenaCenty: null,
    kupitelneOnline: false,
    poznamka: 'Cena na vyžiadanie.',
  },
  {
    kluc: 'premium-protein',
    nazov: 'Premium Protein',
    typ: 'INE',
    cenaCenty: null,
    kupitelneOnline: false,
    poznamka: 'Cena na vyžiadanie.',
  },
]

export function getPolozka(kluc: string): CennikPolozka | undefined {
  return CENNIK.find((p) => p.kluc === kluc)
}

export function formatCena(cenaCenty: number | null): string {
  if (cenaCenty === null) return 'cena na vyžiadanie'
  return `${(cenaCenty / 100).toFixed(2).replace('.', ',')} €`
}

export const CENNIK_SKUPINY: { nazov: string; typ: ProduktTyp }[] = [
  { nazov: 'Jednorazové vstupy', typ: 'VSTUP' },
  { nazov: 'Permanentky', typ: 'PERMANENTKA' },
  { nazov: 'Balíky vstupov', typ: 'BALIK' },
  { nazov: 'Ostatné', typ: 'INE' },
]
