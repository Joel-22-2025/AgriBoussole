import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import type { DashboardActivity } from '@/features/dashboard/dashboard-data'
import { StatusList } from '@/features/dashboard/components/status-list'

const chartTooltipStyle = {
  background: 'var(--bg-card)',
  border: '1px solid var(--border)',
  borderRadius: 10,
  fontSize: 12,
  color: 'var(--text-body)',
}

export function LineCard({
  title,
  description,
  activity,
  analysisTitle,
}: {
  title: string
  description: string
  activity: DashboardActivity
  analysisTitle: string
}) {
  return (
    <section className="rounded-card bg-card p-6 shadow-card ring-1 ring-border">
      <header>
        <h2 className="text-lg leading-[1.3] font-semibold text-ink-strong">{title}</h2>
        <p className="mt-0.5 text-[13px] leading-[1.45] text-ink-muted">{description}</p>
      </header>

      <div className="mt-5 grid grid-cols-3 gap-3">
        {activity.indicateurs.map((indicator) => (
          <div key={indicator.label}>
            <p className="tabular text-2xl leading-tight font-semibold text-ink-strong">
              {indicator.value}
            </p>
            <p className="mt-0.5 text-xs text-ink-muted">{indicator.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 h-[220px]" role="img" aria-label={title}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={activity.series} margin={{ top: 8, right: 8, bottom: 0, left: -22 }}>
            <CartesianGrid stroke="var(--border)" strokeDasharray="4 4" vertical={false} />
            <XAxis
              dataKey="jour"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: 'var(--text-muted)' }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: 'var(--text-muted)' }}
            />
            <Tooltip contentStyle={chartTooltipStyle} />
            <Line
              type="monotone"
              dataKey="recommandations"
              name="Recommandations"
              stroke="var(--green-accent)"
              strokeWidth={3}
              dot={{ r: 4, fill: 'var(--green-accent)', strokeWidth: 0 }}
              activeDot={{ r: 5 }}
              isAnimationActive
              animationDuration={600}
            />
            <Line
              type="monotone"
              dataKey="objectif"
              name="Objectif"
              stroke="var(--danger)"
              strokeWidth={2}
              strokeDasharray="6 6"
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-ink-muted">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-0.5 w-4 rounded-full bg-brand" aria-hidden="true" />
          Recommandations
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-0.5 w-4 border-t-2 border-dashed border-destructive" aria-hidden="true" />
          Objectif
        </span>
      </div>

      <div className="my-5 h-px bg-border" />

      <p className="mb-2 text-xs font-medium tracking-[0.04em] text-ink-muted uppercase">
        {analysisTitle}
      </p>
      <StatusList
        label={analysisTitle}
        rows={activity.analyse.map((row) => ({
          name: row.label,
          value: row.value,
          tone: 'neutral',
        }))}
      />
    </section>
  )
}
