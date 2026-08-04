'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import type {
  ActiveWorkout,
  AppData,
  KatalogCvik,
  Preferences,
  WorkoutPlan,
  WorkoutSession,
} from '@/lib/klub/types'
import {
  clearData,
  defaultData,
  exportJson,
  importJson,
  loadData,
  saveData,
  storageKey,
} from '@/lib/klub/storage'
import { activeToSessionExercises, sessionVolume } from '@/lib/klub/calc'
import { uid } from '@/lib/klub/id'

// v2 — formát sa zmenil zo string[] na {nazov, partia}[] (filter podľa partie).
const KATALOG_KEY = 'gladiator:klub:katalog:v2'

interface AppContextValue {
  data: AppData
  /** Návrhy názvov cvikov z admin katalógu (voľný text ostáva povolený). */
  katalog: KatalogCvik[]
  /* plány */
  savePlan: (plan: WorkoutPlan) => void
  deletePlan: (planId: string) => void
  /* aktívny tréning */
  startWorkout: (planId: string) => boolean
  updateActive: (updater: (active: ActiveWorkout) => ActiveWorkout) => void
  finishWorkout: () => WorkoutSession | null
  cancelWorkout: () => void
  /* história */
  deleteSession: (sessionId: string) => void
  /* preferencie a dáta */
  setPrefs: (patch: Partial<Preferences>) => void
  exportData: () => string
  importData: (json: string) => boolean
  resetAll: () => void
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({
  clenId,
  katalog: katalogProp,
  children,
}: {
  clenId: string
  katalog: KatalogCvik[]
  children: ReactNode
}) {
  const key = storageKey(clenId)
  // Prvý render (aj server) musí byť deterministický: štartujeme z prázdnych
  // dát a skutočné localStorage dáta načítame v efekte po pripojení. Tým sa
  // vyhneme hydration mismatchu a zároveň sa dáta viažu na správny kľúč člena.
  const [data, setData] = useState<AppData>(() => defaultData())
  const [hydrated, setHydrated] = useState(false)
  const skipSave = useRef(true)
  const dataRef = useRef(data)
  dataRef.current = data

  // Katalóg cvikov: server ho podá čerstvý; do localStorage ho cacheujeme, nech
  // appka ponúka návrhy aj offline. Ak server nič nepodá (offline), berieme cache.
  const [katalog, setKatalog] = useState<KatalogCvik[]>(katalogProp)
  useEffect(() => {
    try {
      if (katalogProp.length > 0) {
        localStorage.setItem(KATALOG_KEY, JSON.stringify(katalogProp))
        setKatalog(katalogProp)
      } else {
        const cached = localStorage.getItem(KATALOG_KEY)
        if (cached) setKatalog(JSON.parse(cached) as KatalogCvik[])
      }
    } catch {
      // localStorage nedostupné – použijeme, čo prišlo zo servera.
    }
  }, [katalogProp])

  // Načítanie dát člena po pripojení + reakcia na zmenu člena (nový kľúč).
  useEffect(() => {
    skipSave.current = true
    setData(loadData(key))
    setHydrated(true)
  }, [key])

  useEffect(() => {
    if (skipSave.current) {
      skipSave.current = false
      return
    }
    saveData(key, data)
  }, [key, data])

  const savePlan = useCallback((plan: WorkoutPlan) => {
    setData((d) => {
      const exists = d.plans.some((p) => p.id === plan.id)
      const updated = { ...plan, updatedAt: new Date().toISOString() }
      return {
        ...d,
        plans: exists
          ? d.plans.map((p) => (p.id === plan.id ? updated : p))
          : [updated, ...d.plans],
      }
    })
  }, [])

  const deletePlan = useCallback((planId: string) => {
    setData((d) => ({ ...d, plans: d.plans.filter((p) => p.id !== planId) }))
  }, [])

  const startWorkout = useCallback((planId: string): boolean => {
    const d = dataRef.current
    if (d.active) {
      return d.active.planId === planId // už beží – pokračujeme v ňom
    }
    const plan = d.plans.find((p) => p.id === planId)
    if (!plan || plan.exercises.length === 0) return false
    const active: ActiveWorkout = {
      planId: plan.id,
      name: plan.name,
      startedAt: new Date().toISOString(),
      exercises: plan.exercises.map((ex) => ({
        id: uid(),
        name: ex.name,
        ...(ex.note ? { note: ex.note } : {}),
        ...(ex.muscleGroup ? { muscleGroup: ex.muscleGroup } : {}),
        sets: ex.sets.map((s) => ({ id: uid(), reps: s.reps, weight: s.weight, done: false })),
      })),
    }
    setData({ ...d, active })
    return true
  }, [])

  const updateActive = useCallback((updater: (a: ActiveWorkout) => ActiveWorkout) => {
    setData((d) => (d.active ? { ...d, active: updater(d.active) } : d))
  }, [])

  const finishWorkout = useCallback((): WorkoutSession | null => {
    const d = dataRef.current
    if (!d.active) return null
    const exercises = activeToSessionExercises(d.active)
    const finishedAt = new Date()
    const startedAt = new Date(d.active.startedAt)
    const session: WorkoutSession = {
      id: uid(),
      planId: d.active.planId,
      name: d.active.name,
      startedAt: startedAt.toISOString(),
      finishedAt: finishedAt.toISOString(),
      durationSec: Math.max(0, Math.round((finishedAt.getTime() - startedAt.getTime()) / 1000)),
      exercises,
      volume: sessionVolume(exercises),
    }
    setData({ ...d, active: null, sessions: [session, ...d.sessions] })
    return session
  }, [])

  const cancelWorkout = useCallback(() => {
    setData((d) => ({ ...d, active: null }))
  }, [])

  const deleteSession = useCallback((sessionId: string) => {
    setData((d) => ({ ...d, sessions: d.sessions.filter((s) => s.id !== sessionId) }))
  }, [])

  const setPrefs = useCallback((patch: Partial<Preferences>) => {
    setData((d) => ({ ...d, prefs: { ...d.prefs, ...patch } }))
  }, [])

  const exportData = useCallback(() => exportJson(dataRef.current), [])

  const importData = useCallback((json: string): boolean => {
    const imported = importJson(json)
    if (!imported) return false
    setData(imported)
    return true
  }, [])

  const resetAll = useCallback(() => {
    clearData(key)
    setData(defaultData())
  }, [key])

  const value = useMemo<AppContextValue>(
    () => ({
      data,
      katalog,
      savePlan,
      deletePlan,
      startWorkout,
      updateActive,
      finishWorkout,
      cancelWorkout,
      deleteSession,
      setPrefs,
      exportData,
      importData,
      resetAll,
    }),
    [
      data,
      katalog,
      savePlan,
      deletePlan,
      startWorkout,
      updateActive,
      finishWorkout,
      cancelWorkout,
      deleteSession,
      setPrefs,
      exportData,
      importData,
      resetAll,
    ],
  )

  // Kým sa nenačítajú dáta z localStorage, nerenderujeme obsah – zabráni to
  // preblesknutiu prázdneho stavu pred hydratáciou dát člena.
  return (
    <AppContext.Provider value={value}>
      {hydrated ? children : null}
    </AppContext.Provider>
  )
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp musí byť použitý vo vnútri AppProvider')
  return ctx
}
