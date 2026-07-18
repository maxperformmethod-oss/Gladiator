import Link from 'next/link'
import { BRAND, KONTAKT, NAV, OTVARACIE_HODINY } from '@/lib/gym'
import { TbdBadge } from '@/components/ui/TbdBadge'

export function Footer() {
  return (
    <footer className="border-t border-line bg-surface">
      <div className="mx-auto w-full max-w-6xl px-4 py-14 md:px-6">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Značka */}
          <div>
            <p className="display text-2xl text-ink">
              GLADIATOR <span className="gold-text">GYM</span>
            </p>
            <p className="mt-1 text-[11px] uppercase tracking-[0.3em] text-ink-faint">
              {BRAND.tagline} · est. {BRAND.zalozene}
            </p>
            <p className="mt-4 max-w-xs text-sm text-ink-dim">„{BRAND.claim}“</p>
          </div>

          {/* Kontakt */}
          <div>
            <p className="display mb-4 text-sm text-gold">
              Kontakt <TbdBadge>údaje čakajú na potvrdenie</TbdBadge>
            </p>
            <address className="space-y-2 text-sm not-italic text-ink-dim">
              <p>{KONTAKT.adresa}</p>
              <p>
                <a href={KONTAKT.telefonHref} className="transition-colors hover:text-ink">
                  {KONTAKT.telefon}
                </a>
              </p>
              <p>
                <a href={KONTAKT.emailHref} className="transition-colors hover:text-ink">
                  {KONTAKT.email}
                </a>
              </p>
            </address>
          </div>

          {/* Otváracie hodiny */}
          <div>
            <p className="display mb-4 text-sm text-gold">Otváracie hodiny</p>
            <ul className="space-y-2 text-sm text-ink-dim">
              {OTVARACIE_HODINY.polozky.map((h) => (
                <li key={h.dni} className="flex justify-between gap-4">
                  <span>{h.dni}</span>
                  <span className="tnum text-ink">{h.cas}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Navigácia */}
          <nav aria-label="Pätičková navigácia">
            <p className="display mb-4 text-sm text-gold">Navigácia</p>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              {NAV.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-ink-dim transition-colors hover:text-ink"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/rezervacia"
                  className="text-ink-dim transition-colors hover:text-ink"
                >
                  Rezervácia
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-line pt-6 text-xs text-ink-faint sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {BRAND.nazov} {BRAND.pobocka}
          </p>
          <p>
            <Link href="/podmienky" className="transition-colors hover:text-ink">
              Obchodné podmienky a GDPR
            </Link>
          </p>
        </div>
      </div>
    </footer>
  )
}
