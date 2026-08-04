'use client'

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { AXIS_PROPS, ChartTooltip, GRID_PROPS } from './chartTheme'
import { SERIES_COLORS } from './chartColors'
import { formatKg, plural } from '@/lib/klub/format'

type Point = { label: string; sortKey: number } & Record<string, number | string>

/** Porovnanie progresu (max váha / odhad 1RM) pre 1–3 cviky. */
export function CompareChart({
  data,
  selectedExercises,
}: {
  data: Point[]
  selectedExercises: string[]
}) {
  return (
    <div className="h-56">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
          <CartesianGrid {...GRID_PROPS} />
          <XAxis dataKey="label" {...AXIS_PROPS} minTickGap={24} />
          <YAxis {...AXIS_PROPS} width={44} unit=" kg" domain={['auto', 'auto']} />
          <Tooltip content={<ChartTooltip format={(v) => formatKg(v)} />} cursor={{ stroke: 'var(--color-line-strong)' }} />
          {selectedExercises.length > 1 && (
            <Legend
              wrapperStyle={{ fontSize: 12, color: 'var(--color-ink-dim)' }}
              formatter={(value: string) => <span style={{ color: 'var(--color-ink-dim)' }}>{value}</span>}
            />
          )}
          {selectedExercises.map((name, i) => (
            <Line
              key={name}
              type="monotone"
              dataKey={name}
              name={name}
              stroke={SERIES_COLORS[i]}
              strokeWidth={2.5}
              dot={{ r: 3, fill: SERIES_COLORS[i], strokeWidth: 0 }}
              activeDot={{ r: 5 }}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

/** Objem po týždňoch (zvislé stĺpce). */
export function VolumeBars({ data }: { data: { label: string; volume: number }[] }) {
  return (
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
          <CartesianGrid {...GRID_PROPS} />
          <XAxis dataKey="label" {...AXIS_PROPS} minTickGap={16} />
          <YAxis {...AXIS_PROPS} width={48} tickFormatter={(v: number) => (v >= 1000 ? `${Math.round(v / 1000)}t` : String(v))} />
          <Tooltip content={<ChartTooltip format={(v) => formatKg(v)} />} cursor={{ fill: 'var(--color-surface-3)' }} />
          <Bar dataKey="volume" fill="var(--color-gold)" radius={[6, 6, 0, 0]} maxBarSize={36} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

/** Počet tréningov po týždňoch (zvislé stĺpce). */
export function CountBars({ data }: { data: { label: string; count: number }[] }) {
  return (
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid {...GRID_PROPS} />
          <XAxis dataKey="label" {...AXIS_PROPS} minTickGap={16} />
          <YAxis {...AXIS_PROPS} width={36} allowDecimals={false} />
          <Tooltip
            content={<ChartTooltip format={(v) => plural(v, 'tréning', 'tréningy', 'tréningov')} />}
            cursor={{ fill: 'var(--color-surface-3)' }}
          />
          <Bar dataKey="count" fill="var(--color-success)" radius={[6, 6, 0, 0]} maxBarSize={36} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

/** Objem podľa svalovej partie (vodorovné stĺpce). */
export function MuscleBars({ data }: { data: { label: string; volume: number }[] }) {
  return (
    <div style={{ height: Math.max(160, data.length * 40) }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
          <CartesianGrid {...GRID_PROPS} horizontal={false} />
          <XAxis type="number" {...AXIS_PROPS} tickFormatter={(v: number) => (v >= 1000 ? `${Math.round(v / 1000)}t` : String(v))} />
          <YAxis type="category" dataKey="label" {...AXIS_PROPS} width={100} />
          <Tooltip content={<ChartTooltip format={(v) => formatKg(v)} />} cursor={{ fill: 'var(--color-surface-3)' }} />
          <Bar dataKey="volume" fill="var(--color-gold)" radius={[0, 6, 6, 0]} maxBarSize={22} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
