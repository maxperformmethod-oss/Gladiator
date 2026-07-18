import { Section } from '@/components/ui/Section'
import { ButtonLink } from '@/components/ui/Button'

export default function NotFound() {
  return (
    <Section className="hex-pattern">
      <div className="flex flex-col items-center py-20 text-center">
        <p className="display text-7xl text-gold md:text-9xl">404</p>
        <p className="display mt-4 text-2xl text-ink">Stránka neexistuje</p>
        <p className="mt-2 max-w-md text-sm text-ink-dim">
          Táto stránka sa v aréne nenachádza. Vráť sa na domov a skús to znova.
        </p>
        <ButtonLink href="/" className="mt-8">
          Späť na domov
        </ButtonLink>
      </div>
    </Section>
  )
}
