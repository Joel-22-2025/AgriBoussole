import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

const tooltipStyle = {
  background: 'var(--bg-card)',
  border: '1px solid var(--border)',
  borderRadius: 10,
  fontSize: 12,
  color: 'var(--text-body)',
}

export interface SaeiMetric {
  label: string
  value: string | number
  numeric: number
  max: number
  hint?: string
  icon: ReactNode
  accent: string
}

/** Carte KPI dont le fond et la barre traduisent l'intensité de la valeur. */
export function SaeiKpiCard({ metric }: { metric: SaeiMetric }) {
  const intensity = Math.min(1, Math.max(0.12, metric.numeric / Math.max(1, metric.max)))
  const deep = intensity >= 0.6

  return (
    <article
      className={cn(
        'relative flex min-h-[132px] flex-col justify-between gap-3 overflow-hidden rounded-card p-5 shadow-card',
        deep ? 'bg-deep text-ink-deep' : 'bg-card text-ink-strong ring-1 ring-border',
      )}
    >
      <span
        className={cn(
          'flex size-9 shrink-0 items-center justify-center rounded-field',
          deep ? 'bg-white/15 text-ink-deep' : 'bg-live text-deep',
        )}
        style={!deep ? { color: metric.accent } : undefined}
        aria-hidden="true"
      >
        {metric.icon}
      </span>

      <div className="min-w-0">
        <p className={cn('text-[11px] font-medium uppercase', deep ? 'text-ink-deep-muted' : 'text-ink-muted')}>
          {metric.label}
        </p>
        <p className="tabular mt-0.5 text-2xl leading-tight font-bold">{metric.value}</p>
        {metric.hint && (
          <p className={cn('mt-0.5 truncate text-[11px]', deep ? 'text-ink-deep-muted' : 'text-ink-muted')}>
            {metric.hint}
          </p>
        )}
      </div>

      <div className={cn('h-1.5 w-full overflow-hidden rounded-pill', deep ? 'bg-white/15' : 'bg-row')}>
        <div
          className="h-full rounded-pill transition-[width] duration-500"
          style={{ width: `${Math.round(intensity * 100)}%`, background: metric.accent }}
        />
      </div>
    </article>
  )
}

export interface SaeiBarDatum {
  name: string
  value: number
  color: string
}

/** Graphique en barres des volumes réels remontés par l'API SAEI. */
export function SaeiActivityChart({
  title,
  description,
  data,
}: {
  title: string
  description: string
  data: SaeiBarDatum[]
}) {
  return (
    <section className="rounded-card bg-card p-5 shadow-card ring-1 ring-border sm:p-6">
      <header>
        <h2 className="text-lg leading-[1.3] font-semibold text-ink-strong">{title}</h2>
        <p className="mt-0.5 text-[13px] leading-[1.45] text-ink-muted">{description}</p>
      </header>

      <div className="mt-5 h-[240px]" role="img" aria-label={title}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -22 }} barSize={38}>
            <CartesianGrid stroke="var(--border)" strokeDasharray="4 4" vertical={false} />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
              interval={0}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
              allowDecimals={false}
            />
            <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'var(--bg-row)' }} />
            <Bar dataKey="value" name="Volume" radius={[8, 8, 0, 0]} isAnimationActive animationDuration={600}>
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}

export type SaeiSegment = SaeiBarDatum

/** Donut de répartition de l'engagement, avec le total au centre. */
export function SaeiEngagementChart({
  title,
  description,
  data,
}: {
  title: string
  description: string
  data: SaeiSegment[]
}) {
  const total = data.reduce((sum, segment) => sum + segment.value, 0)

  return (
    <section className="rounded-card bg-card p-5 shadow-card ring-1 ring-border sm:p-6">
      <header>
        <h2 className="text-lg leading-[1.3] font-semibold text-ink-strong">{title}</h2>
        <p className="mt-0.5 text-[13px] leading-[1.45] text-ink-muted">{description}</p>
      </header>

      {total === 0 ? (
        <p className="mt-8 rounded-field bg-row px-4 py-6 text-center text-sm text-ink-muted">
          Aucune activité d’engagement pour le moment.
        </p>
      ) : (
        <>
          <div className="relative mt-2 h-[200px]" role="img" aria-label={`${title} : ${total} éléments`}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  innerRadius="62%"
                  outerRadius="88%"
                  paddingAngle={2}
                  stroke="none"
                  isAnimationActive
                  animationDuration={600}
                >
                  {data.map((segment) => (
                    <Cell key={segment.name} fill={segment.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="tabular text-3xl leading-none font-bold text-ink-strong">{total}</span>
              <span className="mt-1 text-[11px] text-ink-muted">au total</span>
            </div>
          </div>

          <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2" aria-label="Légende du graphique">
            {data.map((segment) => (
              <li key={segment.name} className="flex min-w-0 items-center gap-2 text-xs">
                <span
                  className="size-2.5 shrink-0 rounded-full"
                  style={{ background: segment.color }}
                  aria-hidden="true"
                />
                <span className="truncate text-ink-muted">{segment.name}</span>
                <span className="tabular ml-auto font-medium text-ink-strong">{segment.value}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  )
}
