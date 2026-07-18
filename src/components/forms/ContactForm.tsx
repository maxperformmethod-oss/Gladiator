'use client'

import { useState } from 'react'
import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Notice } from '@/components/ui/Notice'
import { inputCls, labelCls } from './fields'

type Status = 'idle' | 'loading' | 'success' | 'error'

export function ContactForm() {
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus('loading')
    setError(null)

    const form = new FormData(e.currentTarget)
    try {
      const res = await fetch('/api/kontakt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          meno: form.get('meno'),
          email: form.get('email'),
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
        <p className="display text-lg text-ink">Správa odoslaná</p>
        <p className="text-sm text-ink-dim">Ozveme sa ti čo najskôr.</p>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label htmlFor="kontakt-meno" className={labelCls}>
          Meno a priezvisko
        </label>
        <input
          id="kontakt-meno"
          name="meno"
          required
          maxLength={120}
          className={inputCls}
          placeholder="Tvoje meno"
        />
      </div>
      <div>
        <label htmlFor="kontakt-email" className={labelCls}>
          Email
        </label>
        <input
          id="kontakt-email"
          name="email"
          type="email"
          required
          maxLength={200}
          className={inputCls}
          placeholder="ty@email.sk"
        />
      </div>
      <div>
        <label htmlFor="kontakt-sprava" className={labelCls}>
          Správa
        </label>
        <textarea
          id="kontakt-sprava"
          name="sprava"
          required
          rows={5}
          maxLength={2000}
          className={inputCls}
          placeholder="S čím ti vieme pomôcť?"
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
        {status === 'loading' ? 'Odosielam…' : 'Odoslať správu'}
      </Button>
    </form>
  )
}
