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
