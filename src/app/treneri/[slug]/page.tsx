import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Section } from '@/components/ui/Section'
import { PlaceholderImage } from '@/components/ui/PlaceholderImage'
import { Notice } from '@/components/ui/Notice'
import { ButtonLink } from '@/components/ui/Button'
import { TbdBadge } from '@/components/ui/TbdBadge'
import { BRAND, TRENERI, TRENERI_OVERENI } from '@/lib/gym'

export function generateStaticParams() {
  return TRENERI.map((t) => ({ slug: t.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const trener = TRENERI.find((t) => t.slug === slug)
  return { title: trener ? trener.meno : 'Tréner' }
}

export default async function TrenerDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const trener = TRENERI.find((t) => t.slug === slug)
  if (!trener) notFound()

  return (
    <Section>
      <Link
        href="/treneri"
        className="mb-8 inline-flex items-center gap-2 text-sm text-ink-dim transition-colors hover:text-ink"
      >
        <ArrowLeft size={16} /> Všetci tréneri
      </Link>

      <div className="grid gap-10 lg:grid-cols-[2fr_3fr]">
        <PlaceholderImage
          label={`Portrét — ${trener.meno}`}
          aspect="aspect-[3/4]"
        />
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold">
            Tréner
          </p>
          <h1 className="display mt-2 text-4xl text-ink md:text-6xl">
            {trener.meno}
          </h1>
          <p className="mt-2 text-sm uppercase tracking-wider text-ink-faint">
            Špecializácia: {trener.specializacia ?? <TbdBadge />}
          </p>

          {!TRENERI_OVERENI && (
            <Notice className="mt-6">
              Profil čaká na overenie a podklady od majiteľa (pobočka{' '}
              {BRAND.pobocka}, bio, špecializácia, foto).
            </Notice>
          )}

          <div className="mt-6 space-y-4 text-ink-dim">
            {trener.bio ? (
              <p>{trener.bio}</p>
            ) : (
              <p>
                Bio trénera doplníme hneď, ako dostaneme podklady. Chceš s ním
                trénovať už teraz? Pošli dopyt cez rezervačný formulár.
              </p>
            )}
          </div>

          <div className="mt-8">
            <ButtonLink href="/rezervacia">Chcem trénovať</ButtonLink>
          </div>
        </div>
      </div>
    </Section>
  )
}
