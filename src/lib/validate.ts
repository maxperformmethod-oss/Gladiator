/** Minimalistická validácia vstupov z formulárov. */

export function reqString(value: unknown, max: number): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  if (!trimmed || trimmed.length > max) return null
  return trimmed
}

export function optString(value: unknown, max: number): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  if (!trimmed) return null
  return trimmed.length > max ? null : trimmed
}

export function isEmail(value: string): boolean {
  return /^\S+@\S+\.\S+$/.test(value) && value.length <= 200
}

/** Reťazec v rozsahu dĺžky. Vracia orezanú hodnotu alebo null. */
export function rangeString(value: unknown, min: number, max: number): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  if (trimmed.length < min || trimmed.length > max) return null
  return trimmed
}

/** Overí, že reťazec zodpovedá vzoru. */
export function matchesPattern(value: string, pattern: RegExp): boolean {
  return pattern.test(value)
}

/** Číslo v rozsahu. Prijíma aj číselný reťazec z formulára. */
export function numberInRange(value: unknown, min: number, max: number): number | null {
  const n =
    typeof value === 'number'
      ? value
      : typeof value === 'string'
        ? Number(value.trim())
        : NaN
  if (!Number.isFinite(n) || n < min || n > max) return null
  return n
}

/** Dátum, ktorý nie je v budúcnosti. Vracia Date alebo null. */
export function pastDate(value: unknown): Date | null {
  if (typeof value !== 'string' && !(value instanceof Date)) return null
  const d = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(d.getTime()) || d.getTime() > Date.now()) return null
  return d
}

/** Hodnota patrí do povoleného zoznamu. */
export function oneOf<T extends string>(value: unknown, allowed: readonly T[]): T | null {
  return typeof value === 'string' && (allowed as readonly string[]).includes(value)
    ? (value as T)
    : null
}

/**
 * Prezývka na porovnávanie: malé písmená, bez diakritiky.
 * Používa sa VÝHRADNE na serveri pre stĺpec Clen.prezyvkaNorm.
 */
export function normalizujPrezyvku(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim()
}

/** Prezývky, ktoré si nikto nesmie privlastniť (zámena za personál/systém). */
const REZERVOVANE_PREZYVKY = ['admin', 'gladiator', 'recepcia', 'sprava', 'system', 'root']

/**
 * Overí prezývku podľa pravidiel a vráti zobrazovanú aj normalizovanú podobu,
 * inak null. Pravidlá: 3–20 znakov, po normalizácii iba `a-z`/`0-9`/`_`/`-`,
 * a nesmie to byť rezervované slovo.
 */
export function validujPrezyvku(
  value: unknown
): { prezyvka: string; prezyvkaNorm: string } | null {
  const prezyvka = rangeString(value, 3, 20)
  if (!prezyvka) return null
  const prezyvkaNorm = normalizujPrezyvku(prezyvka)
  if (!matchesPattern(prezyvkaNorm, /^[a-z0-9_-]+$/)) return null
  if (REZERVOVANE_PREZYVKY.includes(prezyvkaNorm)) return null
  return { prezyvka, prezyvkaNorm }
}
