import type { Metadata } from 'next'
import { Section } from '@/components/ui/Section'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Notice } from '@/components/ui/Notice'
import { TbdBadge } from '@/components/ui/TbdBadge'
import { BRAND, KONTAKT } from '@/lib/gym'

export const metadata: Metadata = {
  title: 'Obchodné podmienky a GDPR',
  description: 'Obchodné podmienky a ochrana osobných údajov.',
}

export default function PodmienkyPage() {
  return (
    <Section>
      <SectionHeading eyebrow="Právne" title="Obchodné podmienky a GDPR" />

      <Notice className="mb-10">
        <strong>NÁVRH ČAKAJÚCI NA PRÁVNU KONTROLU.</strong> Texty nižšie sú
        pracovný placeholder — pred spustením reálnych platieb ich MUSÍ
        skontrolovať a schváliť právnik. Chýbajú fakturačné údaje predávajúceho
        (IČO / DIČ / IČ DPH) <TbdBadge />.
      </Notice>

      <div className="prose-invert max-w-3xl space-y-10">
        <div>
          <h2 className="display text-2xl text-ink">Obchodné podmienky (návrh)</h2>
          <ol className="mt-4 list-decimal space-y-3 pl-5 text-sm text-ink-dim">
            <li>
              Predávajúci: {BRAND.nazov} {BRAND.pobocka}, {KONTAKT.adresa}.
              Fakturačné údaje (IČO, DIČ, IČ DPH): <TbdBadge />
            </li>
            <li>
              Predmet kúpy: jednorazové vstupy, permanentky a balíky vstupov do
              prevádzky {BRAND.nazov} {BRAND.pobocka} podľa aktuálneho cenníka.
            </li>
            <li>
              Platba prebieha online prostredníctvom platobnej brány Stripe. Po
              úspešnej platbe zákazník dostane potvrdenie s unikátnym číslom
              objednávky.
            </li>
            <li>
              Uplatnenie: vstup sa uplatňuje na recepcii — zamestnanec overí platbu
              podľa čísla objednávky alebo emailu zákazníka.
            </li>
            <li>
              Odstúpenie od zmluvy a reklamácie: <TbdBadge>DOPLNÍ PRÁVNIK</TbdBadge>
            </li>
            <li>
              Platnosť balíkov vstupov je obmedzená (uvedená pri každej položke
              cenníka).
            </li>
          </ol>
        </div>

        <div>
          <h2 className="display text-2xl text-ink">
            Ochrana osobných údajov — GDPR (návrh)
          </h2>
          <ol className="mt-4 list-decimal space-y-3 pl-5 text-sm text-ink-dim">
            <li>
              Prevádzkovateľ: {BRAND.nazov} {BRAND.pobocka} <TbdBadge>DOPLNIŤ PRÁVNU FORMU</TbdBadge>
            </li>
            <li>
              Spracúvané údaje: meno, email, telefón (formuláre a objednávky);
              platobné údaje spracúva výhradne Stripe — my ich neukladáme.
            </li>
            <li>
              Účel: vybavenie objednávky, overenie vstupu na recepcii, odpoveď na
              dopyt z formulára.
            </li>
            <li>
              Doba uchovávania: <TbdBadge>DOPLNÍ PRÁVNIK</TbdBadge>
            </li>
            <li>
              Práva dotknutej osoby (prístup, oprava, výmaz, námietka) — žiadosti
              na {KONTAKT.email}.
            </li>
            <li>
              Cookies: web používa iba technicky nevyhnutné cookies. Analytika sa
              zatiaľ nepoužíva.
            </li>
          </ol>
        </div>
      </div>
    </Section>
  )
}
