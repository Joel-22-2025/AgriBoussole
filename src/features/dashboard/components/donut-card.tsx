import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'

import type { ChartSegment } from '@/features/dashboard/dashboard-data'
import type { StatusListRow } from '@/features/dashboard/components/status-list'
import { StatusList } from '@/features/dashboard/components/status-list'

const chartTooltipStyle = {
  background: 'var(--bg-card)',
  border: '1px solid var(--border)',
  borderRadius: 10,
  fontSize: 12,
  color: 'var(--text-body)',
}

export function DonutCard({
  title,
  description,
  data,
  unit,
  statusTitle,
  statusRows,
}: {
  title: string
  description: string
  data: ChartSegment[]
  unit: string
  statusTitle: string
  statusRows: StatusListRow[]
}) {
  const total = data.reduce((sum, segment) => sum + segment.value, 0)

  return (
    <section className="rounded-card bg-card p-6 shadow-card ring-1 ring-border">
      <header>
        <h2 className="text-lg leading-[1.3] font-semibold text-ink-strong">{title}</h2>
        <p className="mt-0.5 text-[13px] leading-[1.45] text-ink-muted">{description}</p>
      </header>

      <div className="relative mt-4 h-[220px]" role="img" aria-label={`${title} : ${total} ${unit}`}>
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
              {data.map((segment, index) => (
                <Cell
                  key={segment.name}
                  fill={segment.color ?? `var(--chart-${(index % 6) + 1})`}
                />
              ))}
            </Pie>
            <Tooltip contentStyle={chartTooltipStyle} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="tabular text-3xl leading-none font-bold text-ink-strong">{total}</span>
          <span className="mt-1 text-xs text-ink-muted">{unit}</span>
        </div>
      </div>

      <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2" aria-label="Légende du graphique">
        {data.map((segment, index) => (
          <li key={segment.name} className="flex min-w-0 items-center gap-2 text-xs">
            <span
              className="size-2.5 shrink-0 rounded-full"
              style={{ background: segment.color ?? `var(--chart-${(index % 6) + 1})` }}
              aria-hidden="true"
            />
            <span className="truncate text-ink-muted">{segment.name}</span>
            <span className="tabular ml-auto font-medium text-ink-strong">{segment.value}</span>
          </li>
        ))}
      </ul>

      <div className="my-5 h-px bg-border" />

      <p className="mb-2 text-xs font-medium tracking-[0.04em] text-ink-muted uppercase">
        {statusTitle}
      </p>
      <StatusList rows={statusRows} label={statusTitle} />
    </section>
  )
}
