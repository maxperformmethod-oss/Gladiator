'use client'

import { useState } from 'react'
import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Notice } from '@/components/ui/Notice'
import { SLUZBY } from '@/lib/gym'
import { inputCls, labelCls } from './fields'

type Status = 'idle' | 'loading' | 'success' | 'error'

export function ReservationForm() {
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus('loading')
    setError(null)

    const form = new FormData(e.currentTarget)
    try {
      const res = await fetch('/api/rezervacia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          meno: form.get('meno'),
          email: form.get('email'),
          telefon: form.get('telefon'),
          sluzba: form.get('sluzba'),
          terminPozadovany: form.get('termin'),
          sprava: form.get('sprava'),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Odoslanie zlyhalo.')
      setStatus('success')
    } catch (err) {
      setStatus('error')
      setError(err instanceof Error ? err.message : 'Odoslanie zlyhalo.')
    }
  }

  if (status === 'success') {
    return (
      <div className="flex flex-col items-start gap-3 rounded-2xl border border-success/40 bg-success/5 p-6">
        <CheckCircle2 className="text-success" aria-hidden />
        <p className="display text-lg text-ink">Dopyt prijatý</p>
        <p className="text-sm text-ink-dim">
          Ozveme sa ti s potvrdením termínu. Rezervácia je záväzná až po našom
          potvrdení.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="rez-meno" className={labelCls}>
            Meno a priezvisko
          </label>
          <input
            id="rez-meno"
            name="meno"
            required
            maxLength={120}
            className={inputCls}
            placeholder="Tvoje meno"
          />
        </div>
        <div>
          <label htmlFor="rez-email" className={labelCls}>
            Email
          </label>
          <input
            id="rez-email"
            name="email"
            type="email"
            required
            maxLength={200}
            className={inputCls}
            placeholder="ty@email.sk"
          />
        </div>
        <div>
          <label htmlFor="rez-telefon" className={labelCls}>
            Telefón <span className="normal-case text-ink-faint">(nepovinné)</span>
          </label>
          <input
            id="rez-telefon"
            name="telefon"
            type="tel"
            maxLength={30}
            className={inputCls}
            placeholder="+421 ..."
          />
        </div>
        <div>
          <label htmlFor="rez-sluzba" className={labelCls}>
            Služba
          </label>
          <select id="rez-sluzba" name="sluzba" required className={inputCls}>
            {SLUZBY.map((s) => (
              <option key={s.slug} value={s.slug}>
                {s.nazov}
              </option>
            ))}
            <option value="ine">Iné / neviem</option>
          </select>
        </div>
      </div>
      <div>
        <label htmlFor="rez-termin" className={labelCls}>
          Preferovaný termín
        </label>
        <input
          id="rez-termin"
          name="termin"
          maxLength={200}
          className={inputCls}
          placeholder="Napr. utorok podvečer, víkend doobeda…"
        />
      </div>
      <div>
        <label htmlFor="rez-sprava" className={labelCls}>
          Poznámka <span className="normal-case text-ink-faint">(nepovinné)</span>
        </label>
        <textarea
          id="rez-sprava"
          name="sprava"
          rows={4}
          maxLength={2000}
          className={inputCls}
          placeholder="Cieľ, skúsenosti, zdravotné obmedzenia…"
        />
      </div>
      <label className="flex items-start gap-3 text-xs text-ink-dim">
        <input type="checkbox" required className="mt-0.5 accent-[#d4af37]" />
        <span>
          Súhlasím so spracovaním osobných údajov podľa{' '}
          <Link href="/podmienky" className="text-gold hover:text-gold-hi">
            zásad GDPR
          </Link>
          .
        </span>
      </label>
      {status === 'error' && error && <Notice>{error}</Notice>}
      <Button type="submit" disabled={status === 'loading'}>
        {status === 'loading' ? 'Odosielam…' : 'Odoslať dopyt'}
      </Button>
    </form>
  )
}
