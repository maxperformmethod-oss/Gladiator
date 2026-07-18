import type { Metadata } from 'next'
import { Section } from '@/components/ui/Section'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Reveal } from '@/components/ui/Reveal'
import { PlaceholderImage } from '@/components/ui/PlaceholderImage'
import { Notice } from '@/components/ui/Notice'

export const metadata: Metadata = {
  title: 'Galéria',
  description: 'Fotogaléria Gladiator Gym Lučenec.',
}

/** Sloty galérie — každý sa nahradí reálnou fotkou z pobočky LC. */
const SLOTY = [
  { label: 'Hlavná sála — celkový pohľad', aspect: 'aspect-[16/9]', span: 'md:col-span-2' },
  { label: 'Zóna voľných váh', aspect: 'aspect-square', span: '' },
  { label: 'Hexagónové LED osvetlenie', aspect: 'aspect-square', span: '' },
  { label: 'Sprint dráha', aspect: 'aspect-square', span: '' },
  { label: 'Kardio zóna', aspect: 'aspect-square', span: '' },
  { label: 'Funkčná zóna', aspect: 'aspect-square', span: '' },
  { label: 'Recepcia', aspect: 'aspect-square', span: '' },
  { label: 'Atmosféra tréningu', aspect: 'aspect-[16/9]', span: 'md:col-span-2' },
]

export default function GaleriaPage() {
  return (
    <Section>
      <SectionHeading eyebrow="Galéria" title="Aréna na vlastné oči" />
      <Notice className="mb-8">
        Galéria čaká na reálne fotografie pobočky Lučenec — nižšie sú pripravené
        sloty s popisom, čo má byť na zábere. Žiadne stock fotky.
      </Notice>
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
        {SLOTY.map((slot, i) => (
          <Reveal key={slot.label} delay={(i % 4) * 0.05} className={slot.span}>
            <PlaceholderImage label={slot.label} aspect={slot.aspect} />
          </Reveal>
        ))}
      </div>
    </Section>
  )
}
