'use client'

import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Download, Info, Trash2, Upload, Volume2 } from 'lucide-react'
import { useApp } from '../AppProvider'
import { useToast } from '../ToastProvider'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { ConfirmDialog } from '../ui/ConfirmDialog'
import { NumberField } from '../ui/NumberField'

/** Nastavenia: preferencie, export/import a vymazanie dát. */
export default function Settings() {
  const { data, setPrefs, exportData, importData, resetAll } = useApp()
  const { toast } = useToast()
  const fileRef = useRef<HTMLInputElement>(null)
  const [confirmReset, setConfirmReset] = useState(false)
  const [confirmImport, setConfirmImport] = useState<string | null>(null)

  const handleExport = () => {
    const json = exportData()
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `gladiator-zaloha-${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
    toast('Dáta boli exportované do JSON súboru.', 'success')
  }

  const handleFile = (file: File) => {
    const reader = new FileReader()
    reader.onload = () => {
      const text = typeof reader.result === 'string' ? reader.result : ''
      setConfirmImport(text)
    }
    reader.onerror = () => toast('Súbor sa nepodarilo prečítať.', 'error')
    reader.readAsText(file)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mx-auto max-w-2xl"
    >
      <h1 className="display text-2xl text-ink">Nastavenia</h1>
      <p className="mt-1 text-sm text-ink-dim">Preferencie, dáta a zálohovanie.</p>

      {/* Tréningové preferencie */}
      <Card className="mt-6">
        <h2 className="mb-4 text-sm font-bold">Tréning</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <NumberField
            label="Týždenný cieľ tréningov"
            value={data.prefs.weeklyGoal}
            min={1}
            max={14}
            step={1}
            suffix="/ týž."
            onChange={(weeklyGoal) => setPrefs({ weeklyGoal })}
          />
          <NumberField
            label="Predvolený odpočinok medzi sériami"
            value={data.prefs.restSec}
            min={15}
            max={600}
            step={15}
            suffix="s"
            onChange={(restSec) => setPrefs({ restSec })}
          />
        </div>
        <p className="mt-2 text-xs text-ink-faint">
          Týždenný cieľ sa zobrazuje ako hlavný ring na prehľade.
        </p>
        <label className="mt-4 flex cursor-pointer items-center justify-between gap-4 border-t border-line pt-4">
          <span className="flex items-center gap-2.5 text-sm font-semibold">
            <Volume2 className="size-4 text-ink-dim" aria-hidden />
            Zvukové upozornenie časovača
          </span>
          <input
            type="checkbox"
            role="switch"
            aria-label="Zvukové upozornenie časovača"
            checked={data.prefs.soundOn}
            onChange={(e) => setPrefs({ soundOn: e.target.checked })}
            className="peer sr-only"
          />
          <span
            aria-hidden
            className="relative h-7 w-12 shrink-0 rounded-full bg-surface-3 transition-colors peer-checked:bg-gold after:absolute after:left-1 after:top-1 after:size-5 after:rounded-full after:bg-ink-dim after:transition-transform peer-checked:after:translate-x-5 peer-checked:after:bg-white"
          />
        </label>
      </Card>

      {/* Záloha */}
      <Card className="mt-3">
        <h2 className="mb-2 text-sm font-bold">Záloha dát</h2>
        <p className="text-sm leading-relaxed text-ink-dim">
          Dáta sú uložené len v tomto prehliadači. Vymazanie údajov prehliadača ich odstráni.
          Zálohu si sprav exportom – je to jediná záloha, ktorú máš.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button variant="secondary" onClick={handleExport}>
            <Download className="size-4" aria-hidden /> Exportovať JSON
          </Button>
          <Button variant="secondary" onClick={() => fileRef.current?.click()}>
            <Upload className="size-4" aria-hidden /> Importovať JSON
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            aria-label="Vybrať JSON súbor na import"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handleFile(file)
              e.target.value = ''
            }}
          />
        </div>
      </Card>

      {/* Nebezpečná zóna */}
      <Card className="mt-3 border-danger/25">
        <h2 className="mb-2 text-sm font-bold text-danger">Vymazanie dát</h2>
        <p className="text-sm leading-relaxed text-ink-dim">
          Natrvalo odstráni všetky tréningy, históriu aj nastavenia z tohto prehliadača.
        </p>
        <Button variant="danger" className="mt-4" onClick={() => setConfirmReset(true)}>
          <Trash2 className="size-4" aria-hidden /> Vymazať všetky dáta
        </Button>
      </Card>

      <p className="mt-6 flex items-start gap-2 text-xs leading-relaxed text-ink-faint">
        <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden />
        Tréningové dáta žijú v tvojom prehliadači. Odhad kalórií je orientačný a nenahrádza
        medicínske meranie.
      </p>

      <ConfirmDialog
        open={confirmReset}
        title="Vymazať všetky dáta?"
        message="Odstránia sa všetky tréningové plány, celá história aj nastavenia. Táto akcia sa nedá vrátiť. Zváž najprv export."
        confirmLabel="Vymazať všetko"
        danger
        onCancel={() => setConfirmReset(false)}
        onConfirm={() => {
          resetAll()
          setConfirmReset(false)
          toast('Všetky dáta boli vymazané.', 'success')
        }}
      />

      <ConfirmDialog
        open={confirmImport !== null}
        title="Importovať dáta?"
        message="Import nahradí všetky aktuálne dáta obsahom súboru. Ak si nie si istý, najprv exportuj zálohu."
        confirmLabel="Importovať"
        onCancel={() => setConfirmImport(null)}
        onConfirm={() => {
          const ok = confirmImport !== null && importData(confirmImport)
          setConfirmImport(null)
          if (ok) toast('Dáta boli úspešne importované.', 'success')
          else toast('Súbor nie je platná záloha.', 'error')
        }}
      />
    </motion.div>
  )
}
