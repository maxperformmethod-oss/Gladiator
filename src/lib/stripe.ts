import Stripe from 'stripe'

/**
 * Lazy Stripe klient — inštancia vzniká až pri prvom použití, takže build
 * a stránky bez platieb fungujú aj s placeholder kľúčom.
 * API verzia sa nepinuje — používa sa default SDK (stabilné Checkout API).
 */
let stripeSingleton: Stripe | null = null

export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key || key.includes('PLACEHOLDER')) {
    throw new Error(
      'STRIPE_SECRET_KEY nie je nakonfigurovaný — doplň test kľúč do .env.local (pozri TODO.md).'
    )
  }
  if (!stripeSingleton) {
    stripeSingleton = new Stripe(key)
  }
  return stripeSingleton
}
