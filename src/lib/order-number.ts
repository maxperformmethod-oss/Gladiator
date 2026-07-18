import { randomBytes } from 'crypto'

/**
 * Unikátne číslo objednávky, napr. GLD-20260718-A7K2.
 * Podľa neho recepcia ručne overí platbu (Fáza 1 — bez QR/čipu).
 * Abeceda bez zámenných znakov (0/O, 1/I/L).
 */
const ALPHABET = '23456789ABCDEFGHJKMNPQRSTUVWXYZ'

export function generateOrderNumber(date = new Date()): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')

  const bytes = randomBytes(4)
  let suffix = ''
  for (let i = 0; i < 4; i++) {
    suffix += ALPHABET[bytes[i] % ALPHABET.length]
  }

  return `GLD-${y}${m}${d}-${suffix}`
}
