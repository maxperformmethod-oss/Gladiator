import type { Metadata, Viewport } from 'next'
import { Inter, Oswald } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/Providers'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { BRAND, SITE_URL } from '@/lib/gym'

const oswald = Oswald({
  subsets: ['latin-ext'],
  variable: '--font-oswald',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin-ext'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${BRAND.nazov} ${BRAND.pobocka} — ${BRAND.tagline}`,
    template: `%s · ${BRAND.nazov} ${BRAND.pobocka}`,
  },
  description: `${BRAND.claim}. ${BRAND.tagline} v Lučenci — voľné váhy, stroje, kardio aj sprint dráha. Vstupy a permanentky kúpiš online.`,
  openGraph: {
    title: `${BRAND.nazov} ${BRAND.pobocka}`,
    description: `${BRAND.claim}.`,
    locale: 'sk_SK',
    type: 'website',
  },
}

export const viewport: Viewport = {
  themeColor: '#0a0a0a',
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="sk" className={`${oswald.variable} ${inter.variable}`}>
      <body>
        <Providers>
          <div className="flex min-h-dvh flex-col">
            <Header />
            <main className="flex-1 pt-16">{children}</main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  )
}
